import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { slug, ref, tripwire } = await req.json();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
  if (!product) return NextResponse.json({ error: "Guide not found" }, { status: 404 });

  const opp = product.opportunity;
  const tripwireAmount = opp?.isReturning ? 799 : opp?.isExpat ? 499 : 299;
  const unitAmount = tripwire ? tripwireAmount : Math.round((opp?.minPrice ?? 9.99) * 100);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/guide/${slug}/pdf?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: siteUrl,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: unitAmount,
        product_data: {
          name: product.title.length > 60
            ? product.title.slice(0, 57).trimEnd() + "…"
            : product.title,
          description: "Step-by-step PDF guide · Instant download",
        },
      },
    }],
    payment_intent_data: {
      metadata: { slug, productId: product.id, ...(ref ? { partnerCode: String(ref) } : {}) },
    },
  });

  return NextResponse.json({ url: session.url });
}
