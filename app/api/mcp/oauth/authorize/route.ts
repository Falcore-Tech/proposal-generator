import { createClient } from "@/utils/supabase/server";
import { createMcpServiceClient } from "../../_lib/supabase";

function oauthError(redirectUri: string, state: string | null, error: string, description: string) {
  const url = new URL(redirectUri);
  url.searchParams.set("error", error);
  url.searchParams.set("error_description", description);
  if (state) url.searchParams.set("state", state);
  return Response.redirect(url.toString(), 302);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const response_type = searchParams.get("response_type");
  const client_id = searchParams.get("client_id");
  const redirect_uri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const code_challenge = searchParams.get("code_challenge");
  const code_challenge_method = searchParams.get("code_challenge_method");

  if (!client_id || !redirect_uri || !code_challenge) {
    return new Response("Missing required OAuth parameters", { status: 400 });
  }
  if (response_type !== "code") {
    return oauthError(redirect_uri, state, "unsupported_response_type", "Only 'code' supported");
  }
  if (code_challenge_method && code_challenge_method !== "S256") {
    return oauthError(redirect_uri, state, "invalid_request", "Only S256 code_challenge_method supported");
  }

  const supabase = createMcpServiceClient();
  const { data: client } = await supabase
    .from("mcp_oauth_clients")
    .select("redirect_uris")
    .eq("client_id", client_id)
    .single();

  if (!client || !client.redirect_uris.includes(redirect_uri)) {
    return new Response("Invalid client_id or redirect_uri", { status: 400 });
  }

  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  if (!user) {
    const base = process.env.NEXT_PUBLIC_BASE_URL!;
    const selfUrl = `${base}/api/mcp/oauth/authorize?${searchParams.toString()}`;
    return Response.redirect(`${base}/login?redirectTo=${encodeURIComponent(selfUrl)}`, 302);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "deactivated") {
    return oauthError(redirect_uri, state, "access_denied", "Account deactivated");
  }

  const code = `mcp_code_${crypto.randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase.from("mcp_oauth_codes").insert({
    code,
    client_id,
    user_id: user.id,
    redirect_uri,
    code_challenge,
    expires_at: expiresAt,
  });

  if (error) {
    return oauthError(redirect_uri, state, "server_error", "Failed to create authorization code");
  }

  const callbackUrl = new URL(redirect_uri);
  callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);

  return Response.redirect(callbackUrl.toString(), 302);
}
