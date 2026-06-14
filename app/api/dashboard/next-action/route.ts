import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get ONE lead with highest priority
    // Priority: READY TODAY leads first (with replies having highest priority)
    // Then READY older, then INTERESTED, then NEW
    const nextAction = await prisma.b2b_leads.findFirst({
      where: {
        pipeline_stage: { notIn: ["WON", "LOST"] },
      },
      orderBy: [
        // READY TODAY leads with replies first
        { engaged_today: "desc" },
        // Then by engagement type score (replies > visits > clicks > opens)
        {
          last_engagement_type: {
            sort: "asc",
            nulls: "last",
          },
        },
        // Then by recency
        {
          last_engagement_at: {
            sort: "desc",
            nulls: "last",
          },
        },
        // Then by engagement score
        {
          engagement_score: {
            sort: "desc",
            nulls: "last",
          },
        },
      ],
      select: {
        id: true,
        business_name: true,
        email: true,
        phone: true,
        lead_tier: true,
        pipeline_stage: true,
        last_engagement_type: true,
        last_engagement_at: true,
        engagement_score: true,
        engaged_today: true,
      },
    });

    if (!nextAction) {
      return NextResponse.json({
        action: null,
        reason: "No leads requiring action",
      });
    }

    // Generate action text based on engagement type
    let actionText = "";
    let urgency = "medium";

    if (nextAction.last_engagement_type === "reply") {
      actionText = `Call or reply to ${nextAction.business_name}`;
      urgency = "high";
    } else if (nextAction.last_engagement_type === "visit") {
      actionText = `Follow up with ${nextAction.business_name}`;
      urgency = "high";
    } else if (nextAction.last_engagement_type === "click") {
      actionText = `Contact ${nextAction.business_name}`;
      urgency = "medium";
    } else if (nextAction.last_engagement_type === "open") {
      actionText = `Follow up with ${nextAction.business_name}`;
      urgency = "medium";
    } else {
      actionText = `Contact ${nextAction.business_name}`;
      urgency = "low";
    }

    const timeAgo = nextAction.last_engagement_at
      ? getRelativeTime(nextAction.last_engagement_at)
      : "no recent engagement";

    return NextResponse.json({
      leadId: nextAction.id,
      businessName: nextAction.business_name,
      action: actionText,
      reason: `${nextAction.last_engagement_type || "new"} ${timeAgo}`,
      urgency,
      contact: {
        email: nextAction.email,
        phone: nextAction.phone,
      },
      tier: nextAction.lead_tier,
      pipeline: nextAction.pipeline_stage,
      engagementScore: nextAction.engagement_score,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Next action error:", error);
    return NextResponse.json({ error: "Failed to fetch next action" }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
