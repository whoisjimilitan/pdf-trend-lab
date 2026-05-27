import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const maxDuration = 60;

async function runEngineAndSaveGuides(
  partnerId: string,
  communityCountry: string,
  topics: string[]
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";
  const niche = topics[0] ?? "general";
  const keyword = topics.join(", ");

  try {
    const res = await fetch(`${siteUrl}/api/engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: communityCountry, niche, count: 5, keyword }),
    });

    if (!res.ok) return;

    const opportunities = await res.json();
    if (!Array.isArray(opportunities) || opportunities.length === 0) return;

    const ids: string[] = opportunities
      .filter((o): o is { id: string } => o && typeof o.id === "string")
      .map((o) => o.id);

    if (ids.length === 0) return;

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { curatedGuides: true },
    });
    if (!partner) return;

    const existing: string[] = JSON.parse(partner.curatedGuides || "[]");
    const merged = [...new Set([...existing, ...ids])];

    await prisma.partner.update({
      where: { id: partnerId },
      data: { curatedGuides: JSON.stringify(merged) },
    });
  } catch {
    // Never break the response
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, communityCountry, platform, communityTopics } = body as {
      code: string;
      communityCountry: string;
      platform: string;
      communityTopics: string[];
    };

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({ where: { code } });
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const topics = Array.isArray(communityTopics) ? communityTopics : [];

    await prisma.partner.update({
      where: { code },
      data: {
        communityCountry: communityCountry ?? null,
        platform: platform ?? null,
        communityTopics: JSON.stringify(topics),
        onboarded: true,
      },
    });

    // Non-blocking: call engine and save opportunity IDs
    if (communityCountry) {
      void runEngineAndSaveGuides(partner.id, communityCountry, topics);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}
