import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    const leads = await prisma.b2b_leads.findMany({
      select: {
        id: true,
        business_name: true,
        business_category: true,
        email: true,
        phone: true,
        website: true,
        lead_tier: true,
        pipeline_stage: true,
        engagement_score: true,
        last_engagement_at: true,
        last_engagement_type: true,
        source: true,
        engaged_today: true,
      },
      orderBy: [{ engagement_score: "desc" }, { created_at: "desc" }],
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
