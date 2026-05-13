import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export type AuthContext =
  | { kind: "anonymous" }
  | { kind: "deactivated" }
  | { kind: "authenticated"; user: { id: string; email: string }; role: UserRole };

export async function resolveProfileRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRole | "deactivated" | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) return null;
  if (profile.role === "deactivated") return "deactivated";
  return profile.role;
}

export async function resolveAuthContext(
  supabase: SupabaseClient<Database>
): Promise<AuthContext> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { kind: "anonymous" };

  const role = await resolveProfileRole(supabase, user.id);
  if (role === null) return { kind: "anonymous" };
  if (role === "deactivated") return { kind: "deactivated" };

  return { kind: "authenticated", user: { id: user.id, email: user.email! }, role };
}
