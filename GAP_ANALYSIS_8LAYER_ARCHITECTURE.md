# Gap Analysis: Current System vs 8-Layer Target Architecture

**Date**: 2026-06-13  
**Purpose**: Audit existing B2B conversion system against locked 8-layer architecture. Identify what exists, what's partial, what's missing.  
**Status**: DISCOVERY PHASE — No code changes. Assessment only.

---

## Executive Summary

**Current State**: Core conversion engine (Discovery → RRTA → Validation → Email) exists and functions.

**Target State**: 8-layer architecture with Evidence Validation, Confidence-based Framing, Relevance Selection, Readiness Detection, and Separated Renderers.

**Gap Count**: 5 missing or incomplete layers. 3 layers need architectural separation.

**Recommendation**: Extend existing system layer-by-layer. No rewrites. Preserve working email generation.

---

## Current Architecture (What Exists)

### Layer 1: Discovery Engine
**Current Status**: ✅ PARTIALLY EXISTS  
**Location**: `lib/b2b-intelligence-extract.ts` — `extractLeadIntelligence()`  

**What it does**:
- Extracts pain_point from lead data (enrichment field or category heuristic)
- Extracts business_pattern from location count
- Extracts operational_challenge from rating + review volume
- Calculates confidence as average of three components (0-1)

**What it's missing**:
- No structured discovery process (just extraction from existing fields)
- Confidence is averaged, not classified by evidence type (PROVEN vs HIGH-CONFIDENCE vs SPECULATION)
- Returns ALL truths, not selected truths

### Layer 2: Truth Discovery Engine
**Current Status**: ✅ PARTIALLY EXISTS  
**Location**: `lib/b2b-intelligence-extract.ts` — multiple extraction functions

**What it does**:
- extractPainPoint() — identifies operational pain
- extractBusinessPattern() — identifies scale/growth pattern
- extractOperationalChallenge() — identifies efficiency burden
- extractLocationContext() — adds context
- extractIndustryObservation() — adds industry perspective
- extractScaleIndicator() — adds scale context

**What it's missing**:
- No selection logic (finds all truths, doesn't pick "THE" truth that matters)
- No validation that truths are actually supported
- Heuristics are generic per category, not prospect-specific

### Layer 3: Evidence Validation Engine
**Current Status**: ❌ MISSING  

**Why it matters**:
- RRTA validator (Layer downstream) checks WRITING FORMAT, not evidence quality
- System needs to ask: "Is this insight supported by available evidence?"
- Prevents: Pharmacy relocation pain when pharmacy runs nationwide delivery

**What's needed**:
- Classification of evidence types: PROVEN (reviews mention it) vs HIGH-CONFIDENCE (inference from data) vs SPECULATION (assumption)
- Gate that rejects unsupported insights before RRTA generation
- Mapping of available evidence per prospect (what data supports what claim?)

**What currently happens**:
- Confidence score calculated, but not used for filtering or gating
- RRTA validator checks if Recognition is specific (format check), not if it's evidence-backed (content check)

### Layer 4: Confidence Scoring Engine
**Current Status**: ⚠️ PARTIALLY EXISTS  
**Location**: `lib/b2b-intelligence-extract.ts` — confidence calculation

**What exists**:
```typescript
confidence: (painPoint.confidence + pattern.confidence + challenge.confidence) / 3
```
Each sub-component has confidence assigned:
- 0.95 = enrichment data (direct)
- 0.85 = location_count (strong inference)
- 0.8 = location_count + rating analysis
- 0.65 = category heuristic
- 0.35-0.2 = generic fallback

**What's missing**:
- **Confidence isn't used for output gating** (low confidence insights are treated same as high)
- **No framing modulation** (same insight at 95% confidence and 70% confidence gets same wording)
- **No separation of confidence levels** for renderer decision-making

**What needs to happen**:
- 95% confidence → "Your pharmacy loses customers one relocation at a time."
- 70% confidence → "Many independent pharmacies find customer retention challenging during location changes."
- Both same insight, different framing intensity

### Layer 5: Relevance Selection Engine
**Current Status**: ❌ MISSING  

**Why it matters**:
- Prospect may have many true business problems, but only ONE matters for our service
- System needs to ask: "Of all these truths, which one intersects with what we solve?"
- Without it: Could highlight truth that's real but irrelevant to the conversion

**What's needed**:
- Service definition (what do we actually solve?)
- Ranking system (which truth best aligns with service?)
- Gate that filters from N truths → 1 relevant truth

**What currently happens**:
- All extracted truths flow to RRTA generator
- RRTA picks pain_point primarily, treats others as supporting context
- No explicit relevance-to-service filter

### Layer 6: Readiness Detection Engine
**Current Status**: ❌ MISSING  

**Why it matters**:
- Same insight expressed 3 different ways depending on when prospect will buy
- Relevant + Ready Now → Direct, urgent card
- Relevant + Not Ready → Durable card designed for retention
- Relevant + Emerging → Card plants awareness for future retrieval

**What's needed**:
- Signals that indicate readiness: review recency, rating trend, volume, hiring, problem frequency
- Classification system: Ready Now (0-3 months) vs Not Ready (3-12 months) vs Emerging (12+ months)
- Gating by readiness so rendering strategy changes

**What currently happens**:
- All prospects get same email structure regardless of readiness
- No distinction between immediate-need and future-need prospects
- No optimization for retention-based conversion

### Layer 7: Insight Selection & Framing Engine
**Current Status**: ⚠️ PARTIALLY EXISTS (as Insight GENERATOR, not Selector)  
**Location**: `lib/b2b-rrta-generator.ts`

**Current architecture**:
```
Intelligence (input) → RRTA Copy (output directly)
```

**Problem**:
- This is a GENERATOR (does the thinking AND expressing)
- Target needs: SELECTOR (upstream thinking) + RENDERERS (downstream expressing)

**What exists now**:
- generateRRTACopy() takes intelligence and outputs R/R/T/A components
- generateSubject(), generateCTAText() derive from intelligence
- Takes all available truth at once

**What needs to happen**:
- Insight Selection layer picks winning insight ONCE
- Passes it downstream to 4 renderers
- Each renderer asks "How do I express THIS insight at MY depth?"

**Current problem illustrated**:
```
// Current: Generator does all thinking
generateRRTACopy(intelligence) → 
  Returns: recognition, relief, trust, action

// Needed: Selector thinks upstream
selectInsight(truths, relevance, readiness) →
  Returns: winning_insight

// Then renderers just express
cardRenderer(insight, readiness) → card
emailRenderer(insight, readiness) → email
pageRenderer(insight, readiness) → page
conversationRenderer(insight, readiness) → conversation
```

### Layer 8: Renderers (Card, Email, Page, Conversation)
**Current Status**: ⚠️ PARTIALLY STRUCTURED  

**What exists**:
- ✅ Email renderer (b2b-rrta-generator + buildEmailBody)
- ⚠️ Prospect page (placeholder in b2b-conversion-engine.ts, needs implementation)
- ❌ Card renderer (doesn't exist)
- ❌ Conversation starter (doesn't exist)

**Problem**:
- Each renderer currently thinks independently
- No guarantee they're expressing the same insight
- No renderers know about readiness level

**Architecture needed**:
```
Single Insight (selected upstream)
    ↓
Card Renderer → Card (gateway, establishes relevance/trust/positioning)
Email Renderer → Email (deepens narrative, creates curiosity gap)
Page Renderer → Page (validates understanding, provides proof)
Conversation Renderer → Conversation script (applies insight, starts business dialogue)
```

Each renderer: "How do I express this specific insight at THIS depth for this readiness level?"

---

## Confidence Scoring: Detailed Breakdown

### Current Implementation

```typescript
// In extractLeadIntelligence():
return {
  pain_point: painPoint.observation,
  confidence: (painPoint.confidence + pattern.confidence + challenge.confidence) / 3
  // Returns: single number 0-1
}
```

### Evidence Classification Needed

**95% Confidence (PROVEN)**
- Direct evidence exists in available data
- Example: "Reviews mention relocation" + "Website mentions local service area"
- Allowed: Direct observation
- Framing: "Your pharmacy loses customers one relocation at a time."

**70% Confidence (HIGH-CONFIDENCE INFERENCE)**
- Strong signal in data but not explicit
- Example: "12 locations" + "Low rating" + "High review volume"
- Allowed: Soft observation with multi-location framing
- Framing: "Many pharmacies your size find customer retention challenging during transitions."

**40% Confidence (SPECULATION)**
- Assumption without supporting data
- Example: "Estate agent, so probably has consistency issues"
- Not allowed: Rejected at Evidence Validation gate

### Current gap

The averaging approach masks evidence type:
```
// Current
extractPainPoint: 0.95 (enriched data)
extractPattern: 0.85 (location count)
extractChallenge: 0.65 (category heuristic)
Average: 0.81 → Treated as single confidence level

// Needed
Classify each:
- painPoint: PROVEN (0.95) — from enrichment
- pattern: HIGH-CONFIDENCE (0.85) — from location inference
- challenge: HIGH-CONFIDENCE (0.65) — from heuristic
Overall: HIGH-CONFIDENCE (not average, but minimum of supporting evidence)
```

---

## Implementation Path (Lowest Risk → Highest Risk)

### Phase 1: Evidence Validation (SAFE)
**Prerequisite**: Modify extractLeadIntelligence to classify evidence types  
**Change**: Add layer between Truth Discovery and Relevance Selection  
**Impact**: Won't break existing email generation, just adds gating before it  
**Code location**: New `lib/b2b-evidence-validator.ts`

### Phase 2: Confidence-based Framing (SAFE)
**Prerequisite**: Evidence classification from Phase 1  
**Change**: Modify RRTA generator to modulate framing by confidence  
**Impact**: Same output structure, different wording based on confidence  
**Code location**: Modify `lib/b2b-rrta-generator.ts`

### Phase 3: Relevance Selection (MODERATE)
**Prerequisite**: Evidence validation + confidence scoring  
**Change**: Add selection layer that picks 1 truth from N  
**Impact**: Requires defining service scope (what do we actually solve?)  
**Code location**: New `lib/b2b-relevance-selector.ts`

### Phase 4: Readiness Detection (MODERATE)
**Prerequisite**: Nothing; independent layer  
**Change**: Analyze prospect signals to classify readiness  
**Impact**: Changes rendering strategy, not generation  
**Code location**: New `lib/b2b-readiness-detector.ts`

### Phase 5: Insight Selection & Framing (MODERATE)
**Prerequisite**: Relevance + Readiness in place  
**Change**: Rename/refactor RRTA generator to Insight Selector  
**Impact**: Shifts thinking upstream, outputs single selected insight  
**Code location**: New `lib/b2b-insight-selector.ts` (replaces part of rrta-generator)

### Phase 6: Renderer Separation (MODERATE)
**Prerequisite**: Insight Selection in place  
**Change**: Separate Email/Card/Page/Conversation into distinct renderers  
**Impact**: Each renderer knows it's expressing a single insight, not independently generating  
**Code location**: New `lib/b2b-renderers/` directory with cardRenderer, emailRenderer, pageRenderer, conversationRenderer

---

## Summary Table

| Layer | Current Status | Gap | Risk | Priority |
|-------|---|---|---|---|
| 1. Discovery | ✅ Partial | Minimal discovery structure | Low | P3 |
| 2. Truth Discovery | ✅ Partial | No selection (finds all) | Low | P3 |
| 3. Evidence Validation | ❌ Missing | Critical for safety | High | P1 |
| 4. Confidence Scoring | ⚠️ Partial | Not used for framing | Medium | P2 |
| 5. Relevance Selection | ❌ Missing | Needed for focus | High | P1 |
| 6. Readiness Detection | ❌ Missing | Needed for timing | High | P1 |
| 7. Insight Selection & Framing | ⚠️ Partial (as Generator) | Needs upstream shift | Medium | P2 |
| 8. Renderers | ⚠️ Partial | Need separation | Medium | P2 |

---

## Database State

**B2B Tables** (exist in PostgreSQL, not in Prisma schema):
- `b2b_leads` — Lead records with enrichment fields
- `b2b_outreach` — Email records with RRTA components
- `b2b_email_events` — Engagement tracking

**Gap**: Prisma schema doesn't include B2B models (using raw queries instead)

**Recommendation**: Audit whether Prisma schema should be updated (low priority, doesn't block logic implementation)

---

## Conclusion

**The existing system is solid for Phase 1 (Intelligence → RRTA → Validate → Email).**

**It needs architectural layers added, not rebuilt:**

1. Add Evidence Validation gate before RRTA generation
2. Add confidence-based framing modulation
3. Add Relevance Selection (upstream of RRTA)
4. Add Readiness Detection (informs rendering strategy)
5. Shift RRTA from Generator to Insight Selector (upstream thinking only)
6. Separate renderers (downstream expressing only)

**Safe path**: Layers 1-6 can be added without touching working email generation. Each extends the pipeline without replacing it.

**Next step**: User approval to proceed with Phase 1 (Evidence Validation) design.
