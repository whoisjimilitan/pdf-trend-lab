# Current System Baseline

**Date**: 2026-06-13  
**Status**: v1-audit-resolved-stable  
**Commit**: 0e2c9ab  
**Lock Date**: 2026-06-13

---

## System State

### What is LIVE

1. **Production Email Generation Pipeline**
   - Path: lib/b2b-conversion-engine.ts
   - Input: EnrichedLead
   - Output: Email (subject, body, CTA) + Prospect page URL
   - Validation: RRTA 4/4 required
   - Status: ✅ OPERATIONAL

2. **Shadow Observer Pipeline** 
   - Path: lib/b2b-shadow-observer.ts
   - Input: Candidate insights + prospect context
   - Processing: Evidence validation → Readiness detection → Relevance selection → Logging
   - Output: Validation log (non-authoritative)
   - Influence on production: NONE
   - Status: ✅ OPERATIONAL

3. **Expression-Only Renderers**
   - Card renderer: 1–3 sentence observation
   - Email renderer: 3–8 paragraph expansion
   - Prospect page renderer: HTML page structure
   - Logic in renderers: ZERO
   - Status: ✅ OPERATIONAL

4. **Page Engagement Tracking**
   - Table: PageEngagementLog
   - Functions: recordPageView, recordScrollDepth, recordDwellTime, recordCTAClick, recordReturnVisit
   - Concurrency safety: Atomic increments (Prisma { increment: 1 })
   - Uniqueness: (prospectId, insightId) unique constraint
   - Status: ✅ OPERATIONAL

5. **Validation Logging**
   - Table: ValidationLog
   - Trigger: Evidence validation engine (shadow mode)
   - Fields: decision reasoning, confidence, evidence, contradictions, outcomes
   - Influence on production: ZERO
   - Status: ✅ OPERATIONAL

---

## Immutable Contracts

### Insight Object (FROZEN)

```typescript
interface Insight {
  insightId: string
  insightType: string
  
  statement: string           // Core observation
  painPoint: string           // Problem statement
  opportunity: string         // Solution/opportunity
  
  confidence: number          // 0.0–1.0
  
  evidenceSources: EvidenceSource[]
  contradictions: Contradiction[]
  
  status: InsightStatus       // APPROVED | PENDING_MORE_EVIDENCE | REJECTED_FOR_NOW
  framingLevel: FramingLevel  // assertive | gentle | speculative
  
  validatedAt: Date
  validationId: string
}
```

**Guarantees:**
- Immutable once created
- Never modified after validation
- Sufficient for all renderer depths
- No new fields may be added

### PageEngagementLog Table (FROZEN)

```sql
CREATE TABLE "PageEngagementLog" (
  id                   TEXT PRIMARY KEY,
  prospectId           TEXT NOT NULL,
  insightId            TEXT NOT NULL,
  validationId         TEXT NOT NULL,
  pageViewed           BOOLEAN DEFAULT false,
  viewedAt             TIMESTAMP,
  dwellTimeSeconds     INTEGER,
  scrollDepthPercent   REAL,
  ctaClicks            INTEGER DEFAULT 0,
  ctaClickedAt         TIMESTAMP,
  returnVisits         INTEGER DEFAULT 0,
  lastVisitAt          TIMESTAMP,
  createdAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (prospectId, insightId)
);
```

**Guarantees:**
- One log per (prospectId, insightId) pair
- Atomic counter increments (no race conditions)
- Indexes on prospectId, insightId, validationId, createdAt

---

## Architecture Principles (LOCKED)

### Shadow Observer Pattern

✅ **Non-authoritative**: Never influences production decisions  
✅ **Observable**: All decisions logged for analysis  
✅ **Non-blocking**: Async, failures don't affect production  
✅ **Isolated**: Separate from production pipeline  

### Expression-Only Renderers

✅ **Zero logic**: No scoring, no ranking, no decisions  
✅ **Pure functions**: Same input → same output always  
✅ **Immutable input**: Cannot modify Insight data  
✅ **Variable depth**: Card < Email < Page (same insight)  

### Atomic Operations

✅ **Race-condition-free**: ctaClicks { increment: 1 }  
✅ **Concurrent-safe**: Prisma atomic increment operators  
✅ **Unique constraints**: (prospectId, insightId) enforced  
✅ **Consistent state**: Single source of truth per pair  

---

## System Topology

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION PIPELINE (Authoritative)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Lead Intelligence → RRTA Generation → Email Assembly      │
│         ↓                    ↓              ↓                │
│  (extractLeadIntelligence) (validateRRTA) (generateSubject) │
│                                                             │
│  Output: Email (subject, body, CTA) + Page URL             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SHADOW PIPELINE (Non-Authoritative, Learning Only)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Candidate Insights → Evidence Validation → Readiness       │
│           ↓                    ↓              ↓               │
│      (buildInsight)    (validateInsight) (detectReadiness)  │
│                                                             │
│  → Relevance Selection → Validation Logging                │
│         ↓                      ↓                             │
│  (filterAndSelect)      (logValidationDecision)            │
│                                                             │
│  Output: ValidationLog (ZERO influence on production)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ENGAGEMENT TRACKING PIPELINE (Observable)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Page View → Scroll Depth → Dwell Time → CTA Click         │
│       ↓           ↓             ↓            ↓              │
│  (recordPageView) (recordScrollDepth) (recordCTAClick)    │
│                                                             │
│  Output: PageEngagementLog (atomic, race-condition-free)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXPRESSION RENDERERS (Pure Functions)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Insight → Card (1–3 sentences)                            │
│         → Email (3–8 paragraphs)                           │
│         → Page (HTML structure)                            │
│                                                             │
│  No logic. No decisions. Expression only.                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Production Path

```
Lead 
  ↓ extractLeadIntelligence()
EnrichedLead (confidence, pain_point, opportunity, category)
  ↓ validateIntelligenceSufficiency()
✓ Valid
  ↓ generateRRTACopy()
RRTACopy (recognition, relief, trust, action)
  ↓ validateRRTA()
✓ RRTA 4/4
  ↓ ensureProspectPageExists()
ProspectPage (id, url)
  ↓ generateSubject() + buildEmailBody() + generateCTAText()
ConversionEngineResult (subject, body, cta_text, cta_link)
  ↓
✉️ Email Sent
```

**No shadow influence at any point.**

### Shadow Path

```
CandidateInsight[]
  ↓ validateInsight()
ValidationResult (insightObject: Insight | null, confidence, status)
  ↓ detectReadiness()
ReadinessResult (readiness, urgency, likelihood)
  ↓ filterAndSelect()
SelectionResult (selectedInsight: Insight, rejectedAlternatives)
  ↓ logValidationDecision()
ValidationLog (persisted, non-blocking async)
  ↓
📊 Analytics Only
```

**Zero influence on production emails or prospect experience.**

---

## Critical Constraints

### Production Pipeline

❌ NO shadow decisions influence email generation  
❌ NO readiness scoring changes prospect messaging  
❌ NO engagement signals change copy tone  
✅ Intelligence only (extractLeadIntelligence)  
✅ RRTA validation only (validateRRTA 4/4 required)  
✅ Prospect page generation only (placeholder URL)  

### Shadow Pipeline

❌ NO production decisions stored in ValidationLog  
❌ NO authority mode active (learning mode only)  
❌ NO blocking operations (all async, non-blocking)  
✅ Evidence validation only  
✅ Decision logging only  
✅ Non-authoritative observations only  

### Engagement Tracking

❌ NO scoring logic in page view recording  
❌ NO ranking logic in engagement aggregation  
❌ NO optimization attempts based on signals  
✅ Atomic counter increments only  
✅ Behavior logging only  
✅ Concurrent-safe operations only  

### Renderers

❌ NO logic in render functions  
❌ NO decisions in render functions  
❌ NO new claims beyond Insight fields  
✅ Expression only  
✅ Pure functions only  
✅ Immutable input respect only  

---

## What Can Change Next

### Phase 2: Insight Approval Workflow
- Evidence validation engine refinement
- Approval criteria definition
- Candidate pool management
- STATUS: Ready to implement

### Phase 3: Engagement Signal Interpretation
- Page dwell time analysis
- CTA click patterns
- Scroll depth correlation
- Readiness signal extraction
- STATUS: Ready to implement (uses PageEngagementLog)

### Phase 4: Prospect Page Rendering
- Replace createProspectPage() placeholder with renderProspectPage()
- Wire Insight data to HTML renderer
- Deploy rendered pages
- STATUS: Ready to implement (renderers are complete)

### Phase 5: Recognition → Relief → Trust → Action Pipeline
- Transform ValidationLog insights into prospect messaging
- Apply psychology framework (Bencivenga, Kennedy, AWAI)
- Shadow test new messaging strategies
- A/B test outcomes
- STATUS: Ready to design

### Phase 6: Shadow-to-Authority Promotion
- Statistical analysis of shadow decisions
- Promotion criteria definition
- Gradual authority increase (shadow only → 10% authority → 25% → ...)
- STATUS: Ready to design

---

## System Health Checks

Run these commands weekly:

```bash
# Validate schema
npx prisma validate

# Check TypeScript
npx tsc --noEmit lib/ --skipLibCheck

# Verify atomic operations
grep "{ increment:" lib/page-engagement-tracker.ts

# Verify shadow isolation
grep -c "recordValidationObservation\|logValidationDecision" lib/b2b-conversion-engine.ts
# Expected: 0 (production never calls shadow logging)

# Verify renderer purity
grep -c "if\|switch\|for\|while" lib/renderers/*.ts
# Expected: minimal (only schema expressions)
```

---

## Restore Points

If any phase breaks, use these:

```bash
# Full system to latest stable
git checkout v1-audit-resolved-stable

# Engagement tracking only
git checkout v1-engagement-instrumentation-stable

# Renderers only
git checkout v1-renderer-foundation-stable

# Core shadow architecture
git checkout v1-shadow-architecture-stable
```

---

## Next Phase Gate Checks

Before starting Phase 2+, verify:

✅ All four freeze points exist  
✅ Production pipeline still generates emails  
✅ Shadow pipeline still logs validation decisions  
✅ Page engagement tracking still atomic  
✅ Renderers still pure expressions  
✅ TypeScript: zero errors  
✅ Prisma: valid schema  

If any check fails: restore to v1-audit-resolved-stable

---

**This baseline is LOCKED. Do not modify this document without explicit ratification from v1 stakeholders.**
