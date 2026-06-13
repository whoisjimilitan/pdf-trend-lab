/**
 * Evidence Validation Engine
 *
 * Phase B: Observer Engine
 *
 * Validates insights against evidence collected from enrichment data.
 * Does NOT modify behavior. Logs everything in shadow mode.
 *
 * Core responsibility: Take a candidate insight and evidence sources,
 * determine confidence score, identify contradictions, approve/reject.
 *
 * Initially mirrors current system logic exactly.
 * All divergences explicitly logged.
 */

import {
  InsightObject,
  EvidenceSource,
  Contradiction,
  createInsightObject
} from "./b2b-insight-object"
import { isEvidenceValidationShadowMode } from "./evidence-validation-flags"
import { logValidationDecision } from "./b2b-validation-logger"
import { v4 as uuidv4 } from "uuid"

/**
 * Candidate insight with evidence
 *
 * Input to validation engine
 */
export interface CandidateInsight {
  insightType: string
  statement: string
  painPoint: string
  opportunity: string
  evidenceSources: EvidenceSource[]
  contradictions: Contradiction[]
}

/**
 * Validation result
 *
 * Output from validation engine
 */
export interface ValidationResult {
  insightObject: InsightObject | null
  confidence: number
  confidenceBand: "PROVEN" | "HIGH_CONFIDENCE" | "MODERATE" | "LOW" | "SPECULATION"
  status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  statusReason: string
  framingLevel: "assertive" | "gentle" | "speculative"
  contradictionsSummary: {
    total: number
    weak: number
    moderate: number
    fatal: number
  }
  divergenceFromCurrentSystem?: {
    currentSystemDecision: string
    observerEngineDecision: string
    reason: string
  }
}

/**
 * Calculate confidence score from evidence
 *
 * Algorithm: Sum weighted evidence strengths, apply contradiction penalties
 *
 * Initially mirrors current system scoring exactly.
 */
function calculateConfidenceScore(
  evidenceSources: EvidenceSource[],
  contradictions: Contradiction[]
): { confidence: number; band: "PROVEN" | "HIGH_CONFIDENCE" | "MODERATE" | "LOW" | "SPECULATION" } {
  if (evidenceSources.length === 0) {
    return { confidence: 0.0, band: "SPECULATION" }
  }

  // Sum weighted evidence
  let baseConfidence = 0
  let totalWeight = 0

  evidenceSources.forEach((source) => {
    baseConfidence += source.strength * source.weight
    totalWeight += source.weight
  })

  // Normalize
  const weightedConfidence = totalWeight > 0 ? baseConfidence / totalWeight : 0

  // Apply contradiction penalties
  let finalConfidence = weightedConfidence
  let totalPenalty = 0

  contradictions.forEach((contradiction) => {
    const penalty = Math.abs(contradiction.confidencePenalty)
    totalPenalty += penalty
  })

  // Cap penalty at -1.0 (fully negates confidence)
  finalConfidence = Math.max(0, weightedConfidence - totalPenalty)

  // Determine band
  let band: "PROVEN" | "HIGH_CONFIDENCE" | "MODERATE" | "LOW" | "SPECULATION" = "SPECULATION"
  if (finalConfidence >= 0.85) band = "PROVEN"
  else if (finalConfidence >= 0.70) band = "HIGH_CONFIDENCE"
  else if (finalConfidence >= 0.55) band = "MODERATE"
  else if (finalConfidence >= 0.40) band = "LOW"
  else band = "SPECULATION"

  return { confidence: finalConfidence, band }
}

/**
 * Determine status from confidence and contradictions
 *
 * Decision rule (mirrors current system):
 * - APPROVED: confidence >= 0.55 AND no FATAL contradictions
 * - PENDING_MORE_EVIDENCE: confidence 0.40–0.55 OR MODERATE contradictions
 * - REJECTED_FOR_NOW: confidence < 0.40 OR FATAL contradictions exist
 */
function determineStatus(
  confidence: number,
  contradictions: Contradiction[]
): { status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"; reason: string } {
  // Check for fatal contradictions
  const fatalContradictions = contradictions.filter((c) => c.level === "FATAL")
  if (fatalContradictions.length > 0) {
    return {
      status: "REJECTED_FOR_NOW",
      reason: `${fatalContradictions.length} fatal contradiction(s) found`
    }
  }

  // Check confidence thresholds
  if (confidence >= 0.55) {
    // Check for moderate contradictions
    const moderateContradictions = contradictions.filter((c) => c.level === "MODERATE")
    if (moderateContradictions.length > 2) {
      return {
        status: "PENDING_MORE_EVIDENCE",
        reason: `${moderateContradictions.length} moderate contradictions detected`
      }
    }
    return { status: "APPROVED", reason: "Confidence sufficient, no critical contradictions" }
  }

  if (confidence >= 0.40) {
    return { status: "PENDING_MORE_EVIDENCE", reason: "Confidence in moderate range, needs more data" }
  }

  return { status: "REJECTED_FOR_NOW", reason: "Confidence too low to approve" }
}

/**
 * Determine framing level based on confidence
 *
 * Decision rule (mirrors current system):
 * - assertive: confidence >= 0.85
 * - gentle: confidence 0.60–0.85
 * - speculative: confidence < 0.60
 */
function determineFramingLevel(
  confidence: number
): "assertive" | "gentle" | "speculative" {
  if (confidence >= 0.85) return "assertive"
  if (confidence >= 0.60) return "gentle"
  return "speculative"
}

/**
 * Log divergence when observer engine decision differs from current system
 *
 * Used to ensure parity during Phase B.
 */
async function logDivergenceIfPresent(
  prospectId: string,
  candidateInsight: CandidateInsight,
  validationResult: ValidationResult,
  currentSystemDecision?: string
): Promise<void> {
  if (!currentSystemDecision || isEvidenceValidationShadowMode()) {
    return
  }

  if (currentSystemDecision !== validationResult.status) {
    console.warn(`DIVERGENCE DETECTED: prospect ${prospectId}`, {
      insightType: candidateInsight.insightType,
      currentSystemDecision,
      observerEngineDecision: validationResult.status,
      confidence: validationResult.confidence,
      reason: "Decision logic produced different result"
    })
  }
}

/**
 * Main validation engine
 *
 * Takes a candidate insight with evidence and determines:
 * 1. Confidence score (0.0–1.0)
 * 2. Status (APPROVED/PENDING/REJECTED)
 * 3. Framing level (assertive/gentle/speculative)
 * 4. Contradiction summary
 * 5. Readiness (ready_now/ready_later/emerging) — delegated to Readiness Engine
 *
 * Returns either an InsightObject (if approved) or null.
 *
 * @param prospectId - Lead/prospect identifier
 * @param businessName - Business name
 * @param candidateInsight - Insight to validate
 * @param leadCategory - Category of lead (for metadata)
 * @param leadLocations - Number of locations
 * @param enrichmentLevel - Enrichment completeness
 * @param currentSystemDecision - (Optional) Current system's decision for parity checking
 */
export async function validateInsight(
  prospectId: string,
  businessName: string,
  candidateInsight: CandidateInsight,
  leadCategory: string,
  leadLocations: number,
  enrichmentLevel: "full" | "partial" | "minimal",
  currentSystemDecision?: string
): Promise<ValidationResult> {
  // Step 1: Calculate confidence
  const { confidence, band } = calculateConfidenceScore(
    candidateInsight.evidenceSources,
    candidateInsight.contradictions
  )

  // Step 2: Determine status
  const { status, reason: statusReason } = determineStatus(confidence, candidateInsight.contradictions)

  // Step 3: Determine framing level
  const framingLevel = determineFramingLevel(confidence)

  // Step 4: Count contradictions by level
  const contradictionsSummary = {
    total: candidateInsight.contradictions.length,
    weak: candidateInsight.contradictions.filter((c) => c.level === "WEAK").length,
    moderate: candidateInsight.contradictions.filter((c) => c.level === "MODERATE").length,
    fatal: candidateInsight.contradictions.filter((c) => c.level === "FATAL").length
  }

  // Step 5: Create InsightObject if approved, otherwise null
  let insightObject: InsightObject | null = null

  if (status === "APPROVED") {
    const insightId = uuidv4()
    const validationId = uuidv4()

    insightObject = createInsightObject({
      insightId,
      insightType: candidateInsight.insightType,
      leadId: prospectId,
      businessName,
      insight: {
        statement: candidateInsight.statement,
        painPoint: candidateInsight.painPoint,
        opportunity: candidateInsight.opportunity
      },
      confidence,
      evidenceSources: candidateInsight.evidenceSources,
      contradictions: candidateInsight.contradictions,
      status,
      statusReason,
      framingLevel,
      framingGuidance: {
        tone: framingLevel === "assertive" ? "direct" : framingLevel === "gentle" ? "empathetic" : "cautious",
        specificity: framingLevel === "assertive" ? "specific" : "generalized",
        presupposition: `The prospect ${framingLevel === "assertive" ? "actively faces" : framingLevel === "gentle" ? "likely experiences" : "may encounter"} this challenge`
      },
      validatedAt: new Date(),
      validationId,
      validationMetadata: {
        leadCategory,
        leadLocations,
        enrichmentLevel,
        discoveryMethod: "evidence_validation_engine"
      },
      readiness: "ready_now", // Will be overridden by Readiness Detection Engine
      readinessStrategy: {
        positioning: "immediate_solution",
        urgency: "high",
        callToAction: "solve_now"
      }
    })

    // Log the validation decision
    if (isEvidenceValidationShadowMode()) {
      await logValidationDecision({
        validationId: insightObject.validationId,
        prospectId,
        selectedInsightType: candidateInsight.insightType,
        selectedBecause: statusReason,
        rejectedInsights: [],
        confidenceScore: confidence,
        confidenceBand: band,
        status,
        evidenceSources: candidateInsight.evidenceSources,
        evidenceSourceCount: candidateInsight.evidenceSources.length,
        contradictions: candidateInsight.contradictions,
        contradictionsCount: contradictionsSummary.total,
        leadCategory,
        leadLocations,
        enrichmentLevel
      })
    }
  }

  // Step 6: Check for divergence from current system
  let divergence: ValidationResult["divergenceFromCurrentSystem"] = undefined
  if (currentSystemDecision && currentSystemDecision !== status) {
    divergence = {
      currentSystemDecision,
      observerEngineDecision: status,
      reason: `Confidence: ${confidence.toFixed(3)}. Status logic: ${statusReason}`
    }

    // Log divergence for analysis
    await logDivergenceIfPresent(prospectId, candidateInsight, {
      insightObject,
      confidence,
      confidenceBand: band,
      status,
      statusReason,
      framingLevel,
      contradictionsSummary,
      divergenceFromCurrentSystem: divergence
    })
  }

  return {
    insightObject,
    confidence,
    confidenceBand: band,
    status,
    statusReason,
    framingLevel,
    contradictionsSummary,
    divergenceFromCurrentSystem: divergence
  }
}

/**
 * Batch validate multiple insights
 *
 * Used for testing parity across 100 representative prospects.
 */
export async function batchValidateInsights(
  candidates: Array<{
    prospectId: string
    businessName: string
    candidateInsight: CandidateInsight
    leadCategory: string
    leadLocations: number
    enrichmentLevel: "full" | "partial" | "minimal"
  }>
): Promise<ValidationResult[]> {
  return Promise.all(
    candidates.map((candidate) =>
      validateInsight(
        candidate.prospectId,
        candidate.businessName,
        candidate.candidateInsight,
        candidate.leadCategory,
        candidate.leadLocations,
        candidate.enrichmentLevel
      )
    )
  )
}
