import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { requireAuth } from "@/lib/api-auth";
import { signProviderSchema } from "@/lib/animated-proposal-schema";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const parsed = signProviderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signature data" }, { status: 400 });
  }

  const authClient = await createClient();
  const { data: proposal } = await authClient
    .from("animated_proposals")
    .select("id, status, created_by, provider_signed_at")
    .eq("id", id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status !== "client_signed") {
    return NextResponse.json({ error: "Client must sign first" }, { status: 400 });
  }

  if (proposal.provider_signed_at) {
    return NextResponse.json({ error: "Already counter-signed" }, { status: 409 });
  }

  const serviceClient = createServiceClient();
  const base64Data = parsed.data.signature_png_base64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const storagePath = `${id}/provider.png`;
  const { error: uploadError } = await serviceClient.storage
    .from("signatures")
    .upload(storagePath, buffer, { contentType: "image/png", upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to store signature" }, { status: 500 });
  }

  const { data: urlData } = serviceClient.storage.from("signatures").getPublicUrl(storagePath);
  const signedAt = new Date().toISOString();

  const { data, error: updateError } = await serviceClient
    .from("animated_proposals")
    .update({
      provider_signature_url: urlData.publicUrl,
      provider_signed_at: signedAt,
      status: "counter_signed",
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await serviceClient.from("animated_proposal_events").insert({
    proposal_id: id,
    event_type: "sign_submit",
    meta: { role: "provider", user_id: user!.id },
  });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user!.id,
    event: "proposal_counter_signed",
    properties: { proposal_id: id, signed_at: signedAt },
  });

  return NextResponse.json({ success: true, proposal: data, signed_at: signedAt });
}
