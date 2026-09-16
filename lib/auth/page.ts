import { redirect } from "next/navigation";
import { resolveAuthContext, type UserRole } from "./core";

export interface AuthUser {
  id: string;
  email: string;
  role: Exclude<UserRole, "deactivated">;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const ctx = await resolveAuthContext();
  if (ctx.kind !== "authenticated") return null;
  return { id: ctx.user.id, email: ctx.user.email, role: ctx.role };
}

export async function requireRole(roles: UserRole[], redirectTo = "/login"): Promise<AuthUser> {
  const ctx = await resolveAuthContext();
  if (ctx.kind === "anonymous") redirect(redirectTo);
  if (ctx.kind === "unprovisioned") redirect("/unauthorized");
  if (ctx.kind === "deactivated") redirect("/access-revoked");
  if (!roles.includes(ctx.role)) redirect("/unauthorized");
  return { id: ctx.user.id, email: ctx.user.email, role: ctx.role };
}

export async function requireAdminRole(redirectTo = "/login"): Promise<AuthUser> {
  return requireRole(["admin"], redirectTo);
}

export async function requireAuthenticatedUser(redirectTo = "/login"): Promise<AuthUser> {
  return requireRole(["admin", "sales_rep"], redirectTo);
}
