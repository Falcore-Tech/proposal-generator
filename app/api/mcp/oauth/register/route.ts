import { NextResponse } from "next/server";
import { createMcpServiceClient } from "../../_lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const redirect_uris: string[] = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];

  if (redirect_uris.length === 0) {
    return NextResponse.json({ error: "invalid_client_metadata", error_description: "redirect_uris required" }, { status: 400 });
  }

  const client_id = `mcp_client_${crypto.randomUUID().replace(/-/g, "")}`;
  const supabase = createMcpServiceClient();

  const { error } = await supabase.from("mcp_oauth_clients").insert({
    client_id,
    redirect_uris,
    client_name: body.client_name ?? null,
  });

  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    client_id,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris,
    grant_types: ["authorization_code"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  }, { status: 201 });
}
