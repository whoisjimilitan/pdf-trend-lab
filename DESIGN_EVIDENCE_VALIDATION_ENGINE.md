# DESIGN: Evidence Validation Engine (Revised)

**Document Type**: Architectural Design (Final)  
**Status**: APPROVED FOR IMPLEMENTATION  
**Date**: 2026-06-13  
**Last Revised**: 2026-06-13  
**Purpose**: Specify Evidence Validation Engine behavior, interfaces, and integration. Engine outputs immutable Insight Objects that guarantee continuity across all future renderers (Card, Email, Page, Conversation).

**Final Constraints (Locked)**:
1. Confidence: Continuous 0.0–1.0 internally; percentages presentation-only
2. PENDING_MORE_EVIDENCE: Auto re-enters enrichment/validation cycles (no manual review)
3. Contradictions: Three levels (WEAK/MODERATE/FATAL) with proportional confidence impacts
4. KPI Hierarchy: Accuracy → Engagement → Conversation → Conversion (in that priority order)
5. Logging: Includes selected_because and rejected_insights for learning
6. Insight Object: Immutable once created; renderers only express/expand/contextualize, never modify

---

## Current State

### What Exists

**File**: `lib/b2b-intelligence-extract.ts`

Current confidence calculation:
```typescript
confidence: (painPoint.confidence + pattern.confidence + challenge.confidence) / 3
```

Each component assigned confidence:
- 0.95 = enrichment data (direct field)
- 0.85 = location_count inference (strong signal)
- 0.65 = category heuristic (weak signal)
- 0.35 = generic fallback (no signal)

**Current gap**: Confidence is calculated but:
1. Not classified by evidence type (PROVEN vs HIGH-CONFIDENCE vs SPECULATION)
2. Not used to gate downstream processing
3. Not used to modulate output framing
4. Averages disparate evidence types (masks quality)

### Current Validation Workflow

```
Lead Data (enriched)
    ↓
extractLeadIntelligence()
    ↓
Intelligence object (with confidence)
    ↓
generateRRTACopy()  ← No validation of evidence quality
    ↓
validateRRTA()  ← Validates WRITING FORMAT only (specificity, empathy, proof structure)
    ↓
Email sent
```

**Problem**: RRTA validator checks "Is the text specific?" not "Is the text TRUE?"

Example:
```
// This passes RRTA validation:
Recognition: "One thing about your pharmacy: you're losing customers to relocation."

// If evidence is:
// - No review mentions relocation
// - Website says "nationwide delivery available"
// - No data suggests relocation is a problem

// RRTA validator: ✅ PASS (it's specific, empathetic, has proof structure)
// Evidence validator: ❌ FAIL (no supporting data)
```

---

## Desired State

### What Evidence Validation Engine Must Do

**Purpose**: Validate that every insight is supported by available evidence. Output standardized Insight Objects that guarantee continuity across all renderers (Email, Card, Page, Conversation).

**Central Architecture: Insight Object**

```typescript
// This object is the contract between validation and all renderers
interface InsightObject {
  // Identity
  insightType: string // "customer_relocation", "consistency_challenge", etc.
  leadId: string
  
  // Confidence (continuous, 0.0–1.0, not banded)
  confidence: number // 0.0–1.0
  
  // Evidence provenance (required for learning loops)
  evidenceSources: EvidenceSourceInstance[] // What supports this
  sourceWeights: Map<string, number> // Weighted contribution per source
  contradictions: Contradiction[] // What contradicts this
  
  // Status (three states, not binary)
  status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  statusReason: string // Why this status
  
  // Rendering guidance (derived from confidence, not hardcoded)
  framingLevel: "assertive" | "gentle" | "speculative" // Auto-determined by confidence level
  framingGuidance: string // How to express this insight
  
  // Logging (for learning loops)
  validationId: string // Unique identifier for this validation decision
  validatedAt: Date
  validationMetadata: ValidationMetadata
}
```

**Validation flow**:
```
Lead Data (enriched)
    ↓
extractLeadIntelligence()
    ↓
validateEvidence()  ← NEW LAYER: Comprehensive evidence analysis
    ├─ Identify primary insight type
    ├─ Map available evidence sources
    ├─ Detect contradictions
    ├─ Calculate continuous confidence (0.0–1.0)
    ├─ Determine status (APPROVED / PENDING / REJECTED_FOR_NOW)
    └─ Output: InsightObject
    ↓
Insight Object → Any Renderer
    ├─ Card Renderer (expresses at card depth)
    ├─ Email Renderer (expresses at email depth)
    ├─ Page Renderer (expresses at page depth)
    └─ Conversation Renderer (expresses at conversation depth)
    ↓
Each renderer outputs same insight, different depth
```

**Key requirements**:
1. Confidence is continuous (0.00–1.0), not banded
2. Bands (PROVEN/HIGH_CONFIDENCE/etc.) are presentation layers only
3. Every validation decision is logged
4. Contradictions actively reduce confidence or trigger rejection
5. Insight Object is immutable once created — all renderers consume the same object
6. Status field allows for learning loops: PENDING_MORE_EVIDENCE can be re-evaluated when enrichment data arrives

---

## Revised Model: Continuous Confidence & Provenance

### Confidence as Continuous Value (0.0–1.0)

**Old approach**: Banded (95%, 70%, reject)

**New approach**: Continuous confidence with presentation-layer banding

```typescript
// Continuous confidence calculation
interface ConfidenceCalculation {
  baseConfidence: number // Start at 0.0
  sourceContributions: Array<{
    source: string
    weight: number // 0.0–1.0
    contribution: number // weight * sourceStrength
  }>
  contradictionPenalty: number // Reduces confidence
  finalConfidence: number // 0.0–1.0
}

// Example: "Customer Relocation" insight
const example = {
  baseConfidence: 0.0,
  sourceContributions: [
    { source: "enrichment_relocation_pain", weight: 0.4, contribution: 0.4 }, // Direct field
    { source: "review_relocation_mention", weight: 0.3, contribution: 0.25 }, // Found in 2 reviews
    { source: "pharmacy_multisite_pattern", weight: 0.2, contribution: 0.12 }, // Location inference
    { source: "low_rating_high_volume", weight: 0.1, contribution: 0.05 } // Weak signal
  ],
  contradictionPenalty: -0.08, // Website says "nationwide delivery" = slight reduction
  finalConfidence: 0.74 // Continuous value
}

// Presentation layer: Band the continuous confidence
const bands = {
  [0.85, 1.0]: "PROVEN", // High confidence insights
  [0.60, 0.85): "HIGH_CONFIDENCE", // Reasonable confidence
  [0.40, 0.60): "MODERATE_CONFIDENCE", // Medium confidence
  [0.20, 0.40): "LOW_CONFIDENCE", // Low confidence
  [0.0, 0.20): "SPECULATION" // Very low confidence
}
```

### Evidence Provenance Structure

**Every approved insight stores**:

```typescript
interface EvidenceSourceInstance {
  sourceId: string // "enrichment_pain_point", "review_mention", etc.
  sourceName: string // Human-readable
  foundAt?: string | string[] // Location in data ("review[2]", "enrichment.pain_point_review")
  strength: number // 0.0–1.0, how strong is this piece of evidence
  rawData?: string // Optional: the actual text/data from source
  discoveredAt: Date
}

// Example: Relocation insight with full provenance
const provenanceExample = {
  insightType: "customer_relocation",
  evidenceSources: [
    {
      sourceId: "enrichment_relocation_pain",
      sourceName: "Enrichment field mentions relocation",
      foundAt: "enrichment.pain_point_review",
      strength: 0.95,
      rawData: "Loses customers during relocations, especially long-term ones",
      discoveredAt: new Date()
    },
    {
      sourceId: "review_relocation_mention",
      sourceName: "Review text mentions relocation challenge",
      foundAt: ["reviews[2]", "reviews[5]"],
      strength: 0.80,
      rawData: "Relocated and lost some regulars who didn't follow",
      discoveredAt: new Date()
    },
    {
      sourceId: "pharmacy_multisite_pattern",
      sourceName: "Multi-location pharmacy pattern",
      foundAt: "location_count=3",
      strength: 0.60,
      rawData: null,
      discoveredAt: new Date()
    }
  ],
  
  sourceWeights: {
    "enrichment_relocation_pain": 0.40,
    "review_relocation_mention": 0.30,
    "pharmacy_multisite_pattern": 0.15,
    "low_rating_high_volume": 0.10,
    "website_local_only": 0.05
  }
}
```

### Contradiction Handling (Three-Level System)

**Contradictions have three severity levels with different confidence impacts**:

```typescript
interface Contradiction {
  id: string
  level: "WEAK" | "MODERATE" | "FATAL" // Three-level system (not binary)
  evidence: string // What contradicts the insight
  reason: string // Why it contradicts
  confidencePenalty: number // Penalty applied to confidence score
  foundAt: string // Where in the data
}

// Contradiction Level Definitions
const contradictionLevels = {
  WEAK: {
    description: "Evidence slightly contradicts insight, reduces confidence marginally",
    confidencePenaltyRange: [-0.05, -0.10], // Reduces confidence by 5–10%
    actionOnViolation: "Continue, but with reduced confidence",
    example: "Pharmacy has 'nationwide delivery available' (weakens relocation pain insight)"
  },
  
  MODERATE: {
    description: "Evidence meaningfully contradicts insight, substantially reduces confidence",
    confidencePenaltyRange: [-0.15, -0.30], // Reduces confidence by 15–30%
    actionOnViolation: "May trigger PENDING_MORE_EVIDENCE if confidence drops below threshold",
    example: "Website says 'operates online only' contradicts multi-location operational focus"
  },
  
  FATAL: {
    description: "Evidence completely negates insight, triggers immediate rejection",
    confidencePenaltyRange: [-0.95, -1.0], // Reduces confidence by 95–100%
    actionOnViolation: "Immediate REJECTED_FOR_NOW, no further consideration",
    example: "location_count = 1 contradicts multi-location operational insight"
  }
}

// Examples of all three levels
const contradictionExamples = {
  relocationInsight: [
    {
      id: "contradiction_nationwide_delivery",
      level: "WEAK", // Slight contradiction
      evidence: "Website states 'nationwide delivery available'",
      reason: "If pharmacy serves nationwide, physical relocation impact may be lower",
      confidencePenalty: -0.07, // Reduce by 7%
      foundAt: "lead.website_content"
    },
    {
      id: "contradiction_online_only",
      level: "MODERATE", // Substantial contradiction
      evidence: "Website states 'online pharmacy only'",
      reason: "If pharmacy operates purely online, customer relocation is irrelevant",
      confidencePenalty: -0.25, // Reduce by 25%
      foundAt: "lead.website_content"
    },
    {
      id: "contradiction_single_location",
      level: "FATAL", // Complete negation
      evidence: "location_count = 1",
      reason: "Single-location business cannot have relocation customer loss pattern",
      confidencePenalty: -0.99, // Reduce by 99%, triggers rejection
      foundAt: "lead.location_count"
    }
  ]
}

// Confidence calculation WITH three-level contradictions
const confidenceWithContradictions = {
  baseConfidence: 0.82,
  
  // Example 1: WEAK contradiction
  contradictions_weak: [
    { level: "WEAK", confidencePenalty: -0.07 }
  ],
  finalConfidence_weak: 0.75, // 0.82 - 0.07 = continues as APPROVED
  
  // Example 2: MODERATE contradiction
  contradictions_moderate: [
    { level: "MODERATE", confidencePenalty: -0.25 }
  ],
  finalConfidence_moderate: 0.57, // 0.82 - 0.25 = still APPROVED but close to threshold
  
  // Example 3: FATAL contradiction
  contradictions_fatal: [
    { level: "FATAL", confidencePenalty: -0.99 }
  ],
  finalConfidence_fatal: 0.0, // 0.82 - 0.99 = effectively 0, triggers REJECTED_FOR_NOW
}

// Status determination WITH contradiction levels
const statusRules = {
  APPROVED: {
    condition: "confidence >= 0.55 AND no FATAL contradictions",
    action: "Proceed to renderers"
  },
  
  PENDING_MORE_EVIDENCE: {
    condition: "confidence 0.40–0.55 AND no FATAL contradictions",
    action: "Auto re-enter enrichment/validation cycle (no manual review)"
  },
  
  REJECTED_FOR_NOW: {
    condition: "confidence < 0.40 OR FATAL contradiction present",
    action: "Do not contact. Hold for enrichment or different insight type"
  }
}
```

### Three-State Status Model

**Instead of binary (approved/rejected), use three states**:

```typescript
type ValidationStatus = "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"

interface StatusDecision {
  status: ValidationStatus
  reason: string
  nextAction?: string
  retryCondition?: string // When to re-evaluate
}

// Decision logic
const statusRules = {
  APPROVED: {
    condition: "confidence >= 0.55",
    meaning: "Insight is supported by evidence. Proceed to renderers.",
    action: "Generate email, card, page with this insight",
    nextAction: null
  },
  
  PENDING_MORE_EVIDENCE: {
    condition: "confidence 0.40–0.55 AND no contradictions",
    meaning: "Insight has some signal but not enough. Wait for more data.",
    action: "Do not contact prospect now. Flag for re-evaluation.",
    retryCondition: "When enrichment_pain_point_review arrives OR 30 days pass"
  },
  
  REJECTED_FOR_NOW: {
    condition: "confidence < 0.40 OR contradictions.type = 'negates'",
    meaning: "Insight is not supported or contradicted by evidence. Do not use.",
    action: "Do not contact prospect. Hold for enrichment or different insight type.",
    retryCondition: "When contradictions resolve OR different evidence discovered"
  }
}

// Prospect is never dropped, always flagged for future re-evaluation
interface ProspectStatus {
  status: ValidationStatus
  lastEvaluatedAt: Date
  nextEvaluationTrigger: string // "enrichment_arrival", "time_based", "manual_review"
  previousAttempts: ValidationResult[] // History of validation attempts
}
```

### Logging Structure (With Learning Fields)

**Every validation decision is logged with reasoning for learning loops**:

```typescript
interface ValidationLog {
  // Identity
  logId: string // Unique identifier
  prospectId: string
  validationId: string // Links to InsightObject.validationId
  
  // Decision reasoning (PRIMARY for learning)
  selectedInsightType: string // Which insight was selected
  selectedBecause: string // WHY this insight was selected (critical for learning)
  rejectedInsights: Array<{
    insightType: string
    reason: string // Why was this rejected?
    wouldHaveConfidence?: number // What confidence would it have had?
  }>
  
  // Validation context
  confidenceScore: number // 0.0–1.0 continuous
  confidenceBand: string // Presentation: PROVEN, HIGH_CONFIDENCE, etc.
  status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  
  // Evidence details
  evidenceSourcesTotal: number
  evidenceSourcesFound: number
  evidenceSourcesList: string[] // Array of source IDs found
  
  // Contradictions
  contradictionsFound: number
  contradictionsByLevel: {
    WEAK: number
    MODERATE: number
    FATAL: number
  }
  
  // Outcomes (populated later for learning)
  emailSent: boolean
  emailSentAt?: Date
  emailOpenRate?: number
  pageVisited?: boolean
  pageVisitedAt?: Date
  replyReceived?: boolean
  replyReceivedAt?: Date
  conversionStatus?: "converted" | "not_converted" | "pending"
  
  // KPI tracking (Accuracy → Engagement → Conversation → Conversion)
  kpi_insightAccuracy?: boolean // Did prospect confirm this was the right insight?
  kpi_engagementDepth?: "none" | "open" | "click" | "reply" // How deep was engagement?
  kpi_conversationStarts?: number // How many conversations started?
  kpi_conversion?: boolean // Did it convert?
  
  // Timestamps
  validatedAt: Date
  outcomeEvaluatedAt?: Date
  
  // Metadata for analysis
  leadCategory: string
  leadLocations: number
  enrichmentLevel: "full" | "partial" | "minimal"
}

// Learning query example 1: "Which evidence sources most predict engagement?"
const insightAccuracyQuery = `
  SELECT 
    selected_insight_type,
    COUNT(*) as total_uses,
    SUM(CASE WHEN kpi_engagement_depth >= 'click' THEN 1 ELSE 0 END) as engaged,
    (SUM(CASE WHEN kpi_engagement_depth >= 'click' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as engagement_rate
  FROM validation_logs
  WHERE outcome_evaluated_at IS NOT NULL
  GROUP BY selected_insight_type
  ORDER BY engagement_rate DESC
`

// Learning query example 2: "How do rejected insights compare to selected ones?"
const rejectionAccuracyQuery = `
  SELECT 
    rejected_insights,
    COUNT(*) as times_rejected,
    SUM(CASE WHEN conversion_status = 'converted' THEN 1 ELSE 0 END) as converted_anyway
  FROM validation_logs
  WHERE rejected_insights IS NOT NULL AND outcome_evaluated_at IS NOT NULL
  GROUP BY rejected_insights
  ORDER BY times_rejected DESC
`

// Learning query example 3: "Is accuracy prioritized over conversion?"
const kpiPriorityQuery = `
  SELECT 
    confidence_band,
    COUNT(*) as total,
    SUM(CASE WHEN kpi_insight_accuracy = true THEN 1 ELSE 0 END) as accuracy_confirmed,
    SUM(CASE WHEN kpi_engagement_depth >= 'reply' THEN 1 ELSE 0 END) as deep_engagement,
    SUM(CASE WHEN conversion_status = 'converted' THEN 1 ELSE 0 END) as converted,
    -- Verify we're optimizing for accuracy, not conversion
    (SUM(CASE WHEN kpi_insight_accuracy = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as accuracy_rate,
    (SUM(CASE WHEN conversion_status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
  FROM validation_logs
  WHERE outcome_evaluated_at IS NOT NULL
  GROUP BY confidence_band
  ORDER BY confidence_band DESC
`
```

**Key design principle**: selected_because and rejected_insights enable understanding why insights were chosen, not just whether they worked. This drives accuracy optimization, not conversion gaming.

## Gap Analysis

### Gap 1: Evidence Source Classification

**Current**: No structured mapping of available data to evidence types.

**Need**: Explicit inventory of what data proves what insight.

Example:
```
INSIGHT: "Pharmacy losing customers to relocation"

Evidence sources:
✅ PROVEN: Review mentions "relocated" + "customer came back" + "inconsistent service during move"
✅ PROVEN: Website states "serving local area only"
❌ NOT PROVEN: Assumption based on "multi-location business"

Confidence: 95% (multiple proven sources)
```

### Gap 2: Confidence Band Definition

**Current**: Single confidence number (0-1) without classification.

**Need**: Three distinct confidence bands with different rules:

```
95% CONFIDENCE (PROVEN)
- Definition: Direct evidence in available data
- Evidence type: Reviews mention it, website confirms it, multiple signals align
- Allowed: Direct insight statement
- Example: "Your pharmacy loses customers one relocation at a time."
- Framing: Assertive, specific

70% CONFIDENCE (HIGH-CONFIDENCE INFERENCE)
- Definition: Strong signal in data but not explicitly stated
- Evidence type: Pattern inference (location count + rating + volume) OR enrichment data with caveats
- Allowed: Soft observation with group framing
- Example: "Many pharmacies your size find customer retention challenging during transitions."
- Framing: Gentle, generalized

40% CONFIDENCE (SPECULATION)
- Definition: Assumption without supporting data
- Evidence type: Category heuristic only, no supporting signal
- Allowed: NOT ALLOWED — Rejected at validation gate
- Example: "I assume your pharmacy has consistency issues because it's multi-location."
- Framing: Not used; insight rejected

REJECTION (Below 40%)
- Definition: No evidence at all
- Decision: Prospect cannot be sent meaningful outreach
- Output: Rejection with reason
- Action: Hold prospect until enrichment data arrives
```

### Gap 3: Evidence Source Inventory

**Current**: Implicit in heuristics scattered across extractPainPoint(), extractPattern(), etc.

**Need**: Explicit, queryable inventory of evidence sources per insight type.

**Available Evidence Sources** (from lead data):

```
ENRICHMENT FIELDS (Direct, 0.95 confidence)
- pain_point_review (explicit field)
- business_pattern (explicit field)
- operational_insight (explicit field)

REVIEW DATA (Strong, 0.85 confidence)
- review_count (high volume = operational weight)
- review_text mentions relocation, consistency, customer feedback
- rating_average (low rating + high volume = operational issues)

LOCATION DATA (Strong, 0.85 confidence)
- location_count ≥ 10 = enterprise scale issues
- location_count 3-9 = regional growth challenges
- location_count = 1 = optimization opportunity

CATEGORY DATA (Weak, 0.65 confidence)
- category matches pain pattern (pharmacy ≈ relocation pain)
- category implies operational model (estate agent ≈ consistency pain)

GENERIC (Weak, 0.35 confidence)
- Default assumptions when no other data available
```

### Gap 4: Validation Rules Per Insight Type

**Current**: No rules. RRTA generator just uses whatever intelligence exists.

**Need**: Explicit validation rules for each insight type.

**Example: "Customer Relocation" Insight**

Rule set:
```
INSIGHT TYPE: "Customer Relocation Pain"

PROVEN (95%):
  Required: At least 2 of:
    - Review mentions "relocated", "relocation", "moved", "changing location"
    - Review mentions "customer left" + "relocation" in same review
    - Website explicitly says "local service area only"
    - Website says "depend on local market"

APPROVED HIGH-CONFIDENCE (70%):
  Required: All of:
    - Category = pharmacy OR delivery service
    - location_count ≥ 3
    - Enrichment field "pain_point_review" contains "relocation" OR "transition"
  OR All of:
    - Category = pharmacy
    - rating < 4.2 AND review_count > 40
    - location_count ≥ 2

REJECTED (Below 40%):
  If: Category = pharmacy AND no review mentions relocation AND no enrichment data

Classification Rule:
  If all PROVEN conditions met → APPROVED (95%)
  Else if all HIGH-CONFIDENCE conditions met → APPROVED (70%)
  Else → REJECTED
```

### Gap 5: Integration Point with RRTA Generator

**Current**: Intelligence flows directly to RRTA generation.

**Need**: Evidence validation gate inserted between intelligence and RRTA.

**Current flow**:
```typescript
const intelligence = extractLeadIntelligence(lead)
const rrta = generateRRTACopy(lead.business_name, lead.category, intelligence)
```

**New flow**:
```typescript
const intelligence = extractLeadIntelligence(lead)
const validation = validateEvidence(lead, intelligence)

if (!validation.approved) {
  return { approved: false, reason: validation.rejectionReason }
}

const rrta = generateRRTACopy(
  lead.business_name,
  lead.category,
  intelligence,
  validation.confidenceLevel  // NEW PARAMETER
)
```

---

## Design: Insight Object as Canonical Architecture

### Core Innovation: Insight Object

The Insight Object is the **single source of truth** passed to all future renderers.

```typescript
// INSIGHT OBJECT — Consumed by Card, Email, Page, Conversation renderers
// IMMUTABLE ONCE CREATED — No downstream modifications allowed
export interface InsightObject {
  // ─── IDENTITY ──────────────────────────────────────────────────────────
  insightId: string // UUID, unique per validation
  insightType: string // "customer_relocation", "consistency_challenge", etc.
  leadId: string
  businessName: string
  
  // ─── CONFIDENCE (Continuous, 0.0–1.0, NOT BANDED) ─────────────────────
  confidence: number // Raw continuous score (0.0–1.0)
  // Presentation layer only (for UI/logging): 
  // 0.85–1.0: PROVEN, 0.60–0.85: HIGH_CONFIDENCE, etc.
  confidenceBand: "PROVEN" | "HIGH_CONFIDENCE" | "MODERATE" | "LOW" | "SPECULATION"
  
  // ─── EVIDENCE PROVENANCE (Why was this confidence assigned?) ───────────
  evidenceSources: {
    sourceId: string
    sourceName: string
    strength: number // How strong this piece of evidence is (0.0–1.0)
    foundAt?: string // Location in data
    rawData?: string // The actual text/number that supports this
    weight: number // What percentage of final confidence does this contribute
  }[]
  
  // ─── CONTRADICTIONS (Three-Level System) ────────────────────────────────
  contradictions: {
    id: string
    level: "WEAK" | "MODERATE" | "FATAL" // Three-level severity
    evidence: string // What contradicts the insight
    reason: string // Why it's a contradiction
    confidencePenalty: number // -0.05 to -1.0 based on level
    foundAt: string
  }[]
  
  // ─── STATUS (Three States, Not Binary) ──────────────────────────────────
  status: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  statusReason: string
  // PENDING_MORE_EVIDENCE: Auto re-enters enrichment/validation cycles
  // (No manual review path; automatically retried when new data arrives)
  
  // ─── DECISION REASONING (For Learning Loops) ──────────────────────────
  selectedBecause: string // Why this insight was selected over alternatives
  rejectedInsights: {
    insightType: string
    reason: string // Why this insight was rejected
    confidence?: number // What confidence it would have had
  }[] // Other insights considered but rejected
  
  // ─── RENDERING GUIDANCE (Auto-Determined by Confidence) ────────────────
  framingLevel: "assertive" | "gentle" | "speculative"
  // assertive (0.85+): "Your pharmacy loses customers one relocation at a time."
  // gentle (0.60–0.85): "Many pharmacies find customer retention challenging..."
  // speculative (<0.60): "Some pharmacies experience..." (should not reach renderers)
  
  framingGuidance: {
    tone: string // "direct", "empathetic", "cautious"
    specificity: "specific" | "generalized" // Specific if high confidence, generalized if lower
    presupposition: string // What the insight assumes about prospect
  }
  
  // ─── VALIDATION METADATA (For Learning Loops) ──────────────────────────
  validatedAt: Date
  validationId: string // Cross-reference to validation_logs table
  validationMetadata: {
    leadCategory: string
    leadLocations: number
    enrichmentLevel: "full" | "partial" | "minimal"
    discoveryMethod: string // How was primary evidence found?
  }
  
  // ─── CORE INSIGHT ──────────────────────────────────────────────────────
  insight: {
    statement: string // The core claim: "Pharmacy loses customers to relocation"
    painPoint: string // What the prospect experiences
    opportunity: string // What solving it enables
  }
  
  // ─── IMMUTABILITY GUARANTEE ───────────────────────────────────────────
  // LOCKED CONSTRAINT: This object is immutable once created.
  // 
  // Renderers MUST:
  // ✓ Express the insight (put it into words at different depths)
  // ✓ Expand the insight (add detail/context)
  // ✓ Contextualize the insight (adapt to medium: card/email/page/conversation)
  //
  // Renderers MUST NOT:
  // ✗ Modify the insight
  // ✗ Change the core statement
  // ✗ Alter confidence
  // ✗ Add/remove evidence sources
  // ✗ Change framing level
  //
  // This guarantees continuity across all touchpoints:
  // Card → Email → Page → Conversation all express the same insight
  // 
  // Implementation: Mark as readonly in TypeScript
  readonly _locked = true // Enforces immutability at type level
}
```

### Insight Object Production with Learning Fields

**Validation engine produces exactly this structure with decision reasoning**:

```typescript
// VALIDATION PIPELINE PRODUCES InsightObject with selectedBecause + rejectedInsights
async function validateEvidence(
  lead: EnrichedLead,
  intelligence: LeadIntelligence
): Promise<InsightObject | ValidationRejection> {
  
  // Step 1: Identify ALL candidate insight types
  const candidateInsights = identifyAllInsightCandidates(lead, intelligence)
  // Returns: [{ type: "customer_relocation", score: 0.85 }, { type: "consistency", score: 0.72 }, ...]
  
  // Step 2: Evaluate evidence for PRIMARY insight (highest-scoring candidate)
  const primaryInsight = candidateInsights[0] // Best candidate
  const evidenceSources = gatherEvidenceSources(lead, primaryInsight.type)
  
  // Step 3: Detect contradictions
  const contradictions = detectContradictions(lead, primaryInsight.type, evidenceSources)
  
  // Step 4: Calculate continuous confidence (0.0–1.0)
  const confidence = calculateContinuousConfidence(
    evidenceSources,
    contradictions
  )
  
  // Step 5: Determine status (with PENDING_MORE_EVIDENCE auto-cycle logic)
  const status = determineStatus(confidence, contradictions)
  // If status === PENDING_MORE_EVIDENCE:
  //   - Schedule auto re-entry into validation when new enrichment arrives
  //   - No manual review needed
  
  // Step 6: Determine framing level (auto-derived from continuous confidence)
  const framingLevel = getFramingLevel(confidence)
  // 0.85–1.0: "assertive"
  // 0.60–0.85: "gentle"
  // <0.60: "speculative" (should not reach renderers)
  
  // Step 7: LEARNING DATA — Record WHY this insight won
  const selectedBecause = generateSelectionReasoning(
    primaryInsight,
    candidateInsights,
    evidenceSources,
    confidence
  )
  // Example: "Selected because 85% confidence from direct enrichment (relocation in pain_point_review) 
  //          + multi-location pattern. Considered consistency (72%) but relocation more relevant to 
  //          service intersection and stronger evidence base."
  
  // Step 8: LEARNING DATA — Record which insights were rejected and why
  const rejectedInsights = candidateInsights.slice(1).map(insight => ({
    insightType: insight.type,
    reason: generateRejectionReasoning(insight, candidateInsights[0]),
    wouldHaveConfidence: insight.score
  }))
  // Example: [
  //   { insightType: "consistency", reason: "Lower confidence (72% vs 85%)", wouldHaveConfidence: 0.72 },
  //   { insightType: "scale_efficiency", reason: "No enrichment support", wouldHaveConfidence: 0.45 }
  // ]
  
  // Step 9: Log validation decision (with learning fields)
  const validationId = await logValidationDecision(
    lead,
    primaryInsight.type,
    selectedBecause,
    rejectedInsights,
    confidence,
    status,
    evidenceSources,
    contradictions
  )
  
  // Step 10: Construct IMMUTABLE Insight Object
  const insightObject: InsightObject = {
    insightId: generateId(),
    insightType: primaryInsight.type,
    leadId: lead.id,
    businessName: lead.business_name,
    
    // ─── CONFIDENCE ──────────────────────────────────────────
    confidence, // Continuous 0.0–1.0
    confidenceBand: mapConfidenceToBand(confidence), // Presentation: PROVEN, HIGH_CONFIDENCE, etc.
    
    // ─── EVIDENCE ─────────────────────────────────────────────
    evidenceSources: evidenceSources.map(s => ({
      sourceId: s.id,
      sourceName: s.name,
      strength: s.strength,
      foundAt: s.foundAt,
      rawData: s.rawData,
      weight: calculateSourceWeight(s, evidenceSources)
    })),
    
    // ─── CONTRADICTIONS (Three-Level System) ──────────────────
    contradictions: contradictions.map(c => ({
      id: c.id,
      level: c.level, // "WEAK" | "MODERATE" | "FATAL"
      evidence: c.evidence,
      reason: c.reason,
      confidencePenalty: c.penalty, // -0.05 to -1.0 based on level
      foundAt: c.foundAt
    })),
    
    // ─── STATUS ───────────────────────────────────────────────
    status,
    statusReason: getStatusReason(status, confidence, contradictions),
    // PENDING_MORE_EVIDENCE will auto re-enter validation (no manual path)
    
    // ─── LEARNING DATA ────────────────────────────────────────
    selectedBecause, // Why this insight was selected
    rejectedInsights, // Which alternatives were considered and why they lost
    
    // ─── RENDERING GUIDANCE ───────────────────────────────────
    framingLevel, // "assertive" | "gentle" | "speculative"
    framingGuidance: getFramingGuidance(framingLevel, primaryInsight),
    
    // ─── METADATA ─────────────────────────────────────────────
    validatedAt: new Date(),
    validationId,
    validationMetadata: {
      leadCategory: lead.category,
      leadLocations: lead.location_count || 1,
      enrichmentLevel: getEnrichmentLevel(lead),
      discoveryMethod: getPrimaryDiscoveryMethod(evidenceSources)
    },
    
    // ─── CORE INSIGHT ─────────────────────────────────────────
    insight: {
      statement: primaryInsight.statement, // "Pharmacy loses customers to relocation"
      painPoint: intelligence.pain_point,
      opportunity: primaryInsight.opportunity
    },
    
    // ─── IMMUTABILITY MARKER ──────────────────────────────────
    _locked: true // Prevents modification (TypeScript enforces at compile time)
  }
  
  return insightObject
}
```

**Key implementation detail**: selectedBecause and rejectedInsights are populated AT CREATION TIME, enabling future learning about insight accuracy without needing post-hoc analysis.

### 1. Evidence Source Inventory

**Structured definition of what evidence supports what**:

```typescript
// Evidence source definitions
interface EvidenceSource {
  id: string // "enrichment_pain_point", "review_relocation_mention", etc.
  name: string // Human-readable
  dataField: string // Where it comes from: "pain_point_review", "review_text", "location_count"
  confidenceBoost: number // 0.95 (direct), 0.85 (strong inference), 0.65 (weak), 0.35 (fallback)
  validator: (lead: EnrichedLead) => boolean // Function to test if source applies
  reason: string // Why this source supports this confidence level
}

// Insight type definitions
interface InsightType {
  id: string // "customer_relocation", "operational_consistency", etc.
  name: string
  provenSources: EvidenceSource[] // What makes it PROVEN (95%)
  highConfidenceSources: EvidenceSource[] // What makes it HIGH-CONFIDENCE (70%)
  rejectionCondition: (lead: EnrichedLead) => boolean // When to reject
}
```

**Concrete example**:

```typescript
const CUSTOMER_RELOCATION_INSIGHT: InsightType = {
  id: "customer_relocation",
  name: "Customer Loss During Relocation",
  
  provenSources: [
    {
      id: "review_relocation_mention",
      name: "Review explicitly mentions relocation",
      dataField: "review_text",
      confidenceBoost: 0.95,
      validator: (lead) => {
        const reviews = lead.review_data || []
        return reviews.some(r => 
          /relocated|relocation|moved|moving|changed location/i.test(r)
        )
      },
      reason: "Prospect reviews directly mention relocation issue"
    },
    {
      id: "website_local_service_only",
      name: "Website states local service area",
      dataField: "website_content",
      confidenceBoost: 0.95,
      validator: (lead) => {
        return lead.website_mentions_local_only === true
      },
      reason: "Website confirms geographic service limitation"
    }
  ],
  
  highConfidenceSources: [
    {
      id: "enrichment_relocation_pain",
      name: "Enrichment field mentions relocation",
      dataField: "pain_point_review",
      confidenceBoost: 0.85,
      validator: (lead) => {
        return lead.pain_point_review?.includes("relocation") ?? false
      },
      reason: "Discovery enrichment explicitly identified relocation pain"
    },
    {
      id: "category_pharmacy_plus_locations",
      name: "Pharmacy with 3+ locations",
      dataField: "category + location_count",
      confidenceBoost: 0.70,
      validator: (lead) => {
        return lead.category === "pharmacy" && (lead.location_count || 0) >= 3
      },
      reason: "Multi-location pharmacy is pattern-consistent with relocation challenges"
    }
  ],
  
  rejectionCondition: (lead) => {
    // Reject if no evidence at all
    return !lead.pain_point_review?.includes("relocation") &&
           (lead.review_data || []).length === 0 &&
           lead.location_count === 1
  }
}
```

### 2. Evidence Validation Model

**Core validation logic**:

```typescript
interface EvidenceValidation {
  approved: boolean // Should this insight proceed?
  confidenceLevel: 95 | 70 | null // If rejected, null
  confidenceBand: "PROVEN" | "HIGH_CONFIDENCE" | "REJECTED"
  
  // Debugging/explanation
  sourcesMet: string[] // Which evidence sources are present
  sourcesMissing: string[] // Which sources are absent
  rejectionReason?: string // Why rejected (if applicable)
  framingGuidance: string // How to express this insight
}

// Main validation function
function validateEvidence(
  lead: EnrichedLead,
  insight: InsightType
): EvidenceValidation {
  
  // Check PROVEN sources
  const provenMet = insight.provenSources.filter(s => s.validator(lead))
  if (provenMet.length >= 2) {
    return {
      approved: true,
      confidenceLevel: 95,
      confidenceBand: "PROVEN",
      sourcesMet: provenMet.map(s => s.id),
      sourcesMissing: [],
      framingGuidance: "Use direct, assertive language. State the insight as fact."
    }
  }
  
  // Check HIGH-CONFIDENCE sources
  const highConfMet = insight.highConfidenceSources.filter(s => s.validator(lead))
  if (highConfMet.length >= 2) {
    return {
      approved: true,
      confidenceLevel: 70,
      confidenceBand: "HIGH_CONFIDENCE",
      sourcesMet: highConfMet.map(s => s.id),
      sourcesMissing: provenMet.map(s => s.id),
      framingGuidance: "Use soft language. Frame as common pattern, not certain fact."
    }
  }
  
  // Check rejection condition
  if (insight.rejectionCondition(lead)) {
    return {
      approved: false,
      confidenceLevel: null,
      confidenceBand: "REJECTED",
      sourcesMet: [],
      sourcesMissing: [...insight.provenSources, ...insight.highConfidenceSources].map(s => s.id),
      rejectionReason: "Insufficient evidence. No supporting data found for this insight."
    }
  }
  
  // Default: Not enough confidence
  return {
    approved: false,
    confidenceLevel: null,
    confidenceBand: "REJECTED",
    sourcesMet: [],
    sourcesMissing: insight.provenSources.map(s => s.id),
    rejectionReason: "Evidence quality below approval threshold."
  }
}
```

### 3. Confidence-to-Framing Mapping

**How confidence level determines expression**:

```typescript
// Same insight, different confidence = different framing
const framingRules = {
  95: {
    confidenceBand: "PROVEN",
    structure: "Direct assertion of fact",
    examples: {
      recognition: "One thing about your pharmacy: you're losing customers one relocation at a time.",
      relief: "When that happens, it becomes your constraint on growth.",
      trust: "We've worked with pharmacies and observed: 92% retain customers during transitions with our process.",
      action: "Does relocation cost you customers? If it does, here's how we solve it."
    },
    tone: "Assertive, specific, evidenced"
  },
  
  70: {
    confidenceBand: "HIGH_CONFIDENCE",
    structure: "Pattern observation + group framing",
    examples: {
      recognition: "One thing we've observed with pharmacies your size: many find customer retention challenging during transitions.",
      relief: "When you're managing customer loyalty during location changes, it becomes complex.",
      trust: "We've worked with similar businesses and observed: many maintain 87% of customers through transitions with our process.",
      action: "Does transition planning ever become a bottleneck? If it does, we should talk."
    },
    tone: "Gentle, relatable, pattern-based"
  },
  
  null: {
    confidenceBand: "REJECTED",
    structure: "Not used",
    examples: null,
    tone: "Prospect not contacted; enrichment needed"
  }
}
```

### 4. Validation Pipeline

**Flow from intelligence to decision**:

```
Step 1: Extract Intelligence
  Input: Lead data
  Output: intelligence = {pain_point, pattern, challenge, confidence}

Step 2: Identify Primary Insight
  Input: intelligence + lead context
  Logic: Which insight type (relocation, consistency, scale, etc.) best fits?
  Output: selectedInsightType

Step 3: Validate Evidence
  Input: lead + selectedInsightType
  Logic: Do sources support this insight?
  Output: validation = {approved, confidenceLevel, sourceMet, reason}

Step 4: Gate Decision
  Input: validation.approved
  Logic: If false, reject prospect. If true, continue with confidence level.
  Output: Proceed or Hold

Step 5: Pass to RRTA (Only if approved)
  Input: intelligence + validation.confidenceLevel
  Logic: RRTA generator modulates framing based on confidence
  Output: Email copy

Step 6: RRTA Validation
  Input: RRTA copy + confidence level
  Logic: Check writing format (existing RRTA validator)
  Output: 4/4 or reject
```

### 5. Integration with Current Workflow

**Insertion point in conversion engine**:

**File**: `lib/b2b-conversion-engine.ts`

**New architecture with Insight Object**:

```typescript
// ===== PHASE 1: INTELLIGENCE EXTRACTION =====
const intelligence = extractLeadIntelligence(lead)

// Validate sufficiency
const sufficiency = validateIntelligenceSufficiency(intelligence)
if (!sufficiency.valid) {
  return { approved: false, rejection_reason: ... }
}

// ===== NEW PHASE 1.5: EVIDENCE VALIDATION (Produces Insight Object) =====
const insightObject = await validateEvidence(lead, intelligence)

// Check status (three states, not binary)
if (insightObject.status === "REJECTED_FOR_NOW") {
  return {
    approved: false,
    rejection_reason: insightObject.statusReason,
    rejection_type: "evidence_rejected",
    prospectStatus: "REJECTED_FOR_NOW",
    retryCondition: insightObject.nextEvaluationTrigger
  }
}

if (insightObject.status === "PENDING_MORE_EVIDENCE") {
  return {
    approved: false,
    rejection_reason: insightObject.statusReason,
    rejection_type: "evidence_pending",
    prospectStatus: "PENDING_MORE_EVIDENCE",
    retryCondition: insightObject.nextEvaluationTrigger
  }
}

// insightObject.status === "APPROVED"
console.log(`✅ Insight validated`)
console.log(`   Type: ${insightObject.insightType}`)
console.log(`   Confidence: ${(insightObject.confidence * 100).toFixed(0)}%`)
console.log(`   Framing: ${insightObject.framingLevel}`)
console.log(`   Evidence sources: ${insightObject.evidenceSources.length}`)
console.log(`   Contradictions: ${insightObject.contradictions.length}`)

// ===== PHASE 2: RRTA COPY GENERATION (Consumes Insight Object) =====
// Pass the entire insightObject to RRTA generator
// RRTA generator uses: confidence, framingLevel, insight statement
const rrta = generateRRTACopy(
  lead.business_name,
  lead.category || "business",
  insightObject  // NEW: Pass Insight Object, not Intelligence
)

// ===== PHASE 3: RRTA VALIDATION (Unchanged) =====
const validation = validateRRTA(rrta)

if (!validation.passed) {
  return {
    approved: false,
    rejection_reason: explainValidationFailure(validation),
    rejection_type: "rrta_validation_failed"
  }
}

// ===== PHASE 4: EMAIL ASSEMBLY (Consumes Insight Object) =====
const email = buildEmail(rrta, lead, insightObject)

// ===== PHASE 5: APPROVAL (Returns Insight Object for Future Renderers) =====
const result: ConversionEngineResult = {
  approved: true,
  
  // Email components
  subject: email.subject,
  body: email.body,
  cta_text: email.ctaText,
  cta_link: email.ctaLink,
  
  // Insight Object (passed downstream to all renderers)
  insightObject, // ← All future renderers will consume this
  
  // Validation metadata
  rrat_score: validation.score,
  rrat_passed: validation.passed,
  validation_details: validation
}

return result
```

**Key change**: Insight Object flows through entire system as canonical representation.

### Insight Object as Immutable Renderer Contract

**LOCKED CONSTRAINT: All renderers consume the SAME immutable InsightObject**

```typescript
// ─── IMMUTABILITY RULES ───────────────────────────────────────────────
// The InsightObject is created once and never modified.
// Each renderer expresses it at a different depth, but NEVER alters it.

// What renderers MAY DO:
// ✓ Read all fields
// ✓ Express the insight in different words/mediums
// ✓ Add context/detail based on medium (card vs email vs page vs conversation)
// ✓ Adapt formatting to channel requirements
// ✓ Add supporting material (examples, case studies, etc.)

// What renderers MUST NOT DO:
// ✗ Modify insightObject.confidence
// ✗ Modify insightObject.insight.statement
// ✗ Add/remove evidence sources
// ✗ Change framing level
// ✗ Alter status
// ✗ Modify selectedBecause or rejectedInsights
// ✗ Create a different insight

// Email Renderer
async function renderEmail(insightObject: Readonly<InsightObject>, lead: EnrichedLead): Promise<Email> {
  // READS: insightObject.confidence, insightObject.framingLevel, insightObject.insight
  // NEVER MODIFIES: insightObject
  // OUTPUTS: Email body expressing THIS insight at email depth
  
  const statement = insightObject.insight.statement // "Pharmacy loses customers to relocation"
  const framing = insightObject.framingLevel // "assertive" | "gentle" | "speculative"
  
  // Express at email depth:
  if (framing === "assertive") {
    return new Email(
      subject: `${lead.business_name} — customer retention challenge`,
      body: `One thing about ${lead.business_name}: ${statement}...`
    )
  } else if (framing === "gentle") {
    return new Email(
      subject: `${lead.business_name} — helping businesses like yours`,
      body: `Many businesses in your sector find similar challenges: ${statement}...`
    )
  }
}

// Card Renderer (future — uses SAME insightObject)
async function renderCard(insightObject: Readonly<InsightObject>, lead: EnrichedLead): Promise<Card> {
  // Uses the SAME insightObject
  // Expresses at CARD depth (shorter, punchier, gateway positioning)
  // NEVER modifies the object
}

// Page Renderer (future — uses SAME insightObject)
async function renderPage(insightObject: Readonly<InsightObject>, lead: EnrichedLead): Promise<Page> {
  // Uses the SAME insightObject
  // Expresses at PAGE depth (detailed, proof-heavy, deeper engagement)
  // NEVER modifies the object
}

// Conversation Renderer (future — uses SAME insightObject)
async function renderConversation(insightObject: Readonly<InsightObject>, lead: EnrichedLead): Promise<ConversationScript> {
  // Uses the SAME insightObject
  // Expresses at CONVERSATION depth (dialogue format, human voice, application)
  // NEVER modifies the object
}
```

**Continuity guarantee**:
- Card expresses: "Pharmacy loses customers to relocation" (gateway)
- Email deepens: "One thing about [name]: you're losing customers one relocation at a time..." (recognition)
- Page validates: "Here's how pharmacies prevent relocation losses..." (proof)
- Conversation applies: "Does relocation cost you customers?" (closes)

All four outputs reference the **same immutable InsightObject**.
All express the **same core insight**.
All use the **same confidence level for framing**.
All maintain **perfect narrative continuity**.

No renderer can modify, substitute, or reframe the insight. This is the guarantee.

---

## Required Code Changes

### New Files to Create

**1. `lib/b2b-evidence-validator.ts`** (Core validation logic)

```typescript
// Type definitions
export interface InsightObject { ... }
export interface EvidenceSourceInstance { ... }
export interface Contradiction { ... }
export interface ValidationLog { ... }

// Evidence source inventory
export const EVIDENCE_SOURCES_BY_INSIGHT: Record<string, EvidenceSourceDefinition[]> = { ... }

// Main validation pipeline
export async function validateEvidence(
  lead: EnrichedLead,
  intelligence: LeadIntelligence
): Promise<InsightObject> { ... }

// Helper functions
export function identifyPrimaryInsight(lead, intelligence): string { ... }
export function gatherEvidenceSources(lead, insightType): EvidenceSourceInstance[] { ... }
export function detectContradictions(lead, insightType, sources): Contradiction[] { ... }
export function calculateContinuousConfidence(sources, contradictions): number { ... }
export function determineStatus(confidence, contradictions): ValidationStatus { ... }
export function getFramingLevel(confidence): "assertive" | "gentle" | "speculative" { ... }
export async function logValidationDecision(lead, insightObject, evidenceSources, contradictions): string { ... }
```

**2. `lib/b2b-insight-definitions.ts`** (Insight type catalog)

```typescript
export interface InsightTypeDefinition {
  id: string
  name: string
  statement: string // Core claim
  opportunity: string // What solving it enables
  evidenceSources: EvidenceSourceDefinition[]
  contradictionRules: ContradictionRule[]
}

// Each insight type with complete rules
export const CUSTOMER_RELOCATION_INSIGHT: InsightTypeDefinition = { ... }
export const OPERATIONAL_CONSISTENCY_INSIGHT: InsightTypeDefinition = { ... }
export const SCALE_EFFICIENCY_INSIGHT: InsightTypeDefinition = { ... }

export const ALL_INSIGHTS = [
  CUSTOMER_RELOCATION_INSIGHT,
  OPERATIONAL_CONSISTENCY_INSIGHT,
  // ...
]

export function getInsightType(insightId: string): InsightTypeDefinition { ... }
```

**3. `lib/b2b-validation-logger.ts`** (Logging for learning loops)

```typescript
export interface ValidationLog { ... }

export async function logValidationDecision(
  lead: EnrichedLead,
  insightObject: InsightObject,
  evidenceSources: EvidenceSourceInstance[],
  contradictions: Contradiction[]
): Promise<string> { ... }

export async function recordEngagement(
  validationId: string,
  engagement: "email_sent" | "email_opened" | "page_visited" | "reply_received"
): Promise<void> { ... }

export async function evaluateOutcome(
  validationId: string,
  outcome: "converted" | "not_converted" | "pending"
): Promise<void> { ... }

export async function queryLearnings(
  query: LearningQuery
): Promise<LearningResult> { ... }
```

### Modified Files

**1. `lib/b2b-conversion-engine.ts`** (Add validation gate, pass Insight Object)

Changes:
- Import `validateEvidence` from `b2b-evidence-validator`
- Import `logValidationDecision` from `b2b-validation-logger`
- Insert validation step after intelligence extraction (Phase 1.5)
- Handle three status cases: APPROVED, PENDING_MORE_EVIDENCE, REJECTED_FOR_NOW
- Pass entire `insightObject` to `generateRRTACopy` (not just confidence)
- Return `insightObject` in `ConversionEngineResult`

Line changes: ~30-40 lines added (new imports, validation pipeline, status handling)

**2. `lib/b2b-rrta-generator.ts`** (Accept InsightObject parameter)

Changes:
- Modify `generateRRTACopy()` signature to accept `insightObject: InsightObject` (not intelligence)
- Use `insightObject.confidence` to determine framing
- Use `insightObject.framingLevel` to select word intensity
- Use `insightObject.insight.statement` as core claim
- Use `insightObject.insight.painPoint` for Relief component
- Use `insightObject.confidenceBand` to guide language specificity

Line changes: ~50-60 lines modified (parameter change, conditional logic using new fields)

**3. `prisma/schema.prisma`** (Add validation_logs table)

```prisma
model ValidationLog {
  id                    String    @id @default(cuid())
  validationId          String    @unique // Links to InsightObject.validationId
  prospectId            String
  
  // ─── DECISION REASONING (Primary for Learning) ──────────────────────
  selectedInsightType   String    // Which insight was selected
  selectedBecause       String    @db.Text // WHY was this selected (critical for learning)
  rejectedInsightsJson  String    @db.Text // JSON: insights rejected and why
  
  // ─── VALIDATION DETAILS ───────────────────────────────────────────
  confidenceScore       Float     // 0.0–1.0 continuous
  confidenceBand        String    // "PROVEN", "HIGH_CONFIDENCE", etc. (presentation only)
  status                String    // "APPROVED", "PENDING_MORE_EVIDENCE", "REJECTED_FOR_NOW"
  
  // ─── EVIDENCE PROVENANCE ──────────────────────────────────────────
  evidenceSourceCount   Int
  evidenceSourcesJson   String    @db.Text // JSON: array of source IDs
  
  // ─── CONTRADICTIONS ───────────────────────────────────────────────
  contradictionsCount   Int       @default(0)
  contradictionsByLevel String    // JSON: { WEAK: N, MODERATE: N, FATAL: N }
  
  // ─── ENGAGEMENT OUTCOMES (Populated Later) ────────────────────────
  emailSent             Boolean   @default(false)
  emailSentAt           DateTime?
  emailOpenRate         Float?
  pageVisited           Boolean   @default(false)
  pageVisitedAt         DateTime?
  replyReceived         Boolean   @default(false)
  replyReceivedAt       DateTime?
  conversionStatus      String?   // "converted", "not_converted", "pending"
  
  // ─── KPI TRACKING (Accuracy → Engagement → Conversation → Conversion) ──
  kpiInsightAccuracy    Boolean?  // Did prospect confirm this insight?
  kpiEngagementDepth    String?   // "none", "open", "click", "reply"
  kpiConversationStarts Int       @default(0) // How many conversations?
  kpiConversion         Boolean   @default(false)
  
  // ─── METADATA ──────────────────────────────────────────────────────
  leadCategory          String
  leadLocations         Int
  enrichmentLevel       String    // "full", "partial", "minimal"
  
  // ─── TIMING ───────────────────────────────────────────────────────
  validatedAt           DateTime  @default(now())
  outcomeEvaluatedAt    DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([prospectId])
  @@index([status])
  @@index([selectedInsightType])
  @@index([kpiInsightAccuracy])
  @@index([conversionStatus])
  @@unique([validationId]) // Ensures 1:1 relationship with InsightObject
}
```

**Indexes prioritize learning queries**:
- status: Track APPROVED vs PENDING vs REJECTED proportions
- selectedInsightType: Aggregate which insights are selected
- kpiInsightAccuracy: Primary metric — did we get the insight right?
- conversionStatus: Secondary metric — did it convert? (lower priority)

### New Error Types

**In conversion engine error types**:
```typescript
rejection_type: 
  | "evidence_rejected" // REJECTED_FOR_NOW
  | "evidence_pending" // PENDING_MORE_EVIDENCE
  | "evidence_invalid" // Validation pipeline error
```

**In ConversionEngineResult**:
```typescript
interface ConversionEngineResult {
  approved: boolean
  insightObject?: InsightObject // NEW: Passed to all renderers
  prospectStatus?: "APPROVED" | "PENDING_MORE_EVIDENCE" | "REJECTED_FOR_NOW"
  retryCondition?: string // For PENDING_MORE_EVIDENCE cases
  // ... existing fields
}
```

---

## Risk Assessment

### Risk Level: LOW

**Why low?**
1. New layer inserted BEFORE existing RRTA generation (no modification to working code)
2. RRTA validator unchanged (format validation still works)
3. If evidence validator rejects, email simply doesn't send (safe failure)
4. Three-state model (APPROVED/PENDING/REJECTED) prevents prospect loss
5. Insight Object is immutable; all future changes are backward-compatible
6. Logging enables data-driven rule refinement

### Potential Risks & Mitigations

**Risk 1: Continuous confidence calculation errors → Wrong framing**
- **Mitigation**: Test confidence calculation against known cases before production
- **Recovery**: Validation logs capture every decision; easy to audit and adjust weights
- **Monitoring**: Track email engagement by confidence band; if low-confidence performs well, adjust

**Risk 2: Contradiction detection too aggressive → Over-rejections**
- **Mitigation**: Start with only clear contradictions (negates type); add weakens gradually
- **Recovery**: Adjust contradiction rules in `InsightTypeDefinition`; re-evaluate PENDING prospects
- **Monitoring**: Track contradiction_penalty impact on conversion rates

**Risk 3: Missing evidence source → Can't validate new insight types**
- **Mitigation**: Evidence sources catalog is extensible; add as new insights emerge
- **Recovery**: Add evidence source definition + update insight type; no logic change
- **Monitoring**: Track "PENDING_MORE_EVIDENCE" prospects to identify missing data

**Risk 4: Enrichment data incomplete → Many prospects in PENDING state**
- **Mitigation**: PENDING_MORE_EVIDENCE is not rejection; prospects re-evaluated when data arrives
- **Recovery**: Invest in discovery enrichment; existing PENDING prospects can be re-run
- **Monitoring**: Track how many prospects move from PENDING to APPROVED with enrichment

**Risk 5: Logging overhead → Performance impact**
- **Mitigation**: Validation logs are inserted asynchronously; email generation not blocked
- **Recovery**: Batch inserts, cache non-critical metadata
- **Monitoring**: Track validation_log write times

**Risk 6: Insight Object breaks RRTA compatibility**
- **Mitigation**: RRTA generator just needs to accept InsightObject instead of Intelligence
- **Recovery**: Map InsightObject fields to old Intelligence fields temporarily
- **Monitoring**: Verify RRTA validation still passes 4/4 for all approved insights

### Rollback Path

If validation causes critical problems:
1. **Revert to old behavior**: Comment out evidence validation gate
2. **Fallback logic**: Create InsightObject on-the-fly from intelligence with confidence=0.75
3. **No data loss**: Validation logs remain for learning
4. **No email loss**: Existing approved emails continue to send
5. **Restart validation**: With adjusted rules, re-run PENDING prospects

### Success Criteria (Prioritized by KPI Hierarchy)

Evidence Validation Engine is working when:

**PRIMARY METRIC — Insight Accuracy** (Optimize for this first)
- ✅ Every validation_log records why an insight was selected (selectedBecause)
- ✅ Rejected insights are documented (rejectedInsights) for learning
- ✅ Prospects confirm insights are correct (kpiInsightAccuracy = true)
- ✅ Query shows high-confidence insights have higher accuracy confirmation than low-confidence

**SECONDARY METRIC — Engagement Depth** (Optimize after accuracy)
- ✅ Engagement tracked across all depths: open → click → reply → conversation
- ✅ High-confidence insights show deeper engagement patterns
- ✅ Contradictions measurably reduce engagement depth

**TERTIARY METRIC — Conversation Starts** (Optimize after engagement)
- ✅ kpiConversationStarts tracked per insight
- ✅ Conversation starts correlate with engagement depth, not conversion alone

**QUATERNARY METRIC — Conversion** (Lowest priority)
- ✅ Conversion is tracked but NOT the optimization target
- ✅ We optimize for accuracy first; conversion follows naturally

**Technical Success Criteria**:
- ✅ Confidence scores range across 0.0–1.0 (continuous, not banded)
- ✅ All contradictions classified: WEAK/MODERATE/FATAL with proportional penalties
- ✅ PENDING_MORE_EVIDENCE auto re-enters validation (no manual path)
- ✅ Insight Objects are immutable (TypeScript readonly enforced)
- ✅ All renderers consume same InsightObject without modification
- ✅ Learning queries confirm accuracy is prioritized over conversion

---

## Migration Strategy

### Phase 1: Design Approval (Current)
- ✅ User reviews revised design document
- ✅ User approves conditional changes
- ⏳ User provides final approval before implementation

### Phase 2: Database Setup
**Duration**: ~1 hour

1. Create `validation_logs` table (Prisma migration)
2. Run Prisma migration: `prisma migrate dev --name add_validation_logs`
3. Verify table structure matches schema

### Phase 3: Core Implementation (Additive)
**Duration**: ~4-6 hours

1. Create `lib/b2b-evidence-validator.ts`
   - Implement InsightObject type
   - Implement evidence source gathering
   - Implement contradiction detection
   - Implement continuous confidence calculation
   - Implement status determination

2. Create `lib/b2b-insight-definitions.ts`
   - Define CUSTOMER_RELOCATION_INSIGHT with full rules
   - Define OPERATIONAL_CONSISTENCY_INSIGHT
   - Define SCALE_EFFICIENCY_INSIGHT

3. Create `lib/b2b-validation-logger.ts`
   - Implement logValidationDecision()
   - Implement recordEngagement()
   - Implement evaluateOutcome()
   - Implement learning query functions

4. Modify `lib/b2b-conversion-engine.ts`
   - Add evidence validation phase (Phase 1.5)
   - Handle three status cases
   - Pass insightObject to downstream
   - Return insightObject in result

5. Modify `lib/b2b-rrta-generator.ts`
   - Change signature: accept insightObject
   - Update copy generation to use insightObject fields
   - Test framing modulation

### Phase 4: Testing & Validation
**Duration**: ~2-3 hours

**Unit tests**:
- Test confidence calculation with known evidence combinations
- Test contradiction detection (weakens vs negates)
- Test status determination logic
- Test evidence source gathering

**Integration tests**:
- Run 10 prospects through full pipeline
- Verify InsightObject creation
- Verify validation logs recorded
- Verify RRTA framing changes with confidence
- Verify email generation succeeds

**Edge case tests**:
- Prospect with no enrichment data (should be PENDING or REJECTED)
- Prospect with contradictions (should reduce confidence)
- Prospect with multiple evidence sources (should average weights)

### Phase 5: Staging Deployment
**Duration**: ~1 hour

1. Deploy code to staging
2. Run 5 test emails through new pipeline
3. Verify validation logs in database
4. Review confidence scores (should be spread across 0.0–1.0)
5. Verify email text matches framing level

### Phase 6: Production Rollout
**Duration**: ~30 minutes + monitoring

1. Deploy to production
2. Monitor first 10 emails:
   - All have validation_logs entries
   - InsightObject data populated
   - RRTA validation passes
   - Email sends successfully
3. Check for any errors in logs
4. Proceed to full traffic

### Phase 7: Learning Loop Activation
**Duration**: Ongoing (post-deployment)

1. Track validation decisions daily
2. Correlate confidence bands with engagement
3. Refine evidence weights based on data
4. Adjust contradiction rules
5. Re-evaluate PENDING prospects as new data arrives

### Rollback / Fallback

**If critical issues during testing**:
1. Comment out evidence validation in `b2b-conversion-engine.ts`
2. Fallback: Create temporary InsightObject with confidence=0.75 for all prospects
3. System continues to send emails while validation rules are fixed

**If issues after production deployment**:
1. Immediate: Disable evidence validation gate (single line comment)
2. Short-term: Adjust insight rules in `b2b-insight-definitions.ts`
3. Medium-term: Adjust contradiction rules
4. Long-term: Re-evaluate PENDING prospects with fixed rules

---

## Approval Checklist

**Before moving to Phase 2 (Database Setup)**:

- [ ] Continuous confidence model (0.0–1.0) is acceptable
- [ ] Evidence provenance structure captures required data
- [ ] Contradiction handling approach (weakens vs negates) is correct
- [ ] Three-state status model (APPROVED/PENDING/REJECTED_FOR_NOW) prevents prospect loss
- [ ] Insight Object as immutable contract for renderers is sound architecture
- [ ] Logging structure enables learning loops
- [ ] Integration point in conversion engine is clear
- [ ] Risk mitigations are acceptable
- [ ] Migration phases are feasible

**Remaining Questions**:

1. **Continuous confidence**: Is 0.0–1.0 scale clear, or should we use percentages internally?

2. **Status model**: Is PENDING_MORE_EVIDENCE the right middle state? Should prospects auto-retry or wait for manual trigger?

3. **Contradictions**: Should all contradictions reduce confidence, or only certain types?

4. **Learning loops**: Which KPIs matter most for refining evidence weights?

5. **Performance**: Is asynchronous logging acceptable, or should validation logs be synchronous?

---

## Summary

**Evidence Validation Engine is the foundation layer.**

**Locked Architecture (Final)**:
- ✅ Continuous confidence (0.0–1.0) internally; percentages presentation-only
- ✅ Evidence provenance captured (sources, weights, contradictions)
- ✅ Contradiction handling (WEAK/MODERATE/FATAL with proportional penalties)
- ✅ Three-state status (APPROVED/PENDING_MORE_EVIDENCE/REJECTED_FOR_NOW)
  - PENDING_MORE_EVIDENCE: Auto re-enters validation cycles (no manual path)
- ✅ Insight Object as immutable contract for all renderers
- ✅ Comprehensive logging with learning fields (selectedBecause, rejectedInsights)
- ✅ KPI hierarchy: Accuracy → Engagement → Conversation → Conversion (in priority order)
- ✅ Renderer constraint: Only express/expand/contextualize, never modify

**Insight Object guarantees continuity**:
All future renderers (Card, Email, Page, Conversation) consume the same immutable InsightObject. No renderer thinks independently. All express the same core claim at different depths. Renders cannot modify, only express.

**Enables Layers 2–6**:
- Layer 2 (Confidence Framing): Uses continuous confidence to modulate language intensity
- Layer 3 (Relevance Selection): Selects THE insight from many validated ones
- Layer 4 (Readiness Detection): Times insight expressions by prospect readiness
- Layer 5 (Insight Selection & Framing): Upstream thinking layer
- Layer 6 (Renderers): Card, Email, Page, Conversation all consume same InsightObject

**Design Status**: ✅ APPROVED FOR IMPLEMENTATION

**Next Phase**: Phase 2 — Database setup (create validation_logs table)

Then Phase 3 — Core implementation begins.
