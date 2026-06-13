/**
 * Readiness Detection Engine
 *
 * Phase B: Observer Engine
 *
 * Determines WHEN a prospect will be ready for an insight.
 *
 * Three states:
 * - ready_now: Problem is active right now, prospect needs solution today
 * - ready_later: Problem exists but not urgent, will become urgent in 3-12 months
 * - emerging: Problem not yet visible, awareness plant for future activation
 *
 * Readiness determines rendering strategy:
 * - ready_now: Urgent CTA, direct positioning, solve-now language
 * - ready_later: Educational tone, future-proofing, save-for-later CTA
 * - emerging: Thought leadership, awareness, consider-now CTA
 */

import { InsightObject } from "./b2b-insight-object"

export interface ReadinessSignals {
  // Location data
  recentLocationChange?: boolean // Added/removed location recently
  locationChurnRate?: number // % of locations changed in last 6 months

  // Business metrics
  revenueDecline?: boolean // Revenue trending down
  customerRetentionDecline?: boolean // Losing customers
  growthRate?: number // YoY growth rate

  // Operational patterns
  seasonalityPattern?: "growing" | "stable" | "declining" // Historical pattern
  upcomingExpansion?: boolean // Planning expansion
  knownPainPoint?: boolean // Explicitly mentioned in reviews/data

  // Temporal signals
  daysUntilProblemLikely?: number // Days until this problem becomes acute
  historicalActivationRate?: number // % of prospects that eventually face this
}

export interface ReadinessResult {
  readiness: "ready_now" | "ready_later" | "emerging"
  urgency: "high" | "medium" | "low"
  rationale: string
  timelineEstimate?: string
  indicators: {
    urgent: string[] // Signals pointing to ready_now
    delayed: string[] // Signals pointing to ready_later
    future: string[] // Signals pointing to emerging
  }
}

/**
 * Score readiness based on signals
 *
 * Decision logic (mirrors current system):
 *
 * READY_NOW (high urgency):
 * - Recent location change
 * - Revenue/retention decline
 * - Explicit pain point mentioned
 *
 * READY_LATER (medium urgency):
 * - Location churn 20–50% annually
 * - Slow revenue decline
 * - Known seasonal peak approaching
 * - Planned expansion
 *
 * EMERGING (low urgency):
 * - No immediate signals
 * - Problem affects <25% of category
 * - Awareness/thought leadership
 */
export function detectReadiness(
  insightType: string,
  signals: ReadinessSignals
): ReadinessResult {
  const urgent: string[] = []
  const delayed: string[] = []
  const future: string[] = []

  // Evaluate location signals
  if (signals.recentLocationChange) {
    urgent.push("Recent location change detected")
  }

  if (signals.locationChurnRate) {
    if (signals.locationChurnRate > 0.5) {
      urgent.push(`High location churn (${(signals.locationChurnRate * 100).toFixed(0)}%)`)
    } else if (signals.locationChurnRate > 0.2) {
      delayed.push(`Moderate location churn (${(signals.locationChurnRate * 100).toFixed(0)}%)`)
    }
  }

  // Evaluate business metrics
  if (signals.revenueDecline) {
    urgent.push("Revenue declining")
  }

  if (signals.customerRetentionDecline) {
    urgent.push("Customer retention declining")
  }

  if (signals.growthRate !== undefined) {
    if (signals.growthRate < -0.1) {
      urgent.push("Negative growth rate")
    } else if (signals.growthRate < 0.05) {
      delayed.push("Minimal growth")
    }
  }

  // Evaluate operational signals
  if (signals.upcomingExpansion) {
    delayed.push("Expansion planned")
  }

  if (signals.knownPainPoint) {
    urgent.push("Pain point explicitly mentioned")
  }

  // Evaluate temporal signals
  if (signals.daysUntilProblemLikely !== undefined) {
    if (signals.daysUntilProblemLikely < 30) {
      urgent.push(`Problem likely within ${signals.daysUntilProblemLikely} days`)
    } else if (signals.daysUntilProblemLikely < 180) {
      delayed.push(`Problem likely within ${Math.ceil(signals.daysUntilProblemLikely / 30)} months`)
    } else {
      future.push(`Long-term challenge (${Math.ceil(signals.daysUntilProblemLikely / 30)} months+)`)
    }
  }

  // Evaluate activation likelihood
  if (signals.historicalActivationRate !== undefined) {
    if (signals.historicalActivationRate < 0.25) {
      future.push("Low historical activation rate")
    }
  }

  // Determine readiness state
  let readiness: "ready_now" | "ready_later" | "emerging"
  let urgency: "high" | "medium" | "low"
  let rationale: string
  let timelineEstimate: string | undefined

  // Scoring logic
  const urgentScore = urgent.length
  const delayedScore = delayed.length
  const futureScore = future.length

  if (urgentScore >= 2) {
    readiness = "ready_now"
    urgency = "high"
    rationale = `Multiple urgent signals detected: ${urgent.slice(0, 2).join(", ")}`
  } else if (urgentScore === 1 && delayedScore >= 1) {
    readiness = "ready_now"
    urgency = "high"
    rationale = `Immediate signal detected: ${urgent[0]}`
  } else if (urgentScore === 1 && delayedScore === 0) {
    readiness = "ready_later"
    urgency = "medium"
    rationale = `One urgent signal, but timing unclear: ${urgent[0]}`
  } else if (delayedScore >= 2) {
    readiness = "ready_later"
    urgency = "medium"
    rationale = `Multiple delayed indicators: ${delayed.slice(0, 2).join(", ")}`
    timelineEstimate = "3-12 months"
  } else if (delayedScore === 1) {
    readiness = "ready_later"
    urgency = "medium"
    rationale = `Delayed signal: ${delayed[0]}`
    timelineEstimate = "3-12 months"
  } else {
    readiness = "emerging"
    urgency = "low"
    rationale = `Awareness signal: This is a known challenge in the category, but no immediate activation signals for this prospect`
    timelineEstimate = "12+ months (if ever)"
  }

  return {
    readiness,
    urgency,
    rationale,
    timelineEstimate,
    indicators: { urgent, delayed, future }
  }
}

/**
 * Apply readiness to InsightObject
 *
 * Updates the readiness fields in an already-created InsightObject.
 * Used after Readiness Detection Engine runs.
 */
export function applyReadinessToInsight(
  insight: InsightObject,
  readinessResult: ReadinessResult
): InsightObject {
  return {
    ...insight,
    readiness: readinessResult.readiness,
    readinessStrategy: {
      positioning:
        readinessResult.readiness === "ready_now"
          ? "immediate_solution"
          : readinessResult.readiness === "ready_later"
            ? "future_readiness"
            : "awareness_plant",
      urgency: readinessResult.urgency,
      callToAction:
        readinessResult.readiness === "ready_now"
          ? "solve_now"
          : readinessResult.readiness === "ready_later"
            ? "save_for_later"
            : "consider_now"
    }
  }
}

/**
 * Example readiness patterns for common insight types
 *
 * These are mirrors of current system logic.
 * In real implementation, these would come from enrichment data.
 */
export function getReadinessSignalsForInsightType(
  insightType: string,
  leadData: Record<string, unknown>
): ReadinessSignals {
  switch (insightType) {
    case "customer_relocation":
      // Pharmacy loses customers to relocation
      return {
        recentLocationChange: leadData.recentLocationChange === true,
        locationChurnRate: leadData.locationChurnRate as number | undefined,
        customerRetentionDecline: leadData.customerRetentionDecline === true,
        knownPainPoint: leadData.mentionsRelocation === true,
        daysUntilProblemLikely: 0 // Immediate if recent change
      }

    case "consistency_challenge":
      // Challenges maintaining consistent service across locations
      return {
        locationChurnRate: leadData.locationChurnRate as number | undefined,
        upcomingExpansion: leadData.plannedExpansion === true,
        growthRate: leadData.growthRate as number | undefined,
        knownPainPoint: leadData.mentionsConsistency === true
      }

    case "service_reliability":
      // Service reliability concerns from reviews
      return {
        revenueDecline: leadData.revenueDecline === true,
        customerRetentionDecline: leadData.retentionDecline === true,
        knownPainPoint: leadData.reviewsMentionReliability === true,
        historicalActivationRate: 0.6 // 60% of category eventually needs this
      }

    default:
      // Generic readiness: no signals
      return {
        historicalActivationRate: 0.25
      }
  }
}
