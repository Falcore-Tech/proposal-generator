import { NextResponse } from "next/server";
import { resolveAuthContext, type UserRole } from "./core";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Exclude<UserRole, "deactivated">;
}

type AuthResult = { user: AuthenticatedUser; error: null } | { user: null; error: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const ctx = await resolveAuthContext();

  if (ctx.kind === "anonymous") {
    return { user: null, error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  if (ctx.kind === "unprovisioned") {
    return { user: null, error: NextResponse.json({ error: "No profile for this account" }, { status: 403 }) };
  }
  if (ctx.kind === "deactivated") {
    return { user: null, error: NextResponse.json({ error: "Access has been revoked" }, { status: 403 }) };
  }
  return { user: { id: ctx.user.id, email: ctx.user.email, role: ctx.role }, error: null };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.user.role !== "admin") {
    return { user: null, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  return result;
}
