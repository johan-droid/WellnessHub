"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plus, MapPin, Calendar, Activity, Loader2, Trash2 } from "lucide-react";

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  description: string | null;
  startDate: number | null;
  endDate: number | null;
  status: string;
  budget: number | null;
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

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

function unwrapData<T>(payload: unknown): T {
  const env = payload as ApiEnvelope<T>;
  if (env && typeof env === "object" && "data" in env) {
    return env.data as T;
  }
  return payload as T;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function formatDateRange(start?: number | null, end?: number | null): string {
  if (!start && !end) return "Dates TBD";
  if (start && !end) return new Date(start).toLocaleDateString();
  if (!start && end) return `Until ${new Date(end!).toLocaleDateString()}`;
  return `${new Date(start!).toLocaleDateString()} – ${new Date(end!).toLocaleDateString()}`;
}

function formatScheduledTime(timestamp?: number | null): string {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  archived: "bg-yellow-100 text-yellow-700",
};

const CATEGORY_ICONS: Record<string, string> = {
  wellness: "🧘",
  sightseeing: "🏛️",
  dining: "🍽️",
  transport: "🚌",
  accommodation: "🏨",
  other: "📌",
};

export default function TripPlannerPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [isFetchingTrips, setIsFetchingTrips] = useState(true);
  const [isFetchingActivities, setIsFetchingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create trip form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: "", destination: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Create activity form
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: "", location: "", category: "other" });
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Load trips
  useEffect(() => {
    if (!token || !user) {
      setIsFetchingTrips(false);
      return;
    }

    const fetchTrips = async () => {
      setIsFetchingTrips(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/protected/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = (await res.json()) as unknown;
        if (!res.ok) throw new Error((payload as ApiEnvelope<never>).error || "Failed to load trips");

        const data = unwrapData<{ trips: Trip[] }>(payload);
        const tripList = data.trips ?? [];
        setTrips(tripList);
        if (tripList.length > 0 && !selectedTrip) {
          setSelectedTrip(tripList[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trips.");
      } finally {
        setIsFetchingTrips(false);
      }
    };

    void fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Load activities when trip changes
  useEffect(() => {
    if (!selectedTrip || !token) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      setIsFetchingActivities(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/protected/trips/${selectedTrip.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = (await res.json()) as unknown;
        if (!res.ok) throw new Error((payload as ApiEnvelope<never>).error || "Failed to load activities");

        const data = unwrapData<{ activities?: TripActivity[] }>(payload);
        setActivities(data.activities ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load activities.");
      } finally {
        setIsFetchingActivities(false);
      }
    };

    void fetchActivities();
  }, [selectedTrip, token]);

  const handleCreateTrip = async () => {
    if (!token || !newTrip.title.trim()) {
      setError("Trip title is required.");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/protected/trips`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTrip.title.trim(),
          destination: newTrip.destination.trim() || null,
          description: newTrip.description.trim() || null,
        }),
      });
      const payload = (await res.json()) as unknown;
      if (!res.ok) throw new Error((payload as ApiEnvelope<never>).error || "Failed to create trip");

      const created = unwrapData<Trip>(payload);
      setTrips(prev => [created, ...prev]);
      setSelectedTrip(created);
      setNewTrip({ title: "", destination: "", description: "" });
      setShowCreateForm(false);
      setSuccess("Trip created successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!token || !confirm("Delete this trip and all its activities? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/api/protected/trips/${tripId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete trip");
      const remaining = trips.filter(t => t.id !== tripId);
      setTrips(remaining);
      setSelectedTrip(remaining[0] ?? null);
      setActivities([]);
      setSuccess("Trip deleted.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip.");
    }
  };

  const handleAddActivity = async () => {
    if (!token || !selectedTrip || !newActivity.title.trim()) {
      setError("Activity title is required.");
      return;
    }
    setIsAddingActivity(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/protected/trips/${selectedTrip.id}/activities`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newActivity.title.trim(),
          location: newActivity.location.trim() || null,
          category: newActivity.category,
        }),
      });
      const payload = (await res.json()) as unknown;
      if (!res.ok) throw new Error((payload as ApiEnvelope<never>).error || "Failed to add activity");

      const created = unwrapData<TripActivity>(payload);
      setActivities(prev => [...prev, created]);
      setNewActivity({ title: "", location: "", category: "other" });
      setShowActivityForm(false);
      setSuccess("Activity added!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add activity.");
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleToggleActivity = async (activity: TripActivity) => {
    if (!token || !selectedTrip) return;
    try {
      const res = await fetch(
        `${API_URL}/api/protected/trips/${selectedTrip.id}/activities/${activity.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !activity.completed }),
        }
      );
      if (!res.ok) return;
      setActivities(prev =>
        prev.map(a => a.id === activity.id ? { ...a, completed: a.completed ? 0 : 1 } : a)
      );
    } catch {
      // Silent fail for toggle
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!token || !selectedTrip) return;
    try {
      await fetch(
        `${API_URL}/api/protected/trips/${selectedTrip.id}/activities/${activityId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch {
      setError("Failed to delete activity.");
    }
  };

  const progressPercent = activities.length > 0
    ? Math.round((activities.filter(a => a.completed).length / activities.length) * 100)
    : 0;

  if (loading || isFetchingTrips) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F6]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F6] font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-orange-100 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold">WellbeingHub — Trip Planner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors">
            ← Dashboard
          </Link>
          {user && (
            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
              {(user.firstName?.[0] ?? "W").toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Trip List */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Your Trips</h2>
              <button
                onClick={() => setShowCreateForm(v => !v)}
                className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>

            {/* Create trip form */}
            {showCreateForm && (
              <div className="rounded-2xl border border-orange-100 bg-white p-4 space-y-3 shadow-sm">
                <h3 className="font-semibold text-sm">New Trip</h3>
                <input
                  type="text"
                  placeholder="Trip title *"
                  value={newTrip.title}
                  onChange={e => setNewTrip(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={newTrip.destination}
                  onChange={e => setNewTrip(p => ({ ...p, destination: e.target.value }))}
                  className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleCreateTrip()}
                    disabled={isCreating}
                    className="flex-1 rounded-xl bg-orange-500 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {trips.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white/50 p-8 text-center text-slate-500 text-sm">
                No trips yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
                      selectedTrip?.id === trip.id
                        ? "border-orange-400 bg-orange-50 shadow-md"
                        : "border-orange-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{trip.title}</h3>
                        {trip.destination && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {trip.destination}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[trip.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {trip.status}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); void handleDeleteTrip(trip.id); }}
                          className="text-slate-300 hover:text-red-400 transition-colors"
                          title="Delete trip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Trip Detail */}
          <section className="lg:col-span-2 space-y-6">
            {!selectedTrip ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white/50 text-slate-400">
                Select a trip to see its details
              </div>
            ) : (
              <>
                {/* Trip header */}
                <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTrip.title}</h2>
                      {selectedTrip.destination && (
                        <p className="text-orange-500 font-medium mt-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {selectedTrip.destination}
                        </p>
                      )}
                      {selectedTrip.description && (
                        <p className="text-slate-500 text-sm mt-2">{selectedTrip.description}</p>
                      )}
                      <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
                      </p>
                    </div>

                    {/* Progress ring */}
                    <div className="flex flex-col items-center">
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#fed7aa" strokeWidth="6" />
                          <circle
                            cx="32" cy="32" r="28" fill="none"
                            stroke="#f97316" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={175.9}
                            strokeDashoffset={175.9 - (progressPercent / 100) * 175.9}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-orange-600">
                          {progressPercent}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">Progress</span>
                    </div>
                  </div>

                  {selectedTrip.budget && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
                      💰 Budget: ${selectedTrip.budget.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Activities */}
                <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-500" />
                      Activities
                      <span className="text-sm font-normal text-slate-400">
                        ({activities.filter(a => a.completed).length}/{activities.length} done)
                      </span>
                    </h3>
                    <button
                      onClick={() => setShowActivityForm(v => !v)}
                      className="flex items-center gap-1 rounded-lg bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-600 hover:bg-orange-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>

                  {/* Add activity form */}
                  {showActivityForm && (
                    <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Activity title *"
                        value={newActivity.title}
                        onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm bg-white focus:border-orange-400 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Location"
                          value={newActivity.location}
                          onChange={e => setNewActivity(p => ({ ...p, location: e.target.value }))}
                          className="rounded-xl border border-orange-100 px-3 py-2 text-sm bg-white focus:border-orange-400 focus:outline-none"
                        />
                        <select
                          value={newActivity.category}
                          onChange={e => setNewActivity(p => ({ ...p, category: e.target.value }))}
                          className="rounded-xl border border-orange-100 px-3 py-2 text-sm bg-white focus:border-orange-400 focus:outline-none"
                        >
                          <option value="wellness">Wellness</option>
                          <option value="sightseeing">Sightseeing</option>
                          <option value="dining">Dining</option>
                          <option value="transport">Transport</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleAddActivity()}
                          disabled={isAddingActivity}
                          className="flex-1 rounded-xl bg-orange-500 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {isAddingActivity ? "Adding..." : "Add Activity"}
                        </button>
                        <button
                          onClick={() => setShowActivityForm(false)}
                          className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isFetchingActivities ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-orange-100 bg-orange-50/30 text-sm text-slate-400">
                      No activities yet — add your first one!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map(activity => (
                        <div
                          key={activity.id}
                          className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                            activity.completed
                              ? "border-green-100 bg-green-50/50 opacity-75"
                              : "border-orange-100 bg-white hover:shadow-sm"
                          }`}
                        >
                          <button
                            onClick={() => void handleToggleActivity(activity)}
                            className={`flex-shrink-0 h-6 w-6 rounded-full border-2 transition-colors ${
                              activity.completed
                                ? "border-green-400 bg-green-400"
                                : "border-orange-300 hover:border-orange-500"
                            }`}
                          >
                            {activity.completed ? (
                              <span className="flex items-center justify-center text-white text-xs">✓</span>
                            ) : null}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${activity.completed ? "line-through text-slate-400" : ""}`}>
                                {CATEGORY_ICONS[activity.category ?? "other"]} {activity.title}
                              </span>
                              {activity.category && (
                                <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-600 px-2 py-0.5">
                                  {activity.category}
                                </span>
                              )}
                            </div>
                            {activity.location && (
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {activity.location}
                              </p>
                            )}
                            {activity.scheduledDate && (
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {formatScheduledTime(activity.scheduledDate)}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => void handleDeleteActivity(activity.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-orange-100 py-8 text-center text-sm text-slate-400">
        <p>© 2026 WellbeingHub. All your journeys, mindfully planned.</p>
      </footer>
    </div>
  );
}
