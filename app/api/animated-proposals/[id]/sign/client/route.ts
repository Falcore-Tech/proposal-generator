import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { db, animatedProposalEvents, animatedProposals } from "@/lib/db";
import { signClientSchema } from "@/lib/animated-proposal-schema";
import { toSignatureDataUrl } from "@/lib/signature-image";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = signClientSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signature data" }, { status: 400 });
  }

  const [proposal] = await db
    .select({ status: animatedProposals.status, client_signed_at: animatedProposals.client_signed_at })
    .from(animatedProposals)
    .where(eq(animatedProposals.id, id))
    .limit(1);

  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  if (proposal.status !== "sent") return NextResponse.json({ error: "Proposal is not open for signing" }, { status: 400 });
  if (proposal.client_signed_at) return NextResponse.json({ error: "Already signed" }, { status: 409 });

  const signedAt = new Date().toISOString();
  await db
    .update(animatedProposals)
    .set({
      client_signature_url: toSignatureDataUrl(parsed.data.signature_png_base64),
      client_signed_at: signedAt,
      status: "client_signed",
    })
    .where(eq(animatedProposals.id, id));

  await db.insert(animatedProposalEvents).values({ proposal_id: id, event_type: "sign_submit", meta: { role: "client" } });

  getPostHogClient().capture({
    distinctId: id,
    event: "proposal_client_signed",
    properties: { proposal_id: id, signed_at: signedAt },
  });

  return NextResponse.json({ success: true, signed_at: signedAt });
}
