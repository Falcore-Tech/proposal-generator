import { NextResponse } from "next/server";
import { createMcpServiceClient } from "../../_lib/supabase";

async function sha256Base64url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  let body: Record<string, string>;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await request.json().catch(() => ({}));
  }

  const { grant_type, code, client_id, redirect_uri, code_verifier } = body;

  if (grant_type !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }
  if (!code || !client_id || !redirect_uri || !code_verifier) {
    return NextResponse.json({ error: "invalid_request", error_description: "Missing required parameters" }, { status: 400 });
  }

  const supabase = createMcpServiceClient();

  const { data: authCode, error: codeError } = await supabase
    .from("mcp_oauth_codes")
    .select("*")
    .eq("code", code)
    .eq("client_id", client_id)
    .eq("redirect_uri", redirect_uri)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (codeError || !authCode) {
    return NextResponse.json({ error: "invalid_grant", error_description: "Invalid or expired authorization code" }, { status: 400 });
  }

  const expectedChallenge = await sha256Base64url(code_verifier);
  if (expectedChallenge !== authCode.code_challenge) {
    return NextResponse.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400 });
  }

  await supabase
    .from("mcp_oauth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", authCode.id);

  const token = `mcp_oauth_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const tokenHash = await hashToken(token);
  const tokenPrefix = token.slice(0, 18);

  const { error: tokenError } = await supabase.from("mcp_oauth_tokens").insert({
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
    client_id,
    user_id: authCode.user_id,
  });

  if (tokenError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    access_token: token,
    token_type: "bearer",
    scope: "mcp",
  });
}
