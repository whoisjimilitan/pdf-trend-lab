import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get last discovery run
    const lastDiscoveryRun = await prisma.b2b_orchestration_runs.findFirst({
      orderBy: { created_at: "desc" },
      take: 1,
      select: {
        id: true,
        status: true,
        created_at: true,
      },
    });

    // Count successful runs this week
    const successfulRunsThisWeek = await prisma.b2b_orchestration_runs.count({
      where: {
        status: "success",
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Total runs this week
    const totalRunsThisWeek = await prisma.b2b_orchestration_runs.count({
      where: {
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get campaign open rate (Phase 3)
    const campaignStats = await prisma.$queryRaw<Array<{ opens: number; sends: number }>>`
      SELECT
        COUNT(DISTINCT CASE WHEN e.event_type = 'open' THEN e.lead_id END) as opens,
        COUNT(DISTINCT c.lead_id) as sends
      FROM phase3_campaign c
      LEFT JOIN b2b_email_events e ON c.lead_id = e.lead_id AND e.event_type = 'open'
      WHERE c.status = 'sent'
    `;

    const campaignOpenRate = campaignStats[0]
      ? Math.round((campaignStats[0].opens / campaignStats[0].sends) * 100)
      : 0;

    // Determine overall system status
    let status = "GREEN";
    let statusMessage = "All systems operational";

    if (successfulRunsThisWeek < 5 && totalRunsThisWeek > 0) {
      status = "YELLOW";
      statusMessage = `${successfulRunsThisWeek}/${totalRunsThisWeek} runs successful this week`;
    } else if (successfulRunsThisWeek === 0 && totalRunsThisWeek > 0) {
      status = "RED";
      statusMessage = "Discovery runs failing";
    }

    // Calculate next discovery run (assuming daily at 02:00 UTC)
    const nextRun = new Date();
    nextRun.setUTCHours(2, 0, 0, 0);
    if (nextRun <= new Date()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return NextResponse.json({
      status,
      statusMessage,
      successfulRunsThisWeek,
      totalRunsThisWeek,
      lastDiscoveryRun: lastDiscoveryRun
        ? {
            timestamp: lastDiscoveryRun.created_at,
            status: lastDiscoveryRun.status,
          }
        : null,
      nextDiscoveryRun: nextRun.toISOString(),
      campaignOpenRate,
      campaignOpenRateHealth:
        campaignOpenRate >= 35 ? "excellent" : campaignOpenRate >= 25 ? "good" : "fair",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("System health error:", error);
    return NextResponse.json({ error: "Failed to fetch system health" }, { status: 500 });
  }
}
