"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AlertTriangle,
  Flower2,
  Frown,
  RefreshCw,
  ServerCrash,
  WifiOff,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type CreateTripInput = {
  title: string;
  destination: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function getError(payload: unknown, fallback: string): string {
  const envelope = payload as ApiEnvelope<unknown>;
  return envelope?.error || fallback;
}

export default function ErrorStatesPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [tripForm, setTripForm] = useState<CreateTripInput>({ title: "", destination: "" });
  const [tripStatus, setTripStatus] = useState<"idle" | "submitting" | "failed" | "success">("idle");
  const [tripError, setTripError] = useState<string | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [retryCountdown, setRetryCountdown] = useState(15);
  const [networkCheckPending, setNetworkCheckPending] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [serverStatus, setServerStatus] = useState<"idle" | "checking" | "down" | "up">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const lastTripPayload = useRef<CreateTripInput | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
      setRetryCountdown(15);
    };

    const onOffline = () => {
      setIsOnline(false);
      setNetworkError("You appear to be offline.");
      setRetryCountdown(15);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline || retryCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setRetryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOnline, retryCountdown]);

  const createTrip = useCallback(
    async (payload: CreateTripInput) => {
      if (!token) return;

      setTripStatus("submitting");
      setTripError(null);
      lastTripPayload.current = payload;

      try {
        const response = await fetch(`${API_URL}/api/protected/trips`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const body = (await response.json()) as unknown;
        if (!response.ok) {
          throw new Error(getError(body, "Trip creation failed."));
        }

        setTripStatus("success");
        setTripError(null);
      } catch (error) {
        setTripStatus("failed");
        setTripError(error instanceof Error ? error.message : "Trip creation failed.");
      }
    },
    [token],
  );

  const submitTrip = async () => {
    if (!tripForm.title.trim()) {
      setTripStatus("failed");
      setTripError("Trip title is required.");
      return;
    }

    await createTrip({
      title: tripForm.title.trim(),
      destination: tripForm.destination.trim() || "Wellness Destination",
    });
  };

  const retryTrip = async () => {
    if (!lastTripPayload.current) {
      setTripError("No previous failed request to retry.");
      return;
    }
    await createTrip(lastTripPayload.current);
  };

  const checkNetworkNow = useCallback(async () => {
    setNetworkCheckPending(true);
    setNetworkError(null);

    try {
      const response = await fetch(`${API_URL}/api/health`);
      const payload = (await response.json()) as ApiEnvelope<{ status: string }>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Network check failed.");
      }

      setIsOnline(true);
      setRetryCountdown(15);
    } catch (error) {
      setIsOnline(false);
      setNetworkError(error instanceof Error ? error.message : "Still offline.");
      setRetryCountdown(15);
    } finally {
      setNetworkCheckPending(false);
    }
  }, []);

  const checkServer = useCallback(async () => {
    setServerStatus("checking");
    setServerError(null);

    try {
      const response = await fetch(`${API_URL}/api/health`);
      const payload = (await response.json()) as ApiEnvelope<{ status: string }>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Server is unavailable.");
      }

      setServerStatus("up");
      setServerError(null);
    } catch (error) {
      setServerStatus("down");
      setServerError(error instanceof Error ? error.message : "Server is unavailable.");
    }
  }, []);

  useEffect(() => {
    void checkServer();
  }, [checkServer]);

  const tripMessage = useMemo(() => {
    if (tripStatus === "success") return "Trip saved successfully.";
    if (tripStatus === "failed") return tripError || "Trip creation failed.";
    if (tripStatus === "submitting") return "Saving trip...";
    return "Submit the form to test a real trip creation request.";
  }, [tripStatus, tripError]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f9] dark:bg-[#221610]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f9] font-display text-slate-900 dark:bg-[#221610] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-rose-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#221610]/80">
          <div className="flex items-center gap-2">
            <div className="text-[#ec5b13]">
              <Flower2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">WellbeingHub</h2>
          </div>
          <div className="flex items-center gap-4">
            <nav className="mr-6 hidden items-center gap-6 md:flex">
              <Link className="text-sm font-medium transition-colors hover:text-[#ec5b13]" href="/dashboard">Home</Link>
              <Link className="text-sm font-medium transition-colors hover:text-[#ec5b13]" href="/dashboard/trips">My Trips</Link>
              <Link className="text-sm font-medium transition-colors hover:text-[#ec5b13]" href="/dashboard/daily-wellness">Wellness</Link>
            </nav>
            <button
              type="button"
              onClick={() => void checkServer()}
              className="rounded-full p-2 transition-colors hover:bg-rose-50 dark:hover:bg-slate-800"
              aria-label="Check server"
            >
              <RefreshCw className={`h-5 w-5 ${serverStatus === "checking" ? "animate-spin" : ""}`} />
            </button>
            <div className="size-10 rounded-full border-2 border-rose-200 dark:border-slate-700 flex items-center justify-center bg-rose-50 text-[#ec5b13] font-bold">
              {(user.firstName?.[0] ?? "W").toUpperCase()}
              {(user.lastName?.[0] ?? "H").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-24 p-6 lg:p-12">
          <section className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-rose-50 bg-white py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 dark:bg-[#ec5b13]/10">
              <AlertTriangle className="h-12 w-12 text-[#ec5b13]" />
            </div>
            <h1 className="mb-3 text-3xl font-bold">Trip creation request</h1>
            <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
              This panel uses a real backend request for trip creation and shows real error/success outcomes.
            </p>

            <div className="w-full max-w-md space-y-3 px-6">
              <input
                type="text"
                value={tripForm.title}
                onChange={(event) => setTripForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Trip title"
                className="w-full rounded-xl border border-rose-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="text"
                value={tripForm.destination}
                onChange={(event) => setTripForm((prev) => ({ ...prev, destination: event.target.value }))}
                placeholder="Destination"
                className="w-full rounded-xl border border-rose-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <p className={`mt-4 px-6 text-sm ${tripStatus === "failed" ? "text-red-600" : tripStatus === "success" ? "text-emerald-600" : "text-slate-500"}`}>
              {tripMessage}
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => void retryTrip()}
                disabled={tripStatus === "submitting"}
                className="rounded-xl bg-[#ec5b13] px-8 py-3 font-bold text-white shadow-lg shadow-[#ec5b13]/20 disabled:opacity-60"
              >
                {tripStatus === "submitting" ? "Trying..." : "Try Again"}
              </button>
              <button
                type="button"
                onClick={() => void submitTrip()}
                className="rounded-xl bg-rose-50 px-8 py-3 font-bold text-slate-700 transition-colors hover:bg-rose-100 dark:bg-slate-800 dark:text-slate-200"
              >
                Edit Details & Submit
              </button>
            </div>
          </section>

          <section className="relative mx-auto flex max-w-2xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-rose-50 bg-white py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <WifiOff className="h-24 w-24" />
            </div>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <WifiOff className="h-12 w-12 text-slate-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">{isOnline ? "Connection restored" : "No internet connection"}</h2>
            <p className="mb-6 max-w-sm text-slate-600 dark:text-slate-400">
              {isOnline
                ? "You are online and connected to backend services."
                : "You appear offline. We can keep retrying to reconnect your workspace."}
            </p>

            {!isOnline && (
              <div className="mb-8 flex items-center gap-4">
                <div className="min-w-[100px] rounded-2xl border border-rose-100 bg-rose-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-2xl font-bold text-[#ec5b13]">{retryCountdown}</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Seconds</p>
                </div>
                <p className="text-sm italic font-medium text-slate-400">Retrying soon...</p>
              </div>
            )}

            {networkError && <p className="mb-4 text-sm text-red-600">{networkError}</p>}

            <button
              type="button"
              onClick={() => void checkNetworkNow()}
              disabled={networkCheckPending}
              className="rounded-xl bg-[#ec5b13]/10 px-8 py-3 font-bold text-[#ec5b13] transition-all hover:bg-[#ec5b13]/20 disabled:opacity-60"
            >
              {networkCheckPending ? "Retrying..." : "Retry Now"}
            </button>
          </section>

          <section className="mx-auto grid max-w-4xl items-center gap-12 py-12 md:grid-cols-2">
            <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left">
              <div className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ec5b13]">
                Error 404
              </div>
              <h2 className="mb-4 text-4xl font-bold leading-tight">Oops! This path seems to be hidden...</h2>
              <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
                The route was not found. Use the button below to continue your trip planning flow.
              </p>
              <Link
                href="/dashboard/trips"
                className="group flex items-center gap-2 rounded-xl bg-[#ec5b13] px-10 py-4 font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                Go back to trips
              </Link>
            </div>
            <div className="order-1 flex justify-center md:order-2">
              <div className="relative h-64 w-64 md:h-80 md:w-80">
                <div className="absolute inset-0 rounded-full bg-rose-100/60 blur-3xl" />
                <div className="relative flex h-full flex-col items-center justify-center gap-4 rounded-3xl border-4 border-rose-50 bg-white p-8 shadow-2xl rotate-3 dark:border-slate-700 dark:bg-slate-800">
                  <Frown className="h-24 w-24 text-[#ec5b13]/80" />
                  <div className="h-2 w-24 rounded-full bg-rose-100" />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-3xl rounded-[3rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-8 py-16 text-center dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 md:p-16">
            <div className="relative mb-8 inline-block">
              <ServerCrash className="h-24 w-24 text-rose-300" />
              <AlertTriangle className="absolute -right-2 -top-2 h-10 w-10 animate-pulse text-[#ec5b13]" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Server health status</h2>
            <p className="mx-auto mb-8 max-w-lg text-slate-600 dark:text-slate-400">
              This card reflects the real result from the backend health endpoint.
            </p>

            <div className="mb-8 rounded-xl border border-rose-100 bg-white/70 p-4 text-left dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500">Status</p>
              <p className={`text-lg font-bold ${serverStatus === "up" ? "text-emerald-600" : serverStatus === "down" ? "text-red-600" : "text-slate-700"}`}>
                {serverStatus === "checking"
                  ? "Checking..."
                  : serverStatus === "up"
                    ? "Backend operational"
                    : serverStatus === "down"
                      ? "Backend unavailable"
                      : "Not checked"}
              </p>
              {serverError && <p className="mt-1 text-sm text-red-600">{serverError}</p>}
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-slate-900"
              >
                Refresh Page
              </button>
              <p className="text-sm text-slate-500">
                Need urgent help?{" "}
                <a className="font-bold text-[#ec5b13] underline underline-offset-4 transition-colors hover:text-[#ec5b13]/80" href="mailto:support@wellbeinghub.app?subject=Urgent%20Support%20Request">
                  Contact Support
                </a>
              </p>
            </div>
          </section>
        </main>

        <footer className="mt-auto border-t border-rose-50 p-8 text-center text-sm text-slate-400 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Flower2 className="h-5 w-5 text-[#ec5b13]/40" />
            <span className="font-bold text-slate-600 dark:text-slate-400">WellbeingHub</span>
          </div>
          <p>© 2026 WellbeingHub. Keep blooming.</p>
        </footer>
      </div>
    </div>
  );
}
