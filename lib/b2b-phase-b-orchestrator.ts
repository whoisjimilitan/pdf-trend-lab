/**
 * Phase B: Observer Engine Orchestrator
 *
 * Brings all Phase B components together:
 * 1. Evidence Validation Engine (validates individual insights)
 * 2. Readiness Detection Engine (determines when prospect is ready)
 * 3. Relevance Selection Engine (picks the best insight)
 *
 * Flow:
 * Input: Enrichment data + candidate insights
 * Process: Validate → Detect Readiness → Select Most Relevant
 * Output: Single InsightObject (the winner) OR null if no approved insights
 *
 * Runs entirely in OBSERVER mode:
 * - Logs everything
 * - Influences nothing
 * - Parallel to current system
 * - Zero behavioral change
 */

import { InsightObject } from "./b2b-insight-object"
import { CandidateInsight, validateInsight } from "./b2b-evidence-validation-engine"
import { detectReadiness, applyReadinessToInsight, ReadinessSignals } from "./b2b-readiness-detection-engine"
import { filterAndSelect } from "./b2b-relevance-selection-engine"
import { isEvidenceValidationShadowMode, isEvidenceValidationEnabled } from "./evidence-validation-flags"
import { logValidationDecision } from "./b2b-validation-logger"

export interface ObserverEngineInput {
  prospectId: string
  businessName: string

  // Candidate insights to validate
  candidateInsights: Array<{
    insightType: string
    statement: string
    painPoint: string
    opportunity: string
    evidence: Array<{
      sourceId: string
      sourceName: string
      strength: number // 0.0–1.0
      foundAt?: string
      rawData?: string
      weight: number // 0.0–1.0
    }>
    contradictions: Array<{
      id: string
      level: "WEAK" | "MODERATE" | "FATAL"
      evidence: string
      reason: string
      confidencePenalty: number
      foundAt: string
    }>
  }>

  // Lead metadata
  leadCategory: string
  leadLocations: number
  enrichmentLevel: "full" | "partial" | "minimal"
  enrichmentData: Record<string, unknown> // For readiness detection

  // Current system decision (for parity checking)
  currentSystemSelectedInsightType?: string
}

export interface ObserverEngineOutput {
  selectedInsight: InsightObject | null
  status: "success" | "no_approved_insights" | "error"
  reason: string

  // Shadow mode only
  shadowModeMetrics?: {
    candidatesEvaluated: number
    candidatesApproved: number
    divergenceDetected: boolean
  }

  // Error details
  errorDetails?: string
}

/**
 * Run the complete Observer Engine pipeline
 *
 * This is the main entry point for Phase B.
 * Should be called for every prospect decision in shadow mode.
 */
export async function runObserverEngine(
  input: ObserverEngineInput
): Promise<ObserverEngineOutput> {
  // Check if enabled
  if (!isEvidenceValidationEnabled()) {
    return {
      selectedInsight: null,
      status: "error",
      reason: "Evidence Validation Engine is disabled",
      errorDetails: "EVIDENCE_VALIDATION_MODE is set to 'off'"
    }
  }

  try {
    // STEP 1: Validate each candidate insight
    const validationResults = await Promise.all(
      input.candidateInsights.map((candidate) =>
        validateInsight(
          input.prospectId,
          input.businessName,
          {
            insightType: candidate.insightType,
            statement: candidate.statement,
            painPoint: candidate.painPoint,
            opportunity: candidate.opportunity,
            evidenceSources: candidate.evidence,
            contradictions: candidate.contradictions
          },
          input.leadCategory,
          input.leadLocations,
          input.enrichmentLevel,
          input.currentSystemSelectedInsightType
        )
      )
    )

    // STEP 2: Detect readiness for each approved insight
    const insightsWithReadiness: InsightObject[] = []

    for (const validationResult of validationResults) {
      if (validationResult.insightObject) {
        // Detect readiness for this insight
        const readinessSignals = getReadinessSignalsFromData(
          validationResult.insightObject.insightType,
          input.enrichmentData
        )

        const readinessResult = detectReadiness(validationResult.insightObject.insightType, readinessSignals)

        // Apply readiness to insight
        const insightWithReadiness = applyReadinessToInsight(validationResult.insightObject, readinessResult)

        insightsWithReadiness.push(insightWithReadiness)
      }
    }

    // STEP 3: Select the most relevant insight
    if (insightsWithReadiness.length === 0) {
      return {
        selectedInsight: null,
        status: "no_approved_insights",
        reason: "No candidate insights passed validation",
        shadowModeMetrics: {
          candidatesEvaluated: input.candidateInsights.length,
          candidatesApproved: 0,
          divergenceDetected: false
        }
      }
    }

    const selectionResult = filterAndSelect(insightsWithReadiness, input.currentSystemSelectedInsightType)

    if (!selectionResult) {
      return {
        selectedInsight: null,
        status: "no_approved_insights",
        reason: "Selection engine found no approved insights",
        shadowModeMetrics: {
          candidatesEvaluated: input.candidateInsights.length,
          candidatesApproved: insightsWithReadiness.length,
          divergenceDetected: false
        }
      }
    }

    // STEP 4: Log divergence if detected
    if (selectionResult.divergenceFromCurrentSystem) {
      console.warn("OBSERVER DIVERGENCE", {
        prospectId: input.prospectId,
        currentSystem: selectionResult.divergenceFromCurrentSystem.currentSystemSelected,
        observer: selectionResult.divergenceFromCurrentSystem.observerEngineSelected,
        reason: selectionResult.divergenceFromCurrentSystem.reason
      })
    }

    // Success
    return {
      selectedInsight: selectionResult.selectedInsight,
      status: "success",
      reason: selectionResult.selectedBecause,
      shadowModeMetrics: {
        candidatesEvaluated: input.candidateInsights.length,
        candidatesApproved: insightsWithReadiness.length,
        divergenceDetected: !!selectionResult.divergenceFromCurrentSystem
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error("Observer Engine Error", {
      prospectId: input.prospectId,
      error: errorMessage
    })

    return {
      selectedInsight: null,
      status: "error",
      reason: "Observer Engine encountered an error",
      errorDetails: errorMessage
    }
  }
}

/**
 * Helper: Extract readiness signals from enrichment data
 *
 * Mirrors the format of signals that current system uses.
 */
function getReadinessSignalsFromData(
  insightType: string,
  enrichmentData: Record<string, unknown>
): ReadinessSignals {
  // Map enrichment data to readiness signals
  // This mirrors how current system determines readiness
  return {
    recentLocationChange: enrichmentData.recentLocationChange === true,
    locationChurnRate: enrichmentData.locationChurnRate as number | undefined,
    revenueDecline: enrichmentData.revenueDecline === true,
    customerRetentionDecline: enrichmentData.customerRetentionDecline === true,
    growthRate: enrichmentData.growthRate as number | undefined,
    upcomingExpansion: enrichmentData.upcomingExpansion === true,
    knownPainPoint: enrichmentData.knownPainPoint === true,
    daysUntilProblemLikely: enrichmentData.daysUntilProblemLikely as number | undefined,
    historicalActivationRate: enrichmentData.historicalActivationRate as number | undefined
  }
}

/**
 * Parity Test Helper: Run observer engine and compare to current system decision
 *
 * Used during parity validation test (100 representative prospects).
 * Logs divergences for analysis.
 */
export async function testParityOnProspect(
  input: ObserverEngineInput
): Promise<{
  prospectId: string
  matchedCurrentSystem: boolean
  observerDecision: string
  currentSystemDecision: string
  observerConfidence?: number
  reason: string
}> {
  const output = await runObserverEngine(input)

  const observerDecision = output.selectedInsight?.insightType || "NO_INSIGHT"
  const currentSystemDecision = input.currentSystemSelectedInsightType || "NO_INSIGHT"
  const matched = observerDecision === currentSystemDecision

  return {
    prospectId: input.prospectId,
    matchedCurrentSystem: matched,
    observerDecision,
    currentSystemDecision,
    observerConfidence: output.selectedInsight?.confidence,
    reason: output.reason
  }
}

/**
 * Parity validation across batch of prospects
 *
 * Returns summary statistics and divergence list.
 */
export async function batchParityTest(
  prospects: ObserverEngineInput[]
): Promise<{
  total: number
  matched: number
  matchRate: number
  divergences: Array<{
    prospectId: string
    observerDecision: string
    currentSystemDecision: string
    confidence: number
  }>
}> {
  const results = await Promise.all(prospects.map((p) => testParityOnProspect(p)))

  const matched = results.filter((r) => r.matchedCurrentSystem).length
  const matchRate = matched / results.length

  const divergences = results
    .filter((r) => !r.matchedCurrentSystem)
    .map((r) => ({
      prospectId: r.prospectId,
      observerDecision: r.observerDecision,
      currentSystemDecision: r.currentSystemDecision,
      confidence: r.observerConfidence || 0
    }))

  return {
    total: results.length,
    matched,
    matchRate,
    divergences
  }
}
