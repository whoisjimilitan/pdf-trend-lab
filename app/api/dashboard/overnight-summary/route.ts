import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count new leads discovered today
    const newLeadsToday = await prisma.b2b_leads.count({
      where: {
        created_at: {
          gte: yesterday,
        },
      },
    });

    // Count leads that became READY today
    const becameReadyToday = await prisma.b2b_leads.count({
      where: {
        lead_tier: "READY",
        last_engagement_at: {
          gte: yesterday,
        },
      },
    });

    // Count replies received today
    const repliesToday = await prisma.b2b_email_events.count({
      where: {
        event_type: "reply",
        timestamp: {
          gte: yesterday,
        },
      },
    });

    // Count meetings booked today
    const meetingsToday = await prisma.b2b_leads.count({
      where: {
        pipeline_stage: "QUALIFIED",
        updated_at: {
          gte: yesterday,
        },
      },
    });

    // Count failures (failed orchestration runs) today
    const failuresToday = await prisma.b2b_orchestration_runs.count({
      where: {
        status: { not: "success" },
        created_at: {
          gte: yesterday,
        },
      },
    });

    return NextResponse.json({
      newLeadsToday,
      becameReadyToday,
      repliesToday,
      meetingsToday,
      failuresToday,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Overnight summary error:", error);
    return NextResponse.json({ error: "Failed to fetch overnight summary" }, { status: 500 });
  }
}
