import { NextResponse, NextRequest } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { signClientSchema } from "@/lib/animated-proposal-schema";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = signClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signature data" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: proposal } = await supabase
    .from("animated_proposals")
    .select("id, status, client_signed_at, token")
    .eq("id", id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not open for signing" }, { status: 400 });
  }

  if (proposal.client_signed_at) {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const base64Data = parsed.data.signature_png_base64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const storagePath = `${id}/client.png`;
  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to store signature" }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("signatures").getPublicUrl(storagePath);

  const signedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("animated_proposals")
    .update({
      client_signature_url: urlData.publicUrl,
      client_signed_at: signedAt,
      status: "client_signed",
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("animated_proposal_events").insert({
    proposal_id: id,
    event_type: "sign_submit",
    meta: { role: "client" },
  });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: id,
    event: "proposal_client_signed",
    properties: { proposal_id: id, signed_at: signedAt },
  });

  return NextResponse.json({ success: true, signed_at: signedAt });
}
