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
  if (sessionMeta.type === "partner") {
    if (!email) {
      console.error("[webhook] Partner purchase but no email on session");
      return NextResponse.json({ received: true });
    }

    let code = generateCode(email);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.partner.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode(email);
      attempts++;
    }

    await prisma.partner.upsert({
      where: { email },
      create: { email, code },
      update: {},
    });

    const dashboardUrl = `${SITE}/affiliate/${code}`;
    const { subject, html } = partnerWelcomeEmail(code, dashboardUrl);

    try {
      await resend.emails.send({ from: FROM, to: email, subject, html });
      console.log("[webhook] Partner welcome email sent to", email);
    } catch (err) {
      console.error("[webhook] Failed to send partner welcome email to", email, err);
    }

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
    const partner = await prisma.partner.findUnique({ where: { code: partnerCode } });
    if (partner) {
      const commission = Math.round(saleAmount * COMMISSION * 100) / 100;
      await prisma.partnerSale.create({
        data: { partnerId: partner.id, productSlug: slug, saleAmount, commission },
      }).catch((err) => console.error("[webhook] Failed to create partner sale:", err));
      await prisma.partner.update({
        where: { id: partner.id },
        data: { salesCount: { increment: 1 }, totalEarned: { increment: commission } },
      }).catch((err) => console.error("[webhook] Failed to update partner totals:", err));
    } else {
      console.warn("[webhook] partnerCode not found in DB:", partnerCode);
    }
  }

  if (email) {
    const product = await prisma.product.findFirst({ where: { slug } });
    if (product) {
      const { subject, html } = purchaseConfirmEmail(product.title, `${SITE}/guide/${slug}/pdf`);
      try {
        await resend.emails.send({ from: FROM, to: email, subject, html });
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
