/**
 * B2B Intelligence Extraction
 *
 * Parses lead record and enrichment data to extract:
 * - Pain point observation
 * - Business pattern
 * - Operational challenge
 * - Industry insight
 *
 * All data extracted from existing lead fields in database
 */

export interface LeadIntelligence {
  // Core observations
  pain_point: string
  business_pattern: string
  operational_challenge: string

  // Context
  location_context: string
  industry_observation: string
  scale_indicator: string

  // Evidence
  evidence_source: string
  confidence: number // 0-1, how confident we are in this intelligence
}

export interface EnrichedLead {
  id: string
  business_name: string
  email: string
  category: string
  location_count?: number
  rating_average?: number
  review_count?: number
  source?: string
  engagement_score?: number

  // Enrichment fields (if available)
  pain_point_review?: string
  business_pattern?: string
  operational_insight?: string
  review_data?: any[]
}

/**
 * Extract intelligence from lead record
 * Uses available fields to infer observations
 */
export function extractLeadIntelligence(lead: EnrichedLead): LeadIntelligence {
  const painPoint = extractPainPoint(lead)
  const pattern = extractBusinessPattern(lead)
  const challenge = extractOperationalChallenge(lead)
  const locationContext = extractLocationContext(lead)
  const industryObservation = extractIndustryObservation(lead)
  const scaleIndicator = extractScaleIndicator(lead)

  const result: LeadIntelligence = {
    pain_point: painPoint.observation,
    business_pattern: pattern.observation,
    operational_challenge: challenge.observation,
    location_context: locationContext,
    industry_observation: industryObservation,
    scale_indicator: scaleIndicator,

    evidence_source: [
      painPoint.source,
      pattern.source,
      challenge.source
    ]
      .filter(Boolean)
      .join(" + "),

    confidence: (painPoint.confidence + pattern.confidence + challenge.confidence) / 3
  }

  // Attach internal evidence tracking (non-enumerable, backward compatible)
  const evidenceSources = [
    {
      sourceId: painPoint.source,
      sourceType: inferSourceType(painPoint.source),
      rawValue: lead.pain_point_review || painPoint.observation,
      weight: painPoint.confidence
    },
    {
      sourceId: pattern.source,
      sourceType: inferSourceType(pattern.source),
      rawValue: lead.location_count || pattern.observation,
      weight: pattern.confidence
    },
    {
      sourceId: challenge.source,
      sourceType: inferSourceType(challenge.source),
      rawValue: lead.rating_average || lead.review_count || challenge.observation,
      weight: challenge.confidence
    }
  ]

  Object.defineProperty(result, '_evidenceSources', {
    value: evidenceSources,
    enumerable: false,
    writable: false,
    configurable: false
  })

  return result
}

/**
 * Infer source type from source ID
 * @internal
 */
function inferSourceType(sourceId: string): "review" | "website" | "enrichment" | "heuristic" {
  if (sourceId.includes("enrichment")) return "enrichment"
  if (sourceId.includes("review")) return "review"
  if (sourceId.includes("location") || sourceId.includes("rating")) return "website"
  return "heuristic"
}

/**
 * Extract pain point from lead intelligence
 */
function extractPainPoint(lead: EnrichedLead): {
  observation: string
  source: string
  confidence: number
} {
  // If enriched with explicit pain point, use it
  if (lead.pain_point_review) {
    return {
      observation: lead.pain_point_review,
      source: "enrichment_pain_point",
      confidence: 0.95
    }
  }

  // Category-specific pain point heuristics
  const categoryPainPoints: Record<string, string> = {
    estate_agent:
      "managing consistent client expectations across locations while handling growing volume",
    pharmacy: "maintaining customer loyalty during relocations and transitions",
    dental: "maintaining patient continuity and managing appointment scheduling efficiently",
    legal: "coordinating case files and client communication across offices",
    events: "managing vendor logistics and event coordination at scale",
    removal: "ensuring consistent service quality during high-volume seasonal periods",
    "care home": "maintaining staff coverage and resident quality of care",
    logistics: "managing fleet and route consistency across multiple locations"
  }

  const categoryKey = (lead.category || "").toLowerCase()
  const painPointText = Object.entries(categoryPainPoints).find(([key]) =>
    categoryKey.includes(key.toLowerCase())
  )

  if (painPointText) {
    return {
      observation: painPointText[1],
      source: "category_heuristic",
      confidence: 0.65
    }
  }

  // Fallback to generic observation
  return {
    observation: "managing operational consistency as the business scales",
    source: "generic_heuristic",
    confidence: 0.35
  }
}

/**
 * Extract business pattern from lead data
 */
function extractBusinessPattern(lead: EnrichedLead): {
  observation: string
  source: string
  confidence: number
} {
  // If enriched with explicit pattern, use it
  if (lead.business_pattern) {
    return {
      observation: lead.business_pattern,
      source: "enrichment_pattern",
      confidence: 0.95
    }
  }

  // Use location count to infer pattern
  const locations = lead.location_count || 0

  if (locations >= 10) {
    return {
      observation: "operating at multi-location scale with consistency challenges",
      source: "location_count",
      confidence: 0.85
    }
  }

  if (locations >= 3) {
    return {
      observation: "managing growth across multiple sites",
      source: "location_count",
      confidence: 0.8
    }
  }

  if (locations === 1) {
    return {
      observation: "single-location business looking to optimize operations",
      source: "location_count",
      confidence: 0.6
    }
  }

  return {
    observation: "managing business operations",
    source: "generic_heuristic",
    confidence: 0.2
  }
}

/**
 * Extract operational challenge from lead data
 */
function extractOperationalChallenge(lead: EnrichedLead): {
  observation: string
  source: string
  confidence: number
} {
  // If enriched with explicit insight, use it
  if (lead.operational_insight) {
    return {
      observation: lead.operational_insight,
      source: "enrichment_operational",
      confidence: 0.95
    }
  }

  // Derive challenge based on rating and review count
  const avgRating = lead.rating_average || 4.0
  const reviewCount = lead.review_count || 0

  // Low rating suggests operational issues
  if (avgRating < 3.5) {
    return {
      observation:
        "facing customer satisfaction challenges that likely stem from operational issues",
      source: "rating_analysis",
      confidence: 0.8
    }
  }

  // High review count suggests they're operational-heavy
  if (reviewCount > 50) {
    return {
      observation:
        "high-volume customer interaction suggesting operational scalability concerns",
      source: "review_volume",
      confidence: 0.7
    }
  }

  return {
    observation: "optimizing operational efficiency",
    source: "generic_heuristic",
    confidence: 0.3
  }
}

/**
 * Extract location context
 */
function extractLocationContext(lead: EnrichedLead): string {
  const locations = lead.location_count || 0

  if (locations > 20) return "enterprise-scale multi-location operation"
  if (locations > 5) return "established multi-location business"
  if (locations > 1) return "growing multi-location business"
  return "single-location business"
}

/**
 * Extract industry observation
 */
function extractIndustryObservation(lead: EnrichedLead): string {
  const category = (lead.category || "").toLowerCase()

  const observations: Record<string, string> = {
    estate_agent: "Estate agents in your market handle high client expectations",
    pharmacy: "Pharmacies depend on customer loyalty and consistent service",
    dental: "Dental practices compete on quality of care and patient relationships",
    legal: "Legal firms require rigorous file management and client confidentiality",
    events: "Event businesses manage complex vendor coordination",
    removal: "Removal companies face seasonal volume swings",
    "care home": "Care homes manage both resident needs and staff capacity",
    logistics: "Logistics businesses compete on reliability and consistency"
  }

  for (const [key, observation] of Object.entries(observations)) {
    if (category.includes(key.toLowerCase())) {
      return observation
    }
  }

  return "Businesses in your sector compete on operational consistency and reliability"
}

/**
 * Extract scale indicator
 */
function extractScaleIndicator(lead: EnrichedLead): string {
  const locations = lead.location_count || 0

  if (locations > 100) return "enterprise-scale"
  if (locations > 20) return "large-scale"
  if (locations > 5) return "mid-market"
  if (locations > 1) return "regional"
  return "single-location"
}

/**
 * Validate that we have minimum intelligence to generate meaningful copy
 */
export function validateIntelligenceSufficiency(
  intelligence: LeadIntelligence
): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  if (intelligence.confidence < 0.3) {
    issues.push("Intelligence confidence too low (< 0.3)")
  }

  if (!intelligence.pain_point) {
    issues.push("No pain point identified")
  }

  if (!intelligence.operational_challenge) {
    issues.push("No operational challenge identified")
  }

  return {
    valid: issues.length === 0,
    issues
  }
}
