import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, animatedProposals } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";
import { createPaymentLink } from "@/lib/stripe-animated";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({ stripe_link: z.string().url().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user: adminUser, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [proposal] = await db
    .select({
      total_price_cents: animatedProposals.total_price_cents,
      currency: animatedProposals.currency,
      company_name: animatedProposals.company_name,
    })
    .from(animatedProposals)
    .where(eq(animatedProposals.id, id))
    .limit(1);
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stripeLink =
    parsed.data.stripe_link ??
    (await createPaymentLink(proposal.total_price_cents, proposal.currency, id, proposal.company_name));

  const [data] = await db
    .update(animatedProposals)
    .set({ stripe_link: stripeLink })
    .where(eq(animatedProposals.id, id))
    .returning({ id: animatedProposals.id, stripe_link: animatedProposals.stripe_link });

  getPostHogClient().capture({
    distinctId: adminUser.id,
    event: "proposal_stripe_link_generated",
    properties: {
      proposal_id: id,
      company_name: proposal.company_name,
      total_price_cents: proposal.total_price_cents,
      currency: proposal.currency,
    },
  });

  return NextResponse.json(data);
}
