"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

function unwrapData<T>(payload: unknown): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope) {
    return maybeEnvelope.data as T;
  }
  return payload as T;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await res.json()) as unknown;
      const data = unwrapData<{ token?: string }>(payload);

      if (!res.ok) {
        const envelope = payload as ApiEnvelope<{ token?: string }>;
        throw new Error(envelope.error || "Failed to login");
      }

      if (!data.token) {
        throw new Error("Authentication token was not returned.");
      }

      // Fetch user data right after getting token
      const userRes = await fetch(`${apiUrl}/api/protected/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      
      const userPayload = (await userRes.json()) as unknown;
      const userData = unwrapData<{ user?: { id: string; email: string; firstName: string; lastName: string; createdAt: number } }>(userPayload);
      
      if (userRes.ok && userData.user) {
        login(data.token, userData.user);
        router.push("/dashboard");
      } else {
        throw new Error("Failed to fetch user profile");
      }
      
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-deepNavy mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-deepNavy mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to sync your wellness journey.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-deepNavy mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-travelTeal focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-deepNavy mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-wellnessPink focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full py-4 text-lg mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-wellnessPink hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
