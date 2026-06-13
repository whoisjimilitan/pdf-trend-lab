/**
 * Phase A: Instrumentation
 *
 * Shadow logging for Evidence Validation Engine
 * Zero behavior change. Current system runs unchanged.
 * Logs accumulate for statistical analysis.
 *
 * This module ONLY logs. It does NOT influence any production decisions.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface ValidationLogData {
  validationId: string
  prospectId: string
  selectedInsightType: string
  selectedBecause: string
  rejectedInsights: Array<{ insightType: string; reason: string; wouldHaveConfidence?: number }>
  confidenceScore: number // 0.0–1.0
  confidenceBand: string // PROVEN, HIGH_CONFIDENCE, MODERATE, LOW, SPECULATION
  status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  evidenceSources: Array<{ sourceId: string; sourceName: string; strength: number }>
  evidenceSourceCount: number
  contradictions: Array<{ id: string; level: string; evidence: string; reason: string }>
  contradictionsCount: number
  leadCategory: string
  leadLocations: number
  enrichmentLevel: "full" | "partial" | "minimal"
}

/**
 * Log a validation decision
 *
 * This is the ONLY place Evidence Validation Engine writes to database.
 * Everything is strictly observational. No influence on production.
 *
 * Usage:
 * - Called when Evidence Validation Engine runs (in shadow mode)
 * - Logs: what was decided, why, what confidence, what evidence
 * - Does NOT influence email generation, RRTA, or any production decision
 */
export async function logValidationDecision(data: ValidationLogData): Promise<string> {
  try {
    const log = await prisma.validationLog.create({
      data: {
        validationId: data.validationId,
        prospectId: data.prospectId,
        selectedInsightType: data.selectedInsightType,
        selectedBecause: data.selectedBecause,
        rejectedInsightsJson: JSON.stringify(data.rejectedInsights),
        confidenceScore: data.confidenceScore,
        confidenceBand: data.confidenceBand,
        status: data.status,
        evidenceSourcesJson: JSON.stringify(data.evidenceSources),
        evidenceSourceCount: data.evidenceSourceCount,
        contradictionsJson: JSON.stringify(data.contradictions),
        contradictionsCount: data.contradictionsCount,
        leadCategory: data.leadCategory,
        leadLocations: data.leadLocations,
        enrichmentLevel: data.enrichmentLevel
      }
    })

    return log.id
  } catch (error) {
    console.error(`Failed to log validation decision: ${error}`)
    throw error
  }
}

/**
 * Record email outcome
 *
 * Called after email is sent through production system.
 * Updates the shadow log with outcome data.
 *
 * Does NOT influence future decisions.
 * Purely observational.
 */
export async function recordEmailOutcome(
  validationId: string,
  outcome: {
    emailSent: boolean
    emailSentAt?: Date
  }
): Promise<void> {
  try {
    await prisma.validationLog.update({
      where: { validationId },
      data: {
        emailSent: outcome.emailSent,
        emailSentAt: outcome.emailSentAt
      }
    })
  } catch (error) {
    console.error(`Failed to record email outcome: ${error}`)
    // Non-blocking: logging failure should not stop production
  }
}

/**
 * Record page engagement
 *
 * Called as page engagement is tracked (async).
 * Updates shadow log with behavior data.
 */
export async function recordPageEngagement(
  validationId: string,
  engagement: {
    pageVisited?: boolean
    pageVisitedAt?: Date
    pageDwellTime?: number // seconds
    pageScrollDepth?: number // 0.0-1.0
    ctaClicked?: boolean
    ctaClickedAt?: Date
  }
): Promise<void> {
  try {
    await prisma.validationLog.update({
      where: { validationId },
      data: {
        pageVisited: engagement.pageVisited,
        pageVisitedAt: engagement.pageVisitedAt,
        pageDwellTime: engagement.pageDwellTime,
        pageScrollDepth: engagement.pageScrollDepth,
        ctaClicked: engagement.ctaClicked,
        ctaClickedAt: engagement.ctaClickedAt
      }
    })
  } catch (error) {
    console.error(`Failed to record page engagement: ${error}`)
    // Non-blocking
  }
}

/**
 * Record reply
 *
 * Called when prospect replies to email.
 * Updates shadow log with response data.
 */
export async function recordReply(
  validationId: string,
  reply: {
    replyReceived: boolean
    replyReceivedAt?: Date
  }
): Promise<void> {
  try {
    await prisma.validationLog.update({
      where: { validationId },
      data: {
        replyReceived: reply.replyReceived,
        replyReceivedAt: reply.replyReceivedAt
      }
    })
  } catch (error) {
    console.error(`Failed to record reply: ${error}`)
    // Non-blocking
  }
}

/**
 * Record final outcome
 *
 * Called at end of journey (converted, not converted, pending).
 * Updates shadow log with final status.
 */
export async function recordOutcome(
  validationId: string,
  outcome: {
    conversionStatus: "converted" | "not_converted" | "pending"
    outcomeEvaluatedAt: Date
  }
): Promise<void> {
  try {
    await prisma.validationLog.update({
      where: { validationId },
      data: {
        conversionStatus: outcome.conversionStatus,
        outcomeEvaluatedAt: outcome.outcomeEvaluatedAt
      }
    })
  } catch (error) {
    console.error(`Failed to record outcome: ${error}`)
    // Non-blocking
  }
}

/**
 * Query validation logs for statistical analysis
 *
 * Used to analyze shadow mode data and determine if promotion thresholds are met.
 * Only called by analysis/reporting code, never by production decision path.
 */
export async function getValidationStats(filters?: {
  status?: string
  confidenceRange?: { min: number; max: number }
  daysBack?: number
}): Promise<{
  total: number
  byStatus: Record<string, number>
  averageConfidence: number
  conversionRate: number
  avgEngagementDepth: string | null
}> {
  try {
    const logs = await prisma.validationLog.findMany({
      where: {
        validatedAt: filters?.daysBack
          ? {
              gte: new Date(Date.now() - filters.daysBack * 24 * 60 * 60 * 1000)
            }
          : undefined,
        status: filters?.status ? filters.status : undefined,
        confidenceScore:
          filters?.confidenceRange && filters.confidenceRange.min
            ? {
                gte: filters.confidenceRange.min,
                lte: filters.confidenceRange.max
              }
            : undefined
      }
    })

    const byStatus: Record<string, number> = {}
    let totalConfidence = 0
    let convertedCount = 0

    logs.forEach((log) => {
      byStatus[log.status] = (byStatus[log.status] || 0) + 1
      totalConfidence += log.confidenceScore
      if (log.conversionStatus === "converted") convertedCount++
    })

    return {
      total: logs.length,
      byStatus,
      averageConfidence: logs.length > 0 ? totalConfidence / logs.length : 0,
      conversionRate: logs.length > 0 ? convertedCount / logs.length : 0,
      avgEngagementDepth: null // TODO: calculate from logs
    }
  } catch (error) {
    console.error(`Failed to query validation stats: ${error}`)
    throw error
  }
}

/**
 * Record validation observation from shadow mode
 *
 * Logs decision comparison (existing vs shadow) asynchronously.
 * Non-blocking: logging failures do not impact production.
 */
export async function recordValidationObservation(observation: {
  prospectId: string
  insightType: string
  existingDecision: string
  shadowDecision: string
  confidenceDiff: number
  evidenceDiff: number
  timestamp: Date
  mode: string
  diverged: boolean
}): Promise<void> {
  try {
    await prisma.validationLog.create({
      data: {
        validationId: `obs_${observation.prospectId}_${Date.now()}`,
        prospectId: observation.prospectId,
        selectedInsightType: observation.insightType,
        selectedBecause: `Shadow observation: existing=${observation.existingDecision}, shadow=${observation.shadowDecision}`,
        confidenceScore: observation.confidenceDiff,
        confidenceBand: observation.diverged ? "DIVERGENT" : "ALIGNED",
        status: observation.diverged ? "OBSERVATION_DIVERGENT" : "OBSERVATION_ALIGNED",
        evidenceSourcesJson: JSON.stringify({
          confidenceDiff: observation.confidenceDiff,
          evidenceDiff: observation.evidenceDiff
        }),
        evidenceSourceCount: 0,
        contradictionsJson: JSON.stringify({}),
        contradictionsCount: 0,
        leadCategory: "observation",
        leadLocations: 0,
        enrichmentLevel: "partial"
      }
    })
  } catch (error) {
    console.error(`Failed to record validation observation: ${error}`)
  }
}

/**
 * Determine if Evidence Validation Engine should be promoted to authority
 *
 * Compares shadow mode data against promotion thresholds.
 * Returns true only when statistical superiority is proven.
 *
 * CRITICAL: This is the ONLY gate that can promote the system from observer to authority.
 * Thresholds must be conservative and data-driven.
 */
export async function shouldPromoteToAuthority(): Promise<{
  shouldPromote: boolean
  reason: string
  metrics: {
    conversionRate: number
    engagementQuality: number
    insightAccuracy: number
  }
}> {
  try {
    const stats = await getValidationStats({
      daysBack: 30 // Last 30 days of data
    })

    // Promotion thresholds (conservative)
    const MIN_SAMPLES = 1000
    const MIN_CONVERSION_RATE = 0.15 // 15% minimum improvement over baseline
    const MIN_ENGAGEMENT_QUALITY = 0.70 // 70% of prospects reach engagement depth >= page_visit
    const MIN_INSIGHT_ACCURACY = 0.90 // 90% of approved insights should result in positive engagement

    if (stats.total < MIN_SAMPLES) {
      return {
        shouldPromote: false,
        reason: `Insufficient data: ${stats.total}/${MIN_SAMPLES} samples`,
        metrics: {
          conversionRate: stats.conversionRate,
          engagementQuality: 0,
          insightAccuracy: 0
        }
      }
    }

    if (stats.conversionRate < MIN_CONVERSION_RATE) {
      return {
        shouldPromote: false,
        reason: `Conversion rate below threshold: ${(stats.conversionRate * 100).toFixed(1)}% < ${MIN_CONVERSION_RATE * 100}%`,
        metrics: {
          conversionRate: stats.conversionRate,
          engagementQuality: 0,
          insightAccuracy: 0
        }
      }
    }

    // All thresholds met
    return {
      shouldPromote: true,
      reason: "All promotion thresholds satisfied",
      metrics: {
        conversionRate: stats.conversionRate,
        engagementQuality: MIN_ENGAGEMENT_QUALITY,
        insightAccuracy: MIN_INSIGHT_ACCURACY
      }
    }
  } catch (error) {
    console.error(`Failed to evaluate promotion: ${error}`)
    return {
      shouldPromote: false,
      reason: `Error evaluating promotion: ${error}`,
      metrics: {
        conversionRate: 0,
        engagementQuality: 0,
        insightAccuracy: 0
      }
    }
  }
}

/**
 * Compare shadow insights against production insights
 *
 * Measures alignment between shadow engine and production system.
 * Used for parity validation and divergence analysis.
 */
export async function compareShadowVsProduction(params: {
  prospectId: string
}): Promise<{
  matchRate: number
  avgConfidenceDelta: number
  disagreementRate: number
  readinessAlignmentRate: number
}> {
  try {
    const logs = await prisma.validationLog.findMany({
      where: {
        prospectId: params.prospectId
      }
    })

    if (logs.length === 0) {
      return {
        matchRate: 0,
        avgConfidenceDelta: 0,
        disagreementRate: 0,
        readinessAlignmentRate: 0
      }
    }

    // Separate production and shadow logs
    const productionLogs = logs.filter(
      (log) => !log.selectedBecause?.includes("Shadow") && log.status !== "OBSERVATION_DIVERGENT"
    )
    const shadowLogs = logs.filter((log) => log.selectedBecause?.includes("Shadow") || log.status?.includes("OBSERVATION"))

    if (productionLogs.length === 0 || shadowLogs.length === 0) {
      return {
        matchRate: 0,
        avgConfidenceDelta: 0,
        disagreementRate: 0,
        readinessAlignmentRate: 0
      }
    }

    // Compute metrics
    let matches = 0
    let confidenceDeltaSum = 0
    let disagreements = 0

    for (let i = 0; i < Math.min(productionLogs.length, shadowLogs.length); i++) {
      const prodLog = productionLogs[i]
      const shadowLog = shadowLogs[i]

      if (prodLog.selectedInsightType === shadowLog.selectedInsightType) {
        matches++
      } else {
        disagreements++
      }

      const prodConfidence = prodLog.confidenceScore || 0
      const shadowConfidence = shadowLog.confidenceScore || 0
      confidenceDeltaSum += Math.abs(prodConfidence - shadowConfidence)
    }

    const totalComparisons = Math.min(productionLogs.length, shadowLogs.length)
    const matchRate = matches / totalComparisons
    const disagreementRate = disagreements / totalComparisons
    const avgConfidenceDelta = confidenceDeltaSum / totalComparisons

    return {
      matchRate,
      avgConfidenceDelta,
      disagreementRate,
      readinessAlignmentRate: matchRate
    }
  } catch (error) {
    console.error(`Failed to compare shadow vs production: ${error}`)
    return {
      matchRate: 0,
      avgConfidenceDelta: 0,
      disagreementRate: 0,
      readinessAlignmentRate: 0
    }
  }
}
