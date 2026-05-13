import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveAuthContext } from "./core";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export async function requireAuth(): Promise<{
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}> {
  const supabase = await createClient();
  const ctx = await resolveAuthContext(supabase);

  if (ctx.kind === "anonymous") {
    return {
      user: null,
      error: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  if (ctx.kind === "deactivated") {
    return {
      user: null,
      error: NextResponse.json({ error: "Access has been revoked" }, { status: 403 }),
    };
  }

  return {
    user: { id: ctx.user.id, email: ctx.user.email, role: ctx.role ?? undefined },
    error: null,
  };
}

export async function requireAdmin(): Promise<{
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}> {
  const { user, error } = await requireAuth();

  if (error) return { user: null, error };

  if (user?.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return { user, error: null };
}
