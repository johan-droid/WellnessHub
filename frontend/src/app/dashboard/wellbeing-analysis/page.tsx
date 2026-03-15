"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, Lightbulb, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type MetricType = "heart_rate" | "weight" | "sleep_hours" | "steps" | "water_intake";
type CompareType = "baseline" | "goal" | "previous_month" | "community";
type ChartType = "area" | "line" | "bar";

type HealthMetric = {
  id: string;
  metricType: "heart_rate" | "weight" | "blood_pressure" | "water_intake" | "steps";
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

type Trip = {
  id: string;
  destination: string | null;
  startDate: number | null;
  endDate: number | null;
};

type Point = {
  day: string;
  ts: number;
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

function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string, endOfDay = false): number {
  const date = new Date(value + (endOfDay ? "T23:59:59" : "T00:00:00"));
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export default function WellbeingAnalysisPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const [draftMetric, setDraftMetric] = useState<MetricType>("weight");
  const [draftCompare, setDraftCompare] = useState<CompareType>("goal");
  const [draftChartType, setDraftChartType] = useState<ChartType>("area");
  const [draftFrom, setDraftFrom] = useState(formatInputDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [draftTo, setDraftTo] = useState(formatInputDate(now));

  const [metricType, setMetricType] = useState<MetricType>("weight");
  const [compareTo, setCompareTo] = useState<CompareType>("goal");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [fromDate, setFromDate] = useState(formatInputDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(formatInputDate(now));

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const loadData = useCallback(async () => {
    if (!token) {
      setIsFetching(false);
      return;
    }

    setError(null);
    setIsFetching(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [metricsRes, logsRes, tripsRes] = await Promise.all([
        fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
        fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
        fetch(`${API_URL}/api/protected/trips`, { headers }),
      ]);

      if (!metricsRes.ok || !logsRes.ok || !tripsRes.ok) {
        throw new Error("Failed to load comparison data.");
      }

      const metricsPayload = (await metricsRes.json()) as unknown;
      const logsPayload = (await logsRes.json()) as unknown;
      const tripsPayload = (await tripsRes.json()) as unknown;

      setMetrics(unwrapData<{ metrics?: HealthMetric[] }>(metricsPayload).metrics ?? []);
      setLogs(unwrapData<{ logs?: WellnessLog[] }>(logsPayload).logs ?? []);
      setTrips(unwrapData<{ trips?: Trip[] }>(tripsPayload).trips ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load analytics.");
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setIsFetching(false);
      return;
    }

    void loadData();
  }, [token, user, loadData]);

  const metricMeta = useMemo(() => {
    const goalMap: Record<MetricType, number> = {
      heart_rate: 72,
      weight: 135,
      sleep_hours: 8,
      steps: 10000,
      water_intake: 2500,
    };

    const unitMap: Record<MetricType, string> = {
      heart_rate: "bpm",
      weight: "lbs",
      sleep_hours: "hrs",
      steps: "steps",
      water_intake: "ml",
    };

    const titleMap: Record<MetricType, string> = {
      heart_rate: "Heart Rate (BPM)",
      weight: "Weight Tracking",
      sleep_hours: "Sleep Quality",
      steps: "Daily Steps",
      water_intake: "Water Intake",
    };

    return {
      goal: goalMap[metricType],
      unit: unitMap[metricType],
      title: titleMap[metricType],
    };
  }, [metricType]);

  const normalizedPoints = useMemo(() => {
    const startTs = parseDateInput(fromDate);
    const endTs = parseDateInput(toDate, true);

    if (!startTs || !endTs || endTs < startTs) {
      return [] as Point[];
    }

    const map = new Map<string, { ts: number; values: number[] }>();

    if (metricType === "sleep_hours") {
      logs
        .filter((log) => log.type === "sleep" && (log.duration ?? 0) > 0)
        .forEach((log) => {
          if (log.loggedAt < startTs || log.loggedAt > endTs) return;
          const date = new Date(log.loggedAt);
          const key = formatInputDate(date);
          const existing = map.get(key) ?? { ts: new Date(key + "T00:00:00").getTime(), values: [] };
          existing.values.push((log.duration ?? 0) / 60);
          map.set(key, existing);
        });
    } else {
      const keyType: HealthMetric["metricType"] = metricType as HealthMetric["metricType"];
      metrics
        .filter((metric) => metric.metricType === keyType)
        .forEach((metric) => {
          if (metric.recordedAt < startTs || metric.recordedAt > endTs) return;
          const date = new Date(metric.recordedAt);
          const key = formatInputDate(date);
          const existing = map.get(key) ?? { ts: new Date(key + "T00:00:00").getTime(), values: [] };
          existing.values.push(metric.value);
          map.set(key, existing);
        });
    }

    return Array.from(map.entries())
      .map(([day, payload]) => ({ day, ts: payload.ts, value: average(payload.values) }))
      .sort((a, b) => a.ts - b.ts);
  }, [metrics, logs, metricType, fromDate, toDate]);

  const comparisonLine = useMemo(() => {
    if (normalizedPoints.length === 0) return null as number | null;

    if (compareTo === "goal") return metricMeta.goal;

    if (compareTo === "baseline") {
      return average(normalizedPoints.map((point) => point.value));
    }

    if (compareTo === "previous_month") {
      const startTs = parseDateInput(fromDate);
      const endTs = parseDateInput(toDate, true);
      const duration = Math.max(endTs - startTs, 0);
      const prevStart = startTs - duration;
      const prevEnd = startTs - 1;

      let prevValues: number[] = [];
      if (metricType === "sleep_hours") {
        prevValues = logs
          .filter((log) => log.type === "sleep" && (log.duration ?? 0) > 0)
          .filter((log) => log.loggedAt >= prevStart && log.loggedAt <= prevEnd)
          .map((log) => (log.duration ?? 0) / 60);
      } else {
        const keyType: HealthMetric["metricType"] = metricType as HealthMetric["metricType"];
        prevValues = metrics
          .filter((metric) => metric.metricType === keyType)
          .filter((metric) => metric.recordedAt >= prevStart && metric.recordedAt <= prevEnd)
          .map((metric) => metric.value);
      }

      return prevValues.length > 0 ? average(prevValues) : null;
    }

    return null;
  }, [normalizedPoints, compareTo, metricMeta.goal, metricType, fromDate, toDate, logs, metrics]);

  const communityNote = compareTo === "community" ? "Community benchmark is not available yet." : null;

  const chartGeometry = useMemo(() => {
    const values = normalizedPoints.map((point) => point.value);
    if (values.length === 0) {
      return {
        linePath: "",
        areaPath: "",
        bars: [] as Array<{ x: number; y: number; h: number; w: number }>,
        labels: [] as string[],
        comparisonY: null as number | null,
      };
    }

    const min = Math.min(...values, ...(comparisonLine !== null ? [comparisonLine] : []));
    const max = Math.max(...values, ...(comparisonLine !== null ? [comparisonLine] : []));
    const range = Math.max(max - min, 1);

    const points = normalizedPoints.map((point, index) => {
      const x = normalizedPoints.length === 1 ? 0 : (index / (normalizedPoints.length - 1)) * 800;
      const y = 275 - ((point.value - min) / range) * 225;
      return { x, y, label: point.day.slice(5), raw: point.value };
    });

    const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const areaPath = `${linePath} L800,300 L0,300 Z`;

    const bars = points.map((point) => ({
      x: point.x - 10,
      y: point.y,
      h: 300 - point.y,
      w: 20,
    }));

    return {
      linePath,
      areaPath,
      bars,
      labels: points.map((point) => point.label),
      comparisonY: comparisonLine !== null ? 275 - ((comparisonLine - min) / range) * 225 : null,
    };
  }, [normalizedPoints, comparisonLine]);

  const stats = useMemo(() => {
    const values = normalizedPoints.map((point) => point.value);
    const currentAvg = average(values);

    const last7 = values.slice(-7);
    const prev7 = values.slice(-14, -7);
    const weeklyTrend = percentChange(average(last7), average(prev7));

    const weekOverWeek = values.length > 7 ? values.at(-1)! - values[Math.max(0, values.length - 8)] : 0;

    const bestIndex = values.length > 0
      ? metricType === "weight" || metricType === "heart_rate"
        ? values.indexOf(Math.min(...values))
        : values.indexOf(Math.max(...values))
      : -1;

    const bestPoint = bestIndex >= 0 ? normalizedPoints[bestIndex] : null;

    return {
      currentAvg,
      weeklyTrend,
      weekOverWeek,
      bestPoint,
    };
  }, [normalizedPoints, metricType]);

  const insights = useMemo(() => {
    const hasTrips = trips.some((trip) => trip.startDate || trip.endDate);
    const sleepCount = logs.filter((log) => log.type === "sleep").length;
    const values = normalizedPoints.map((point) => point.value);
    const trend = values.length >= 2 ? values.at(-1)! - values[0] : 0;

    return [
      {
        title: hasTrips ? "Travel and Recovery" : "Plan a Recovery Break",
        body: hasTrips
          ? "Trips are logged in your account. Compare travel periods against this metric to spot recovery patterns."
          : "You can unlock travel-linked patterns once at least one trip date range is recorded.",
      },
      {
        title: "Weekly Momentum",
        body:
          trend > 0
            ? `Your selected metric is trending up by ${trend.toFixed(1)} ${metricMeta.unit} across this range.`
            : trend < 0
              ? `Your selected metric is trending down by ${Math.abs(trend).toFixed(1)} ${metricMeta.unit} across this range.`
              : "Your selected metric is stable in this range.",
      },
      {
        title: "Sleep Data Coverage",
        body:
          sleepCount > 0
            ? `You have ${sleepCount} sleep logs available. Cross-analyze sleep with daytime metrics for stronger insights.`
            : "No sleep logs yet. Start logging sleep to unlock better trend explanations.",
      },
    ];
  }, [trips, logs, normalizedPoints, metricMeta.unit]);

  const applyFilters = () => {
    if (!draftFrom || !draftTo) {
      setError("Please select a valid date range.");
      return;
    }

    if (parseDateInput(draftTo, true) < parseDateInput(draftFrom)) {
      setError("End date must be after start date.");
      return;
    }

    setError(null);
    setMetricType(draftMetric);
    setCompareTo(draftCompare);
    setChartType(draftChartType);
    setFromDate(draftFrom);
    setToDate(draftTo);
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FF6B9D] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-slate-700">
      <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-[#FF6B9D]">
            <Sparkles className="h-6 w-6" />
            <span className="text-2xl font-bold">WellbeingHub</span>
          </div>
          <nav className="hidden space-x-8 text-sm font-medium text-pink-500/80 md:flex">
            <Link className="transition-colors hover:text-[#FF6B9D]" href="/dashboard">Dashboard</Link>
            <Link className="border-b-2 border-[#FF6B9D] pb-1 text-[#FF6B9D]" href="/dashboard/wellbeing-analysis">Analytics</Link>
            <Link className="transition-colors hover:text-[#FF6B9D]" href="/dashboard/daily-wellness">Habits</Link>
            <Link className="transition-colors hover:text-[#FF6B9D]" href="/dashboard/trips">Community</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                void loadData();
              }}
              disabled={isRefreshing}
              className="rounded-full bg-[#FFF0F5] p-2 text-[#FF6B9D]"
              aria-label="Refresh analytics"
            >
              <Bell className={`h-5 w-5 ${isRefreshing ? "animate-pulse" : ""}`} />
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#FF9E7D] shadow-sm">
              <div
                className="h-full w-full bg-cover bg-center"
                style={user.profilePicture ? { backgroundImage: `url(${user.profilePicture})` } : undefined}
              >
                {!user.profilePicture && (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {(user.firstName?.[0] ?? "W").toUpperCase()}
                    {(user.lastName?.[0] ?? "H").toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {communityNote && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {communityNote}
          </div>
        )}

        <section className="mb-8">
          <div className="rounded-3xl border border-pink-100 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[150px] flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pink-400">Metric Type</label>
                <select
                  value={draftMetric}
                  onChange={(event) => setDraftMetric(event.target.value as MetricType)}
                  className="w-full rounded-2xl border-pink-100 bg-white/50 py-2.5 text-sm focus:border-[#FF6B9D] focus:ring-[#FF6B9D]"
                >
                  <option value="heart_rate">Heart Rate (BPM)</option>
                  <option value="weight">Weight Tracking</option>
                  <option value="sleep_hours">Sleep Quality</option>
                  <option value="steps">Daily Steps</option>
                  <option value="water_intake">Water Intake</option>
                </select>
              </div>

              <div className="min-w-[150px] flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pink-400">Compare To</label>
                <select
                  value={draftCompare}
                  onChange={(event) => setDraftCompare(event.target.value as CompareType)}
                  className="w-full rounded-2xl border-pink-100 bg-white/50 py-2.5 text-sm focus:border-[#FF6B9D] focus:ring-[#FF6B9D]"
                >
                  <option value="baseline">My Baseline</option>
                  <option value="goal">Health Goal</option>
                  <option value="previous_month">Previous Period</option>
                  <option value="community">Community Average</option>
                </select>
              </div>

              <div className="min-w-[150px] flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pink-400">Chart Type</label>
                <div className="flex rounded-2xl border border-pink-100 bg-white/50 p-1">
                  {([
                    { key: "area", label: "Area" },
                    { key: "line", label: "Line" },
                    { key: "bar", label: "Bar" },
                  ] as const).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setDraftChartType(item.key)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-medium ${
                        draftChartType === item.key
                          ? "bg-[#FF6B9D] text-white shadow-sm"
                          : "text-pink-400 hover:text-[#FF6B9D]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-[220px] flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-pink-400">Date Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={draftFrom}
                    onChange={(event) => setDraftFrom(event.target.value)}
                    className="w-full rounded-2xl border-pink-100 bg-white/50 py-2.5 text-xs focus:border-[#FF6B9D] focus:ring-[#FF6B9D]"
                  />
                  <span className="text-pink-300">to</span>
                  <input
                    type="date"
                    value={draftTo}
                    onChange={(event) => setDraftTo(event.target.value)}
                    className="w-full rounded-2xl border-pink-100 bg-white/50 py-2.5 text-xs focus:border-[#FF6B9D] focus:ring-[#FF6B9D]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="rounded-2xl bg-[#FF6B9D] px-8 py-2.5 font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg"
              >
                Update View
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-9">
            <div className="relative flex h-[500px] flex-col overflow-hidden rounded-[2rem] border border-pink-100 bg-white/70 p-8 shadow-sm backdrop-blur">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FFF0F5] opacity-50 blur-3xl" />
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-slate-800">{metricMeta.title} &amp; Progress Analysis</h2>
                  <p className="text-sm text-slate-400">Tracking your journey with real logged data</p>
                </div>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <span className="mr-2 h-3 w-3 rounded-full bg-[#FF6B9D]" />
                    <span className="text-xs font-medium text-slate-500">Actual</span>
                  </div>
                  {comparisonLine !== null && compareTo !== "community" && (
                    <div className="flex items-center">
                      <span className="mr-2 h-3 w-3 rounded-full bg-[#A7D397]" />
                      <span className="text-xs font-medium text-slate-500">Comparison</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex-grow">
                {normalizedPoints.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-[#FFF0F5]/30 text-sm text-slate-500">
                    No data in this date range. Log more metrics or adjust filters.
                  </div>
                ) : (
                  <>
                    <svg className="h-full w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                      <g stroke="#f3f4f6" strokeWidth="1">
                        <line x1="0" y1="50" x2="800" y2="50" />
                        <line x1="0" y1="125" x2="800" y2="125" />
                        <line x1="0" y1="200" x2="800" y2="200" />
                        <line x1="0" y1="275" x2="800" y2="275" />
                      </g>

                      {comparisonLine !== null && compareTo !== "community" && (
                        <line
                          x1="0"
                          y1={chartGeometry.comparisonY ?? 200}
                          x2="800"
                          y2={chartGeometry.comparisonY ?? 200}
                          stroke="#A7D397"
                          strokeWidth="2"
                          strokeDasharray="8 4"
                        />
                      )}

                      {chartType === "area" && (
                        <>
                          <defs>
                            <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={chartGeometry.areaPath} fill="url(#gradient-pink)" />
                          <path d={chartGeometry.linePath} fill="none" stroke="#FF6B9D" strokeWidth="4" strokeLinecap="round" />
                        </>
                      )}

                      {chartType === "line" && (
                        <path d={chartGeometry.linePath} fill="none" stroke="#FF6B9D" strokeWidth="4" strokeLinecap="round" />
                      )}

                      {chartType === "bar" &&
                        chartGeometry.bars.map((bar, index) => (
                          <rect key={`${bar.x}-${index}`} x={bar.x} y={bar.y} width={bar.w} height={bar.h} fill="#FF6B9D" rx="6" />
                        ))}
                    </svg>

                    <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {chartGeometry.labels.slice(0, 6).map((label, index) => (
                        <span key={`${label}-${index}`}>{label}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside className="col-span-12 space-y-6 lg:col-span-3">
            <div className="rounded-3xl border-l-4 border-[#FF6B9D] border-pink-100 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase text-pink-400">Current Average</p>
              <div className="mt-1 flex items-baseline">
                <h3 className="text-3xl font-serif text-slate-800">{stats.currentAvg.toFixed(1)}</h3>
                <span className="ml-1 text-sm text-slate-400">{metricMeta.unit}</span>
              </div>
            </div>

            <div className="rounded-3xl border-l-4 border-[#A7D397] border-pink-100 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase text-green-500">Weekly Trend</p>
              <div className="mt-1 flex items-center text-[#A7D397]">
                {stats.weeklyTrend >= 0 ? <TrendingUp className="mr-1 h-5 w-5" /> : <TrendingDown className="mr-1 h-5 w-5" />}
                <h3 className="text-2xl font-serif text-slate-800">{stats.weeklyTrend.toFixed(1)}%</h3>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Based on last 7 entries vs previous 7 entries</p>
            </div>

            <div className="rounded-3xl border-l-4 border-[#FF9E7D] border-pink-100 bg-white/70 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase text-[#FF9E7D]">WoW Change</p>
              <div className="mt-1 flex items-baseline">
                <h3 className="text-2xl font-serif text-slate-800">{stats.weekOverWeek.toFixed(1)}</h3>
                <span className="ml-1 text-sm text-slate-400">{metricMeta.unit}</span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#FF6B9D] to-[#FF9E7D] p-6 text-white shadow-md">
              <p className="text-xs font-bold uppercase opacity-80">Best Performance</p>
              <h3 className="mt-1 text-xl font-serif">
                {stats.bestPoint ? new Date(stats.bestPoint.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not enough data"}
              </h3>
              <p className="mt-2 text-xs opacity-90">
                {stats.bestPoint
                  ? `${stats.bestPoint.value.toFixed(1)} ${metricMeta.unit} on your best recorded day.`
                  : "Log more entries to identify your best performance day."}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="mb-6 flex items-center text-2xl font-serif text-slate-800">
            <Lightbulb className="mr-2 h-6 w-6 text-[#FF6B9D]" />
            Personalized Wellbeing Insights
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className="group cursor-pointer rounded-[2rem] border border-pink-100 bg-white/70 p-6 backdrop-blur transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F5] text-[#FF6B9D] transition-transform group-hover:scale-110">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="mb-2 font-bold text-slate-800">{insight.title}</h4>
                <p className="text-sm leading-relaxed text-slate-500">{insight.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-pink-100 bg-white/50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400">Love yourself enough to live a healthy lifestyle.</p>
          <div className="mt-8 flex justify-center space-x-6 text-slate-400">
            <Link className="hover:text-[#FF6B9D]" href="/dashboard/settings">Privacy</Link>
            <Link className="hover:text-[#FF6B9D]" href="/dashboard/health/log">Support</Link>
            <Link className="hover:text-[#FF6B9D]" href="/dashboard/settings">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
