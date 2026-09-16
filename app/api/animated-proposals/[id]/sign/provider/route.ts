import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, animatedProposalEvents, animatedProposals } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";
import { signProviderSchema } from "@/lib/animated-proposal-schema";
import { toSignatureDataUrl } from "@/lib/signature-image";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const parsed = signProviderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signature data" }, { status: 400 });
  }

  const [proposal] = await db
    .select({ status: animatedProposals.status, provider_signed_at: animatedProposals.provider_signed_at })
    .from(animatedProposals)
    .where(eq(animatedProposals.id, id))
    .limit(1);

  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (proposal.status !== "client_signed") return NextResponse.json({ error: "Client must sign first" }, { status: 400 });
  if (proposal.provider_signed_at) return NextResponse.json({ error: "Already counter-signed" }, { status: 409 });

  const signedAt = new Date().toISOString();
  const [data] = await db
    .update(animatedProposals)
    .set({
      provider_signature_url: toSignatureDataUrl(parsed.data.signature_png_base64),
      provider_signed_at: signedAt,
      status: "counter_signed",
    })
    .where(eq(animatedProposals.id, id))
    .returning();

  await db.insert(animatedProposalEvents).values({
    proposal_id: id,
    event_type: "sign_submit",
    meta: { role: "provider", user_id: user.id },
  });

  getPostHogClient().capture({
    distinctId: user.id,
    event: "proposal_counter_signed",
    properties: { proposal_id: id, signed_at: signedAt },
  });

  return NextResponse.json({ success: true, proposal: data, signed_at: signedAt });
}
