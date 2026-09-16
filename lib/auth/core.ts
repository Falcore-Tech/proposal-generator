import { eq } from "drizzle-orm";
import { db, profiles, type UserRole } from "@/lib/db";
import { auth } from "./server";

export type { UserRole };

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export type AuthContext =
  | { kind: "anonymous" }
  | { kind: "unprovisioned"; user: SessionUser }
  | { kind: "deactivated"; user: SessionUser }
  | { kind: "authenticated"; user: SessionUser; role: Exclude<UserRole, "deactivated"> };

export async function resolveProfileRole(userId: string): Promise<UserRole | null> {
  const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile?.role ?? null;
}

export async function resolveAuthContext(): Promise<AuthContext> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return { kind: "anonymous" };

  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
  };

  const role = await resolveProfileRole(user.id);
  if (!role) return { kind: "unprovisioned", user };
  if (role === "deactivated") return { kind: "deactivated", user };
  return { kind: "authenticated", user, role };
}
