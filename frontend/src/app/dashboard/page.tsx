"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isMoodLog } from "@/lib/type-guards";
import {
  Calendar,
  Clock3,
  Droplets,
  Footprints,
  Heart,
  LogOut,
  MapPin,
  Moon,
  Sparkles,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  description: string | null;
  startDate: number | null;
  endDate: number | null;
  status: "planning" | "ongoing" | "completed" | "archived" | string;
  createdAt: number;
};

type WellnessLog = {
  id: string;
  tripId: string | null;
  type: string;
  value: string | null;
  rating: number | null;
  duration: number | null;
  notes: string | null;
  loggedAt: number;
};

type HealthMetric = {
  id: string;
  metricType: string;
  value: number | string;
  unit: string;
  recordedAt: number;
};

type TripActivity = {
  id: string;
  title: string;
  location: string | null;
  scheduledDate: number | null;
  category: string | null;
  completed: number | null;
};

type DashboardPayload = {
  trips: Trip[];
  logs: WellnessLog[];
  metrics: HealthMetric[];
  activities: TripActivity[];
};

type MetricDisplay = {
  value: number | string;
  unit: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function getDisplayName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Explorer";
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0] ?? "W";
  const last = lastName?.[0] ?? "H";
  return `${first}${last}`.toUpperCase();
}

function formatShortDate(timestamp?: number | null): string {
  if (!timestamp) return "Not set";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp?: number | null): string {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inRangePercent(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardPayload>({
    trips: [],
    logs: [],
    metrics: [],
    activities: [],
  });
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token || !user) {
      setIsFetching(false);
      return;
    }

    const loadDashboard = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const authHeaders = { Authorization: `Bearer ${token}` };

        const [tripsRes, logsRes, metricsRes] = await Promise.all([
          fetch(`${API_URL}/api/protected/trips`, { headers: authHeaders }),
          fetch(`${API_URL}/api/protected/wellness-logs`, { headers: authHeaders }),
          fetch(`${API_URL}/api/protected/health-metrics`, { headers: authHeaders }),
        ]);

        if (!tripsRes.ok || !logsRes.ok || !metricsRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const tripsRaw = (await tripsRes.json()) as unknown;
        const logsRaw = (await logsRes.json()) as unknown;
        const metricsRaw = (await metricsRes.json()) as unknown;

        const tripsData = unwrapData<{ trips?: Trip[] }>(tripsRaw);
        const logsData = unwrapData<{ logs?: WellnessLog[] }>(logsRaw);
        const metricsData = unwrapData<{ metrics?: HealthMetric[] }>(metricsRaw);

        const trips = tripsData.trips ?? [];
        const logs = logsData.logs ?? [];
        const metrics = metricsData.metrics ?? [];

        const activeTrip = trips.find((trip) => trip.status === "ongoing") ?? trips[0];
        let activities: TripActivity[] = [];

        if (activeTrip?.id) {
          const activitiesRes = await fetch(`${API_URL}/api/protected/trips/${activeTrip.id}`, {
            headers: authHeaders,
          });

          if (activitiesRes.ok) {
            const activitiesRaw = (await activitiesRes.json()) as unknown;
            const tripData = unwrapData<{ activities?: TripActivity[] }>(activitiesRaw);
            activities = tripData.activities ?? [];
          }
        }

        setDashboard({ trips, logs, metrics, activities });
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load dashboard.");
      } finally {
        setIsFetching(false);
      }
    };

    void loadDashboard();
  }, [token, user]);

  const derived = useMemo(() => {
    const now = Date.now();
    const trip = dashboard.trips.find((item) => item.status === "ongoing") ?? dashboard.trips[0] ?? null;

    const totalActivities = dashboard.activities.length;
    const completedActivities = dashboard.activities.filter((item) => Boolean(item.completed)).length;
    const tripLogs = trip
      ? dashboard.logs.filter((log) => !log.tripId || log.tripId === trip.id)
      : dashboard.logs;

    const tripProgressByDates = (() => {
      if (!trip?.startDate || !trip?.endDate) return null;
      const total = trip.endDate - trip.startDate;
      if (total <= 0) return null;
      const elapsed = now - trip.startDate;
      return inRangePercent(Math.round((elapsed / total) * 100));
    })();

    const tripProgressByActivities = totalActivities > 0
      ? inRangePercent(Math.round((completedActivities / totalActivities) * 100))
      : 0;

    const tripProgress = tripProgressByDates ?? tripProgressByActivities;

    const sortedLogs = [...dashboard.logs].sort((a, b) => b.loggedAt - a.loggedAt);
    const sortedMetrics = [...dashboard.metrics].sort((a, b) => b.recordedAt - a.recordedAt);

    const latestMood = sortedLogs.find((item) => item.type.toLowerCase() === "mood")?.rating;
    const latestSleep = sortedLogs.find((item) => item.type.toLowerCase() === "sleep")?.duration;
    const latestWaterMetric = sortedMetrics.find((item) => item.metricType === "water_intake");
    const latestStepsMetric = sortedMetrics.find((item) => item.metricType === "steps");

    const latestWater: MetricDisplay | null = latestWaterMetric
      ? { value: latestWaterMetric.value, unit: latestWaterMetric.unit }
      : null;
    const latestSteps: MetricDisplay | null = latestStepsMetric
      ? { value: latestStepsMetric.value, unit: latestStepsMetric.unit }
      : null;

    const upcomingActivities = [...dashboard.activities]
      .filter((item) => (item.scheduledDate ?? 0) >= now)
      .sort((a, b) => (a.scheduledDate ?? 0) - (b.scheduledDate ?? 0))
      .slice(0, 4);

    const moodValues = sortedLogs
      .filter(isMoodLog)
      .slice(0, 7)
      .reverse()
      .map((item) => {
        const value = item.rating;
        return value <= 5 ? value * 2 : value;
      });

    const moodSeries = moodValues;
    const moodAverage = moodSeries.length > 0
      ? moodSeries.reduce((sum, item) => sum + item, 0) / moodSeries.length
      : 0;

    const latestMoodDisplay = typeof latestMood === "number"
      ? latestMood <= 5
        ? latestMood * 2
        : latestMood
      : null;

    return {
      activeTrip: trip,
      totalActivities,
      completedActivities,
      totalLogs: tripLogs.length,
      tripProgress,
      latestMoodDisplay,
      latestSleep,
      latestWater,
      latestSteps,
      upcomingActivities,
      moodSeries,
      moodAverage,
    };
  }, [dashboard]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFAFA] via-[#FFF5F7] to-[#FFF0F5]">
        <div className="h-12 w-12 rounded-full border-4 border-[#F48FB1] border-t-transparent animate-spin" />
      </div>
    );
  }

  const name = getDisplayName(user.firstName, user.lastName);
  const initials = getInitials(user.firstName, user.lastName);
  const activeTripTitle = derived.activeTrip?.title || "No active trip";
  const activeTripDestination = derived.activeTrip?.destination || "Create your first destination";

  const circumference = 282.7;
  const dashOffset = circumference - (inRangePercent(derived.tripProgress) / 100) * circumference;

  const chartPoints = derived.moodSeries.map((value, index) => {
    const maxIndex = Math.max(derived.moodSeries.length - 1, 1);
    const x = (index / maxIndex) * 300;
    const y = 90 - (inRangePercent(value, 0, 10) / 10) * 70;
    return { x, y };
  });

  const chartPath = chartPoints.length > 0
    ? chartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ")
    : "";

  const areaPath = chartPath ? `${chartPath} L300,100 L0,100 Z` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAFA] via-[#FFF5F7] to-[#FFF0F5] text-[#5D4037]">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-pink-50/50 bg-white px-6 shadow-sm shadow-pink-100/20">
        <div className="flex items-center gap-2 text-[#FF4081]">
          <Sparkles className="h-7 w-7" />
          <span className="text-2xl font-bold tracking-tight">WellbeingHub</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-xs text-gray-400">Welcome back,</p>
            <p className="font-medium text-[#4E342E]">{name}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-pink-100 bg-white p-2 text-[#F06292] transition-colors hover:bg-pink-50"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-[#FFE4EC] font-semibold text-[#E91E63]">
            {initials}
          </div>
        </div>
      </header>

      <aside className="fixed top-16 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-pink-50/30 bg-[#FFF9FB] md:flex">
        <nav className="flex-1 py-6">
          <ul className="space-y-1 text-sm">
              <li className="rounded-r-full border-l-4 border-[#FF80AB] bg-[#FF80AB]/5 px-6 py-3 font-semibold text-[#FF4081]">
                Dashboard
              </li>
              <li>
                <Link href="/dashboard/wellbeing-analysis" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Wellbeing Analysis
                </Link>
              </li>
              <li>
                <Link href="/dashboard/trips" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Trips
                </Link>
              </li>
              <li>
                <Link href="/dashboard/daily-wellness" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Wellness
                </Link>
              </li>
              <li>
                <Link href="/dashboard/health" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Health
                </Link>
              </li>
            <li>
              <Link href="/dashboard/profile" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                Profile
              </Link>
            </li>
              <li>
                <Link href="/dashboard/settings" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/empty-states" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Empty States
                </Link>
              </li>
              <li>
                <Link href="/dashboard/loading-states" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Loading States
                </Link>
              </li>
              <li>
                <Link href="/dashboard/error-states" className="block px-6 py-3 text-[#F06292] transition-colors hover:text-[#E91E63]">
                  Error States
                </Link>
              </li>
          </ul>
        </nav>
        <div className="border-t border-pink-100 p-6">
          <div className="rounded-[2rem] border border-white bg-white/40 p-5 shadow-sm">
            <p className="mb-2 text-xs text-gray-400">ACCOUNT</p>
            <p className="mb-3 text-sm font-medium">{user.email}</p>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#FF4081] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#E91E63]"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="px-4 pb-24 pt-20 md:ml-64 md:px-8 md:pb-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <section className="relative flex flex-col gap-6 overflow-hidden rounded-[3rem] border border-white bg-white/80 p-8 shadow-[0_8px_30px_rgb(255,182,193,0.1)] md:flex-row lg:col-span-6">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C8E6C9]/50 bg-white/60 px-3 py-1 text-[#81C784]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{derived.activeTrip ? "Active Trip" : "Trip Status"}</span>
              </div>
              <h2 className="mb-1 text-2xl font-bold text-[#4E342E]">{activeTripDestination}</h2>
              <p className="mb-6 text-gray-400">
                {activeTripTitle}
                {derived.activeTrip?.startDate ? ` • From ${formatShortDate(derived.activeTrip.startDate)}` : ""}
              </p>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-gray-500">Activities</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {derived.completedActivities} / {derived.totalActivities}
                  </p>
                </div>
                <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-gray-500">Logs Created</p>
                  <p className="text-lg font-semibold text-gray-800">{derived.totalLogs} Total</p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-full bg-[#FF4081] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-pink-200 transition-colors hover:bg-[#E91E63]"
              >
                View Details
              </button>
            </div>

            <div className="flex min-w-[180px] items-center justify-center">
              <div className="relative h-32 w-32 md:h-40 md:w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="64" fill="transparent" stroke="#FCE4EC" strokeWidth="14" />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="transparent"
                    stroke="#F48FB1"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeWidth="14"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{inRangePercent(derived.tripProgress)}%</span>
                  <span className="text-[10px] uppercase text-gray-500">Complete</span>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col rounded-[3rem] border border-white bg-white/80 p-8 shadow-[0_8px_30px_rgb(255,182,193,0.1)] lg:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#4E342E]">Today&apos;s Snapshot</h3>
              <button type="button" className="text-xs font-semibold text-[#FF4081]">Refresh</button>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-[2rem] border border-white bg-[#FFF0F5]/40 p-4">
                <Heart className="text-[#F48FB1]" size={18} />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Mood</span>
                <p className="font-semibold">{derived.latestMoodDisplay ? `${derived.latestMoodDisplay}/10` : "N/A"}</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-[2rem] border border-white bg-[#F3E5F5]/40 p-4">
                <Moon className="text-[#9575CD]" size={18} />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Sleep</span>
                <p className="font-semibold">
                  {derived.latestSleep ? `${(derived.latestSleep / 60).toFixed(1)}h` : "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-[2rem] border border-white bg-[#E1F5FE]/40 p-4">
                <Footprints className="text-[#4FC3F7]" size={18} />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Steps</span>
                <p className="font-semibold">
                  {derived.latestSteps ? `${derived.latestSteps.value}${derived.latestSteps.unit ? ` ${derived.latestSteps.unit}` : ""}` : "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-[2rem] border border-white bg-[#E0F2F1]/40 p-4">
                <Droplets className="text-[#4DB6AC]" size={18} />
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Water</span>
                <p className="font-semibold">
                  {derived.latestWater ? `${derived.latestWater.value}${derived.latestWater.unit ? ` ${derived.latestWater.unit}` : ""}` : "N/A"}
                </p>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col rounded-[3rem] border border-white bg-white/80 p-8 shadow-[0_8px_30px_rgb(255,182,193,0.1)] lg:col-span-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#4E342E]">Upcoming Today</h3>
              <span className="text-xs text-gray-400">Live from trip itinerary</span>
            </div>

            {isFetching ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl border border-pink-100 bg-pink-50/20" />
                ))}
              </div>
            ) : derived.upcomingActivities.length > 0 ? (
              <div className="space-y-4">
                {derived.upcomingActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-2xl border border-pink-50 bg-pink-50/20 p-4 transition-colors hover:border-pink-200"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/30 text-orange-400">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{activity.location || "Location TBA"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-sm font-medium text-gray-800">{formatTime(activity.scheduledDate)}</span>
                      <span className="rounded bg-blue-900/30 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400">
                        {activity.category || "general"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Calendar className="mb-3 h-12 w-12 opacity-20" />
                <p>No upcoming activities yet.</p>
              </div>
            )}
          </section>

          <section className="relative flex flex-col rounded-[3rem] border border-white bg-white/80 p-8 shadow-[0_8px_30px_rgb(255,182,193,0.1)] lg:col-span-4">
            <h3 className="mb-2 text-lg font-semibold text-[#4E342E]">Mood Trend</h3>
            <p className="mb-6 text-xs text-gray-500">
              {derived.moodSeries.length > 0
                ? `Last ${derived.moodSeries.length} Logs (Avg: ${derived.moodAverage.toFixed(1)})`
                : "No mood logs yet"}
            </p>
            <div className="relative mt-4 min-h-[140px] flex-1">
              {derived.moodSeries.length > 0 ? (
                <>
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#F48FB1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#FF8A80" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#trendGradient)" />
                    <path d={chartPath} fill="none" stroke="#F48FB1" strokeLinecap="round" strokeWidth="3" />
                    {chartPoints.map((point, index) => (
                      <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="3" fill="#FF4081" />
                    ))}
                  </svg>
                  <div className="mt-4 flex justify-between text-[10px] uppercase tracking-tighter text-gray-500">
                    {derived.moodSeries.map((_, index) => (
                      <span key={index}>{index + 1}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/20 text-sm text-gray-500">
                  Add a mood log to view trend analytics.
                </div>
              )}
            </div>
            <a href="#" className="mt-8 block text-center text-sm font-semibold text-[#FF4081] hover:underline">
              View Detailed Analytics
            </a>
          </section>
        </div>
      </main>

      <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-pink-100 bg-white md:hidden">
                <Link href="/dashboard/wellbeing-analysis" className="flex flex-col items-center text-gray-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="mt-1 text-[10px]">Analysis</span>
                </Link>
        <Link href="/dashboard" className="flex flex-col items-center text-[#E8593C]">
          <Sparkles className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Dash</span>
        </Link>
        <Link href="/dashboard/trips" className="flex flex-col items-center text-gray-400">
          <MapPin className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Trips</span>
        </Link>
        <Link href="/dashboard/daily-wellness" className="flex flex-col items-center text-gray-400">
          <Heart className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Well</span>
        </Link>
        <Link href="/dashboard/health" className="flex flex-col items-center text-gray-400">
          <Droplets className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Health</span>
        </Link>
        <Link href="/dashboard/empty-states" className="flex flex-col items-center text-gray-400">
          <Sparkles className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Empty</span>
        </Link>
        <Link href="/dashboard/loading-states" className="flex flex-col items-center text-gray-400">
          <Sparkles className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Loading</span>
        </Link>
        <Link href="/dashboard/error-states" className="flex flex-col items-center text-gray-400">
          <Sparkles className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Error</span>
        </Link>
      </nav>
    </div>
  );
}
