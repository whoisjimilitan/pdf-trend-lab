import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
  if (!product) return NextResponse.json({ error: "Guide not found" }, { status: 404 });

  const opp = product.opportunity;
  const currency = opp?.isDiaspora || opp?.country === "GB" ? "gbp"
    : opp?.country === "NG" ? "ngn"
    : opp?.country === "GH" ? "ghs"
    : opp?.country === "KE" ? "kes"
    : opp?.country === "ZA" ? "zar"
    : opp?.country === "CA" ? "cad"
    : opp?.country === "AU" ? "aud"
    : "usd";

  const unitAmount = Math.round((opp?.minPrice ?? 9.99) * 100);

  const origin = req.headers.get("origin") ?? "https://pdfseeds.com";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page" as const,
    mode: "payment",
    return_url: `${origin}/guide/${slug}?session_id={CHECKOUT_SESSION_ID}`,
    line_items: [{
      quantity: 1,
      price_data: {
        currency,
        unit_amount: unitAmount,
        product_data: {
          name: product.title,
          description: opp?.painPoint ?? "Step-by-step PDF guide — instant download",
        },
      },
    }],
    payment_intent_data: {
      metadata: { slug, productId: product.id },
    },
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
