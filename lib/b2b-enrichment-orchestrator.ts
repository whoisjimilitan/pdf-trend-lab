/**
 * B2B Enrichment Orchestrator
 *
 * Coordinates the full enrichment pipeline for newly created leads.
 * Executes: Brief → Angle → Email Draft → Pressure Type Assignment
 *
 * Design: Failures are non-blocking. Lead creation always succeeds.
 * Each stage executes independently.
 */

import { generateProspectBrief } from "./b2b-prospect-brief-generator";
import { generateOutreachAngles } from "./b2b-outreach-angle-generator";
import { generateEmailDraft } from "./b2b-email-draft-generator";
import { mapCategoryToPressureType } from "./b2b-pressure-type-mapper";
import { prisma } from "./prisma";

export interface EnrichmentResult {
  lead_id: string;
  brief_generated: boolean;
  angle_generated: boolean;
  email_generated: boolean;
  pressure_type?: string;
  errors: string[];
  completed_at: string;
}

/**
 * Enrich a lead with brief, angle, email draft, and pressure type
 *
 * This should be called immediately after a lead is created.
 * Runs asynchronously (doesn't block lead creation).
 *
 * Assigns pressure_type based on business category and saves to b2b_outreach.
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

    // Fetch lead to get category for pressure type mapping
    const lead = await prisma.b2b_leads.findUnique({
      where: { id: leadId },
      select: { business_category: true },
    });

    if (!lead?.business_category) {
      result.errors.push("Lead has no business category for pressure type mapping");
      console.log(`[ENRICHMENT] No category found for ${leadId}`);
    }

    const pressureType = lead?.business_category
      ? mapCategoryToPressureType(lead.business_category)
      : undefined;

    if (pressureType) {
      result.pressure_type = pressureType;
      console.log(`[ENRICHMENT] Assigned pressure_type: ${pressureType} for ${leadId}`);
    }

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

          // STEP 4: Save to b2b_outreach with pressure_type
          if (email.subject && email.body) {
            try {
              await prisma.b2b_outreach.create({
                data: {
                  lead_id: leadId,
                  subject: email.subject,
                  body: email.body,
                  email_type: "initial",
                  sent_by: "autonomous",
                  pressure_type: pressureType,
                  copy_variant: "default",
                },
              });
              console.log(`[ENRICHMENT] Outreach record created for ${leadId}`);
            } catch (err) {
              result.errors.push("Failed to save outreach record");
              console.error(
                `[ENRICHMENT] Failed to save outreach for ${leadId}:`,
                err
              );
            }
          }
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
    console.log(
      `[ENRICHMENT] ✅ Complete enrichment for ${leadId} (pressure: ${result.pressure_type})`
    );
  } else if (result.brief_generated || result.angle_generated || result.email_generated) {
    console.log(
      `[ENRICHMENT] ⚠️ Partial enrichment for ${leadId}: brief=${result.brief_generated}, angle=${result.angle_generated}, email=${result.email_generated}`
    );
  } else {
    console.log(`[ENRICHMENT] ❌ No enrichment for ${leadId}`);
  }

  return result;
}
