/**
 * Outreach Angle Generator
 *
 * Determines primary and secondary angles for business development outreach.
 * Based on business category and typical pain points.
 */

import { prisma } from "./prisma";
import { type ProspectBrief } from "./b2b-prospect-brief-generator";

export interface OutreachAngle {
  lead_id: string;
  primary_angle: string;
  primary_hook: string;
  secondary_angle: string;
  secondary_hook: string;
  reasoning: string;
  generated_at: string;
}

type AngleType =
  | "lead-generation"
  | "automation"
  | "customer-retention"
  | "conversion-improvement"
  | "operational-efficiency"
  | "revenue-growth";

/**
 * Get category-specific primary angle
 */
function getPrimaryAngle(
  category: string
): { angle: AngleType; hook: string } {
  const angleMap: Record<string, { angle: AngleType; hook: string }> = {
    "removal-companies": {
      angle: "lead-generation",
      hook: "More qualified moving requests = more booked jobs = more revenue",
    },
    "estate-agents": {
      angle: "lead-generation",
      hook: "More qualified buyers = faster sales = higher commission",
    },
    "dental-practices": {
      angle: "lead-generation",
      hook: "More new patients = grow the practice = predictable income",
    },
    "legal": {
      angle: "revenue-growth",
      hook: "Recurring client relationships = stable revenue per month",
    },
    "pharmacies": {
      angle: "customer-retention",
      hook: "Regular customers = predictable foot traffic = higher turnover",
    },
    "event-organisers": {
      angle: "lead-generation",
      hook: "More event bookings = better capacity utilization = higher margins",
    },
  };

  return (
    angleMap[category] || {
      angle: "lead-generation",
      hook: "More qualified prospects = more closed business",
    }
  );
}

/**
 * Get category-specific secondary angle
 */
function getSecondaryAngle(
  category: string
): { angle: AngleType; hook: string } {
  const angleMap: Record<string, { angle: AngleType; hook: string }> = {
    "removal-companies": {
      angle: "operational-efficiency",
      hook: "Better job scheduling = less wasted time = better crew utilization",
    },
    "estate-agents": {
      angle: "conversion-improvement",
      hook: "Better buyer nurturing = more offer acceptances = fewer fallen-through sales",
    },
    "dental-practices": {
      angle: "customer-retention",
      hook: "Keep patients coming back = lifetime value per patient increases",
    },
    "legal": {
      angle: "automation",
      hook: "Less admin time = more billable hours = higher profitability",
    },
    "pharmacies": {
      angle: "automation",
      hook: "Faster transactions = less waiting = happier customers",
    },
    "event-organisers": {
      angle: "operational-efficiency",
      hook: "Smoother event execution = happier clients = more referrals",
    },
  };

  return (
    angleMap[category] || {
      angle: "automation",
      hook: "Less manual work = more time on high-value activities",
    }
  );
}

/**
 * Get reasoning for angle selection
 */
function getReasoning(brief: ProspectBrief): string {
  const category = brief.category;
  const reasoningMap: Record<string, string> = {
    "removal-companies":
      "Removal companies live and die by booking rate and crew utilization. Lead generation is the #1 constraint.",
    "estate-agents":
      "Estate agents' revenue is directly tied to transaction count and speed. Lead generation unlocks everything else.",
    "dental-practices":
      "Dental practices have high lifetime value per patient. New patient acquisition is the growth lever.",
    "legal":
      "Legal practices benefit most from recurring revenue and client stickiness. Growth comes from depth of relationships.",
    "pharmacies":
      "Pharmacy profitability depends on repeat customers and transaction speed. Retention and efficiency drive margins.",
    "event-organisers":
      "Event businesses live on booking volume and execution quality. More bookings + smoother execution = growth.",
  };

  return (
    reasoningMap[category] ||
    "Based on typical business model and growth constraints in this category."
  );
}

/**
 * Generate outreach angles for a lead
 */
export async function generateOutreachAngles(
  brief: ProspectBrief
): Promise<OutreachAngle | null> {
  try {
    const primary = getPrimaryAngle(brief.category);
    const secondary = getSecondaryAngle(brief.category);

    const angle: OutreachAngle = {
      lead_id: brief.lead_id,
      primary_angle: primary.angle,
      primary_hook: primary.hook,
      secondary_angle: secondary.angle,
      secondary_hook: secondary.hook,
      reasoning: getReasoning(brief),
      generated_at: new Date().toISOString(),
    };

    // Store angle in brief cache (merge with existing brief)
    const existing = await prisma.b2b_prospect_brief_cache.findUnique({
      where: { lead_id: brief.lead_id },
      select: { brief_data: true },
    });

    await prisma.b2b_prospect_brief_cache.update({
      where: { lead_id: brief.lead_id },
      data: {
        brief_data: {
          ...(typeof existing?.brief_data === 'object' && existing?.brief_data ? existing.brief_data : {}),
          ...brief,
          outreach_angle: angle,
        } as any,
        updated_at: new Date(),
      },
    });

    console.log(
      `[ANGLE] Generated for ${brief.business_name}: ${primary.angle} + ${secondary.angle}`
    );
    return angle;
  } catch (error) {
    console.error(
      `[ANGLE] Error generating angles for ${brief.lead_id}:`,
      error
    );
    return null;
  }
}
