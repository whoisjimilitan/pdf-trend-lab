import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM, partnerWelcomeEmail } from "@/lib/resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email?: string };
  if (!email?.trim()) return NextResponse.json({ found: false }, { status: 400 });

  const partner = await prisma.partner.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!partner) return NextResponse.json({ found: false });

  const dashboardUrl = `${SITE}/affiliate/${partner.code}`;
  const { subject, html } = partnerWelcomeEmail(partner.code, dashboardUrl);
  await resend.emails.send({ from: FROM, to: partner.email, subject, html }).catch(() => {});

  return NextResponse.json({ found: true });
}
