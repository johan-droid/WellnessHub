"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Check, Copy, Flower2, QrCode, X } from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type TwoFactorStatus = {
  enabled: boolean;
  configured: boolean;
};

type TwoFactorSetup = {
  qrCodeUrl: string;
  backupCode: string;
  otpauthUrl: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

export default function TwoFactorPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [status, setStatus] = useState<TwoFactorStatus>({ enabled: false, configured: false });
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [step, setStep] = useState<2 | 3>(2);
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [disablePassword, setDisablePassword] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const fetchStatusAndSetup = useCallback(async () => {
    if (!token) return;

    setIsFetching(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const statusRes = await fetch(`${API_URL}/api/protected/2fa/status`, { headers });
      if (!statusRes.ok) throw new Error("Failed to load 2FA status.");

      const statusPayload = (await statusRes.json()) as unknown;
      const statusData = unwrapData<TwoFactorStatus>(statusPayload);
      setStatus(statusData);

      if (!statusData.enabled) {
        const setupRes = await fetch(`${API_URL}/api/protected/2fa/setup`, {
          method: "POST",
          headers,
        });
        if (!setupRes.ok) throw new Error("Failed to generate QR code.");

        const setupPayload = (await setupRes.json()) as unknown;
        const setupData = unwrapData<TwoFactorSetup>(setupPayload);
        setSetup(setupData);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to initialize 2FA.");
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setIsFetching(false);
      return;
    }

    void fetchStatusAndSetup();
  }, [token, user, fetchStatusAndSetup]);

  const verificationCode = useMemo(() => codeDigits.join(""), [codeDigits]);

  const copyBackup = async () => {
    if (!setup?.backupCode) return;
    await navigator.clipboard.writeText(setup.backupCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const updateCodeDigit = (index: number, value: string) => {
    const normalized = value.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = normalized;
    setCodeDigits(next);

    if (normalized && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onBackspace = (index: number, value: string) => {
    if (value === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    if (!token) return;
    if (verificationCode.length !== 6) {
      setError("Enter the full 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/2fa/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const envelope = payload as ApiEnvelope<unknown>;
        throw new Error(envelope.error || "Verification failed.");
      }

      setStatus({ enabled: true, configured: true });
      setSuccess("Two-factor authentication enabled successfully.");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!token) return;
    if (!disablePassword) {
      setError("Enter your current password to disable 2FA.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/protected/2fa/disable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: disablePassword }),
      });

      const payload = (await response.json()) as unknown;
      if (!response.ok) {
        const envelope = payload as ApiEnvelope<unknown>;
        throw new Error(envelope.error || "Unable to disable 2FA.");
      }

      setDisablePassword("");
      setStatus({ enabled: false, configured: false });
      setSuccess("Two-factor authentication disabled.");
      setCodeDigits(["", "", "", "", "", ""]);
      setStep(2);
      await fetchStatusAndSetup();
    } catch (disableError) {
      setError(disableError instanceof Error ? disableError.message : "Unable to disable 2FA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isFetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff0f3]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff758f] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff0f3] text-slate-900 dark:bg-[#2b1b1e] dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-[#ff758f]/10 px-6 py-4 lg:px-40">
        <Link href="/dashboard/settings" className="flex items-center gap-4">
          <div className="rounded-full bg-[#ff758f]/10 p-2 text-[#ff758f]">
            <Flower2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">WellbeingHub</h2>
        </Link>
        <button
          type="button"
          onClick={() => router.push("/dashboard/settings")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff758f]/10 text-[#ff758f] transition-colors hover:bg-[#ff758f]/20"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-4xl p-4 md:p-8">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        <div className="mx-auto mb-8 flex max-w-lg flex-col gap-3">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#ff758f]">Security Setup</p>
              <p className="text-lg font-bold">Step {step} of 3</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{step === 2 ? "66%" : "100%"} Complete</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#ff758f]/10">
            <div className="h-full rounded-full bg-[#ff758f]" style={{ width: step === 2 ? "66%" : "100%" }} />
          </div>
        </div>

        <div className="mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] border border-[#ff758f]/10 bg-white/80 shadow-2xl shadow-[#ff758f]/10 backdrop-blur-sm dark:bg-slate-900/80">
          {step === 2 && (
            <div className="p-8 text-center md:p-12">
              <div className="mb-6">
                <span className="inline-flex rounded-full bg-[#ff758f]/5 p-6 ring-8 ring-[#ff758f]/5">
                  <QrCode className="h-10 w-10 text-[#ff758f]" />
                </span>
              </div>
              <h2 className="mb-4 text-3xl font-bold">Scan QR Code</h2>
              <p className="mx-auto mb-8 max-w-md text-base text-slate-600 dark:text-slate-300">
                Open your authenticator app and scan this QR code to link your account.
              </p>

              {setup?.qrCodeUrl ? (
                <div className="mb-8 inline-block rounded-2xl border border-[#ff758f]/10 bg-white p-4 shadow-sm">
                  <div
                    aria-label="QR Code for 2FA"
                    className="h-44 w-44 bg-cover bg-center"
                    style={{ backgroundImage: `url(${setup.qrCodeUrl})` }}
                  />
                </div>
              ) : (
                <div className="mb-8 text-sm text-slate-500">Preparing QR code...</div>
              )}

              <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-[#ff758f]/20 bg-[#ff758f]/5 p-6 text-left">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#ff758f]">Backup Code</label>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-lg font-bold text-slate-700 dark:text-slate-200">{setup?.backupCode || "Generating..."}</code>
                  <button
                    type="button"
                    onClick={() => void copyBackup()}
                    className="flex items-center gap-1 text-sm font-bold text-[#ff758f] hover:underline"
                    disabled={!setup?.backupCode}
                  >
                    <Copy className="h-4 w-4" /> {isCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard/settings"
                  className="rounded-2xl bg-[#ff758f]/5 px-8 py-4 font-bold text-[#ff758f] transition-colors hover:bg-[#ff758f]/10"
                >
                  Back
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-2xl bg-[#ff758f] px-8 py-4 font-bold text-white shadow-xl shadow-[#ff758f]/20 transition-all hover:scale-[1.02]"
                >
                  Next: Verify Code
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 text-center md:p-12">
              <h2 className="mb-6 text-2xl font-bold">Enter 6-digit code</h2>
              <div className="mb-8 flex justify-center gap-2">
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) => updateCodeDigit(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace") {
                        onBackspace(index, digit);
                      }
                    }}
                    className="h-16 w-12 rounded-xl border-2 border-[#ff758f]/20 bg-[#fff0f3] text-center text-2xl font-bold focus:border-[#ff758f] focus:ring-[#ff758f]/20 dark:bg-slate-800"
                    maxLength={1}
                    inputMode="numeric"
                  />
                ))}
              </div>

              <div className="mb-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-[#ff758f]/5 px-6 py-3 font-bold text-[#ff758f]"
                >
                  Back to QR
                </button>
                <button
                  type="button"
                  onClick={() => void verifyCode()}
                  disabled={isSubmitting || verificationCode.length !== 6 || status.enabled}
                  className="rounded-xl bg-[#ff758f] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Verifying..." : status.enabled ? "Verified" : "Complete Verification"}
                </button>
              </div>

              {status.enabled && (
                <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                    <span className="rounded-full bg-emerald-500 p-1 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <p className="font-medium">Two-factor authentication enabled successfully.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {status.enabled && (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-[#ff758f]/20 bg-white/70 p-5 dark:bg-slate-900/70">
            <h3 className="mb-3 font-bold">Disable Two-Factor Authentication</h3>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Enter your current password to disable 2FA.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Current password"
                className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="button"
                disabled={isSubmitting || !disablePassword}
                onClick={() => void disableTwoFactor()}
                className="h-11 rounded-xl bg-red-500 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-[#ff758f]/5 py-10 text-center">
        <p className="text-sm text-slate-400">© 2024 WellbeingHub. Secure your journey.</p>
      </footer>
    </div>
  );
}
