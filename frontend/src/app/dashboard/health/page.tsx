"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ERRORS } from "@/lib/errors";
import {
  Activity,
  Bed,
  Droplets,
  Heart,
  Plus,
  Scale,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type HealthMetricType = "heart_rate" | "weight" | "blood_pressure" | "steps" | "water_intake";
type RangeFilter = "7" | "30" | "90" | "all";
type LogType = HealthMetricType | "sleep";

type HealthMetric = {
  id: string;
  metricType: HealthMetricType;
  value: number;
  unit: string;
  recordedAt: number;
};

type WellnessLog = {
  id: string;
  type: string;
  rating: number | null;
  duration: number | null;
  loggedAt: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sparklinePath(values: number[]): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 24 - ((value - min) / range) * 18;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export default function HealthPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [sleepLogs, setSleepLogs] = useState<WellnessLog[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [range, setRange] = useState<RangeFilter>("30");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeLogType, setActiveLogType] = useState<LogType | null>(null);
  const [metricValueInput, setMetricValueInput] = useState("");
  const [metricUnitInput, setMetricUnitInput] = useState("");
  const [sleepHoursInput, setSleepHoursInput] = useState("");
  const [sleepQualityInput, setSleepQualityInput] = useState("4");

  const rangeStart = useMemo(() => {
    if (range === "all") return 0;
    const days = Number(range);
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [range]);

  const loadHealthData = useCallback(async () => {
    if (!token) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [metricsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
        fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
      ]);

      if (!metricsRes.ok || !logsRes.ok) {
        throw new Error(ERRORS.DATA_LOAD_FAILED);
      }

      const metricsPayload = (await metricsRes.json()) as unknown;
      const logsPayload = (await logsRes.json()) as unknown;

      const metricsData = unwrapData<{ metrics?: HealthMetric[] }>(metricsPayload);
      const logsData = unwrapData<{ logs?: WellnessLog[] }>(logsPayload);

      setMetrics(metricsData.metrics ?? []);
      setSleepLogs((logsData.logs ?? []).filter((log) => log.type === "sleep"));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : ERRORS.DATA_LOAD_FAILED);
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !token) {
      setIsFetching(false);
      return;
    }
    void loadHealthData();
  }, [user, token, loadHealthData]);

  const filteredMetrics = useMemo(
    () => metrics.filter((metric) => metric.recordedAt >= rangeStart),
    [metrics, rangeStart],
  );

  const filteredSleep = useMemo(
    () => sleepLogs.filter((log) => log.loggedAt >= rangeStart),
    [sleepLogs, rangeStart],
  );

  const latestByType = useMemo(() => {
    const source = filteredMetrics.length > 0 ? filteredMetrics : metrics;
    const findLatest = (type: HealthMetricType): HealthMetric | null =>
      source.find((metric) => metric.metricType === type) ?? metrics.find((metric) => metric.metricType === type) ?? null;

    const latestSleep =
      (filteredSleep.length > 0 ? filteredSleep : sleepLogs).find((log) => log.type === "sleep") ?? null;

    return {
      heartRate: findLatest("heart_rate"),
      weight: findLatest("weight"),
      bloodPressure: findLatest("blood_pressure"),
      steps: findLatest("steps"),
      water: findLatest("water_intake"),
      sleep: latestSleep,
    };
  }, [filteredMetrics, metrics, filteredSleep, sleepLogs]);

  const chartSeries = useMemo(() => {
    const source = filteredMetrics.length > 0 ? filteredMetrics : metrics;
    const byType = (type: HealthMetricType): number[] =>
      source
        .filter((metric) => metric.metricType === type)
        .slice(0, 7)
        .reverse()
        .map((metric) => metric.value);

    const sleepHours = (filteredSleep.length > 0 ? filteredSleep : sleepLogs)
      .slice(0, 7)
      .reverse()
      .map((log) => (log.duration ? log.duration / 60 : 0))
      .filter((value) => value > 0);

    return {
      heart: byType("heart_rate"),
      weight: byType("weight"),
      bloodPressure: byType("blood_pressure"),
      sleep: sleepHours,
    };
  }, [filteredMetrics, metrics, filteredSleep, sleepLogs]);

  const stepsProgress = useMemo(() => {
    const current = toNumber(latestByType.steps?.value) ?? 0;
    return Math.max(0, Math.min(100, Math.round((current / 10000) * 100)));
  }, [latestByType.steps]);

  const waterProgress = useMemo(() => {
    const value = toNumber(latestByType.water?.value) ?? 0;
    const unit = (latestByType.water?.unit ?? "").toLowerCase();
    const liters = unit.includes("ml") ? value / 1000 : value;
    return Math.max(0, Math.min(100, Math.round((liters / 2.5) * 100)));
  }, [latestByType.water]);

  const openLogModal = (type: LogType) => {
    setActiveLogType(type);
    setError(null);
    setSuccess(null);

    if (type === "sleep") {
      setSleepHoursInput("");
      setSleepQualityInput("4");
      return;
    }

    const defaultUnits: Record<HealthMetricType, string> = {
      heart_rate: "bpm",
      weight: "kg",
      blood_pressure: "mmHg",
      steps: "steps",
      water_intake: "L",
    };

    setMetricValueInput("");
    setMetricUnitInput(defaultUnits[type]);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setActiveLogType(null);
  };

  const submitLog = async () => {
    if (!token || !activeLogType) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeLogType === "sleep") {
        const hours = Number(sleepHoursInput);
        const quality = Number(sleepQualityInput);

        if (!Number.isFinite(hours) || hours <= 0 || !Number.isFinite(quality)) {
          throw new Error("Enter valid sleep hours and quality.");
        }

        const sleepResponse = await fetch(`${API_URL}/api/protected/wellness-logs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "sleep",
            duration: Math.round(hours * 60),
            rating: Math.max(1, Math.min(5, Math.round(quality))),
          }),
        });

        const sleepPayload = (await sleepResponse.json()) as unknown;
        if (!sleepResponse.ok) {
          const envelope = sleepPayload as ApiEnvelope<unknown>;
          throw new Error(envelope.error || "Failed to log sleep.");
        }
      } else {
        const value = Number(metricValueInput);
        if (!Number.isFinite(value) || value <= 0) {
          throw new Error("Enter a valid metric value.");
        }

        const metricResponse = await fetch(`${API_URL}/api/protected/health-metrics`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metricType: activeLogType,
            value,
            unit: metricUnitInput.trim() || "unit",
          }),
        });

        const metricPayload = (await metricResponse.json()) as unknown;
        if (!metricResponse.ok) {
          const envelope = metricPayload as ApiEnvelope<unknown>;
          throw new Error(envelope.error || "Failed to log metric.");
        }
      }

      setSuccess("Health metric logged successfully.");
      setActiveLogType(null);
      await loadHealthData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ERRORS.DATA_SAVE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF0F3]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FF8E9E] border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-12"
      style={{
        backgroundColor: "#FFF0F3",
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255, 182, 193, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 192, 203, 0.2) 0%, transparent 50%)",
      }}
    >
      <nav className="sticky top-0 z-50 border-b border-pink-50 bg-white/60 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 text-pink-600">
            <Sparkles className="h-6 w-6" />
            <span className="text-xl font-bold">WellbeingHub</span>
          </div>
          <div className="flex items-center gap-6">
            <Link className="font-medium text-pink-600 hover:text-pink-400" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-medium text-gray-500 hover:text-pink-400" href="/dashboard/wellbeing-analysis">
              History
            </Link>
            <Link className="font-medium text-gray-500 hover:text-pink-400" href="/dashboard/settings">
              Settings
            </Link>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-pink-200">
              <div
                aria-label="User profile"
                className="h-full w-full bg-cover bg-center"
                style={user.profilePicture ? { backgroundImage: `url(${user.profilePicture})` } : undefined}
              >
                {!user.profilePicture && (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-pink-700">
                    {(user.firstName?.[0] ?? "W").toUpperCase()}
                    {(user.lastName?.[0] ?? "H").toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-10">
        <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-pink-600">Your Health Metrics</h1>
            <p className="italic text-pink-400">&quot;Nurture your body, bloom from within.&quot;</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/health/log"
              className="rounded-full bg-[#FF8E9E] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition-colors hover:bg-[#ff7e8e]"
            >
              Open Health Logging
            </Link>
          <div className="flex items-center rounded-full border border-pink-200 bg-white/50 p-1.5 shadow-sm backdrop-blur">
            {[
              { label: "Last 7 days", value: "7" as const },
              { label: "30 days", value: "30" as const },
              { label: "90 days", value: "90" as const },
              { label: "All time", value: "all" as const },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  range === option.value
                    ? "bg-[#FF8E9E] px-6 font-semibold text-white shadow-lg shadow-pink-200"
                    : "text-gray-500 hover:bg-pink-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          </div>
        </header>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-pink-50 p-3">
                <Heart className="h-6 w-6 text-[#E24B4A]" />
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E24B4A]">
                {latestByType.heartRate ? "Tracked" : "No Data"}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Heart Rate</h3>
            <div className="mb-4 mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-800">{latestByType.heartRate?.value ?? "--"}</span>
              <span className="font-medium text-gray-400">{latestByType.heartRate?.unit ?? "bpm"}</span>
            </div>
            <div className="mb-3 h-16 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <path d={sparklinePath(chartSeries.heart)} fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              {latestByType.heartRate ? `Last log: ${formatDateTime(latestByType.heartRate.recordedAt)}` : "No heart rate logs yet."}
            </p>
            <button
              type="button"
              onClick={() => openLogModal("heart_rate")}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#FF7E8E] py-4 font-bold text-white shadow-lg shadow-pink-100 transition-colors hover:bg-[#ff6b7d]"
            >
              <Plus className="h-4 w-4" /> Log Heart Rate
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-blue-50 p-3">
                <Scale className="h-6 w-6 text-[#185FA5]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Goal: 65 kg</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Weight</h3>
            <div className="mb-2 mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-800">{latestByType.weight?.value ?? "--"}</span>
              <span className="font-medium text-gray-400">{latestByType.weight?.unit ?? "kg"}</span>
            </div>
            <div className="mb-6 mt-3 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-[#8BB8A1]"
                style={{
                  width: `${
                    Math.max(
                      0,
                      Math.min(
                        100,
                        latestByType.weight ? Math.round((Math.min(latestByType.weight.value, 100) / 100) * 100) : 0,
                      ),
                    )
                  }%`,
                }}
              />
            </div>
            <div className="mb-3 h-12 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <path d={sparklinePath(chartSeries.weight)} fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              {latestByType.weight ? `Last log: ${formatDateTime(latestByType.weight.recordedAt)}` : "No weight logs yet."}
            </p>
            <button
              type="button"
              onClick={() => openLogModal("weight")}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#8BB8A1] py-4 font-bold text-white shadow-lg shadow-green-100 transition-colors hover:bg-[#7aa991]"
            >
              <Plus className="h-4 w-4" /> Log Weight
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-teal-50 p-3">
                <Shield className="h-6 w-6 text-[#0F6E56]" />
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F6E56]">
                {latestByType.bloodPressure ? "Tracked" : "No Data"}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Blood Pressure</h3>
            <div className="mb-4 mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{latestByType.bloodPressure?.value ?? "--"}</span>
              <span className="text-xs font-medium text-gray-400">{latestByType.bloodPressure?.unit ?? "mmHg"}</span>
            </div>
            <div className="mb-3 h-16 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <path d={sparklinePath(chartSeries.bloodPressure)} fill="none" opacity="0.85" stroke="#0F6E56" strokeWidth="2" />
              </svg>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              {latestByType.bloodPressure
                ? `Last log: ${formatDateTime(latestByType.bloodPressure.recordedAt)}`
                : "No blood pressure logs yet."}
            </p>
            <button
              type="button"
              onClick={() => openLogModal("blood_pressure")}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#FF8E9E] py-4 font-bold text-white shadow-lg shadow-pink-100 transition-colors hover:bg-[#ff7e8e]"
            >
              <Plus className="h-4 w-4" /> Log Blood Pressure
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-amber-50 p-3">
                <Activity className="h-6 w-6 text-[#FF8E9E]" />
              </div>
              <span className="text-xs font-bold text-[#FF8E9E]">{stepsProgress}% Daily Goal</span>
            </div>
            <div className="mb-4 flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#FF8E9E"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (stepsProgress / 100) * 251.2}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600">
                  {latestByType.steps ? `${Math.round(latestByType.steps.value).toLocaleString()}` : "--"}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Daily Steps</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">
                    {latestByType.steps ? Math.round(latestByType.steps.value).toLocaleString() : "--"}
                  </span>
                </div>
                <span className="text-xs text-gray-400">/ 10,000 steps</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLogModal("steps")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#FF8E9E] py-4 font-bold text-white shadow-lg shadow-pink-100 transition-colors hover:bg-[#ff7e8e]"
            >
              <Plus className="h-4 w-4" /> Log Steps
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-blue-50 p-3">
                <Droplets className="h-6 w-6 text-[#8BB8A1]" />
              </div>
              <span className="text-xs font-bold text-[#8BB8A1]">{waterProgress}% Intake</span>
            </div>
            <div className="mb-6 flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8BB8A1"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (waterProgress / 100) * 251.2}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600">
                  {latestByType.water ? `${latestByType.water.value}${latestByType.water.unit}` : "--"}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Water Intake</h3>
                <span className="text-2xl font-bold text-gray-800">
                  {latestByType.water ? `${latestByType.water.value}${latestByType.water.unit}` : "--"}
                </span>
                <p className="text-xs text-gray-400">/ 2.5L goal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLogModal("water_intake")}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#8BB8A1] py-4 font-bold text-white shadow-lg shadow-green-100 transition-colors hover:bg-[#7aa991]"
            >
              <Plus className="h-4 w-4" /> Log Water Intake
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[3rem] border border-[rgba(255,182,193,0.4)] bg-white/95 p-8 shadow-[0_15px_35px_-5px_rgba(255,182,193,0.2)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-2xl bg-indigo-50 p-3">
                <Bed className="h-6 w-6 text-[#534AB7]" />
              </div>
              <div className="flex text-[#534AB7]">
                {Array.from({ length: 5 }).map((_, index) => {
                  const rating = latestByType.sleep?.rating ?? 0;
                  return <Waves key={index} className={`h-4 w-4 ${index < rating ? "opacity-100" : "opacity-20"}`} />;
                })}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Sleep Quality</h3>
            <div className="mb-4 mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-800">
                {latestByType.sleep?.duration ? (latestByType.sleep.duration / 60).toFixed(1) : "--"}
              </span>
              <span className="font-medium text-gray-400">hours</span>
            </div>
            <div className="mb-3 h-16 w-full">
              <svg className="h-full w-full" viewBox="0 0 100 30">
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#534AB7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#534AB7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${sparklinePath(chartSeries.sleep)} L100,30 L0,30 Z`} fill="url(#sleepGradient)" />
                <path d={sparklinePath(chartSeries.sleep)} fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              {latestByType.sleep ? `Last log: ${formatDateTime(latestByType.sleep.loggedAt)}` : "No sleep logs yet."}
            </p>
            <button
              type="button"
              onClick={() => openLogModal("sleep")}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#A594F9] py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-[#9281e6]"
            >
              <Plus className="h-4 w-4" /> Log Sleep
            </button>
          </section>
        </div>

        <footer className="mt-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-[1px] w-8 bg-pink-200" />
            <div className="text-pink-300">🌸</div>
            <span className="h-[1px] w-8 bg-pink-200" />
          </div>
          <p className="text-sm text-pink-400">© 2026 WellbeingHub. Designed for your balanced life.</p>
        </footer>
      </main>

      {activeLogType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-2xl">
            <h2 className="mb-1 text-2xl font-bold text-pink-600">
              {activeLogType === "sleep" ? "Log Sleep" : `Log ${activeLogType.replace("_", " ")}`}
            </h2>
            <p className="mb-6 text-sm text-gray-500">Save a new health entry to sync your dashboard.</p>

            {activeLogType === "sleep" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Hours slept</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={sleepHoursInput}
                    onChange={(event) => setSleepHoursInput(event.target.value)}
                    className="w-full rounded-xl border border-pink-100 px-3 py-2"
                    placeholder="e.g. 7.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Sleep quality (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={sleepQualityInput}
                    onChange={(event) => setSleepQualityInput(event.target.value)}
                    className="w-full rounded-xl border border-pink-100 px-3 py-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Value</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={metricValueInput}
                    onChange={(event) => setMetricValueInput(event.target.value)}
                    className="w-full rounded-xl border border-pink-100 px-3 py-2"
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">Unit</label>
                  <input
                    type="text"
                    value={metricUnitInput}
                    onChange={(event) => setMetricUnitInput(event.target.value)}
                    className="w-full rounded-xl border border-pink-100 px-3 py-2"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-xl border border-pink-100 px-4 py-2 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitLog()}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#FF8E9E] px-4 py-2 font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
