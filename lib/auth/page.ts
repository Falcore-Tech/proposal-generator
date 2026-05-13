import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { resolveAuthContext, type UserRole } from "./core";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const ctx = await resolveAuthContext(supabase);

  if (ctx.kind !== "authenticated") return null;

  return { id: ctx.user.id, email: ctx.user.email, role: ctx.role };
}

export async function requireRole(
  roles: UserRole[],
  redirectTo = "/login"
): Promise<AuthUser> {
  const supabase = await createClient();
  const ctx = await resolveAuthContext(supabase);

  if (ctx.kind === "anonymous") redirect(redirectTo);
  if (ctx.kind === "deactivated") redirect("/access-revoked");
  if (!roles.includes(ctx.role)) redirect("/unauthorized");

  return { id: ctx.user.id, email: ctx.user.email, role: ctx.role };
}

export async function requireAdminRole(redirectTo = "/login"): Promise<AuthUser> {
  return requireRole(["admin"], redirectTo);
}

export async function requireSalesRepRole(redirectTo = "/login"): Promise<AuthUser> {
  return requireRole(["sales_rep"], redirectTo);
}

export async function requireAuthenticatedUser(redirectTo = "/login"): Promise<AuthUser> {
  return requireRole(["admin", "sales_rep"], redirectTo);
}

export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === role;
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

export async function isSalesRep(): Promise<boolean> {
  return hasRole("sales_rep");
}
