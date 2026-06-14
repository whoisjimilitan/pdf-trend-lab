/**
 * Phase A: Instrumentation
 *
 * Shadow logging for Evidence Validation Engine
 * Zero behavior change. Current system runs unchanged.
 * Logs accumulate for statistical analysis.
 *
 * This module ONLY logs. It does NOT influence any production decisions.
 *
 * NOTE: ValidationLog model missing from schema in Phase 3.4A
 * Functions stubbed; will be restored when model is added in Phase 3.4B
 */

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

export async function logValidationDecision(data: ValidationLogData): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function recordEmailOutcome(params: {
  validationId: string
  prospectId: string
  emailSent: boolean
  openedAt?: string
  clickedAt?: string
}): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function recordPageEngagement(params: {
  validationId: string
  prospectId: string
  insightId: string
  pageViewed: boolean
  scrollDepth?: number
}): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function recordReply(params: {
  validationId: string
  prospectId: string
  repliedAt: string
  replyText: string
}): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function recordOutcome(params: {
  validationId: string
  prospectId: string
  outcome: "WON" | "LOST" | "PENDING"
  reason?: string
}): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function getValidationStats(filters?: {
  prospectId?: string
  leadCategory?: string
  status?: string
}): Promise<{
  total: number
  approved: number
  pending: number
  rejected: number
  avgConfidence: number
}> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    avgConfidence: 0
  }
}

export async function recordValidationObservation(observation: any): Promise<string> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return "temp-" + Date.now()
}

export async function shouldPromoteToAuthority(): Promise<{
  eligible: boolean
  reason: string
}> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return {
    eligible: false,
    reason: "Validation logging unavailable"
  }
}

export async function compareShadowVsProduction(params: {
  prospectId: string
  insights: any[]
}): Promise<{
  discrepancies: number
  alignmentScore: number
}> {
  // Feature: Validation logging — database model removed from schema in Phase 3.4A
  return {
    discrepancies: 0,
    alignmentScore: 0
  }
}
