/**
 * Shadow Observer Engine
 *
 * Observes insight decisions in shadow mode only.
 * Never influences production flow.
 * Never blocks execution.
 * Logs all observations to validation_logs asynchronously.
 */

import { isEvidenceValidationShadowMode } from "./evidence-validation-flags"
import { recordValidationObservation } from "./b2b-validation-logger"
import { buildInsight } from "./b2b-insight-builder"
import { selectPrimaryInsight } from "./b2b-relevance-selector"
import { detectReadiness } from "./b2b-readiness-detector"
import type { Insight } from "./b2b-insight-object"

export interface ShadowObservation {
  prospectId: string
  insightType: string
  existingDecision: string
  shadowDecision: string
  confidenceDiff: number
  evidenceDiff: number
  timestamp: Date
  mode: "SHADOW_ONLY"
  diverged: boolean
}

/**
 * Build shadow insight end-to-end through pipeline
 *
 * Shadow pipeline flow:
 * Intelligence → Select → Readiness → Build Insight → Log
 *
 * @param params Shadow intelligence and context
 * @returns Canonical Insight object (or null if no approval)
 */
export async function buildShadowInsight(params: {
  shadowIntelligence: any
  prospectId: string
  businessName: string
  serviceContext: {
    serviceType: string
    targetProblem: string
  }
  engagementSignals?: any
}): Promise<Insight | null> {
  try {
    if (!isEvidenceValidationShadowMode()) {
      return null
    }

    // Step 1: Convert LeadIntelligence to Insight
    const insightCandidate = buildInsight({
      insightType: "shadow_observation",
      statement: params.shadowIntelligence.pain_point || "Unspecified challenge",
      painPoint: params.shadowIntelligence.pain_point || "Prospect faces operational challenge",
      opportunity: params.shadowIntelligence.operational_challenge || "Opportunity to optimize operations",
      confidence: params.shadowIntelligence.confidence || 0.5,
      evidenceSources: params.shadowIntelligence.evidence_source || [],
      contradictions: []
    })

    // Step 2: Select most relevant insight
    const selected = selectPrimaryInsight({
      insights: [insightCandidate],
      serviceContext: params.serviceContext
    })

    if (!selected.selectedInsight) {
      return null
    }

    // Step 3: Detect readiness
    const readiness = detectReadiness({
      insight: selected.selectedInsight,
      engagementSignals: params.engagementSignals || {}
    })

    // Step 4: Use selected insight
    const insight = selected.selectedInsight

    // Step 5: Log asynchronously (non-blocking)
    recordValidationObservation({
      prospectId: params.prospectId,
      insightType: insight.insightType,
      existingDecision: null,
      shadowDecision: insight.insightType,
      confidenceDiff: 0,
      timestamp: new Date(),
      mode: "SHADOW_ONLY",
      diverged: false
    }).catch((error) => {
      console.error(`Shadow insight logging failed (non-blocking): ${error}`)
    })

    return insight
  } catch (error) {
    console.error(`Shadow pipeline error (non-blocking): ${error}`)
    return null
  }
}

/**
 * Observe insight decision in shadow mode
 *
 * Compares existing system decision with shadow engine decision.
 * Records observation asynchronously without blocking.
 * No influence on production.
 *
 * @param params Decision comparison data
 * @returns Observation object
 */
export function observeInsightDecision(params: {
  existingDecision: string
  shadowDecision: string
  prospectId: string
  insightType: string
  confidenceDiff: number
  evidenceDiff: number
}): ShadowObservation {
  const observation: ShadowObservation = {
    prospectId: params.prospectId,
    insightType: params.insightType,
    existingDecision: params.existingDecision,
    shadowDecision: params.shadowDecision,
    confidenceDiff: params.confidenceDiff,
    evidenceDiff: params.evidenceDiff,
    timestamp: new Date(),
    mode: "SHADOW_ONLY",
    diverged: params.existingDecision !== params.shadowDecision
  }

  // Log asynchronously, non-blocking
  if (isEvidenceValidationShadowMode()) {
    recordValidationObservation(observation).catch((error) => {
      console.error(`Shadow observation logging failed (non-blocking): ${error}`)
    })
  }

  return observation
}

/**
 * Batch observe multiple decisions
 *
 * @param observations Array of decision observations
 */
export function batchObserveDecisions(
  observations: Array<{
    existingDecision: string
    shadowDecision: string
    prospectId: string
    insightType: string
    confidenceDiff: number
    evidenceDiff: number
  }>
): ShadowObservation[] {
  return observations.map((obs) =>
    observeInsightDecision({
      existingDecision: obs.existingDecision,
      shadowDecision: obs.shadowDecision,
      prospectId: obs.prospectId,
      insightType: obs.insightType,
      confidenceDiff: obs.confidenceDiff,
      evidenceDiff: obs.evidenceDiff
    })
  )
}

/**
 * Check if observation is divergent
 *
 * @param observation Shadow observation
 * @returns True if existing and shadow decisions differ
 */
export function isDivergent(observation: ShadowObservation): boolean {
  return observation.diverged
}

/**
 * Filter observations by divergence
 *
 * @param observations Array of observations
 * @returns Only divergent observations
 */
export function getDivergences(observations: ShadowObservation[]): ShadowObservation[] {
  return observations.filter((obs) => obs.diverged)
}
