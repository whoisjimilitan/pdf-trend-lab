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

  if (!sig || !secret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  const sessionMeta = session.metadata ?? {};

  // ── Partner sign-up ────────────────────────────────────────────────────────
  if (sessionMeta.type === "partner") {
    if (!email) return NextResponse.json({ received: true });

    let code = generateCode(email);
    // Ensure uniqueness
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
    await resend.emails.send({ from: FROM, to: email, subject, html }).catch(() => {});

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

  if (slug) {
    // Update product sales stats
    await prisma.product.updateMany({
      where: { slug },
      data: { salesCount: { increment: 1 }, revenue: { increment: saleAmount } },
    }).catch(() => {});

    // Attribute partner commission
    if (partnerCode) {
      const partner = await prisma.partner.findUnique({ where: { code: partnerCode } });
      if (partner) {
        const commission = Math.round(saleAmount * COMMISSION * 100) / 100;
        await prisma.partnerSale.create({
          data: { partnerId: partner.id, productSlug: slug, saleAmount, commission },
        });
        await prisma.partner.update({
          where: { id: partner.id },
          data: { salesCount: { increment: 1 }, totalEarned: { increment: commission } },
        });
      }
    }

    // Purchase confirmation email to buyer
    if (email) {
      const product = await prisma.product.findFirst({ where: { slug } });
      if (product) {
        const { subject, html } = purchaseConfirmEmail(product.title, `${SITE}/guide/${slug}`);
        await resend.emails.send({ from: FROM, to: email, subject, html }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ received: true });
}
