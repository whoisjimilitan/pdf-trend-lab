/**
 * B2B Enrichment Orchestrator
 *
 * Coordinates the full enrichment pipeline for newly created leads.
 * Executes: Brief → Angle → Email Draft
 *
 * Design: Failures are non-blocking. Lead creation always succeeds.
 * Each stage executes independently.
 */

import { generateProspectBrief } from "./b2b-prospect-brief-generator";
import { generateOutreachAngles } from "./b2b-outreach-angle-generator";
import { generateEmailDraft } from "./b2b-email-draft-generator";

export interface EnrichmentResult {
  lead_id: string;
  brief_generated: boolean;
  angle_generated: boolean;
  email_generated: boolean;
  errors: string[];
  completed_at: string;
}

/**
 * Enrich a lead with brief, angle, and email draft
 *
 * This should be called immediately after a lead is created.
 * Runs asynchronously (doesn't block lead creation).
 */
export async function enrichLeadWithOutreach(
  leadId: string
): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    lead_id: leadId,
    brief_generated: false,
    angle_generated: false,
    email_generated: false,
    errors: [],
    completed_at: new Date().toISOString(),
  };

  try {
    console.log(`[ENRICHMENT] Starting enrichment pipeline for ${leadId}`);

    // STEP 1: Generate Prospect Brief
    const brief = await generateProspectBrief(leadId);
    if (!brief) {
      result.errors.push("Failed to generate prospect brief");
      console.log(`[ENRICHMENT] Brief generation failed for ${leadId}`);
    } else {
      result.brief_generated = true;
      console.log(`[ENRICHMENT] Brief generated for ${leadId}`);

      // STEP 2: Generate Outreach Angle (depends on brief)
      const angle = await generateOutreachAngles(brief);
      if (!angle) {
        result.errors.push("Failed to generate outreach angle");
        console.log(`[ENRICHMENT] Angle generation failed for ${leadId}`);
      } else {
        result.angle_generated = true;
        console.log(`[ENRICHMENT] Angle generated for ${leadId}`);

        // STEP 3: Generate Email Draft (depends on brief + angle)
        const email = await generateEmailDraft(brief, angle);
        if (!email) {
          result.errors.push("Failed to generate email draft");
          console.log(`[ENRICHMENT] Email generation failed for ${leadId}`);
        } else {
          result.email_generated = true;
          console.log(`[ENRICHMENT] Email draft generated for ${leadId}`);
        }
      }
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error during enrichment";
    result.errors.push(errorMsg);
    console.error(`[ENRICHMENT] Error enriching ${leadId}:`, error);
  }

  result.completed_at = new Date().toISOString();

  // Log result
  if (result.brief_generated && result.angle_generated && result.email_generated) {
    console.log(`[ENRICHMENT] ✅ Complete enrichment for ${leadId}`);
  } else if (result.brief_generated || result.angle_generated || result.email_generated) {
    console.log(
      `[ENRICHMENT] ⚠️ Partial enrichment for ${leadId}: brief=${result.brief_generated}, angle=${result.angle_generated}, email=${result.email_generated}`
    );
  } else {
    console.log(`[ENRICHMENT] ❌ No enrichment for ${leadId}`);
  }

  return result;
}
