/**
 * SAINT & STORY V1 CONVERSION ENGINE
 *
 * Single authoritative source for all outbound email generation
 *
 * Philosophy:
 * - No email sends without RRTA 4/4 validation
 * - Intelligence injection is mandatory
 * - Prospect page linkage is mandatory
 * - No hardcoded templates
 * - No generic copy
 * - No exceptions
 *
 * All email paths (initial, follow-up, test, manual, campaign) route through this engine
 */

import { extractLeadIntelligence, validateIntelligenceSufficiency, EnrichedLead } from "./b2b-intelligence-extract"
import { generateRRTACopy, buildEmailBody, generateCTAText, generateSubject, RRTACopy } from "./b2b-rrta-generator"
import { validateRRTA, explainValidationFailure } from "./b2b-rrta-validator"

export type OutboundEmailContext = "initial_outreach" | "follow_up" | "test" | "manual" | "campaign"

export interface ConversionEngineRequest {
  lead: EnrichedLead
  context: OutboundEmailContext
  triggerEvent?: string
}

export interface ConversionEngineResult {
  // RRTA Components
  recognition: string
  relief: string
  trust: string
  action: string

  // Email Content
  subject: string
  body: string
  cta_text: string
  cta_link: string

  // Prospect Page
  prospect_page_id: string
  prospect_page_url: string

  // Validation
  rrat_score: number // 0-4
  rrat_passed: boolean
  validation_details: any

  // Status
  approved: boolean
  rejection_reason?: string
  recommendation?: string
}

export interface ConversionEngineError {
  approved: false
  rejection_reason: string
  rejection_type: "intelligence_insufficient" | "rrta_validation_failed" | "page_generation_failed"
}

/**
 * MAIN ENTRY POINT: Generate outbound email
 *
 * This is the ONLY function that should be called from send paths
 * All email generation flows through here
 */
export async function generateOutboundEmail(
  request: ConversionEngineRequest
): Promise<ConversionEngineResult | ConversionEngineError> {
  try {
    const { lead, context, triggerEvent } = request

    console.log(`\n📧 Conversion Engine: Generating ${context} email for ${lead.business_name}`)

    // ===== PHASE 1: INTELLIGENCE EXTRACTION =====
    const intelligence = extractLeadIntelligence(lead)

    // Validate sufficiency
    const sufficiency = validateIntelligenceSufficiency(intelligence)
    if (!sufficiency.valid) {
      return {
        approved: false,
        rejection_reason: `Insufficient intelligence: ${sufficiency.issues.join(", ")}`,
        rejection_type: "intelligence_insufficient"
      }
    }

    console.log(`✅ Intelligence extracted (confidence: ${(intelligence.confidence * 100).toFixed(0)}%)`)

    // ===== PHASE 2: RRTA COPY GENERATION =====
    const rrta = generateRRTACopy(lead.business_name, lead.category || "business", intelligence)

    console.log(`✅ RRTA copy generated`)

    // ===== PHASE 3: RRTA VALIDATION =====
    const validation = validateRRTA(rrta)

    if (!validation.passed) {
      return {
        approved: false,
        rejection_reason: explainValidationFailure(validation),
        rejection_type: "rrta_validation_failed"
      }
    }

    console.log(`✅ RRTA validation passed (${validation.score}/4)`)

    // ===== PHASE 4: PROSPECT PAGE SETUP =====
    const pageResult = await ensureProspectPageExists(lead, rrta, context)

    if (!pageResult.success) {
      return {
        approved: false,
        rejection_reason: `Prospect page generation failed: ${pageResult.error}`,
        rejection_type: "page_generation_failed"
      }
    }

    console.log(`✅ Prospect page ready: ${pageResult.url}`)

    // ===== PHASE 5: EMAIL ASSEMBLY =====
    const subject = generateSubject(lead.business_name, lead.category || "business", intelligence)
    const body = buildEmailBody(rrta, lead.business_name)
    const ctaText = generateCTAText(intelligence)
    const ctaLink = pageResult.url

    console.log(`✅ Email assembled`)

    // ===== PHASE 6: APPROVAL =====
    const result: ConversionEngineResult = {
      // RRTA Components
      recognition: rrta.recognition,
      relief: rrta.relief,
      trust: rrta.trust,
      action: rrta.action,

      // Email Content
      subject,
      body,
      cta_text: ctaText,
      cta_link: ctaLink,

      // Prospect Page
      prospect_page_id: pageResult.id,
      prospect_page_url: pageResult.url,

      // Validation
      rrat_score: validation.score,
      rrat_passed: validation.passed,
      validation_details: validation,

      // Status
      approved: true,
      recommendation: `Email ready to send. Prospect page will capture engagement. Track opens, page visits, and replies in ${context} context.`
    }

    console.log(`\n✅ APPROVED: Email ready to send to ${lead.email}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Page: ${pageResult.url}`)

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Conversion engine error: ${errorMessage}`)

    return {
      approved: false,
      rejection_reason: `Unexpected error: ${errorMessage}`,
      rejection_type: "intelligence_insufficient"
    }
  }
}

/**
 * Ensure prospect page exists and is linked
 *
 * Prospect page is MANDATORY
 * Every email must link to the prospect page
 * Page must mirror the email's narrative
 */
async function ensureProspectPageExists(
  lead: EnrichedLead,
  rrta: RRTACopy,
  context: OutboundEmailContext
): Promise<{
  success: boolean
  id: string
  url: string
  error?: string
}> {
  try {
    // Check if page already exists
    const existingPage = await getProspectPage(lead.id)

    if (existingPage) {
      return {
        success: true,
        id: existingPage.id,
        url: existingPage.url
      }
    }

    // Generate new page
    const newPage = await createProspectPage(lead, rrta, context)

    return {
      success: true,
      id: newPage.id,
      url: newPage.url
    }
  } catch (error) {
    return {
      success: false,
      id: "",
      url: "",
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Get existing prospect page for lead
 *
 * PLACEHOLDER: Implement with actual database query
 * Should return: { id, url } or null
 */
async function getProspectPage(
  leadId: string
): Promise<{
  id: string
  url: string
} | null> {
  try {
    // TODO: Query database for existing prospect_page where lead_id = leadId
    // For now, return null to force page creation
    return null
  } catch {
    return null
  }
}

/**
 * Create prospect page for lead
 *
 * PLACEHOLDER: Implement with actual page generation
 * Page should:
 * - Mirror the email's RRTA narrative
 * - Include prospect-specific context
 * - Have CTA that drives engagement
 * - Track all interactions
 */
async function createProspectPage(
  lead: EnrichedLead,
  rrta: RRTACopy,
  context: OutboundEmailContext
): Promise<{
  id: string
  url: string
}> {
  // TODO: Implement actual prospect page generation
  // For validation phase, return placeholder

  const pageId = `page_${lead.id}_${Date.now()}`
  const pageUrl = `/prospect-brief/${lead.id}?context=${context}`

  return {
    id: pageId,
    url: pageUrl
  }
}

/**
 * Validation-only mode: Test engine without sending
 *
 * Used in Phase 7 to generate samples for human review
 */
export async function validateEmailGeneration(
  request: ConversionEngineRequest
): Promise<{
  valid: boolean
  email?: ConversionEngineResult
  errors?: string[]
}> {
  const result = await generateOutboundEmail(request)

  if ("approved" in result && result.approved === false) {
    const error = result as ConversionEngineError
    return {
      valid: false,
      errors: [error.rejection_reason]
    }
  }

  return {
    valid: true,
    email: result as ConversionEngineResult
  }
}

/**
 * For debugging: Show what would be generated
 */
export async function previewEmail(request: ConversionEngineRequest): Promise<string> {
  const result = await generateOutboundEmail(request)

  if ("approved" in result && !result.approved) {
    return `❌ Generation Failed:\n${result.rejection_reason}`
  }

  const email = result as ConversionEngineResult

  return `
📧 EMAIL PREVIEW
================

TO: ${request.lead.email}
SUBJECT: ${email.subject}

---

${email.body}

[CTA Button: "${email.cta_text}"]
[Points to: ${email.cta_link}]

---

🔗 PROSPECT PAGE: ${email.prospect_page_url}

✅ RRTA VALIDATION: ${email.rrat_score}/4
${email.rrat_passed ? "✅ APPROVED FOR SEND" : "❌ REJECTED - Fix issues above"}
`
}
