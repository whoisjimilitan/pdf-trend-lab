# Phase B: Observer Engine — COMPLETE

**Date**: 2026-06-13  
**Status**: Implementation complete. Ready for testing and deployment to shadow mode.

---

## What Was Built

### 1. Insight Object Type (`lib/b2b-insight-object.ts`)

**Purpose**: Immutable contract between Observer Engine and all renderers.

**Core design**:
- Immutable meaning (statement, painPoint, opportunity cannot change)
- Optional context fields (framingLevel, framingGuidance) for operational use
- Evidence and contradictions included with full provenance
- Locked after creation with `_locked: true` marker
- Type guards and validation functions prevent unauthorized modification

**Key fields**:
- `insightId` — Unique identifier
- `insightType` — Type of insight (customer_relocation, consistency_challenge, etc.)
- `insight.statement` — Core claim (immutable)
- `insight.painPoint` — What prospect experiences
- `insight.opportunity` — What solving enables
- `confidence` — 0.0–1.0 continuous score
- `status` — APPROVED, PENDING_MORE_EVIDENCE, or REJECTED_FOR_NOW
- `framingLevel` — assertive, gentle, or speculative
- `readiness` — ready_now, ready_later, or emerging
- `evidenceSources` — Full provenance of each evidence piece
- `contradictions` — All contradictions with explanation and penalty

**Type guards**: `isInsightObject()`, `validateInsightImmutability()`, `getInsightMeaning()`

---

### 2. Evidence Validation Engine (`lib/b2b-evidence-validation-engine.ts`)

**Purpose**: Validate individual insights against evidence. Produce confidence scores. Handle contradictions.

**Algorithm**:
1. Calculate confidence from weighted evidence sources
2. Apply contradiction penalties (scale -0.05 to -1.0 based on level)
3. Determine status (APPROVED/PENDING/REJECTED) based on confidence thresholds
4. Determine framing level (assertive/gentle/speculative)
5. Create InsightObject if approved

**Confidence thresholds** (mirrors current system):
- PROVEN: >= 0.85
- HIGH_CONFIDENCE: >= 0.70
- MODERATE: >= 0.55
- LOW: >= 0.40
- SPECULATION: < 0.40

**Status logic** (mirrors current system):
- APPROVED: confidence >= 0.55 AND no FATAL contradictions
- PENDING_MORE_EVIDENCE: confidence 0.40–0.55 OR MODERATE contradictions (2+)
- REJECTED_FOR_NOW: confidence < 0.40 OR FATAL contradictions

**Parity checking**: Logs divergences when observer decision differs from current system

**Functions**:
- `validateInsight()` — Validate single insight
- `batchValidateInsights()` — Validate multiple in parallel

---

### 3. Readiness Detection Engine (`lib/b2b-readiness-detection-engine.ts`)

**Purpose**: Determine WHEN prospect will be ready for an insight.

**Three states**:
- **ready_now** — Problem is active right now (urgent)
  - Signals: Recent location change, revenue decline, customer retention drop
  - Rendering: Direct CTA, urgent tone, solve-now positioning
  
- **ready_later** — Problem exists but not urgent (3-12 months)
  - Signals: Planned expansion, moderate churn, upcoming seasonal peak
  - Rendering: Educational tone, save-for-later CTA, future-readiness
  
- **emerging** — Problem not yet visible (12+ months or never)
  - Signals: No immediate signals, low historical activation rate
  - Rendering: Thought leadership, consider-now CTA, awareness plant

**Signals evaluated**:
- Location data (recent change, churn rate)
- Business metrics (revenue, retention, growth rate)
- Operational patterns (seasonality, expansion plans)
- Temporal signals (days until problem likely, historical activation)

**Functions**:
- `detectReadiness()` — Score readiness and determine state
- `applyReadinessToInsight()` — Update insight with readiness result
- `getReadinessSignalsForInsightType()` — Example signal extraction

---

### 4. Relevance Selection Engine (`lib/b2b-relevance-selection-engine.ts`)

**Purpose**: Choose single MOST RELEVANT insight from multiple approved candidates.

**Selection formula** (mirrors current system):
1. Readiness multiplier (ready_now: 3x, ready_later: 1.5x, emerging: 1x)
2. Confidence multiplier (0.0–1.0)
3. Evidence boost (number of sources, capped at +0.2)
4. Final score: 0.0–3.0

**Selection criteria** (in order):
1. ready_now state (3x multiplier dominates)
2. High confidence (0.85+ receives higher boost)
3. More evidence sources (better support)

**Output**:
- Selected insight
- Selection reasoning
- Rejection reasons for alternatives
- Divergence detection vs current system

**Functions**:
- `selectMostRelevant()` — Select from multiple candidates
- `filterAndSelect()` — Filter to approved only, then select

---

### 5. Phase B Orchestrator (`lib/b2b-phase-b-orchestrator.ts`)

**Purpose**: Bring all components together. Main entry point for shadow mode.

**Flow**:
```
Input: Enrichment data + candidate insights
  ↓
Validate each insight (Evidence Validation Engine)
  ↓
Detect readiness for approved insights (Readiness Detection Engine)
  ↓
Select best insight (Relevance Selection Engine)
  ↓
Output: Single InsightObject (or null)
```

**Input type** (`ObserverEngineInput`):
- prospectId, businessName
- Array of candidate insights with evidence and contradictions
- Lead metadata (category, locations, enrichment level)
- Current system decision (for parity checking)

**Output type** (`ObserverEngineOutput`):
- selectedInsight (InsightObject or null)
- status (success, no_approved_insights, error)
- reason (human-readable explanation)
- shadowModeMetrics (candidates evaluated, approved, divergence detected)

**Functions**:
- `runObserverEngine()` — Main pipeline
- `testParityOnProspect()` — Compare to current system for single prospect
- `batchParityTest()` — Parity validation across 100+ prospects

---

### 6. Parity Validation Test (`lib/__tests__/b2b-parity-validation.test.ts`)

**Purpose**: Verify Observer Engine makes identical decisions as current system.

**Success criteria**:
- 95%+ decision parity on representative 100-prospect dataset
- All divergences logged and explained
- Zero hidden divergence

**Test structure**:
- Individual prospect tests (validate specific decisions)
- Readiness detection tests (verify timing logic)
- Evidence validation tests (verify contradiction handling)
- Batch parity test (overall match rate)
- Immutability test (InsightObject is locked)
- Divergence detection test (observer logs differences)

**Mock data**: 10 representative prospects covering:
- pharmacy (customer relocation)
- dental (consistency challenge)
- retail (low confidence / awareness only)

**Run test**:
```bash
npx jest lib/__tests__/b2b-parity-validation.test.ts
```

---

## Phase B System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Observer Engine                             │
│                  (Shadow Mode, Phase B)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input: Enrichment Data + Candidate Insights                     │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Evidence Validation Engine                                 │ │
│  │  - Calculate confidence (0.0–1.0)                           │ │
│  │  - Detect contradictions (WEAK/MODERATE/FATAL)             │ │
│  │  - Determine status (APPROVED/PENDING/REJECTED)            │ │
│  │  - Determine framing (assertive/gentle/speculative)        │ │
│  │  → InsightObject (if approved)                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Readiness Detection Engine                                 │ │
│  │  - Evaluate location, business, operational signals         │ │
│  │  - Determine readiness state (ready_now/later/emerging)     │ │
│  │  - Estimate timeline                                        │ │
│  │  → Apply readiness to InsightObject                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Relevance Selection Engine                                 │ │
│  │  - Score each approved insight (readiness × confidence)     │ │
│  │  - Select highest-scoring insight                           │ │
│  │  - Log rejection reasons for alternatives                   │ │
│  │  → Single InsightObject (winner)                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│    ↓                                                              │
│  Output: InsightObject (locked, immutable) or null               │
│                                                                   │
│  Parallel operation:                                             │
│  - Observer Engine runs alongside current system                │
│  - No decisions influenced                                       │
│  - All outcomes logged to ValidationLog table                   │
│  - Divergences tracked for analysis                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Created

1. **lib/b2b-insight-object.ts** — Immutable insight type (185 lines)
2. **lib/b2b-evidence-validation-engine.ts** — Validation logic (270 lines)
3. **lib/b2b-readiness-detection-engine.ts** — Readiness determination (230 lines)
4. **lib/b2b-relevance-selection-engine.ts** — Insight selection (200 lines)
5. **lib/b2b-phase-b-orchestrator.ts** — Main entry point (250 lines)
6. **lib/__tests__/b2b-parity-validation.test.ts** — Test suite (280 lines)

**Total**: ~1,415 lines of typed, documented code

---

## Key Design Principles (Locked)

### 1. Immutability

InsightObject is created once and locked:
```typescript
export interface InsightObject {
  readonly _locked: true
  insight: {
    statement: string      // Cannot change
    painPoint: string      // Cannot change
    opportunity: string    // Cannot change
  }
  // Context fields can be used by renderers, but meaning is fixed
}
```

Renderers never modify the insight. They only express it at different depths.

### 2. Parity First, Evolution Second

Observer Engine initially replicates current system logic exactly:
- Same confidence calculation
- Same status determination
- Same framing rules
- Same readiness signals

Only after 95%+ parity is proven can evolution begin.

### 3. No Hidden Divergence

All differences between observer and current system are:
- **Logged explicitly** (not silent)
- **Explained in detail** (reason documented)
- **Analyzed** (divergence report generated)
- **Approved** (decision made to keep or adjust)

### 4. Multi-Signal Hierarchy

Selection uses multiple signals, weighted in order:
1. Readiness state (ready_now > ready_later > emerging)
2. Confidence level (high > moderate > low)
3. Evidence sources (more > fewer)

Single signal (confidence alone) does not determine output.

### 5. Non-Authoritative Until Proven

Observer Engine makes no decisions in shadow mode:
- Logs everything
- Influences nothing
- Parallel to current system
- Zero behavioral change

Promotion to authority is data-driven only (1000 samples + all metrics).

---

## Constraints Locked (from PHASE_B_CONSTRAINTS.md)

### ✅ Constraint 1: Promotion Thresholds Are Calibration Parameters

The initial thresholds (MIN_SAMPLES: 1000, MIN_CONVERSION_IMPROVEMENT: 0.15, etc.) are subject to adjustment based on observed variance in shadow mode.

**Why**: Real performance data determines whether thresholds are too tight (system never promotes) or too loose (promotes prematurely).

### ✅ Constraint 2: Authority Transition Rules Are Guardrails

Authority transition is a system-level guardrail, not immutable policy. Engineering override must remain possible for debugging, testing, and rollback.

**Why**: Humans must retain the ability to intervene without being locked out.

### ✅ Constraint 3: Observer Engine Must NOT Diverge Hidden

Observer Engine logs differences only. No implicit logic diverges from current system. All changes are explicit and logged.

**Why**: If observer engine diverges silently in Phase B, you won't know which system is better during shadow mode.

---

## Testing Strategy

### Parity Validation Test (Pre-Deployment)

**Goal**: Verify Observer Engine matches current system on 100 representative prospects.

**Execution**:
```bash
npx jest lib/__tests__/b2b-parity-validation.test.ts
```

**Success Criteria**:
- ✅ 95%+ decision parity
- ✅ All divergences logged
- ✅ Zero unexpected behavior

**Failure Action**:
- Analyze divergences
- Adjust Observer Engine logic to match current system
- Re-test
- Do NOT deploy with <95% parity

### Shadow Mode Monitoring (Post-Deployment)

Once deployed to shadow mode with `EVIDENCE_VALIDATION_MODE=shadow`:

**Daily monitoring**:
- Check ValidationLog table for divergences
- Analyze systematic patterns
- Verify non-blocking logging (no failures in production)
- Monitor promotion threshold metrics

**Weekly analysis**:
- Generate divergence report
- Review edge cases
- Adjust Observer Engine if needed (with testing)
- Track progress toward promotion thresholds

**Promotion readiness check**:
- Every 1000 samples: run `shouldPromoteToAuthority()`
- If all metrics met: ready for Phase C (authority transition decision)
- If not: continue collecting data, adjust thresholds if needed

---

## Deployment Checklist

- [ ] Database migration applied (Phase A)
- [ ] Phase B code compiled (no TypeScript errors)
- [ ] Parity validation test passes (95%+ match)
- [ ] All divergences analyzed and approved
- [ ] EVIDENCE_VALIDATION_MODE environment variable configured
- [ ] Feature flag deployment (set to "shadow" mode)
- [ ] ValidationLog table monitored (logs flowing)
- [ ] Promotion threshold tracking enabled
- [ ] Daily divergence reports scheduled

---

## What Happens Next

### Phase C: Authority Transition (After 1000+ shadow samples)

When promotion thresholds met:
1. Change EVIDENCE_VALIDATION_MODE to "authority"
2. Observer Engine now makes production decisions
3. Current system becomes observer
4. Validation logic takes over

### Phase D: Prospect Page Renderer

Build the prospect-facing page that uses InsightObject:
- Renders insight statement with appropriate framing level
- Displays evidence sources (optional)
- Drives page engagement metrics
- Captures dwell time and scroll depth as learning signals

### Phase E: Card Renderer

Operator-facing card showing:
- Insight type
- Confidence score
- Evidence summary
- Readiness state
- Rendering strategy guidance

### Phase F: Email Renderer

Modify existing RRTA email generator to accept InsightObject:
- Subject line template based on framing level
- Body copy based on readiness state
- CTA based on urgency level

### Phase G: Conversation Renderer

Conversation turn that references InsightObject:
- Opening statement (mirror of email)
- Evidence (if trust sufficient)
- Next-step CTA

---

## Success Metrics

**Phase B is successful when**:

✅ Observer Engine built (all 4 core engines complete)  
✅ Parity validation test passes (95%+ match)  
✅ Deployed to shadow mode without incidents  
✅ Logging non-blocking (no production impact)  
✅ Divergences explicitly tracked and analyzed  
✅ Zero hidden divergence detected  
✅ Promotion threshold metrics flowing into ValidationLog  
✅ Ready to deploy Phase C (authority transition decision)  

---

## Key Files Reference

- **Constraints**: [PHASE_B_CONSTRAINTS.md](PHASE_B_CONSTRAINTS.md)
- **Prime Directive**: [PRIME_DIRECTIVE.md](PRIME_DIRECTIVE.md)
- **Validation Logger**: [lib/b2b-validation-logger.ts](lib/b2b-validation-logger.ts)
- **Feature Flags**: [lib/evidence-validation-flags.ts](lib/evidence-validation-flags.ts)

---

**Status**: Phase B implementation complete. Ready for parity testing and shadow mode deployment.

Next step: Run parity validation test before deploying to production.
