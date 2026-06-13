/**
 * Insight Builder
 *
 * Converts system outputs into canonical Insight objects.
 * Mapper only. No validation. No selection. No rendering.
 */

import { Insight, FramingLevel, EvidenceSource, Contradiction } from "./b2b-insight-object"
import { v4 as uuidv4 } from "uuid"

/**
 * Build canonical Insight object from parameters
 *
 * @param params Insight data
 * @returns Canonical Insight object
 */
export function buildInsight(params: {
  insightType: string
  statement: string
  painPoint: string
  opportunity: string
  confidence: number
  evidenceSources?: any[]
  contradictions?: any[]
  validationId?: string
}): Insight {
  const insightId = uuidv4()
  const validationId = params.validationId || uuidv4()
  const validatedAt = new Date()

  const framingLevel = determineFraming(params.confidence)

  return {
    insightId,
    insightType: params.insightType,

    statement: params.statement,
    painPoint: params.painPoint,
    opportunity: params.opportunity,

    confidence: params.confidence,

    evidenceSources: (params.evidenceSources || []) as EvidenceSource[],
    contradictions: (params.contradictions || []) as Contradiction[],

    status: "APPROVED",
    framingLevel,

    validatedAt,
    validationId
  }
}

/**
 * Determine framing level from confidence score
 *
 * @param confidence Score 0.0-1.0
 * @returns Framing level
 */
function determineFraming(confidence: number): FramingLevel {
  if (confidence >= 0.85) return "assertive"
  if (confidence >= 0.6) return "gentle"
  return "speculative"
}
