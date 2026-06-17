import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resend, FROM, purchaseConfirmEmail, partnerWelcomeEmail } from "@/lib/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";
const COMMISSION = 0.80;

function generateCode(email: string): string {
  const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toLowerCase();
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${suffix}`;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error("[webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET env var");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  const sessionMeta = session.metadata ?? {};

  console.log("[webhook] checkout.session.completed — session:", session.id, "email:", email, "meta:", sessionMeta);

  // ── Partner sign-up ────────────────────────────────────────────────────────
  // Feature: Partner affiliate program — database model removed from schema in Phase 3.4A
  if (sessionMeta.type === "partner") {
    console.log("[webhook] Partner sign-up request ignored (feature unavailable)");
    return NextResponse.json({ received: true });
  }

  // ── Guide purchase ─────────────────────────────────────────────────────────
  const pi = session.payment_intent
    ? await stripe.paymentIntents.retrieve(session.payment_intent as string)
    : null;
  const piMeta = pi?.metadata ?? {};
  const slug = piMeta.slug;
  const partnerCode = piMeta.partnerCode;
  const saleAmount = (session.amount_total ?? 0) / 100;

  console.log("[webhook] Guide purchase — slug:", slug, "amount:", saleAmount, "partnerCode:", partnerCode);

  if (!slug) {
    console.error("[webhook] No slug found in payment intent metadata. PI id:", pi?.id);
    return NextResponse.json({ received: true });
  }

  await prisma.product.updateMany({
    where: { slug },
    data: { salesCount: { increment: 1 }, revenue: { increment: saleAmount } },
  }).catch((err) => console.error("[webhook] Failed to update product stats:", err));

  if (partnerCode) {
    // Feature: Partner affiliate program — database models removed from schema in Phase 3.4A
    console.log("[webhook] Partner sale tracking skipped (feature unavailable):", partnerCode);
  }

  if (email) {
    const product = await prisma.product.findFirst({ where: { slug } });
    if (product) {
      const { subject, html, text } = purchaseConfirmEmail(product.title, `${SITE}/guide/${slug}/pdf`);
      try {
        await resend.emails.send({ from: FROM, to: email, subject, html, text });
        console.log("[webhook] Purchase confirmation email sent to", email, "for guide:", slug);
      } catch (err) {
        console.error("[webhook] Failed to send purchase confirmation email to", email, err);
      }
    } else {
      console.error("[webhook] Product not found in DB for slug:", slug);
    }
  } else {
    console.warn("[webhook] No buyer email on session — skipping confirmation email");
  }

  return NextResponse.json({ received: true });
}
