/**
 * Prospect Brief Generator
 *
 * Generates business context and opportunity analysis from lead data.
 * No external APIs - uses only existing lead information.
 * Deterministic output based on business category, size, and location.
 */

import { prisma } from "./prisma";

export interface ProspectBrief {
  lead_id: string;
  business_name: string;
  category: string;
  location?: string | null;
  website: string | null;
  industry_segment: string;
  business_type: string;
  likely_challenges: string[];
  likely_opportunities: string[];
  suggested_value_prop: string;
  estimated_size: "micro" | "small" | "medium" | "enterprise";
  decision_maker_titles: string[];
  opportunity_score: number;
  generated_at: string;
  [key: string]: unknown;
}

/**
 * Infer business type from category
 */
function inferBusinessType(category: string): string {
  const categoryMap: Record<string, string> = {
    "removal-companies": "Logistics & Moving Services",
    "estate-agents": "Real Estate",
    "dental-practices": "Healthcare - Dentistry",
    "legal": "Legal Services",
    "pharmacies": "Healthcare - Pharmacy",
    "event-organisers": "Event Management",
    "driving-schools": "Education",
    "plumbing": "Trades & Services",
    "electricians": "Trades & Services",
    "accounting": "Professional Services",
  };

  return categoryMap[category] || "Service Business";
}

/**
 * Get category-specific challenges
 */
function getChallenges(category: string): string[] {
  const challengeMap: Record<string, string[]> = {
    "removal-companies": [
      "Finding reliable, trained moving teams",
      "Managing seasonal demand fluctuations",
      "Reducing customer acquisition costs",
      "Improving quote-to-booking conversion",
      "Handling customer feedback and reviews",
    ],
    "estate-agents": [
      "Generating qualified leads consistently",
      "Reducing time-on-market",
      "Converting viewings to offers",
      "Building client loyalty and repeat business",
      "Managing competitive pressure",
    ],
    "dental-practices": [
      "Attracting new patients to the practice",
      "Improving patient retention",
      "Managing appointment no-shows",
      "Building trust with anxious patients",
      "Growing treatment acceptance rates",
    ],
    "legal": [
      "Attracting high-value clients",
      "Improving client communication",
      "Managing workload and capacity",
      "Demonstrating expertise and specialization",
      "Building recurring revenue",
    ],
    "event-organisers": [
      "Finding consistent event bookings",
      "Managing logistics and vendor coordination",
      "Improving profit margins",
      "Building repeat business from corporate clients",
      "Handling last-minute cancellations",
    ],
  };

  return challengeMap[category] || [
    "Customer acquisition",
    "Service quality",
    "Operational efficiency",
  ];
}

/**
 * Get category-specific opportunities
 */
function getOpportunities(category: string): string[] {
  const opportunityMap: Record<string, string[]> = {
    "removal-companies": [
      "Automated quote generation and booking",
      "GPS-based job tracking",
      "Customer communication automation",
      "Review generation and management",
      "Demand forecasting",
    ],
    "estate-agents": [
      "Lead generation from local searches",
      "Property-specific marketing",
      "Automated valuation systems",
      "Client management automation",
      "Market intelligence and insights",
    ],
    "dental-practices": [
      "Patient acquisition campaigns",
      "Appointment reminder automation",
      "Patient education content",
      "Online booking system",
      "Referral program management",
    ],
    "legal": [
      "Client intake automation",
      "Matter management systems",
      "Client portal and communication",
      "Legal research tools",
      "Practice growth strategies",
    ],
    "event-organisers": [
      "Event booking platforms",
      "Vendor management systems",
      "Client collaboration tools",
      "Event marketing automation",
      "Revenue optimization",
    ],
  };

  return opportunityMap[category] || [
    "Process automation",
    "Customer experience",
    "Revenue growth",
  ];
}

/**
 * Get suggested value proposition based on category
 */
function getSuggestedValueProp(category: string): string {
  const propMap: Record<string, string> = {
    "removal-companies":
      "More booked jobs, happier customers, less wasted capacity",
    "estate-agents":
      "Faster sales, more qualified buyers, higher commission rates",
    "dental-practices":
      "More new patients, higher treatment acceptance, less no-shows",
    "legal": "Better client relationships, more recurring revenue, less admin",
    "event-organisers":
      "More consistent bookings, smoother execution, better margins",
  };

  return (
    propMap[category] ||
    "Grow revenue, improve operations, delight customers"
  );
}

/**
 * Get decision maker titles for category
 */
function getDecisionMakerTitles(category: string): string[] {
  const titlesMap: Record<string, string[]> = {
    "removal-companies": [
      "Managing Director",
      "Operations Manager",
      "Business Owner",
      "Head of Sales",
    ],
    "estate-agents": [
      "Branch Manager",
      "Owner",
      "Director",
      "Sales Director",
    ],
    "dental-practices": [
      "Practice Owner",
      "Practice Manager",
      "Clinical Director",
      "Lead Dentist",
    ],
    "legal": [
      "Managing Partner",
      "Senior Partner",
      "Practice Manager",
      "Office Manager",
    ],
    "event-organisers": [
      "Director",
      "Owner",
      "Project Manager",
      "Sales Director",
    ],
  };

  return titlesMap[category] || ["Owner", "Manager", "Director"];
}

/**
 * Estimate business size based on website presence and contact methods
 */
function estimateBusinessSize(
  website: string | null,
  phone: string | null,
  email: string | null
): "micro" | "small" | "medium" | "enterprise" {
  let signals = 0;
  if (website) signals++;
  if (phone) signals++;
  if (email) signals++;

  if (signals >= 3) return "small";
  if (signals >= 2) return "micro";
  return "micro";
}

/**
 * Generate a prospect brief for a lead
 */
export async function generateProspectBrief(leadId: string): Promise<ProspectBrief | null> {
  try {
    const lead = await prisma.b2b_leads.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        business_name: true,
        business_category: true,
        website: true,
        phone: true,
        email: true,
        engagement_score: true,
      },
    });

    if (!lead) {
      console.log(`[BRIEF] Lead not found: ${leadId}`);
      return null;
    }

    const brief: ProspectBrief = {
      lead_id: lead.id,
      business_name: lead.business_name,
      category: lead.business_category || "general",
      location: null,
      website: lead.website,
      industry_segment: inferBusinessType(lead.business_category || ""),
      business_type: inferBusinessType(lead.business_category || ""),
      likely_challenges: getChallenges(lead.business_category || ""),
      likely_opportunities: getOpportunities(lead.business_category || ""),
      suggested_value_prop: getSuggestedValueProp(lead.business_category || ""),
      estimated_size: estimateBusinessSize(lead.website, lead.phone, lead.email),
      decision_maker_titles: getDecisionMakerTitles(lead.business_category || ""),
      opportunity_score: lead.engagement_score || 20,
      generated_at: new Date().toISOString(),
    };

    // Store brief in cache
    await prisma.b2b_prospect_brief_cache.upsert({
      where: { lead_id: leadId },
      update: {
        brief_data: brief as any,
        updated_at: new Date(),
      },
      create: {
        lead_id: leadId,
        brief_data: brief as any,
      },
    });

    console.log(`[BRIEF] Generated for ${brief.business_name}`);
    return brief;
  } catch (error) {
    console.error(`[BRIEF] Error generating brief for ${leadId}:`, error);
    return null;
  }
}
