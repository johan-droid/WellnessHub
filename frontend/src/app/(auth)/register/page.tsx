"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base-url";

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

async function parseApiPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  throw new Error(
    `API returned non-JSON response (${response.status}) from ${response.url}. Check NEXT_PUBLIC_API_URL. Preview: ${text.slice(0, 120)}`
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await parseApiPayload(res);
      const data = unwrapData<{ token?: string }>(payload);

      if (!res.ok) {
        const envelope = payload as ApiEnvelope<{ token?: string }>;
        throw new Error(envelope.error || "Failed to register");
      }

      if (!data.token) {
        throw new Error("Authentication token was not returned.");
      }

      // Fetch user data right after getting token
      const userRes = await fetch(`${apiUrl}/api/protected/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      
      const userPayload = await parseApiPayload(userRes);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-deepNavy mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-deepNavy mb-2">Start Your Journey</h1>
            <p className="text-gray-500">Create an account to track your wellness and adventures.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-deepNavy mb-2">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-travelTeal focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-deepNavy mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-travelTeal focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-deepNavy mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-memoryPurple focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-deepNavy mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-wellnessPink focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full py-4 text-lg mt-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-travelTeal hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
