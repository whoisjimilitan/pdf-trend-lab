import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, country, source } = await req.json() as { query?: string; country?: string; source?: string };
    if (!query?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
    await prisma.searchQuery.create({
      data: { query: query.trim(), country: country?.trim() || null, source: source || "homepage" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  const queries = await prisma.searchQuery.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(queries);
}
