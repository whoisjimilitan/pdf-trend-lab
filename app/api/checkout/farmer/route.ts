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
          name: "PDF Seeds — Farmer Access",
          description: "Lifetime access to the farmer dashboard. Plant guides. Earn passively.",
        },
      },
    }],
    success_url: `${siteUrl}/signin?welcome=farmer`,
    cancel_url: `${siteUrl}/earn`,
  });

  return NextResponse.json({ url: session.url });
}
