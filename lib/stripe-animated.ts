import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createPaymentLink(
  totalPriceCents: number,
  currency: string,
  proposalId: string,
  companyName: string
): Promise<string> {
  const stripe = getStripe();

  const product = await stripe.products.create({
    name: `Falcore Proposal — ${companyName}`,
    metadata: { proposal_id: proposalId },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: totalPriceCents,
    currency: currency.toLowerCase(),
  });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { proposal_id: proposalId, company_name: companyName },
  });

  return link.url;
}
