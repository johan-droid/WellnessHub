"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Bolt,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flower2,
  Moon,
  Sparkles,
  Utensils,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type WellnessLog = {
  id: string;
  type: string;
  value: string | null;
  rating: number | null;
  duration: number | null;
  notes: string | null;
  loggedAt: number;
};

type Metric = {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  recordedAt: number;
};

type TabType = "mood" | "exercise" | "nutrition" | "sleep";

type MoodForm = {
  score: number;
  dayType: "excellent" | "great" | "good" | "fair" | "bad";
  energy: number;
  activity: string;
  notes: string;
  tags: string[];
};

type ExerciseForm = {
  duration: number;
  intensity: "low" | "moderate" | "high";
  activity: string;
  notes: string;
  tags: string[];
};

type NutritionForm = {
  quality: number;
  mealType: string;
  notes: string;
  tags: string[];
};

type SleepForm = {
  hours: number;
  quality: number;
  notes: string;
  tags: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

const moodTags = ["Stayed Hydrated", "No Caffeine after 2pm", "Meditation", "Grateful"];
const exerciseTags = ["Cardio", "Strength", "Stretching", "Outdoor"];
const nutritionTags = ["Protein-rich", "More Veggies", "Low Sugar", "Balanced Meals"];
const sleepTags = ["Early Bedtime", "No Screens", "Deep Sleep", "Night Routine"];

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function safeParseJson(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function toOneToFive(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score / 2)));
}

function badgeClass(active: boolean): string {
  return active
    ? "border-primary bg-primary/10 text-primary"
    : "border-primary/10 text-slate-600 hover:border-primary/40 hover:bg-primary/5";
}

export default function DailyWellnessPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("mood");
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [moodForm, setMoodForm] = useState<MoodForm>({
    score: 8,
    dayType: "great",
    energy: 3,
    activity: "Reading & Self-care",
    notes: "",
    tags: [],
  });

  const [exerciseForm, setExerciseForm] = useState<ExerciseForm>({
    duration: 30,
    intensity: "moderate",
    activity: "Yoga",
    notes: "",
    tags: [],
  });

  const [nutritionForm, setNutritionForm] = useState<NutritionForm>({
    quality: 4,
    mealType: "Balanced Meals",
    notes: "",
    tags: [],
  });

  const [sleepForm, setSleepForm] = useState<SleepForm>({
    hours: 7.5,
    quality: 4,
    notes: "",
    tags: [],
  });

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

    const fetchData = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [logsRes, metricsRes] = await Promise.all([
          fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
          fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
        ]);

        if (!logsRes.ok || !metricsRes.ok) {
          throw new Error("Failed to load wellness data.");
        }

        const logsPayload = (await logsRes.json()) as unknown;
        const metricsPayload = (await metricsRes.json()) as unknown;

        const logsData = unwrapData<{ logs?: WellnessLog[] }>(logsPayload);
        const metricsData = unwrapData<{ metrics?: Metric[] }>(metricsPayload);

        setLogs(logsData.logs ?? []);
        setMetrics(metricsData.metrics ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load data.");
      } finally {
        setIsFetching(false);
      }
    };

    void fetchData();
  }, [token, user]);

  const latest = useMemo(() => {
    const sortedLogs = [...logs].sort((a, b) => b.loggedAt - a.loggedAt);
    const sortedMetrics = [...metrics].sort((a, b) => b.recordedAt - a.recordedAt);

    const latestByType = (type: TabType) => sortedLogs.find((item) => item.type === type) ?? null;

    const latestSleep = latestByType("sleep");
    const sleepData = safeParseJson(latestSleep?.value ?? null);
    const latestExercise = latestByType("exercise");
    const exerciseData = safeParseJson(latestExercise?.value ?? null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNutritionCount = sortedLogs.filter((item) => {
      if (item.type !== "nutrition") return false;
      const logDate = new Date(item.loggedAt);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    }).length;

    const latestWater = sortedMetrics.find((item) => item.metricType === "water_intake") ?? null;

    return {
      latestSleep,
      sleepHours: typeof sleepData.hours === "number" ? sleepData.hours : (latestSleep?.duration ? Number((latestSleep.duration / 60).toFixed(1)) : null),
      sleepQuality: typeof sleepData.quality === "number" ? sleepData.quality : latestSleep?.rating,
      latestExercise,
      exerciseIntensity: typeof exerciseData.intensity === "string" ? exerciseData.intensity : null,
      todayNutritionCount,
      latestWater,
    };
  }, [logs, metrics]);

  const refreshLogs = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/protected/wellness-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const payload = (await res.json()) as unknown;
    const data = unwrapData<{ logs?: WellnessLog[] }>(payload);
    setLogs(data.logs ?? []);
  };

  const saveCurrentTab = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let body: Record<string, unknown>;

      if (activeTab === "mood") {
        body = {
          type: "mood",
          rating: toOneToFive(moodForm.score),
          notes: moodForm.notes,
          value: JSON.stringify({
            score: moodForm.score,
            dayType: moodForm.dayType,
            energy: moodForm.energy,
            activity: moodForm.activity,
            tags: moodForm.tags,
          }),
        };
      } else if (activeTab === "exercise") {
        const intensityToRating = {
          low: 2,
          moderate: 3,
          high: 5,
        } as const;

        body = {
          type: "exercise",
          rating: intensityToRating[exerciseForm.intensity],
          duration: exerciseForm.duration,
          notes: exerciseForm.notes,
          value: JSON.stringify({
            intensity: exerciseForm.intensity,
            activity: exerciseForm.activity,
            tags: exerciseForm.tags,
          }),
        };
      } else if (activeTab === "nutrition") {
        body = {
          type: "nutrition",
          rating: nutritionForm.quality,
          notes: nutritionForm.notes,
          value: JSON.stringify({
            mealType: nutritionForm.mealType,
            tags: nutritionForm.tags,
          }),
        };
      } else {
        body = {
          type: "sleep",
          rating: sleepForm.quality,
          duration: Math.round(sleepForm.hours * 60),
          notes: sleepForm.notes,
          value: JSON.stringify({
            hours: sleepForm.hours,
            quality: sleepForm.quality,
            tags: sleepForm.tags,
          }),
        };
      }

      const response = await fetch(`${API_URL}/api/protected/wellness-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        const envelope = payload as ApiEnvelope<unknown>;
        throw new Error(envelope.error || "Unable to save wellness log.");
      }

      await refreshLogs();
      setSuccess("Wellness logged successfully");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save log.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetCurrentTab = () => {
    setSuccess(null);
    setError(null);

    if (activeTab === "mood") {
      setMoodForm({
        score: 8,
        dayType: "great",
        energy: 3,
        activity: "Reading & Self-care",
        notes: "",
        tags: [],
      });
      return;
    }

    if (activeTab === "exercise") {
      setExerciseForm({
        duration: 30,
        intensity: "moderate",
        activity: "Yoga",
        notes: "",
        tags: [],
      });
      return;
    }

    if (activeTab === "nutrition") {
      setNutritionForm({
        quality: 4,
        mealType: "Balanced Meals",
        notes: "",
        tags: [],
      });
      return;
    }

    setSleepForm({
      hours: 7.5,
      quality: 4,
      notes: "",
      tags: [],
    });
  };

  const toggleTag = (tag: string) => {
    if (activeTab === "mood") {
      setMoodForm((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
      }));
      return;
    }

    if (activeTab === "exercise") {
      setExerciseForm((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
      }));
      return;
    }

    if (activeTab === "nutrition") {
      setNutritionForm((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
      }));
      return;
    }

    setSleepForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f8]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  const tagOptions = activeTab === "mood"
    ? moodTags
    : activeTab === "exercise"
      ? exerciseTags
      : activeTab === "nutrition"
        ? nutritionTags
        : sleepTags;

  const selectedTags = activeTab === "mood"
    ? moodForm.tags
    : activeTab === "exercise"
      ? exerciseForm.tags
      : activeTab === "nutrition"
        ? nutritionForm.tags
        : sleepForm.tags;

  return (
    <div className="min-h-screen bg-[#fdf8f8] text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-[#fdf8f8]/80 px-6 py-4 backdrop-blur-sm dark:bg-slate-900/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold">WellbeingHub</p>
              <p className="text-xs text-slate-500">Daily Wellness</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {success && (
              <div className="hidden items-center gap-1 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-primary md:flex">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{success}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-primary/10 dark:text-slate-300"
              aria-label="Go to dashboard"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-sm font-bold text-primary">
              {(user.firstName?.[0] ?? "U").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="relative overflow-hidden rounded-xl border border-primary/5 bg-gradient-to-r from-primary/10 to-transparent p-8">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily Wellness Log</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Take a moment for yourself today. How are you feeling?</p>
              </div>
              <Flower2 className="absolute -right-8 -top-8 h-28 w-28 rotate-12 text-primary/10" />
            </div>

            <nav className="flex gap-2 overflow-x-auto rounded-xl border border-primary/10 bg-primary/5 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("mood")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-all ${activeTab === "mood" ? "bg-white font-semibold text-primary shadow-sm dark:bg-primary dark:text-white" : "font-medium text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                <Sparkles className="h-4 w-4" /> Mood
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exercise")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-all ${activeTab === "exercise" ? "bg-white font-semibold text-primary shadow-sm dark:bg-primary dark:text-white" : "font-medium text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                <Dumbbell className="h-4 w-4" /> Exercise
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nutrition")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-all ${activeTab === "nutrition" ? "bg-white font-semibold text-primary shadow-sm dark:bg-primary dark:text-white" : "font-medium text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                <Utensils className="h-4 w-4" /> Nutrition
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sleep")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-all ${activeTab === "sleep" ? "bg-white font-semibold text-primary shadow-sm dark:bg-primary dark:text-white" : "font-medium text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                <Moon className="h-4 w-4" /> Sleep
              </button>
            </nav>

            <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-xl shadow-primary/5 dark:bg-slate-900">
              <div className="space-y-8 p-6 md:p-10">
                {activeTab === "mood" && (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-end justify-between">
                        <label className="text-lg font-semibold">Mood Score (1-10)</label>
                        <span className="text-3xl font-bold text-primary">{moodForm.score}</span>
                      </div>
                      <div className="px-2 pb-2 pt-6">
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={moodForm.score}
                          onChange={(event) => setMoodForm((prev) => ({ ...prev, score: Number(event.target.value) }))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/10 accent-primary"
                        />
                        <div className="mt-4 flex justify-between px-1 text-2xl">
                          <span className="opacity-50">😫</span>
                          <span className="opacity-60">😕</span>
                          <span className="opacity-70">😐</span>
                          <span className="opacity-80">🙂</span>
                          <span className="scale-125">✨</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">How would you describe your day?</label>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {(["excellent", "great", "good", "fair", "bad"] as const).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setMoodForm((prev) => ({ ...prev, dayType: item }))}
                            className={`rounded-xl p-3 text-sm capitalize transition-all ${badgeClass(moodForm.dayType === item)}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </section>

                    <div className="grid gap-8 md:grid-cols-2">
                      <section className="space-y-3">
                        <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Energy Level</label>
                        <div className="flex items-center gap-4 rounded-xl bg-primary/5 p-4">
                          <Bolt className="h-4 w-4 text-primary" />
                          <div className="flex flex-1 gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setMoodForm((prev) => ({ ...prev, energy: level }))}
                                className={`h-2 flex-1 rounded-full ${level <= moodForm.energy ? "bg-primary" : "bg-primary/20"}`}
                                aria-label={`Set energy level ${level}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{moodForm.energy <= 2 ? "Low" : moodForm.energy === 3 ? "Moderate" : "High"}</span>
                        </div>
                      </section>

                      <section className="space-y-3">
                        <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">What did you do?</label>
                        <select
                          value={moodForm.activity}
                          onChange={(event) => setMoodForm((prev) => ({ ...prev, activity: event.target.value }))}
                          className="w-full rounded-xl border-none bg-primary/5 p-3 text-slate-700 focus:ring-2 focus:ring-primary/20 dark:text-slate-200"
                        >
                          <option>Reading &amp; Self-care</option>
                          <option>Socializing</option>
                          <option>Productive Work</option>
                          <option>Nature Walk</option>
                          <option>Meditation</option>
                        </select>
                      </section>
                    </div>
                  </>
                )}

                {activeTab === "exercise" && (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-end justify-between">
                        <label className="text-lg font-semibold">Exercise Duration (minutes)</label>
                        <span className="text-3xl font-bold text-primary">{exerciseForm.duration}</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={180}
                        step={5}
                        value={exerciseForm.duration}
                        onChange={(event) => setExerciseForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/10 accent-primary"
                      />
                    </section>

                    <section className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Intensity</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["low", "moderate", "high"] as const).map((intensity) => (
                          <button
                            key={intensity}
                            type="button"
                            onClick={() => setExerciseForm((prev) => ({ ...prev, intensity }))}
                            className={`rounded-xl p-3 text-sm capitalize transition-all ${badgeClass(exerciseForm.intensity === intensity)}`}
                          >
                            {intensity}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Workout Type</label>
                      <select
                        value={exerciseForm.activity}
                        onChange={(event) => setExerciseForm((prev) => ({ ...prev, activity: event.target.value }))}
                        className="w-full rounded-xl border-none bg-primary/5 p-3 text-slate-700 focus:ring-2 focus:ring-primary/20 dark:text-slate-200"
                      >
                        <option>Yoga</option>
                        <option>Walking</option>
                        <option>Strength Training</option>
                        <option>Cycling</option>
                        <option>Stretching</option>
                      </select>
                    </section>
                  </>
                )}

                {activeTab === "nutrition" && (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-end justify-between">
                        <label className="text-lg font-semibold">Nutrition Quality (1-5)</label>
                        <span className="text-3xl font-bold text-primary">{nutritionForm.quality}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={nutritionForm.quality}
                        onChange={(event) => setNutritionForm((prev) => ({ ...prev, quality: Number(event.target.value) }))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/10 accent-primary"
                      />
                    </section>

                    <section className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Meal Focus</label>
                      <select
                        value={nutritionForm.mealType}
                        onChange={(event) => setNutritionForm((prev) => ({ ...prev, mealType: event.target.value }))}
                        className="w-full rounded-xl border-none bg-primary/5 p-3 text-slate-700 focus:ring-2 focus:ring-primary/20 dark:text-slate-200"
                      >
                        <option>Balanced Meals</option>
                        <option>Protein-rich</option>
                        <option>High Fiber</option>
                        <option>Hydration Focus</option>
                        <option>Comfort Food</option>
                      </select>
                    </section>
                  </>
                )}

                {activeTab === "sleep" && (
                  <>
                    <section className="space-y-4">
                      <div className="flex items-end justify-between">
                        <label className="text-lg font-semibold">Sleep Duration (hours)</label>
                        <span className="text-3xl font-bold text-primary">{sleepForm.hours.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={12}
                        step={0.5}
                        value={sleepForm.hours}
                        onChange={(event) => setSleepForm((prev) => ({ ...prev, hours: Number(event.target.value) }))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/10 accent-primary"
                      />
                    </section>

                    <section className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Sleep Quality (1-5)</label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={sleepForm.quality}
                        onChange={(event) => setSleepForm((prev) => ({ ...prev, quality: Number(event.target.value) }))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/10 accent-primary"
                      />
                    </section>
                  </>
                )}

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Daily Journaling</label>
                    <span className="text-[10px] text-slate-400">
                      {(activeTab === "mood" ? moodForm.notes.length : activeTab === "exercise" ? exerciseForm.notes.length : activeTab === "nutrition" ? nutritionForm.notes.length : sleepForm.notes.length)} / 500 characters
                    </span>
                  </div>
                  <textarea
                    value={activeTab === "mood" ? moodForm.notes : activeTab === "exercise" ? exerciseForm.notes : activeTab === "nutrition" ? nutritionForm.notes : sleepForm.notes}
                    maxLength={500}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (activeTab === "mood") {
                        setMoodForm((prev) => ({ ...prev, notes: value }));
                      } else if (activeTab === "exercise") {
                        setExerciseForm((prev) => ({ ...prev, notes: value }));
                      } else if (activeTab === "nutrition") {
                        setNutritionForm((prev) => ({ ...prev, notes: value }));
                      } else {
                        setSleepForm((prev) => ({ ...prev, notes: value }));
                      }
                    }}
                    className="min-h-[120px] w-full resize-none rounded-2xl border-none bg-primary/5 p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 dark:text-slate-200"
                    placeholder="What is on your mind? Any specific wins or challenges today?"
                  />
                </section>

                <section className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Quick Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedTags.includes(tag) ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="flex justify-end gap-3 border-t border-primary/10 pt-6">
                  <button
                    type="button"
                    onClick={resetCurrentTab}
                    className="rounded-xl border border-slate-200 px-6 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentTab}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-primary/10 bg-white p-4 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-3">
                  <Moon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Sleep Summary</span>
                </div>
                {isFetching ? (
                  <p className="text-xs text-slate-500">Loading...</p>
                ) : latest.latestSleep ? (
                  <p className="text-xs text-slate-500">
                    Last: {latest.sleepHours ?? "N/A"} hrs • Quality: {latest.sleepQuality ?? "N/A"}/5
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">No sleep logs yet.</p>
                )}
              </div>

              <div className="rounded-xl border border-primary/10 bg-white p-4 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-3">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Last Exercise</span>
                </div>
                {isFetching ? (
                  <p className="text-xs text-slate-500">Loading...</p>
                ) : latest.latestExercise ? (
                  <p className="text-xs text-slate-500">
                    {latest.latestExercise.duration ?? "N/A"} min • {latest.exerciseIntensity ?? "Intensity not set"}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">No exercise logs yet.</p>
                )}
              </div>

              <div className="rounded-xl border border-primary/10 bg-white p-4 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-3">
                  <Utensils className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Nutrition Today</span>
                </div>
                {isFetching ? (
                  <p className="text-xs text-slate-500">Loading...</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    {latest.todayNutritionCount} log(s) today
                    {latest.latestWater ? ` • Water: ${latest.latestWater.value} ${latest.latestWater.unit}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="p-6 text-center text-xs text-slate-400">
          <p>© 2026 WellbeingHub. Bloom where you are planted.</p>
        </footer>
      </div>
    </div>
  );
}
