import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { enrichLeadWithOutreach } from "@/lib/b2b-enrichment-orchestrator";

interface DiscoveryResult {
  business_name: string;
  business_category: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
}

export const maxDuration = 300; // 5 minutes max

/**
 * Normalize string for deduplication
 */
function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Check if lead already exists by website, email, or name
 */
async function isDuplicate(lead: DiscoveryResult): Promise<boolean> {
  if (!lead.website && !lead.email && !lead.business_name) {
    return true; // Skip if no identifying info
  }

  const existing = await prisma.b2b_leads.findFirst({
    where: {
      OR: [
        // Check by website
        ...(lead.website
          ? [
              {
                website: {
                  contains: normalize(lead.website),
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
        // Check by email domain
        ...(lead.email
          ? [
              {
                email: {
                  contains: normalize(lead.email),
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
        // Check by business name (95%+ match)
        ...(lead.business_name
          ? [
              {
                business_name: {
                  contains: normalize(lead.business_name).substring(0, 20),
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
      ],
    },
  });

  return !!existing;
}

/**
 * Calculate lead tier based on business data
 */
function calculateTier(business: DiscoveryResult): "A" | "B" | "C" {
  let score = 0;

  // Has verified contact info
  if (business.email && business.email.includes("@")) score += 2;
  if (business.phone) score += 2;
  if (business.website) score += 1;

  // Has complete business name
  if (business.business_name && business.business_name.length > 5) score += 1;

  // Assign tier
  if (score >= 5) return "A";
  if (score >= 3) return "B";
  return "C";
}

/**
 * Main discovery endpoint
 * Discovers new businesses and converts to leads
 */
export async function POST(request: Request) {
  const startTime = new Date();
  const runId = `discovery-${Date.now()}`;

  console.log(`[DISCOVERY] Starting run: ${runId}`);

  // Create orchestration run record
  const orchestrationRun = await prisma.b2b_orchestration_runs.create({
    data: {
      run_id: runId,
      started_at: startTime,
      completed_at: startTime,
      businesses_found: 0,
      leads_created: 0,
      status: "success",
      duration_ms: 0,
    },
  });

  let businessesFound = 0;
  let leadsCreated = 0;
  let duplicatesSkipped = 0;
  let errors: string[] = [];

  try {
    // DISCOVERY SOURCE: Query discovered_businesses that don't yet have b2b_leads
    // Join with enriched_businesses for contact information
    const discoverySource = await prisma.discovered_businesses.findMany({
      select: {
        id: true,
        business_name: true,
        category: true,
        address: true,
        enriched_businesses_enriched_businesses_discovered_business_idTodiscovered_businesses:
          {
            select: {
              email: true,
              phone: true,
              website: true,
            },
            take: 1,
          },
      },
      where: {
        b2b_leads: {
          none: {}, // Only get businesses that don't have b2b_leads yet
        },
      },
      take: 50, // Limit to 50 new businesses per run
      orderBy: { discovered_at: "desc" },
    });

    console.log(
      `[DISCOVERY] Found ${discoverySource.length} candidates from discovered_businesses`
    );

    businessesFound = discoverySource.length;

    // Process each discovered business
    for (const business of discoverySource) {
      try {
        const enrichment = business.enriched_businesses_enriched_businesses_discovered_business_idTodiscovered_businesses[0];
        const candidate: DiscoveryResult = {
          business_name: business.business_name,
          business_category: business.category,
          email: enrichment?.email || null,
          phone: enrichment?.phone || null,
          website: enrichment?.website || null,
          location: business.address,
        };

        // DEDUPLICATION: Check if already exists
        const isDup = await isDuplicate(candidate);
        if (isDup) {
          duplicatesSkipped++;
          console.log(
            `[DISCOVERY] Skipped duplicate: ${candidate.business_name}`
          );
          continue;
        }

        // ENRICHMENT: Already enriched in enriched_businesses table
        const tier = calculateTier(candidate);
        const score = tier === "A" ? 40 : tier === "B" ? 25 : 10;

        // CREATE LEAD: Persist to b2b_leads
        const now = new Date();
        const lead = await prisma.b2b_leads.create({
          data: {
            business_name: candidate.business_name || "Unknown",
            business_category: candidate.business_category,
            email: candidate.email,
            phone: candidate.phone,
            website: candidate.website,
            lead_tier: tier,
            pipeline_stage: "NEW",
            engagement_score: score,
            source: "discovery",
            created_at: now,
            updated_at: now,
          },
        });

        leadsCreated++;
        console.log(
          `[DISCOVERY] Created lead: ${lead.business_name} (${lead.id})`
        );

        // ENRICHMENT: Generate prospect brief, outreach angle, and email draft
        // Non-blocking: fire and forget, so discovery doesn't slow down
        enrichLeadWithOutreach(lead.id).catch((error) => {
          console.error(`[DISCOVERY] Enrichment error for ${lead.id}:`, error);
          // Don't fail discovery run if enrichment fails
        });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        errors.push(errorMsg);
        console.error(`[DISCOVERY] Error processing business:`, e);
      }
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    errors.push(`Discovery source query failed: ${errorMsg}`);
    console.error(`[DISCOVERY] Fatal error:`, e);
  }

  // WRITE ORCHESTRATION LOGS
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  try {
    await prisma.b2b_orchestration_runs.update({
      where: { id: orchestrationRun.id },
      data: {
        completed_at: endTime,
        businesses_found: businessesFound,
        leads_created: leadsCreated,
        duration_ms: duration,
        failures: errors,
        status: errors.length > 0 ? "partial_failure" : "success",
        execution_details: {
          duplicates_skipped: duplicatesSkipped,
          errors_count: errors.length,
          source: "enriched_businesses",
        },
      },
    });

    console.log(`[DISCOVERY] Run completed: ${runId}`);
  } catch (e) {
    console.error(`[DISCOVERY] Failed to update orchestration run:`, e);
  }

  return NextResponse.json({
    status: errors.length > 0 ? "partial_failure" : "success",
    orchestration_run_id: orchestrationRun.id,
    run_id: runId,
    timestamp: startTime.toISOString(),
    duration_ms: duration,
    businesses_found: businessesFound,
    leads_created: leadsCreated,
    duplicates_skipped: duplicatesSkipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/**
 * GET endpoint for testing
 * Returns last 5 discovery runs
 */
export async function GET() {
  const recentRuns = await prisma.b2b_orchestration_runs.findMany({
    orderBy: { started_at: "desc" },
    take: 5,
    select: {
      id: true,
      run_id: true,
      started_at: true,
      businesses_found: true,
      leads_created: true,
      status: true,
      duration_ms: true,
    },
  });

  return NextResponse.json({
    endpoint: "/api/discovery/run",
    method: "POST",
    description: "Execute discovery pipeline to find and create leads",
    recent_runs: recentRuns,
  });
}
