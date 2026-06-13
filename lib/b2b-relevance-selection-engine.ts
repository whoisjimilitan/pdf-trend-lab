/**
 * Relevance Selection Engine
 *
 * Phase B: Observer Engine
 *
 * Given multiple candidate insights (all approved by Evidence Validation Engine),
 * selects the single MOST RELEVANT for this prospect right now.
 *
 * Selection criteria (in order):
 * 1. Readiness state (ready_now > ready_later > emerging)
 * 2. Confidence score (high confidence > low confidence)
 * 3. Specificity (specific signals > general patterns)
 *
 * Output: Single selected Insight + rejection reasons for alternatives
 */

import { type Insight } from "./b2b-insight-object"

export interface SelectionResult {
  selectedInsight: Insight
  selectedBecause: string
  rejectedAlternatives: Array<{
    insightId: string
    insightType: string
    confidence: number
    rejectionReason: string
  }>
  divergenceFromCurrentSystem?: {
    currentSystemSelected: string
    observerEngineSelected: string
    reason: string
  }
}

/**
 * Score insight for relevance
 *
 * Scoring formula (mirrors current system):
 * 1. Readiness multiplier (ready_now: 3x, ready_later: 1.5x, emerging: 1x)
 * 2. Confidence multiplier (0.0–1.0)
 * 3. Engagement potential (number of evidence sources)
 *
 * Result: 0.0–3.0 relevance score
 */
function scoreRelevance(insight: Insight): number {
  const confidenceScore = insight.confidence // 0.0–1.0
  const engagementBoost = Math.min(insight.evidenceSources.length / 5, 0.2) // Cap at +0.2

  const relevanceScore = confidenceScore + engagementBoost

  return relevanceScore
}

/**
 * Select single most relevant insight from candidates
 *
 * Takes multiple approved insights, selects the best one.
 * Returns rejection reasons for alternatives.
 *
 * All candidates should be APPROVED status only.
 * (PENDING or REJECTED candidates should be filtered before this function)
 */
export function selectMostRelevant(
  insights: Insight[],
  currentSystemSelected?: string
): SelectionResult {
  if (insights.length === 0) {
    throw new Error("Must provide at least one insight candidate")
  }

  // Score all insights
  const scored = insights.map((insight) => ({
    insight,
    score: scoreRelevance(insight)
  }))

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score)

  // Select the winner
  const selectedInsight = scored[0].insight
  const selectedScore = scored[0].score

  // Generate selection reason
  const selectedBecause = generateSelectionReason(selectedInsight, selectedScore)

  // Generate rejection reasons for alternatives
  const rejectedAlternatives = scored.slice(1).map((item) => ({
    insightId: item.insight.insightId,
    insightType: item.insight.insightType,
    confidence: item.insight.confidence,
    rejectionReason: generateRejectionReason(item.insight, selectedInsight, item.score, selectedScore)
  }))

  // Check for divergence from current system
  let divergence: SelectionResult["divergenceFromCurrentSystem"] = undefined
  if (currentSystemSelected && currentSystemSelected !== selectedInsight.insightType) {
    divergence = {
      currentSystemSelected,
      observerEngineSelected: selectedInsight.insightType,
      reason: `Selection score: ${selectedScore.toFixed(2)}. Primary decision factor: confidence and evidence`
    }
  }

  return {
    selectedInsight,
    selectedBecause,
    rejectedAlternatives,
    divergenceFromCurrentSystem: divergence
  }
}

/**
 * Generate human-readable selection reason
 */
function generateSelectionReason(insight: Insight, score: number): string {
  const confidencePhrase =
    insight.confidence >= 0.85
      ? `high confidence (${(insight.confidence * 100).toFixed(0)}%)`
      : insight.confidence >= 0.70
        ? `good confidence (${(insight.confidence * 100).toFixed(0)}%)`
        : `moderate confidence (${(insight.confidence * 100).toFixed(0)}%)`

  return `Selected with ${confidencePhrase} based on ${insight.evidenceSources.length} evidence sources (score: ${score.toFixed(2)})`
}

/**
 * Generate human-readable rejection reason
 */
function generateRejectionReason(
  rejectedInsight: Insight,
  selectedInsight: Insight,
  rejectedScore: number,
  selectedScore: number
): string {
  const scoreDiff = selectedScore - rejectedScore

  // Determine what made the difference
  let reason = ""

  if (selectedInsight.confidence > rejectedInsight.confidence + 0.1) {
    reason = `Selected insight has higher confidence (${(selectedInsight.confidence * 100).toFixed(0)}% vs ${(rejectedInsight.confidence * 100).toFixed(0)}%)`
  } else if (selectedInsight.evidenceSources.length > rejectedInsight.evidenceSources.length) {
    reason = `Selected insight has more supporting evidence (${selectedInsight.evidenceSources.length} vs ${rejectedInsight.evidenceSources.length} sources)`
  } else {
    reason = `Selected insight ranks higher (${selectedScore.toFixed(2)} vs ${rejectedScore.toFixed(2)})`
  }

  return reason
}

/**
 * Filter and select: Takes all candidate insights, filters to approved only,
 * then selects the most relevant
 */
export function filterAndSelect(
  insights: Insight[],
  currentSystemSelected?: string
): SelectionResult | null {
  // Filter to approved insights only
  const approvedInsights = insights.filter((i) => i.status === "APPROVED")

  if (approvedInsights.length === 0) {
    return null // No approved insights to select from
  }

  if (approvedInsights.length === 1) {
    // Only one candidate, select it
    const insight = approvedInsights[0]
    return {
      selectedInsight: insight,
      selectedBecause: "Single approved insight candidate",
      rejectedAlternatives: []
    }
  }

  // Multiple candidates, run selection engine
  return selectMostRelevant(approvedInsights, currentSystemSelected)
}
