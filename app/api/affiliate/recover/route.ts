import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM, partnerWelcomeEmail } from "@/lib/resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email?: string };
  if (!email?.trim()) return NextResponse.json({ found: false }, { status: 400 });

  // Feature: Partner affiliate program — database model removed from schema in Phase 3.4A
  const partner = null;

  if (!partner) return NextResponse.json({ found: false });
}
