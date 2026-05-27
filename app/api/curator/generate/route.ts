import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body as { code: string };

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({ where: { code } });
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const { communityCountry, communityTopics: topicsJson } = partner;
    const topics: string[] = JSON.parse(topicsJson || "[]");
    const niche = topics[0] ?? "general";
    const keyword = topics.join(", ");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfseeds.com";

    const res = await fetch(`${siteUrl}/api/engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: communityCountry ?? "GH",
        niche,
        count: 5,
        keyword,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Engine error: ${text}` }, { status: 502 });
    }

    const opportunities = await res.json();
    if (!Array.isArray(opportunities)) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const newIds: string[] = opportunities
      .filter((o): o is { id: string } => o && typeof o.id === "string")
      .map((o) => o.id);

    const existing: string[] = JSON.parse(partner.curatedGuides || "[]");
    const merged = [...new Set([...existing, ...newIds])];

    await prisma.partner.update({
      where: { code },
      data: { curatedGuides: JSON.stringify(merged) },
    });

    return NextResponse.json({ ok: true, count: newIds.length });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}
