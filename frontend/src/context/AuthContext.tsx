"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { tokenStorage } from "@/lib/token-storage";
import { apiClient, ApiError } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  bio?: string | null;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, expiresIn?: number) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (t: string) => {
    try {
      apiClient.setToken(t);
      const data = await apiClient.get<{ user: User }>("/api/protected/me");
      setUser(data.user);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.isAuthError()) {
        logout();
        setError("Session expired. Please login again.");
      } else {
        console.error("Failed to fetch user", err);
        setError("Failed to load user");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Only run user fetch once on mount when token is available
  useEffect(() => {
    const storedToken = tokenStorage.get();
    if (storedToken) {
      setToken(storedToken);
      void fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []); // Empty dependencies - run only on mount

  const login = (t: string, u: User, expiresIn?: number) => {
    tokenStorage.set(t, expiresIn);
    apiClient.setToken(t);
    setToken(t);
    setUser(u);
    setError(null);
  };

  const logout = () => {
    tokenStorage.clear();
    apiClient.setToken(null);
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }
    await fetchUser(token);
  }, [fetchUser, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
