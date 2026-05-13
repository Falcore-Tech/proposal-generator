import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";
import { createPaymentLink } from "@/lib/stripe-animated";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({ stripe_link: z.string().url().optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: proposal } = await supabase
    .from("animated_proposals")
    .select("total_price_cents, currency, company_name")
    .eq("id", id)
    .single();

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let stripeLink = parsed.data.stripe_link;

  if (!stripeLink) {
    stripeLink = await createPaymentLink(
      proposal.total_price_cents,
      proposal.currency,
      id,
      proposal.company_name
    );
  }

  const { data, error } = await supabase
    .from("animated_proposals")
    .update({ stripe_link: stripeLink })
    .eq("id", id)
    .select("id, stripe_link")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: adminUser!.id,
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
