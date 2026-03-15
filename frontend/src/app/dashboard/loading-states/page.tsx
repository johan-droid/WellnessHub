"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Bell, Flower2, Map, LayoutDashboard, Send } from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type Trip = {
  id: string;
  title: string;
  destination: string | null;
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
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function SkeletonTripCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rose-50 bg-white shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
      <div className="skeleton h-40 w-full" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function LoadingStatesPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tripsRes, logsRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/api/protected/trips`, { headers }),
        fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
        fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
      ]);

      if (!tripsRes.ok || !logsRes.ok || !metricsRes.ok) {
        throw new Error("Failed to load data from backend.");
      }

      const tripsPayload = (await tripsRes.json()) as unknown;
      const logsPayload = (await logsRes.json()) as unknown;
      const metricsPayload = (await metricsRes.json()) as unknown;

      setTrips(unwrapData<{ trips?: Trip[] }>(tripsPayload).trips ?? []);
      setLogs(unwrapData<{ logs?: WellnessLog[] }>(logsPayload).logs ?? []);
      setMetrics(unwrapData<{ metrics?: HealthMetric[] }>(metricsPayload).metrics ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load state collection.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }
    void fetchData();
  }, [token, user, fetchData]);

  const saveProgress = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/wellness-logs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "meditation",
          duration: 10,
          notes: "Saved from loading state action",
        }),
      });

      const payload = (await response.json()) as ApiEnvelope<unknown>;
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save progress.");
      }

      setSuccess("Progress saved successfully.");
      await fetchData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save progress.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafb] dark:bg-[#221610]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffafb] font-display text-slate-900 transition-colors duration-300 dark:bg-[#221610] dark:text-slate-100">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #fce7f3 25%, #fbcfe8 50%, #fce7f3 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        .pulse-soft {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-rose-900/30 dark:bg-[#221610]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-[#ec5b13]">
              <Flower2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Wellbeing<span className="text-[#ec5b13]">Hub</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="mr-6 hidden gap-6 md:flex">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#ec5b13] dark:text-slate-300">
                Dashboard
              </Link>
              <Link href="/dashboard/empty-states" className="text-sm font-semibold text-slate-600 hover:text-[#ec5b13] dark:text-slate-300">
                Empty States
              </Link>
              <Link href="/dashboard/loading-states" className="text-sm font-semibold text-[#ec5b13]">
                Loading States
              </Link>
            </div>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-[#fce7f3] bg-[#fce7f3]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 p-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <LayoutDashboard className="h-5 w-5 text-rose-400" /> Dashboard
            </h3>
            <span className="text-xs font-medium uppercase tracking-widest text-rose-400">
              {isLoading ? "Loading View" : "Loaded"}
            </span>
          </div>

          <div className={`relative h-48 w-full overflow-hidden rounded-xl border border-rose-100 md:h-64 dark:border-rose-900/20 ${isLoading ? "skeleton" : "bg-white dark:bg-slate-800/50"}`}>
            {!isLoading && (
              <div className="absolute inset-0 flex flex-col justify-end gap-2 p-8">
                <div className="text-2xl font-bold">Welcome back</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Trips: {trips.length} • Logs: {logs.length} • Metrics: {metrics.length}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-4 rounded-xl border border-rose-50 bg-white p-6 shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-8 w-16 rounded-lg" />
                  </div>
                ))
              : [
                  { label: "Trips", value: trips.length },
                  { label: "Wellness Logs", value: logs.length },
                  { label: "Health Metrics", value: metrics.length },
                  { label: "Loaded", value: 1 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2 rounded-xl border border-rose-50 bg-white p-6 shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
                    <div className="text-3xl font-bold text-[#ec5b13]">{item.value}</div>
                  </div>
                ))}
          </div>
        </section>

        <hr className="border-rose-100 dark:border-rose-900/20" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Map className="h-5 w-5 text-rose-400" /> My Trips
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonTripCard key={index} />)
              : trips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="flex flex-col overflow-hidden rounded-xl border border-rose-50 bg-white shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
                    <div className="h-40 w-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-slate-700 dark:to-slate-800" />
                    <div className="space-y-2 p-5">
                      <div className="text-lg font-semibold">{trip.title || "Untitled Trip"}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{trip.destination || "Destination not set"}</div>
                      <div className="pt-2 text-xs text-[#ec5b13]">ID: {trip.id.slice(0, 8)}</div>
                    </div>
                  </div>
                ))}
            {!isLoading && trips.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-rose-200 bg-white p-8 text-center text-slate-500 dark:border-rose-900/30 dark:bg-slate-800/30 dark:text-slate-400">
                No trips available yet.
              </div>
            )}
          </div>
        </section>

        <hr className="border-rose-100 dark:border-rose-900/20" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-rose-400" /> Analytics
            </h3>
          </div>
          <div className="rounded-xl border border-rose-50 bg-white p-8 shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
            <div className="flex h-64 items-end justify-between gap-4 md:h-80">
              {Array.from({ length: 12 }).map((_, index) => {
                const value = isLoading ? Math.max(20, ((index * 17) % 100)) : Math.max(20, ((metrics[index % Math.max(metrics.length, 1)]?.value ?? 40) % 100));
                return (
                  <div
                    key={index}
                    className={`${isLoading ? "skeleton pulse-soft" : "bg-[#ec5b13]/25 border-t-2 border-dashed border-[#ec5b13]"} flex-1 rounded-t-lg`}
                    style={{ height: `${value}%` }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <hr className="border-rose-100 dark:border-rose-900/20" />

        <section className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Send className="h-5 w-5 text-rose-400" /> Actions
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-rose-50 bg-white p-10 shadow-sm dark:border-rose-900/10 dark:bg-slate-800/50">
            <p className="text-sm italic text-slate-500 dark:text-slate-400">Example loading action uses real backend write</p>
            <button
              type="button"
              onClick={() => void saveProgress()}
              disabled={isSaving}
              className="flex items-center gap-3 rounded-xl bg-[#ec5b13] px-8 py-3 font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all active:scale-95 disabled:cursor-wait disabled:opacity-80"
            >
              {isSaving ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Saving your progress...</span>
                </>
              ) : (
                <span>Save Progress</span>
              )}
            </button>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed -left-20 top-20 -z-10 h-64 w-64 rounded-full bg-rose-100/30 blur-3xl" />
      <div className="pointer-events-none fixed -right-20 bottom-20 -z-10 h-80 w-80 rounded-full bg-[#ec5b13]/5 blur-3xl" />

      <footer className="mx-auto max-w-7xl border-t border-rose-100 px-6 py-10 text-center dark:border-rose-900/20">
        <p className="text-sm text-slate-400 dark:text-slate-500">© 2026 WellbeingHub. Handcrafted with love.</p>
      </footer>
    </div>
  );
}
