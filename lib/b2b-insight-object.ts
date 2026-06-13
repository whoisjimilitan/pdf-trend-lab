/**
 * Insight Object Contract
 *
 * Canonical immutable type for all insight operations.
 * Used by: validators, selectors, renderers, loggers.
 * Framework-agnostic. No coupling to database or rendering.
 */

export type InsightStatus = "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"

export type FramingLevel = "assertive" | "gentle" | "speculative"

export interface EvidenceSource {
  sourceId: string
  sourceName: string
  strength: number
  foundAt: Date
  rawData: string
  weight: number
}

export interface Contradiction {
  type: "WEAK" | "MODERATE" | "FATAL"
  impact: number
  description: string
}

export interface Insight {
  insightId: string
  insightType: string

  statement: string
  painPoint: string
  opportunity: string

  confidence: number

  evidenceSources: EvidenceSource[]
  contradictions: Contradiction[]

  status: InsightStatus
  framingLevel: FramingLevel

  validatedAt: Date
  validationId: string
}
