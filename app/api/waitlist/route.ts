import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, query, country } = await req.json() as { email?: string; query?: string; country?: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  try {
    await prisma.emailSubscriber.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        productSlug: query?.trim() || null,
        country: country?.trim() || null,
        source: "waitlist",
      },
      update: {
        productSlug: query?.trim() || null,
        country: country?.trim() || null,
        source: "waitlist",
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
