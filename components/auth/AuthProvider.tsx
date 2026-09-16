"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import axios from "axios";
import { authClient } from "@/lib/auth/client";
import type { SessionUser, UserRole } from "@/lib/auth/core";

export interface InitialAuth {
  user: SessionUser;
  role: UserRole | null;
}

interface AuthContextValue {
  user: SessionUser | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialAuth,
}: {
  children: React.ReactNode;
  initialAuth: InitialAuth | null;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [user, setUser] = useState<SessionUser | null>(initialAuth?.user ?? null);
  const [userRole, setUserRole] = useState<UserRole | null>(initialAuth?.role ?? null);

  useEffect(() => {
    setUser(initialAuth?.user ?? null);
    setUserRole(initialAuth?.role ?? null);
  }, [initialAuth]);

  useEffect(() => {
    if (user?.email) {
      posthog.identify(user.email, { email: user.email, is_internal_user: true });
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) return { error: new Error(error.message ?? "Sign in failed") };
    } catch (thrown) {
      return { error: thrown instanceof Error ? thrown : new Error("Sign in failed") };
    }

    const { data } = await axios.get<InitialAuth | { user: null; role: null }>("/api/auth/me");
    setUser(data.user);
    setUserRole(data.role);
    posthog.identify(email, { email, is_internal_user: true });
    posthog.capture("user_logged_in", { email });
    startRefresh(() => router.refresh());
    return { error: null };
  };

  const signOut = async () => {
    posthog.capture("user_logged_out");
    posthog.reset();
    await authClient.signOut();
    setUser(null);
    setUserRole(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading: isRefreshing, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
