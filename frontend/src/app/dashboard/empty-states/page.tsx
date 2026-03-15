"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flower2,
  Heart,
  Luggage,
  Moon,
  Plus,
  Sparkles,
  User,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type Trip = {
  id: string;
  startDate: number | null;
  endDate: number | null;
};

type WellnessLog = {
  id: string;
  type: string;
  loggedAt: number;
};

type HealthMetric = {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  recordedAt: number;
};

type TripDetails = {
  activities?: Array<{ id: string }>;
};

type SettingsState = {
  connectedGoogle: boolean;
  connectedApple: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function getDistinctDayCount(timestamps: number[]): number {
  return new Set(
    timestamps.map((ts) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }),
  ).size;
}

export default function EmptyStatesPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [settings, setSettings] = useState<SettingsState>({ connectedGoogle: false, connectedApple: false });
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [isConnecting, setIsConnecting] = useState<"apple" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const fetchAll = useCallback(async () => {
    if (!token) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tripsRes, logsRes, metricsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/protected/trips`, { headers }),
        fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
        fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
        fetch(`${API_URL}/api/protected/settings`, { headers }),
      ]);

      if (!tripsRes.ok || !logsRes.ok || !metricsRes.ok || !settingsRes.ok) {
        throw new Error("Failed to load empty state data.");
      }

      const tripsPayload = (await tripsRes.json()) as unknown;
      const logsPayload = (await logsRes.json()) as unknown;
      const metricsPayload = (await metricsRes.json()) as unknown;
      const settingsPayload = (await settingsRes.json()) as unknown;

      const tripsData = unwrapData<{ trips?: Trip[] }>(tripsPayload);
      const logsData = unwrapData<{ logs?: WellnessLog[] }>(logsPayload);
      const metricsData = unwrapData<{ metrics?: HealthMetric[] }>(metricsPayload);
      const settingsData = unwrapData<{ settings?: SettingsState }>(settingsPayload);

      const nextTrips = tripsData.trips ?? [];
      setTrips(nextTrips);
      setLogs(logsData.logs ?? []);
      setMetrics(metricsData.metrics ?? []);
      setSettings(
        settingsData.settings ?? {
          connectedApple: false,
          connectedGoogle: false,
        },
      );

      if (nextTrips.length > 0) {
        const activityResponses = await Promise.all(
          nextTrips.slice(0, 12).map(async (trip) => {
            const res = await fetch(`${API_URL}/api/protected/trips/${trip.id}`, { headers });
            if (!res.ok) return 0;
            const payload = (await res.json()) as unknown;
            const details = unwrapData<TripDetails>(payload);
            return details.activities?.length ?? 0;
          }),
        );

        setActivitiesCount(activityResponses.reduce((sum, count) => sum + count, 0));
      } else {
        setActivitiesCount(0);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load data.");
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      setIsFetching(false);
      return;
    }

    void fetchAll();
  }, [user, token, fetchAll]);

  const derived = useMemo(() => {
    const moodCount = logs.filter((log) => log.type === "mood").length;
    const sleepLogs = logs.filter((log) => log.type === "sleep");
    const sleepDays = getDistinctDayCount(sleepLogs.map((log) => log.loggedAt));
    const meditationCount = logs.filter((log) => log.type === "meditation").length;

    const analyticsReady = moodCount >= 3 && sleepDays >= 5 && meditationCount >= 1;

    return {
      tripCount: trips.length,
      wellnessCount: logs.length,
      metricCount: metrics.length,
      moodCount,
      sleepDays,
      meditationCount,
      analyticsReady,
      moodRemaining: Math.max(0, 3 - moodCount),
      sleepRemaining: Math.max(0, 5 - sleepDays),
      meditationRemaining: Math.max(0, 1 - meditationCount),
    };
  }, [trips, logs, metrics]);

  const connectProvider = async (provider: "apple" | "google") => {
    if (!token) return;

    setIsConnecting(provider);
    setError(null);
    setSuccess(null);

    try {
      const payload =
        provider === "apple"
          ? { connectedApple: true }
          : { connectedGoogle: true };

      const response = await fetch(`${API_URL}/api/protected/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as ApiEnvelope<unknown>;
      if (!response.ok) {
        throw new Error(body.error || "Unable to connect provider.");
      }

      setSuccess(provider === "apple" ? "Apple Health connected." : "Google Fit connected.");
      await fetchAll();
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Connection failed.");
    } finally {
      setIsConnecting(null);
    }
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f7]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-900 dark:bg-[#221610] dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-pink-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ec5b13]/10 text-[#ec5b13]">
              <Flower2 className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">WellbeingHub</h1>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm font-semibold text-[#ec5b13]" href="/dashboard">Dashboard</Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-[#ec5b13] dark:text-slate-400" href="/dashboard/daily-wellness">Journal</Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-[#ec5b13] dark:text-slate-400" href="/dashboard/trips">Retreats</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchAll()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Refresh"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-[#ec5b13] bg-[#fce7f3] flex items-center justify-center text-[#ec5b13] font-bold">
              {(user.firstName?.[0] ?? "W").toUpperCase()}
              {(user.lastName?.[0] ?? "H").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-24 px-4 py-12">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <section className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-pink-100 dark:bg-slate-800/50">
            <Luggage className="h-28 w-28 text-[#ec5b13]/40" />
            <div className="absolute -right-4 top-10 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CalendarDays className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {derived.tripCount === 0 ? "No trips planned yet" : `${derived.tripCount} trip${derived.tripCount > 1 ? "s" : ""} planned`}
          </h2>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
            {derived.tripCount === 0
              ? "Your next adventure for the soul is waiting. Start your journey by planning your first retreat or getaway."
              : "Great progress. Continue planning new mindful journeys and add activities to each trip."}
          </p>
          <Link
            href="/dashboard/trips"
            className="mt-8 flex items-center gap-2 rounded-xl bg-[#ec5b13] px-8 py-4 font-bold text-white shadow-lg shadow-[#ec5b13]/30 transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            {derived.tripCount === 0 ? "Create Your First Trip" : "Open Trip Planner"}
          </Link>
        </section>

        <section className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-green-500/10 dark:bg-slate-800/50">
            <Sparkles className="h-28 w-28 text-green-600/40" />
            <div className="absolute -left-4 bottom-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#ec5b13]/20">
              <Heart className="h-10 w-10 text-[#ec5b13]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {derived.wellnessCount === 0 ? "No wellness logged yet" : `${derived.wellnessCount} wellness logs recorded`}
          </h2>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
            Keep tracking mood, mindfulness, and rest. Consistent logging unlocks better analytics.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard/daily-wellness" className="flex items-center gap-2 rounded-xl bg-[#ec5b13] px-6 py-3 font-bold text-white shadow-md shadow-[#ec5b13]/20">
              <Heart className="h-4 w-4" />
              Log Mood
            </Link>
            <Link href="/dashboard/health/log" className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-white shadow-md shadow-green-500/20">
              <Moon className="h-4 w-4" />
              Log Sleep
            </Link>
            <Link href="/dashboard/daily-wellness" className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 font-bold text-white shadow-md dark:bg-slate-700">
              <Sparkles className="h-4 w-4" />
              Journal Entry
            </Link>
          </div>
        </section>

        <section className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-pink-100 dark:bg-slate-800/50">
            <Heart className="h-28 w-28 text-[#ec5b13]/40" />
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="h-48 w-48 rounded-full border-2 border-dashed border-[#ec5b13]/30" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {derived.metricCount === 0 ? "Connect your health data" : `${derived.metricCount} health metrics synced`}
          </h2>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
            Sync your favorite providers for a complete picture of physical and mental wellbeing.
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => void connectProvider("apple")}
              disabled={isConnecting !== null || settings.connectedApple}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Heart className="h-4 w-4 text-red-500" />
              {settings.connectedApple ? "Apple Health Connected" : isConnecting === "apple" ? "Connecting..." : "Connect Apple Health"}
            </button>
            <button
              type="button"
              onClick={() => void connectProvider("google")}
              disabled={isConnecting !== null || settings.connectedGoogle}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <User className="h-4 w-4 text-blue-500" />
              {settings.connectedGoogle ? "Google Fit Connected" : isConnecting === "google" ? "Connecting..." : "Connect Google Fit"}
            </button>
          </div>
        </section>

        <section className="flex flex-col items-center text-center">
          <div className="relative mb-8 flex h-64 w-64 items-center justify-center rounded-full bg-green-500/10 dark:bg-slate-800/50">
            <CalendarDays className="h-28 w-28 text-green-600/40" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-pink-100 bg-white px-3 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ec5b13]">
                {activitiesCount === 0 ? "Empty Schedule" : `${activitiesCount} Activities`}
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {activitiesCount === 0 ? "No activities planned" : "Activities planned"}
          </h2>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
            Add mindful activities to your trips and build your intentional schedule.
          </p>
          <Link
            href="/dashboard/trips"
            className="mt-8 flex items-center gap-2 rounded-xl bg-green-500 px-8 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            {activitiesCount === 0 ? "Add First Activity" : "Manage Activities"}
          </Link>
        </section>

        <section className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-pink-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50 md:grid-cols-2">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ec5b13]/10 text-[#ec5b13]">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {derived.analyticsReady ? "Analytics unlocked" : "Not enough data yet"}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {derived.analyticsReady
                ? "You now have enough data for strong personalized trend insights."
                : "We need a few more logs to generate your personalized wellness insights and trends."}
            </p>

            <div className="mt-8 w-full space-y-3">
              <div className={`flex items-center gap-3 rounded-xl border p-3 ${derived.moodRemaining === 0 ? "border-emerald-200 bg-emerald-50" : "border-pink-100 bg-pink-50"}`}>
                {derived.moodRemaining === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-400" />}
                <span className="text-sm font-medium">
                  {derived.moodRemaining === 0 ? "Mood logging complete" : `Log ${derived.moodRemaining} more mood entr${derived.moodRemaining > 1 ? "ies" : "y"}`}
                </span>
              </div>

              <div className={`flex items-center gap-3 rounded-xl border p-3 ${derived.sleepRemaining === 0 ? "border-emerald-200 bg-emerald-50" : "border-pink-100 bg-pink-50"}`}>
                {derived.sleepRemaining === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-400" />}
                <span className="text-sm font-medium">
                  {derived.sleepRemaining === 0 ? "Sleep coverage complete" : `Track sleep for ${derived.sleepRemaining} more day${derived.sleepRemaining > 1 ? "s" : ""}`}
                </span>
              </div>

              <div className={`flex items-center gap-3 rounded-xl border p-3 ${derived.meditationRemaining === 0 ? "border-emerald-200 bg-emerald-50" : "border-pink-100 bg-pink-50"}`}>
                {derived.meditationRemaining === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-400" />}
                <span className="text-sm font-medium">
                  {derived.meditationRemaining === 0 ? "Mindfulness session complete" : "Complete 1 mindfulness session"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex aspect-square items-center justify-center">
            <div className="flex h-full w-full max-h-80 flex-col justify-end gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-40 items-end gap-2">
                <div className="h-[20%] flex-1 rounded-t-lg bg-slate-200 dark:bg-slate-700" />
                <div className="h-[40%] flex-1 rounded-t-lg border-t-2 border-dashed border-[#ec5b13] bg-[#ec5b13]/20" />
                <div className="h-[15%] flex-1 rounded-t-lg bg-slate-200 dark:bg-slate-700" />
                <div className="h-[30%] flex-1 rounded-t-lg bg-slate-200 dark:bg-slate-700" />
                <div className="h-[60%] flex-1 rounded-t-lg border-t-2 border-dashed border-[#ec5b13] bg-[#ec5b13]/20" />
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-700" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl dark:bg-slate-900">
                  {derived.analyticsReady ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-[#ec5b13]" />}
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {derived.analyticsReady ? "Insights Ready" : "Awaiting Data"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-pink-100 bg-white py-12 dark:bg-[#221610]">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-center gap-2">
            <Flower2 className="h-5 w-5 text-[#ec5b13]" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">WellbeingHub</p>
          </div>
          <p className="text-xs text-slate-500">© 2026 WellbeingHub. Designed for your inner peace.</p>
        </div>
      </footer>
    </div>
  );
}
