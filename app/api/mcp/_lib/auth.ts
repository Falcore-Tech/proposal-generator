import { createMcpServiceClient } from "./supabase";

export interface McpAuthContext {
  userId: string;
  keyId: string;
}

export async function verifyMcpKey(request: Request): Promise<McpAuthContext | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const keyHash = await hashKey(token);
  const supabase = createMcpServiceClient();

  const { data, error } = await supabase
    .from("mcp_api_keys")
    .select("id, user_id")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .single();

  if (error || !data) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user_id)
    .single();

  if (!profile || profile.role === "deactivated") return null;

  await supabase
    .from("mcp_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { userId: data.user_id, keyId: data.id };
}

async function hashKey(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
