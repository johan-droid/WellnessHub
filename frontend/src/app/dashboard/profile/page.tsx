"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Award,
  ChevronRight,
  Download,
  Flame,
  MapPin,
  Pencil,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  bio: string | null;
  createdAt: number;
};

type Trip = {
  id: string;
  title: string;
  destination: string | null;
  status: string;
  createdAt: number;
};

type WellnessLog = {
  id: string;
  loggedAt: number;
  type: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function formatDisplayName(profile: UserProfile | null): string {
  if (!profile) return "Wellbeing User";
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return fullName || profile.email;
}

function getInitials(profile: UserProfile | null): string {
  const first = profile?.firstName?.[0] ?? "W";
  const last = profile?.lastName?.[0] ?? "H";
  return `${first}${last}`.toUpperCase();
}

function calculateStreak(logs: WellnessLog[]): number {
  if (logs.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(
      logs.map((log) => {
        const date = new Date(log.loggedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    ),
  ).sort((a, b) => b - a);

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = uniqueDays[index - 1];
    const current = uniqueDays[index];
    const dayDiff = (previous - current) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export default function ProfileOverviewPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
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

    const loadData = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, tripsRes, logsRes] = await Promise.all([
          fetch(`${API_URL}/api/protected/me`, { headers }),
          fetch(`${API_URL}/api/protected/trips`, { headers }),
          fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
        ]);

        if (!profileRes.ok || !tripsRes.ok || !logsRes.ok) {
          throw new Error("Failed to load profile data.");
        }

        const profilePayload = (await profileRes.json()) as unknown;
        const tripsPayload = (await tripsRes.json()) as unknown;
        const logsPayload = (await logsRes.json()) as unknown;

        const profileData = unwrapData<{ user: UserProfile }>(profilePayload);
        const tripsData = unwrapData<{ trips?: Trip[] }>(tripsPayload);
        const logsData = unwrapData<{ logs?: WellnessLog[] }>(logsPayload);

        setProfile(profileData.user);
        setTrips(tripsData.trips ?? []);
        setLogs(logsData.logs ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load profile.");
      } finally {
        setIsFetching(false);
      }
    };

    void loadData();
  }, [token, user]);

  const derived = useMemo(() => {
    const completedTrips = trips.filter((trip) => trip.status === "completed").length;
    const tripCount = completedTrips > 0 ? completedTrips : trips.length;
    const logsCount = logs.length;
    const streak = calculateStreak(logs);

    const badges: string[] = [];
    if (tripCount >= 3) badges.push("Travel Champion");
    if (logsCount >= 100) badges.push("Wellness Warrior");
    if (streak >= 7) badges.push("Streak Keeper");
    if (badges.length === 0) badges.push("Journey Starter");

    const recentTrip = [...trips].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

    return {
      tripCount,
      logsCount,
      streak,
      badges,
      recentTrip,
    };
  }, [logs, trips]);

  const onDownloadData = () => {
    const payload = {
      profile,
      trips,
      logs,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "wellbeing-profile-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const onShareProfile = async () => {
    const shareTitle = `${formatDisplayName(profile)} on WellbeingHub`;
    const shareText = "Check out my wellbeing journey.";

    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    window.alert("Profile link copied to clipboard.");
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbfc]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  const displayName = formatDisplayName(profile);
  const bio = profile?.bio || "No bio yet. Add details from Edit Profile.";
  const location = derived.recentTrip?.destination || "Location not set";
  const avatarInitials = getInitials(profile);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fdfbfc] text-slate-900 dark:bg-[#221610] dark:text-slate-100">
      <header className="sticky top-0 z-50 w-full border-b border-[#ec5b13]/10 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-20 dark:bg-[#221610]/80">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-2 text-[#ec5b13]">
            <Sparkles className="h-5 w-5" />
            <span className="text-lg font-bold">WellbeingHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-[#ec5b13]/10 dark:text-slate-300"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#ec5b13]/30 bg-[#ec5b13]/20">
              {profile?.profilePicture ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${profile.profilePicture})` }}
                  aria-label="Profile avatar"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#ec5b13]">
                  {avatarInitials}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#ec5b13]/10 to-[#fdfbfc] dark:to-[#221610]" />
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,#f8d7da_0%,#fdfbfc_55%,#fdfbfc_100%)] dark:bg-[radial-gradient(circle_at_top,#4a2b1f_0%,#221610_60%,#221610_100%)]" />
          <div className="absolute inset-0 bg-[#ec5b13]/10 mix-blend-soft-light" />
        </div>

        <div className="relative z-20 mx-auto -mt-20 max-w-[1000px] px-4">
          <div className="rounded-2xl border border-[#ec5b13]/10 bg-white p-6 shadow-xl shadow-[#ec5b13]/5 lg:p-10 dark:bg-slate-900">
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white ring-4 ring-[#ec5b13]/20 dark:border-slate-800">
                    {profile?.profilePicture ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${profile.profilePicture})` }}
                        aria-label="Profile"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#ec5b13]/10 text-3xl font-bold text-[#ec5b13]">
                        {avatarInitials}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500 dark:border-slate-900" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold">{displayName}</h2>
                  <p className="flex items-center justify-center gap-1 font-medium text-[#ec5b13] md:justify-start">
                    <MapPin className="h-4 w-4" /> {location}
                  </p>
                  <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">{bio}</p>
                </div>
              </div>
              <Link
                href="/dashboard/profile/edit"
                className="flex items-center gap-2 rounded-xl bg-[#ec5b13] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#ec5b13]/20 transition-all hover:bg-[#d94e08]"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#ec5b13]/5 bg-[#ec5b13]/5 p-6 text-center dark:bg-[#ec5b13]/10">
                <span className="text-3xl font-bold text-[#ec5b13]">{derived.tripCount}</span>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Trips Completed</p>
              </div>
              <div className="rounded-xl border border-[#ec5b13]/5 bg-[#ec5b13]/5 p-6 text-center dark:bg-[#ec5b13]/10">
                <span className="text-3xl font-bold text-[#ec5b13]">{derived.logsCount}</span>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Wellness Logs</p>
              </div>
              <div className="rounded-xl border border-[#ec5b13]/5 bg-[#ec5b13]/5 p-6 text-center dark:bg-[#ec5b13]/10">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-6 w-6 text-[#ec5b13]" />
                  <span className="text-3xl font-bold text-[#ec5b13]">{derived.streak}</span>
                </div>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Day Streak</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <Award className="h-5 w-5 text-[#ec5b13]" /> Badges Earned
              </h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {derived.badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-3 rounded-full border border-[#ec5b13]/20 bg-white px-4 py-3 shadow-sm dark:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Quick Actions</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                  type="button"
                  onClick={onDownloadData}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-[#ec5b13]/30 hover:bg-[#ec5b13]/5 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-slate-400 group-hover:text-[#ec5b13]" />
                    <span className="font-medium">Download Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => void onShareProfile()}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-[#ec5b13]/30 hover:bg-[#ec5b13]/5 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-slate-400 group-hover:text-[#ec5b13]" />
                    <span className="font-medium">Share Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
                <a
                  href="mailto:support@wellbeinghub.app"
                  className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-[#ec5b13]/30 hover:bg-[#ec5b13]/5 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-slate-400 group-hover:text-[#ec5b13]" />
                    <span className="font-medium">Help &amp; Support</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#ec5b13]/10 bg-white py-10 text-center dark:bg-[#221610]">
        <p className="text-sm text-slate-400 dark:text-slate-600">© 2024 WellbeingHub. Made with care for your health.</p>
      </footer>
    </div>
  );
}
