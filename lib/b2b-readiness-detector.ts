/**
 * Readiness Detection Engine
 *
 * Classifies when a prospect is ready to act on selected insight.
 * Based on behavioral engagement signals.
 * No insight modification. No messaging. Classification only.
 */

import type { Insight } from "./b2b-insight-object"

export type ReadinessState = "READY_NOW" | "EMERGING" | "NOT_READY"

export interface ReadinessResult {
  state: ReadinessState
  signalsDetected: string[]
  confidence: number
}

/**
 * Detect readiness state from engagement signals
 *
 * Classifies prospect into:
 * - READY_NOW: High engagement + intent signals present
 * - EMERGING: Moderate engagement, showing interest
 * - NOT_READY: No clear engagement or intent
 *
 * @param params Insight and engagement signals
 * @returns Readiness state and supporting signals
 */
export function detectReadiness({
  insight,
  engagementSignals
}: {
  insight: Insight
  engagementSignals: {
    emailOpen?: boolean
    pageVisit?: boolean
    dwellTime?: number
    scrollDepth?: number
    returnVisits?: number
    ctaClicks?: number
  }
}): ReadinessResult {
  const signals: string[] = []
  let readinessScore = 0

  // High intent signals (strongest)
  if (engagementSignals.ctaClicks) {
    signals.push("cta_clicked")
    readinessScore += 0.4
  }

  if (engagementSignals.returnVisits && engagementSignals.returnVisits > 1) {
    signals.push("multiple_return_visits")
    readinessScore += 0.3
  }

  // Moderate engagement signals
  if (engagementSignals.pageVisit) {
    signals.push("page_visited")
    readinessScore += 0.2
  }

  if (engagementSignals.dwellTime && engagementSignals.dwellTime > 45) {
    signals.push("extended_dwell_time")
    readinessScore += 0.15
  }

  if (engagementSignals.scrollDepth && engagementSignals.scrollDepth > 0.6) {
    signals.push("deep_scroll")
    readinessScore += 0.15
  }

  // Low engagement signals
  if (engagementSignals.emailOpen) {
    signals.push("email_opened")
    readinessScore += 0.1
  }

  // Determine state
  let state: ReadinessState
  let confidence: number

  if (readinessScore >= 0.6) {
    state = "READY_NOW"
    confidence = Math.min(1.0, readinessScore)
  } else if (readinessScore >= 0.25) {
    state = "EMERGING"
    confidence = readinessScore
  } else {
    state = "NOT_READY"
    confidence = readinessScore
  }

  return {
    state,
    signalsDetected: signals,
    confidence
  }
}

/**
 * Check if prospect is ready now
 *
 * @param readinessResult Readiness detection result
 * @returns True if READY_NOW state
 */
export function isReadyNow(readinessResult: ReadinessResult): boolean {
  return readinessResult.state === "READY_NOW"
}

/**
 * Check if prospect shows emerging interest
 *
 * @param readinessResult Readiness detection result
 * @returns True if EMERGING state
 */
export function isEmerging(readinessResult: ReadinessResult): boolean {
  return readinessResult.state === "EMERGING"
}

/**
 * Check if prospect is not ready
 *
 * @param readinessResult Readiness detection result
 * @returns True if NOT_READY state
 */
export function isNotReady(readinessResult: ReadinessResult): boolean {
  return readinessResult.state === "NOT_READY"
}
