"use client";

// Added at top of file:
type ApiEnvelope<T> = { success?: boolean; data?: T; error?: string; }
function unwrapData<T>(payload: unknown): T {
  const env = payload as ApiEnvelope<T>;
  if (env && typeof env === "object" && "data" in env) {
    return env.data as T;
  }
  return payload as T;
}

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  description: string | null;
  startDate: number | null;
  endDate: number | null;
  status: string;
  createdAt: number;
};

type TripActivity = {
  id: string;
  tripId: string;
  title: string;
  description: string | null;
  location: string | null;
  scheduledDate: number | null;
  estimatedDuration: number | null;
  category: string | null;
  completed: number | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function formatDateRange(start?: number | null, end?: number | null): string {
  if (!start || !end) return "Dates TBD";
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

function formatDay(timestamp?: number | null): string {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(timestamp?: number | null): string {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function TripPlannerPage() {
  const { user, token, loading } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      setIsFetching(false);
      return;
    }
    const fetchTrips = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const authHeaders = { Authorization: `Bearer ${token}` };
        const tripsRes = await fetch(`${API_URL}/api/protected/trips`, { headers: authHeaders });
        if (!tripsRes.ok) throw new Error("Failed to load trips.");
        const tripsPayload = await tripsRes.json() as unknown;
        const tripsData = unwrapData<{ trips?: Trip[] }>(tripsPayload);
        const tripList = tripsData.trips ?? [];
        if (tripList.length > 0) {
          setSelectedTrip(tripList[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trips.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchTrips();
  }, [token, user]);

  useEffect(() => {
    if (!selectedTrip || !token) {
      setActivities([]);
      return;
    }
    const fetchActivities = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const authHeaders = { Authorization: `Bearer ${token}` };
        const actRes = await fetch(`${API_URL}/api/protected/trips/${selectedTrip.id}`, { headers: authHeaders });
        if (!actRes.ok) throw new Error("Failed to load activities.");
        const actPayload = await actRes.json() as unknown;
        const actData = unwrapData<{ activities?: TripActivity[] }>(actPayload);
        setActivities(actData.activities ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load activities.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchActivities();
  }, [selectedTrip, token]);

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F6]">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F6]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#FFF5F6] font-display text-slate-900">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 z-50 bg-[#FFF5F6]/90">
          <div className="flex items-center gap-3">
            <div className="h-12 flex items-center justify-center rounded-xl bg-white p-1">
              <Image className="h-full w-auto object-contain" alt="WellbeingHub logo" src="/logo.png" width={96} height={48} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined text-slate-600">arrow_back</span>
              </button>
            </Link>
            <div className="size-10 rounded-full border-2 border-orange-200 p-0.5">
              <Image
                className="rounded-full size-full object-cover"
                alt="User profile avatar"
                src={user?.profilePicture || "/avatar.png"}
                width={40}
                height={40}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          <section className="relative rounded-2xl overflow-hidden mb-6 aspect-[21/9]">
            {selectedTrip && (
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%), url('/paris.jpg')` }}>
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-white text-3xl md:text-4xl font-bold mb-1">{selectedTrip.title}</h1>
                    <p className="text-white/90 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-center size-20">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <circle className="stroke-green-100" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
                      <circle className="stroke-orange-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset="65" strokeLinecap="round" strokeWidth="3" />
                    </svg>
                    <span className="absolute text-white font-bold text-sm">35%</span>
                  </div>
                </div>
              </div>
            )}
          </section>
          <nav className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
            <Link href="/dashboard/trips" className="px-6 py-4 text-orange-600 font-bold border-b-2 border-orange-500">Activities</Link>
            <Link href="/dashboard/daily-wellness" className="px-6 py-4 text-slate-500 font-semibold border-b-2 border-transparent">Wellness</Link>
            <Link href="/dashboard/health" className="px-6 py-4 text-slate-500 font-semibold border-b-2 border-transparent">Health Metrics</Link>
          </nav>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Trip Timeline</h3>
            <button className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Activity
            </button>
          </div>
          <div className="space-y-10">
            {activities.length === 0 ? (
              <div className="text-gray-500">No activities yet for this trip.</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm uppercase tracking-wider">{formatDay(activity.scheduledDate)}</div>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500 shrink-0">
                      <span className="material-symbols-outlined">{activity.category === "wellness" ? "self_improvement" : activity.category === "sightseeing" ? "museum" : activity.category === "dining" ? "restaurant" : "event"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-slate-900">{activity.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${activity.category === "wellness" ? "bg-orange-100 text-orange-500" : activity.category === "sightseeing" ? "bg-yellow-100 text-yellow-700" : activity.category === "dining" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{activity.category || "General"}</span>
                      </div>
                      <p className="text-sm text-slate-500">{formatTime(activity.scheduledDate)} • {activity.location || "Location TBA"}</p>
                    </div>
                    <input type="checkbox" checked={!!activity.completed} className="size-6 rounded-full border-orange-200 text-orange-500 focus:ring-orange-500" readOnly />
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        <footer className="border-t border-slate-200 mt-auto py-8 text-center text-sm text-slate-500">
          <p>© 2024 WellbeingHub. All your journeys, mindfully planned.</p>
        </footer>
      </div>
    </div>
  );
}

