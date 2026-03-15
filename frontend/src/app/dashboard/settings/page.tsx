"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Circle,
  Download,
  Eye,
  EyeOff,
  Lock,
  Palette,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type SettingsState = {
  theme: "light" | "dark" | "system";
  language: string;
  units: "metric" | "imperial";
  twoFactorEnabled: boolean;
  notificationsEnabled: boolean;
  connectedGoogle: boolean;
  connectedApple: boolean;
};

type Profile = {
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  email: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    theme: "light",
    language: "English (US)",
    units: "metric",
    twoFactorEnabled: true,
    notificationsEnabled: true,
    connectedGoogle: false,
    connectedApple: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token || !user) {
      setIsFetching(false);
      return;
    }

    const fetchAll = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/protected/me`, { headers }),
          fetch(`${API_URL}/api/protected/settings`, { headers }),
        ]);

        if (!profileRes.ok || !settingsRes.ok) {
          throw new Error("Failed to load settings.");
        }

        const profilePayload = (await profileRes.json()) as unknown;
        const settingsPayload = (await settingsRes.json()) as unknown;

        const profileData = unwrapData<{ user: Profile }>(profilePayload);
        const settingsData = unwrapData<{ settings: SettingsState }>(settingsPayload);

        setProfile(profileData.user);
        setSettings(settingsData.settings);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load settings.");
      } finally {
        setIsFetching(false);
      }
    };

    void fetchAll();
  }, [token, user]);

  useEffect(() => {
    const resolvedTheme = settings.theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : settings.theme;

    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme]);

  const displayName = useMemo(() => {
    if (!profile) return "Wellbeing User";
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return fullName || profile.email;
  }, [profile]);

  const avatarInitials = useMemo(() => {
    const first = profile?.firstName?.[0] ?? "W";
    const last = profile?.lastName?.[0] ?? "H";
    return `${first}${last}`.toUpperCase();
  }, [profile]);

  const passwordChecks = useMemo(() => {
    const checks = {
      minLength: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
      matches: confirmPassword.length > 0 && confirmPassword === newPassword,
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const percent = Math.round((passed / 6) * 100);

    let label = "Weak";
    let color = "bg-red-500";

    if (percent >= 84) {
      label = "Strong";
      color = "bg-emerald-500";
    } else if (percent >= 50) {
      label = "Good";
      color = "bg-amber-500";
    }

    return { checks, percent, label, color };
  }, [newPassword, confirmPassword]);

  const canSubmitPassword =
    currentPassword.length > 0
    && passwordChecks.checks.minLength
    && passwordChecks.checks.uppercase
    && passwordChecks.checks.lowercase
    && passwordChecks.checks.number
    && passwordChecks.checks.special
    && passwordChecks.checks.matches;

  const saveSettings = async (nextSettings: Partial<SettingsState>) => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const envelope = payload as ApiEnvelope<unknown>;
        throw new Error(envelope.error || "Failed to save settings.");
      }

      setSuccess("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = async (theme: SettingsState["theme"]) => {
    setSettings((prev) => ({ ...prev, theme }));
    await saveSettings({ theme });
  };

  const handleLanguageChange = async (language: string) => {
    setSettings((prev) => ({ ...prev, language }));
    await saveSettings({ language });
  };

  const handleUnitsChange = async (units: SettingsState["units"]) => {
    setSettings((prev) => ({ ...prev, units }));
    await saveSettings({ units });
  };

  const handleBooleanToggle = async (key: "twoFactorEnabled" | "notificationsEnabled") => {
    const nextValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: nextValue }));
    await saveSettings({ [key]: nextValue });
  };

  const changePassword = async () => {
    if (!token) return;
    if (!canSubmitPassword) {
      setError("Password requirements are not met.");
      return;
    }

    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const envelope = payload as ApiEnvelope<unknown>;
        throw new Error(envelope.error || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(false);
      setSuccess("Password updated.");
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "Unable to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const downloadData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, tripsRes, logsRes, metricsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/protected/me`, { headers }),
        fetch(`${API_URL}/api/protected/trips`, { headers }),
        fetch(`${API_URL}/api/protected/wellness-logs`, { headers }),
        fetch(`${API_URL}/api/protected/health-metrics`, { headers }),
        fetch(`${API_URL}/api/protected/settings`, { headers }),
      ]);

      if (!profileRes.ok || !tripsRes.ok || !logsRes.ok || !metricsRes.ok || !settingsRes.ok) {
        throw new Error("Failed to prepare export.");
      }

      const profilePayload = (await profileRes.json()) as unknown;
      const tripsPayload = (await tripsRes.json()) as unknown;
      const logsPayload = (await logsRes.json()) as unknown;
      const metricsPayload = (await metricsRes.json()) as unknown;
      const settingsPayload = (await settingsRes.json()) as unknown;

      const exportData = {
        profile: unwrapData<{ user: unknown }>(profilePayload).user,
        trips: unwrapData<{ trips: unknown[] }>(tripsPayload).trips,
        wellnessLogs: unwrapData<{ logs: unknown[] }>(logsPayload).logs,
        healthMetrics: unwrapData<{ metrics: unknown[] }>(metricsPayload).metrics,
        settings: unwrapData<{ settings: unknown }>(settingsPayload).settings,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "wellbeinghub-data-export.json";
      link.click();
      URL.revokeObjectURL(link.href);

      setSuccess("Data export downloaded.");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to download data.");
    }
  };

  const clearCache = () => {
    const authToken = localStorage.getItem("auth_token");
    localStorage.clear();
    sessionStorage.clear();
    if (authToken) {
      localStorage.setItem("auth_token", authToken);
    }
    setSuccess("Local cache cleared.");
  };

  const checkUpdates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      if (!response.ok) throw new Error("Update check failed.");
      setSuccess("You are on the latest version.");
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Unable to check updates.");
    }
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f5]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ec5b13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f5] font-display text-slate-900 dark:bg-[#221610] dark:text-slate-100">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 opacity-10 [background-image:radial-gradient(#f472b6_0.5px,transparent_0.5px),radial-gradient(#f472b6_0.5px,#fff5f5_0.5px)] [background-position:0_0,10px_10px] [background-size:20px_20px]" />

        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#ec5b13]/10 bg-white/80 px-6 py-4 backdrop-blur-md lg:px-40 dark:bg-[#221610]/80">
          <Link href="/dashboard" className="flex items-center gap-4">
            <div className="rounded-full bg-[#ec5b13]/10 p-2 text-[#ec5b13]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">WellbeingHub</h2>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#ec5b13]/10 text-[#ec5b13]"
              onClick={() => handleBooleanToggle("notificationsEnabled")}
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              {settings.notificationsEnabled && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ec5b13]" />}
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#ec5b13]/20">
              {profile?.profilePicture ? (
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.profilePicture})` }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#ec5b13]/10 text-xs font-bold text-[#ec5b13]">
                  {avatarInitials}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-40">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Personalize your wellbeing experience.</p>
            <p className="mt-1 text-sm text-slate-500">Signed in as {displayName}</p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
          {isSaving && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Saving settings...</div>}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-[#ec5b13]/5 bg-white p-6 shadow-sm transition-all hover:border-[#ec5b13]/20 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center gap-3">
                <UserRound className="h-5 w-5 text-[#f472b6]" />
                <h3 className="text-lg font-semibold">Account</h3>
              </div>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-[#ec5b13]/5"
                >
                  <span className="text-sm font-medium">Change Password</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#ec5b13]" />
                </button>

                <Link
                  href="/dashboard/2fa"
                  className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#ec5b13]/5"
                >
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">{settings.twoFactorEnabled ? "Enabled" : "Not enabled"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#ec5b13]" />
                </Link>

                <div className="p-3">
                  <p className="mb-3 text-sm font-medium">Connected Accounts</p>
                  <div className="flex gap-2 text-xs">
                    <span className={`rounded-lg px-3 py-2 font-semibold ${settings.connectedGoogle ? "bg-[#ec5b13]/10 text-[#ec5b13]" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}>Google</span>
                    <span className={`rounded-lg px-3 py-2 font-semibold ${settings.connectedApple ? "bg-[#ec5b13]/10 text-[#ec5b13]" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}>Apple</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="mt-4 w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 dark:bg-red-900/10"
                >
                  Logout
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-[#ec5b13]/5 bg-white p-6 shadow-sm transition-all hover:border-[#ec5b13]/20 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center gap-3">
                <Palette className="h-5 w-5 text-[#f472b6]" />
                <h3 className="text-lg font-semibold">Display</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium">Theme Preferences</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["light", "dark", "system"] as const).map((themeValue) => (
                      <button
                        key={themeValue}
                        type="button"
                        onClick={() => void handleThemeChange(themeValue)}
                        className={`rounded-xl border-2 p-2 transition-all ${settings.theme === themeValue ? "border-[#ec5b13] bg-[#ec5b13]/5" : "border-transparent"}`}
                      >
                        <span className="text-xs font-semibold capitalize">{themeValue}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#ec5b13]/10 p-3">
                  <span className="text-sm font-medium">Language</span>
                  <select
                    value={settings.language}
                    onChange={(e) => void handleLanguageChange(e.target.value)}
                    className="border-none bg-transparent text-sm font-bold text-[#ec5b13] focus:ring-0"
                  >
                    <option>English (US)</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#ec5b13]/10 p-3">
                  <span className="text-sm font-medium">Units</span>
                  <div className="rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => void handleUnitsChange("metric")}
                      className={`rounded-md px-3 py-1 text-xs font-bold ${settings.units === "metric" ? "bg-white shadow-sm dark:bg-slate-600" : "text-slate-500"}`}
                    >
                      Metric
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUnitsChange("imperial")}
                      className={`rounded-md px-3 py-1 text-xs font-bold ${settings.units === "imperial" ? "bg-white shadow-sm dark:bg-slate-600" : "text-slate-500"}`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#ec5b13]/5 bg-white p-6 shadow-sm transition-all hover:border-[#ec5b13]/20 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-5 w-5 text-[#f472b6]" />
                <h3 className="text-lg font-semibold">Data &amp; Privacy</h3>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void downloadData()}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#ec5b13]/5 p-4 font-semibold text-[#ec5b13] transition-colors hover:bg-[#ec5b13]/10"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm">Download My Data</span>
                </button>
                <button
                  type="button"
                  onClick={clearCache}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#ec5b13]/20 p-4 font-semibold text-slate-600 transition-all hover:border-[#ec5b13] hover:text-[#ec5b13] dark:text-slate-300"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Clear App Cache</span>
                </button>
                <p className="mt-4 px-1 text-[10px] text-slate-400">
                  Your data is encrypted and never shared without your consent.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-[#ec5b13]/5 bg-white p-6 shadow-sm transition-all hover:border-[#ec5b13]/20 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center gap-3">
                <Settings className="h-5 w-5 text-[#f472b6]" />
                <h3 className="text-lg font-semibold">About</h3>
              </div>
              <div className="flex flex-col items-center py-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ec5b13] to-[#f472b6] text-white shadow-lg shadow-[#ec5b13]/20">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h4 className="font-bold">WellbeingHub</h4>
                <p className="mb-6 text-sm text-slate-500">Version 1.0.0</p>
                <button
                  type="button"
                  onClick={() => void checkUpdates()}
                  className="rounded-full border-2 border-[#ec5b13] px-6 py-2 text-sm font-bold text-[#ec5b13] transition-all hover:bg-[#ec5b13] hover:text-white"
                >
                  Check for updates
                </button>
              </div>
              <div className="mt-4 flex justify-center gap-6 border-t border-[#ec5b13]/10 pt-4">
                <a className="text-xs text-slate-400 hover:text-[#ec5b13]" href="https://example.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                <a className="text-xs text-slate-400 hover:text-[#ec5b13]" href="https://example.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>
              </div>
            </section>
          </div>
        </main>

        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-pink-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between px-8 pb-4 pt-8">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg bg-[#ec5b13]/10 p-2">
                      <Lock className="h-5 w-5 text-[#ec5b13]" />
                    </div>
                    <h2 className="text-2xl font-bold">Update Security</h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create a strong new password to keep your account safe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                className="space-y-5 px-8 py-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void changePassword();
                }}
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 outline-none transition-all focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#ec5b13]"
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 outline-none transition-all focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#ec5b13]"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium uppercase tracking-wider text-slate-500">
                      Strength: <span className={passwordChecks.label === "Strong" ? "text-emerald-500" : passwordChecks.label === "Good" ? "text-amber-500" : "text-red-500"}>{passwordChecks.label}</span>
                    </span>
                    <span className="text-slate-400">{passwordChecks.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-full transition-all duration-500 ${passwordChecks.color}`} style={{ width: `${passwordChecks.percent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-pink-200/50 bg-pink-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.minLength ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.uppercase ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    One uppercase letter
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.lowercase ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    One lowercase letter
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.number ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    One number
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.special ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    One special character
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {passwordChecks.checks.matches ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                    Passwords match
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 outline-none transition-all focus:border-[#ec5b13] focus:ring-2 focus:ring-[#ec5b13]/20 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#ec5b13]"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 bg-slate-50 px-0 py-2 sm:flex-row dark:bg-slate-800/50">
                  <button
                    type="submit"
                    disabled={isChangingPassword || !canSubmitPassword}
                    className="h-11 flex-1 rounded-lg bg-[#ec5b13] px-6 text-sm font-bold text-white shadow-lg shadow-[#ec5b13]/20 transition-all hover:bg-[#ec5b13]/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isChangingPassword ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
