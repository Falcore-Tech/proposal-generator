import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/utils/supabase/service";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const proposalId = session.metadata?.proposal_id;

    if (proposalId) {
      const supabase = createServiceClient();
      await supabase
        .from("animated_proposals")
        .update({ status: "paid", stripe_payment_intent_id: session.payment_intent as string })
        .eq("id", proposalId)
        .in("status", ["counter_signed", "client_signed", "sent"]);

      await supabase.from("animated_proposal_events").insert({
        proposal_id: proposalId,
        event_type: "stripe_click",
        meta: { checkout_session_id: session.id },
      });

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: proposalId,
        event: "proposal_payment_completed",
        properties: {
          proposal_id: proposalId,
          checkout_session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
