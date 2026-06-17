import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, country, source } = await req.json() as { query?: string; country?: string; source?: string };
    if (!query?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
    // Feature: Search logging — database model removed from schema in Phase 3.4A
    // Accept request but don't persist (SearchQuery model missing)
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  // Feature: Search logging — database model removed from schema in Phase 3.4A
  // Return empty search history (SearchQuery model missing)
  return NextResponse.json([]);
}
