"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Droplets, Heart, Moon, Shield, Sparkles, Weight } from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type MetricType = "heart_rate" | "weight" | "blood_pressure" | "water_intake";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function getErrorMessage(payload: unknown, fallback: string): string {
  const envelope = payload as ApiEnvelope<unknown>;
  return envelope?.error || fallback;
}

export default function HealthLogPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [heartRate, setHeartRate] = useState("72");
  const [heartTime, setHeartTime] = useState("09:30");
  const [heartState, setHeartState] = useState("Resting");
  const [heartNotes, setHeartNotes] = useState("");

  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightDateTime, setWeightDateTime] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bpArm, setBpArm] = useState("Left Arm");
  const [bpTime, setBpTime] = useState("");

  const [sleepBedtime, setSleepBedtime] = useState("22:30");
  const [sleepWakeup, setSleepWakeup] = useState("07:00");
  const [sleepRating, setSleepRating] = useState(4);

  const [waterQuick, setWaterQuick] = useState<number | null>(500);
  const [waterCustom, setWaterCustom] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const sleepHours = useMemo(() => {
    const [bedH, bedM] = sleepBedtime.split(":").map(Number);
    const [wakeH, wakeM] = sleepWakeup.split(":").map(Number);

    if ([bedH, bedM, wakeH, wakeM].some((value) => Number.isNaN(value))) {
      return 0;
    }

    const bedTotal = bedH * 60 + bedM;
    const wakeTotal = wakeH * 60 + wakeM;
    const diff = wakeTotal >= bedTotal ? wakeTotal - bedTotal : 24 * 60 - bedTotal + wakeTotal;

    return diff / 60;
  }, [sleepBedtime, sleepWakeup]);

  const postHealthMetric = async (metricType: MetricType, value: number, unit: string) => {
    if (!token) throw new Error("You must be logged in.");

    const response = await fetch(`${API_URL}/api/protected/health-metrics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metricType, value, unit }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Failed to save metric."));
    }
  };

  const postWellnessVitalsNote = async (notes: string, value: Record<string, unknown>) => {
    if (!token || (!notes.trim() && Object.keys(value).length === 0)) return;

    const response = await fetch(`${API_URL}/api/protected/wellness-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "vitals",
        notes: notes.trim() || null,
        value: JSON.stringify(value),
      }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Failed to save note."));
    }
  };

  const postSleepLog = async () => {
    if (!token) throw new Error("You must be logged in.");

    const response = await fetch(`${API_URL}/api/protected/wellness-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "sleep",
        duration: Math.round(sleepHours * 60),
        rating: sleepRating,
        value: JSON.stringify({ bedtime: sleepBedtime, wakeup: sleepWakeup, hours: Number(sleepHours.toFixed(2)) }),
      }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Failed to save sleep log."));
    }
  };

  const submitHeart = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const bpm = Number(heartRate);
      if (!Number.isFinite(bpm) || bpm < 40 || bpm > 220) {
        throw new Error("Enter a valid BPM between 40 and 220.");
      }

      await postHealthMetric("heart_rate", bpm, "bpm");
      await postWellnessVitalsNote(heartNotes, { metricType: "heart_rate", state: heartState, time: heartTime, bpm });
      setSuccess(`Heart rate logged (${bpm} bpm).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to log heart rate.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitWeight = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const value = Number(weightValue);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Enter a valid weight value.");
      }

      await postHealthMetric("weight", value, weightUnit);
      await postWellnessVitalsNote(weightNotes, {
        metricType: "weight",
        dateTime: weightDateTime || null,
        value,
        unit: weightUnit,
      });
      setSuccess(`Weight recorded (${value} ${weightUnit}).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to record weight.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitBloodPressure = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const systolic = Number(bpSystolic);
      const diastolic = Number(bpDiastolic);
      if (!Number.isFinite(systolic) || !Number.isFinite(diastolic) || systolic <= 0 || diastolic <= 0) {
        throw new Error("Enter valid systolic and diastolic values.");
      }

      await postHealthMetric("blood_pressure", systolic, `${diastolic} mmHg`);
      await postWellnessVitalsNote("", {
        metricType: "blood_pressure",
        systolic,
        diastolic,
        arm: bpArm,
        time: bpTime || null,
      });
      setSuccess(`Blood pressure saved (${systolic}/${diastolic} mmHg).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save blood pressure.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSleep = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (sleepHours <= 0) {
        throw new Error("Enter valid bedtime and wakeup times.");
      }

      await postSleepLog();
      setSuccess(`Sleep recorded (${sleepHours.toFixed(1)} hours).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save sleep.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitWater = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const ml = Number(waterCustom) > 0 ? Number(waterCustom) : waterQuick;
      if (!ml || !Number.isFinite(ml) || ml <= 0) {
        throw new Error("Select or enter a valid water amount.");
      }

      await postHealthMetric("water_intake", ml, "ml");
      setSuccess(`Water added (${ml} ml).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add water.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f7]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff5c8d] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] p-8">
      <nav className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3 text-[#ff5c8d]">
          <Sparkles className="h-6 w-6" />
          <span className="text-2xl font-bold">WellbeingHub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/health" className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-[#ff5c8d] hover:bg-pink-50">
            Back to Metrics
          </Link>
          <Link href="/dashboard" className="rounded-xl bg-[#ff5c8d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e04a7a]">
            Dashboard
          </Link>
        </div>
      </nav>

      {error && <div className="mx-auto mb-6 max-w-6xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="mx-auto mb-6 max-w-6xl rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 pb-20">
        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <header className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-pink-50 p-3 text-[#ff5c8d]"><Heart className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-800">Heart Rate</h2>
          </header>
          <form className="space-y-4" onSubmit={(event) => void submitHeart(event)}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">Beats Per Minute (BPM)</label>
              <div className="flex items-center gap-4">
                <input className="w-full cursor-pointer accent-[#ff5c8d]" max={200} min={40} type="range" value={heartRate} onChange={(event) => setHeartRate(event.target.value)} />
                <span className="w-12 text-right text-lg font-bold text-[#ff5c8d]">{heartRate}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Time</label>
                <input className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" type="time" value={heartTime} onChange={(event) => setHeartTime(event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">State</label>
                <select className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" value={heartState} onChange={(event) => setHeartState(event.target.value)}>
                  <option>Resting</option>
                  <option>Post-Workout</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Notes</label>
              <textarea className="h-16 w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="Optional notes" value={heartNotes} onChange={(event) => setHeartNotes(event.target.value)} />
            </div>
            <button disabled={submitting} className="w-full rounded-2xl bg-[#ff5c8d] py-3 font-bold text-white transition-colors hover:bg-[#e04a7a] disabled:opacity-60" type="submit">
              Log Reading
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <header className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-pink-50 p-3 text-[#ff5c8d]"><Weight className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-800">Body Weight</h2>
          </header>
          <form className="space-y-4" onSubmit={(event) => void submitWeight(event)}>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold text-gray-600">Weight Value</label>
                <input className="w-full rounded-xl border-pink-100 text-lg font-bold focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="00.0" step="0.1" type="number" value={weightValue} onChange={(event) => setWeightValue(event.target.value)} />
              </div>
              <div className="mb-0.5 flex rounded-xl bg-pink-50 p-1">
                <button type="button" className={`px-4 py-1.5 rounded-lg text-xs font-bold ${weightUnit === "kg" ? "bg-[#ff5c8d] text-white" : "text-[#ff5c8d]"}`} onClick={() => setWeightUnit("kg")}>kg</button>
                <button type="button" className={`px-4 py-1.5 rounded-lg text-xs font-bold ${weightUnit === "lbs" ? "bg-[#ff5c8d] text-white" : "text-[#ff5c8d]"}`} onClick={() => setWeightUnit("lbs")}>lbs</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Date & Time</label>
              <input className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" type="datetime-local" value={weightDateTime} onChange={(event) => setWeightDateTime(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Daily Notes</label>
              <textarea className="h-16 w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="Optional notes" value={weightNotes} onChange={(event) => setWeightNotes(event.target.value)} />
            </div>
            <button disabled={submitting} className="w-full rounded-2xl bg-[#ff5c8d] py-3 font-bold text-white transition-colors hover:bg-[#e04a7a] disabled:opacity-60" type="submit">
              Record Weight
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <header className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-pink-50 p-3 text-[#ff5c8d]"><Shield className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-800">Blood Pressure</h2>
          </header>
          <form className="space-y-4" onSubmit={(event) => void submitBloodPressure(event)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-center text-sm font-semibold text-gray-600">Systolic</label>
                <input className="w-full rounded-2xl border-pink-100 py-3 text-center text-xl font-bold focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="120" type="number" value={bpSystolic} onChange={(event) => setBpSystolic(event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-center text-sm font-semibold text-gray-600">Diastolic</label>
                <input className="w-full rounded-2xl border-pink-100 py-3 text-center text-xl font-bold focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="80" type="number" value={bpDiastolic} onChange={(event) => setBpDiastolic(event.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Arm Used</label>
                <select className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" value={bpArm} onChange={(event) => setBpArm(event.target.value)}>
                  <option>Left Arm</option>
                  <option>Right Arm</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Time</label>
                <input className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" type="time" value={bpTime} onChange={(event) => setBpTime(event.target.value)} />
              </div>
            </div>
            <button disabled={submitting} className="w-full rounded-2xl bg-[#ff5c8d] py-3 font-bold text-white transition-colors hover:bg-[#e04a7a] disabled:opacity-60" type="submit">
              Save Entry
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <header className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-pink-50 p-3 text-[#ff5c8d]"><Moon className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-800">Sleep Tracking</h2>
          </header>
          <form className="space-y-4" onSubmit={(event) => void submitSleep(event)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Bedtime</label>
                <input className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" type="time" value={sleepBedtime} onChange={(event) => setSleepBedtime(event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Wake up</label>
                <input className="w-full rounded-xl border-pink-100 text-sm focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" type="time" value={sleepWakeup} onChange={(event) => setSleepWakeup(event.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">Sleep quality (1-5)</label>
              <input
                className="w-full cursor-pointer accent-[#ff5c8d]"
                type="range"
                min={1}
                max={5}
                value={sleepRating}
                onChange={(event) => setSleepRating(Number(event.target.value))}
              />
              <div className="mt-1 text-xs font-bold text-[#ff5c8d]">{sleepRating}/5 • {sleepHours.toFixed(1)} hours</div>
            </div>
            <button disabled={submitting} className="w-full rounded-2xl bg-[#ff5c8d] py-3 font-bold text-white transition-colors hover:bg-[#e04a7a] disabled:opacity-60" type="submit">
              Record Sleep
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <header className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-400"><Droplets className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-gray-800">Hydration</h2>
          </header>
          <form className="space-y-6" onSubmit={(event) => void submitWater(event)}>
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-600">Quick Add</label>
              <div className="grid grid-cols-3 gap-3">
                {[250, 500, 750].map((ml) => (
                  <button
                    key={ml}
                    className={`rounded-2xl border p-3 transition-colors ${waterQuick === ml ? "border-pink-200 bg-pink-50" : "border-blue-100 hover:bg-blue-50"}`}
                    type="button"
                    onClick={() => setWaterQuick(ml)}
                  >
                    <div className="text-xs font-bold text-[#ff5c8d]">{ml}ml</div>
                    <div className="text-[10px] text-gray-400">{ml === 250 ? "Glass" : ml === 500 ? "Bottle" : "Sport"}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Custom Amount (ml)</label>
              <div className="relative">
                <input className="w-full rounded-xl border-pink-100 py-2 pl-4 pr-12 focus:border-[#ff5c8d] focus:ring-[#ff5c8d]" placeholder="0" type="number" value={waterCustom} onChange={(event) => setWaterCustom(event.target.value)} />
                <span className="absolute right-4 top-2.5 text-xs font-bold text-gray-400">ML</span>
              </div>
            </div>
            <button disabled={submitting} className="w-full rounded-2xl bg-[#ff5c8d] py-3 font-bold text-white transition-colors hover:bg-[#e04a7a] disabled:opacity-60" type="submit">
              Add Water
            </button>
          </form>
        </section>

        <section className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_10px_25px_-5px_rgba(255,92,141,0.1)]">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">Live Record Status</h3>
          {success ? (
            <p className="text-center text-sm text-gray-500">
              <span className="font-bold text-[#ff5c8d]">{success}</span>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-500">Submit any form to save a real backend record.</p>
          )}
          <button
            type="button"
            onClick={() => router.push("/dashboard/health")}
            className="mt-8 text-sm font-bold text-[#ff5c8d] hover:underline"
          >
            Back to Dashboard
          </button>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-0 left-0 p-8 opacity-20">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" fill="#ff5c8d" />
        </svg>
      </div>
    </div>
  );
}
