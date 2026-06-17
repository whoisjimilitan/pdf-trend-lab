import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, productSlug, country, source } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  try {
    // Feature: Email subscription — database model removed from schema in Phase 3.4A
    // Accept subscription but don't persist (EmailSubscriber model missing)
    return NextResponse.json({ ok: true, id: "temp-" + Date.now() });
  } catch {
    return NextResponse.json({ error: "Could not save email" }, { status: 500 });
  }
}

export async function GET() {
  // Feature: Email subscription — database model removed from schema in Phase 3.4A
  // Return empty subscriber list (EmailSubscriber model missing)
  return NextResponse.json([]);
}
