import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const maxDuration = 60;

async function runEngineAndSaveGuides(
  partnerId: string,
  communityCountry: string,
  topics: string[]
): Promise<void> {
  // Feature: Partner affiliate program — database model removed from schema in Phase 3.4A
  return;
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

    // Feature: Partner affiliate program — database model removed from schema in Phase 3.4A
    const partner = null;
    if (!partner) {
      return NextResponse.json({ error: "Partner feature unavailable" }, { status: 503 });
    }
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}
