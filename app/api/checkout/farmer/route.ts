import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: 1999,
        product_data: {
          name: "PDF Seeds — Affiliate Access",
          description: "Lifetime access to your affiliate dashboard. Answer any community question with a guide in 60 seconds. Keep 80% of every sale — for life.",
        },
      },
    }],
    metadata: { type: "partner" },
    customer_creation: "always",
    success_url: `${siteUrl}/earn?joined=true`,
    cancel_url: `${siteUrl}/earn`,
  });

  return NextResponse.json({ url: session.url });
}
