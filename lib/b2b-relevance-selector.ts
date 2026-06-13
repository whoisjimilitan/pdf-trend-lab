/**
 * Relevance Selection Engine
 *
 * Selects single primary insight from multiple valid candidates.
 * Ranks by confidence × relevance intersection.
 * No evidence evaluation. No insight modification.
 * Selection only.
 */

import type { Insight } from "./b2b-insight-object"

export interface SelectionResult {
  selectedInsight: Insight
  rejectedInsights: Insight[]
  selectionReason: string
}

/**
 * Select primary insight from candidates
 *
 * Ranks insights by:
 * 1. Relevance to service context
 * 2. Confidence score
 * 3. Intersection score (relevance × confidence)
 *
 * Returns highest-ranking insight.
 *
 * @param params Insights and service context
 * @returns Selection result with primary insight and rejected alternatives
 */
export function selectPrimaryInsight({
  insights,
  serviceContext
}: {
  insights: Insight[]
  serviceContext: {
    serviceType: string
    targetProblem: string
  }
}): SelectionResult {
  if (insights.length === 0) {
    throw new Error("Must provide at least one insight")
  }

  if (insights.length === 1) {
    return {
      selectedInsight: insights[0],
      rejectedInsights: [],
      selectionReason: "single candidate"
    }
  }

  // Score each insight by relevance × confidence
  const scored = insights.map((insight) => ({
    insight,
    relevanceScore: calculateRelevanceToService(insight, serviceContext),
    confidenceScore: insight.confidence,
    intersectionScore: 0 // Will calculate below
  }))

  // Calculate intersection score (relevance × confidence)
  scored.forEach((item) => {
    item.intersectionScore = item.relevanceScore * item.confidenceScore
  })

  // Sort by intersection score (descending)
  scored.sort((a, b) => b.intersectionScore - a.intersectionScore)

  const selected = scored[0]
  const rejected = scored.slice(1)

  return {
    selectedInsight: selected.insight,
    rejectedInsights: rejected.map((r) => r.insight),
    selectionReason: `highest intersection of relevance (${selected.relevanceScore.toFixed(2)}) + confidence (${selected.confidenceScore.toFixed(2)}) = ${selected.intersectionScore.toFixed(2)}`
  }
}

/**
 * Calculate relevance score of insight to service context
 *
 * Scores insight relevance to target service and problem.
 * Range: 0.0 - 1.0
 *
 * @param insight Candidate insight
 * @param serviceContext Service type and target problem
 * @returns Relevance score
 */
function calculateRelevanceToService(
  insight: Insight,
  serviceContext: {
    serviceType: string
    targetProblem: string
  }
): number {
  const insightText = `${insight.statement} ${insight.painPoint}`.toLowerCase()
  const targetText = `${serviceContext.serviceType} ${serviceContext.targetProblem}`.toLowerCase()

  // Word overlap scoring
  const insightWords = insightText.split(/\s+/)
  const targetWords = targetText.split(/\s+/)

  const matches = insightWords.filter((word) => targetWords.includes(word)).length
  const maxWords = Math.max(insightWords.length, targetWords.length)

  const overlapScore = maxWords > 0 ? matches / maxWords : 0

  // Confidence-weighted relevance (insights with higher confidence are more relevant)
  const confidenceBoost = insight.confidence * 0.3

  return Math.min(1.0, overlapScore + confidenceBoost)
}

/**
 * Rank insights by relevance score
 *
 * Returns ranked list without selection.
 * For analysis/logging only.
 *
 * @param insights Candidate insights
 * @param serviceContext Service type and target problem
 * @returns Ranked insights with scores
 */
export function rankByRelevance(
  insights: Insight[],
  serviceContext: {
    serviceType: string
    targetProblem: string
  }
): Array<{
  insight: Insight
  relevanceScore: number
  confidenceScore: number
  intersectionScore: number
}> {
  const ranked = insights.map((insight) => {
    const relevanceScore = calculateRelevanceToService(insight, serviceContext)
    const confidenceScore = insight.confidence
    const intersectionScore = relevanceScore * confidenceScore

    return {
      insight,
      relevanceScore,
      confidenceScore,
      intersectionScore
    }
  })

  ranked.sort((a, b) => b.intersectionScore - a.intersectionScore)

  return ranked
}
