"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Camera, Heart, Lock, Trash2, UserRound } from "lucide-react";

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

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function toFormState(profile: UserProfile): ProfileFormState {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email,
    bio: profile.bio ?? "",
    profilePicture: profile.profilePicture ?? "",
  };
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, token, loading, logout, refreshUser } = useAuth();

  const [initialForm, setInitialForm] = useState<ProfileFormState | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    const loadProfile = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/protected/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile.");
        }

        const payload = (await response.json()) as unknown;
        const data = unwrapData<{ user: UserProfile }>(payload);
        const nextForm = toFormState(data.user);

        setInitialForm(nextForm);
        setForm(nextForm);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load profile.");
      } finally {
        setIsFetching(false);
      }
    };

    void loadProfile();
  }, [token, user]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(initialForm) !== JSON.stringify(form);
  }, [form, initialForm]);

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim() || null,
          lastName: form.lastName.trim() || null,
          bio: form.bio.trim() || null,
          profilePicture: form.profilePicture.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile changes.");
      }

      setInitialForm(form);
      setSuccess("Profile updated successfully.");
      await refreshUser();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const onDiscard = () => {
    if (!initialForm) return;
    setForm(initialForm);
    setSuccess(null);
    setError(null);
  };

  const onDeleteAccount = async () => {
    if (!token) return;

    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      logout();
      router.push("/register");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete account.");
      setIsDeleting(false);
    }
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffcfc]">
        <div className="h-12 w-12 rounded-full border-4 border-[#ec5b13] border-t-transparent animate-spin" />
      </div>
    );
  }

  const avatarFallback = `${form.firstName?.[0] ?? "W"}${form.lastName?.[0] ?? "H"}`.toUpperCase();

  return (
    <div className="relative min-h-screen bg-[#fffcfc] text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-white/90 px-4 py-3 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#ec5b13]/10 p-2 text-[#ec5b13]">
              <Heart className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">WellbeingHub</h2>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 items-center justify-center rounded-xl bg-pink-100 px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-pink-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="profile-settings-form"
              disabled={isSaving || !hasUnsavedChanges}
              className="flex h-10 items-center justify-center rounded-xl bg-[#ec5b13] px-6 text-sm font-semibold text-white shadow-lg shadow-[#ec5b13]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      {hasUnsavedChanges && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-amber-800">
            You have unsaved changes
          </p>
        </div>
      )}

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <div className="mb-10 flex flex-col items-center">
          <div className="group relative">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-pink-50 text-2xl font-bold shadow-xl">
              {form.profilePicture ? (
                <div
                  aria-label="Profile"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.profilePicture})` }}
                />
              ) : (
                avatarFallback
              )}
            </div>
            <div className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#ec5b13] p-2 text-white">
              <Camera className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <h1 className="text-2xl font-bold">Personalize Your Journey</h1>
            <p className="text-slate-500">Update your profile to get a tailored wellness experience.</p>
          </div>
        </div>

        <form id="profile-settings-form" onSubmit={onSave} className="space-y-12">
          <section>
            <div className="mb-6 flex items-center gap-2 border-b border-pink-100 pb-2">
              <UserRound className="h-5 w-5 text-pink-700" />
              <h3 className="text-lg font-bold uppercase tracking-wide text-slate-800">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-600">First Name</label>
                <input
                  className="h-12 w-full rounded-xl border border-pink-100 bg-white px-4 text-slate-800 focus:border-[#ec5b13] focus:ring-[#ec5b13]"
                  value={form.firstName}
                  onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-600">Last Name</label>
                <input
                  className="h-12 w-full rounded-xl border border-pink-100 bg-white px-4 text-slate-800 focus:border-[#ec5b13] focus:ring-[#ec5b13]"
                  value={form.lastName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Email Address</label>
                <input
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500"
                  value={form.email}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Bio</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-pink-100 bg-white p-4 text-slate-800 focus:border-[#ec5b13] focus:ring-[#ec5b13]"
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">Profile Picture URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="h-12 w-full rounded-xl border border-pink-100 bg-white px-4 text-slate-800 focus:border-[#ec5b13] focus:ring-[#ec5b13]"
                  value={form.profilePicture}
                  onChange={(e) => setForm((prev) => ({ ...prev, profilePicture: e.target.value }))}
                />
                <p className="text-xs text-slate-500">Use a valid URL to update your profile picture.</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <section>
              <div className="mb-6 flex items-center gap-2 border-b border-pink-100 pb-2">
                <Heart className="h-5 w-5 text-pink-700" />
                <h3 className="text-lg font-bold uppercase tracking-wide text-slate-800">Notifications</h3>
              </div>
              <p className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-slate-600">
                Notification and advanced wellness preferences are coming soon. Your core profile fields are fully synced now.
              </p>
            </section>

            <section>
              <div className="mb-6 flex items-center gap-2 border-b border-pink-100 pb-2">
                <Lock className="h-5 w-5 text-pink-700" />
                <h3 className="text-lg font-bold uppercase tracking-wide text-slate-800">Privacy</h3>
              </div>
              <p className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-slate-600">
                Privacy controls are planned. Account data management and deletion are already functional below.
              </p>
            </section>
          </div>
        </form>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-pink-100 pt-8 md:flex-row">
          <button
            type="button"
            onClick={onDeleteAccount}
            disabled={isDeleting}
            className="flex items-center gap-1 text-sm font-semibold text-red-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
          <div className="flex w-full gap-4 md:w-auto">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 px-8 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Discard
            </button>
            <button
              type="submit"
              form="profile-settings-form"
              disabled={isSaving || !hasUnsavedChanges}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#ec5b13] px-10 font-bold text-white shadow-lg shadow-[#ec5b13]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400">
        <p>© 2024 WellbeingHub</p>
      </footer>
    </div>
  );
}
