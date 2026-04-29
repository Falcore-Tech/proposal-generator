import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createServiceClient } from "@/utils/supabase/service";

function generateKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "xma_mcp_" + Array.from(array).map((b) => chars[b % chars.length]).join("");
}

async function hashKey(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("mcp_api_keys")
    .select("id, name, key_prefix, last_used_at, created_at, revoked_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "My Key";

  const plaintext = generateKey();
  const keyHash = await hashKey(plaintext);
  const key_prefix = plaintext.slice(0, 16);

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("mcp_api_keys")
    .insert({ user_id: user!.id, name, key_hash: keyHash, key_prefix })
    .select("id, name, key_prefix, created_at")
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ ...data, plaintext_key: plaintext });
}

export async function DELETE(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createServiceClient();
  const { error: dbError } = await supabase
    .from("mcp_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user!.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
