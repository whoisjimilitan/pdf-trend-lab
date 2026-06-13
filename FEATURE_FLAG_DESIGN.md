# Feature Flag Design: Evidence Validation Engine

**Date**: 2026-06-13  
**Purpose**: Enable safe rollout of Evidence Validation Engine with instant rollback capability  
**Status**: Design (Pre-Implementation)

---

## Core Principle

**New validation layer should NOT be mandatory on day one.**

The Evidence Validation Engine needs to run in parallel with current production path, not replace it. This allows:
- ✅ Instant rollback (flip flag, revert to current path)
- ✅ A/B testing (measure quality improvement)
- ✅ Zero-risk deployment (old path always available)
- ✅ Shadow validation (collect data without affecting production)

---

## Feature Flag Implementation

### Environment Variable

```
EVIDENCE_VALIDATION_ENABLED=false (default)
```

**Values**:
- `false` = Run current path (no Evidence Validation)
- `true` = Run Evidence Validation path
- `"shadow"` = Run both paths in parallel, log results (future)

---

## Code Implementation

### 1. Configuration Module

**File**: `lib/feature-flags.ts` (NEW)

```typescript
export const EVIDENCE_VALIDATION_ENABLED = 
  process.env.EVIDENCE_VALIDATION_ENABLED === "true"

export const isEvidenceValidationEnabled = (): boolean => {
  return EVIDENCE_VALIDATION_ENABLED
}

// For shadow mode (future):
export const isShadowValidationMode = (): boolean => {
  return process.env.EVIDENCE_VALIDATION_ENABLED === "shadow"
}
```

---

### 2. Conversion Engine Integration

**File**: `lib/b2b-conversion-engine.ts`

**Location**: Phase 1.5 insertion point (after intelligence extraction, before RRTA generation)

```typescript
import { isEvidenceValidationEnabled } from "./feature-flags"

export async function generateOutboundEmail(
  request: ConversionEngineRequest
): Promise<ConversionEngineResult | ConversionEngineError> {
  try {
    const { lead, context, triggerEvent } = request

    // ===== PHASE 1: INTELLIGENCE EXTRACTION =====
    const intelligence = extractLeadIntelligence(lead)

    const sufficiency = validateIntelligenceSufficiency(intelligence)
    if (!sufficiency.valid) {
      return { approved: false, rejection_reason: ... }
    }

    // ===== PHASE 1.5: EVIDENCE VALIDATION (FEATURE FLAGGED) =====
    let insightObject: InsightObject | undefined
    
    if (isEvidenceValidationEnabled()) {
      // NEW PATH: Evidence Validation enabled
      insightObject = await validateEvidence(lead, intelligence)
      
      // Check status
      if (insightObject.status === "REJECTED_FOR_NOW") {
        return {
          approved: false,
          rejection_reason: insightObject.statusReason,
          rejection_type: "evidence_rejected",
          prospectStatus: "REJECTED_FOR_NOW"
        }
      }
      
      if (insightObject.status === "PENDING_MORE_EVIDENCE") {
        return {
          approved: false,
          rejection_reason: insightObject.statusReason,
          rejection_type: "evidence_pending",
          prospectStatus: "PENDING_MORE_EVIDENCE"
        }
      }
      
      // insightObject.status === "APPROVED"
      console.log(`✅ Evidence validated: ${insightObject.insightType}`)
    } else {
      // OLD PATH: Evidence Validation disabled (production fallback)
      // Create minimal InsightObject from intelligence for compatibility
      insightObject = createFallbackInsightObject(lead, intelligence)
      console.log(`⚠️ Evidence validation disabled - using fallback path`)
    }

    // ===== PHASE 2: RRTA COPY GENERATION =====
    // Now accepts InsightObject regardless of which path was taken
    const rrta = generateRRTACopy(
      lead.business_name,
      lead.category || "business",
      insightObject
    )

    // ===== PHASE 3: RRTA VALIDATION =====
    const validation = validateRRTA(rrta)
    if (!validation.passed) {
      return {
        approved: false,
        rejection_reason: explainValidationFailure(validation),
        rejection_type: "rrta_validation_failed"
      }
    }

    // ... rest of pipeline (unchanged) ...

    const result: ConversionEngineResult = {
      approved: true,
      insightObject,  // Include for learning/tracking
      // ... rest of result ...
    }

    return result
  } catch (error) {
    // ... error handling ...
  }
}
```

---

### 3. Fallback Insight Object Creator

**File**: `lib/b2b-conversion-engine.ts` (helper function)

```typescript
/**
 * Create minimal InsightObject when Evidence Validation is disabled.
 * Allows new code path to work with old validation logic.
 */
function createFallbackInsightObject(
  lead: EnrichedLead,
  intelligence: LeadIntelligence
): InsightObject {
  return {
    insightId: generateId(),
    insightType: "fallback_from_intelligence",
    leadId: lead.id,
    businessName: lead.business_name,
    
    confidence: intelligence.confidence,
    confidenceBand: "HIGH_CONFIDENCE", // Assume all current sends are HIGH_CONFIDENCE
    
    evidenceSources: [
      {
        sourceId: "legacy_intelligence",
        sourceName: "Extracted from legacy intelligence",
        strength: intelligence.confidence,
        weight: 1.0
      }
    ],
    
    contradictions: [], // No contradiction detection in fallback
    
    status: "APPROVED", // Always approve in fallback (current behavior)
    statusReason: "Fallback path - evidence validation disabled",
    
    selectedBecause: "Using fallback path (evidence validation disabled)",
    rejectedInsights: [],
    
    framingLevel: intelligence.confidence >= 0.75 ? "assertive" : "gentle",
    framingGuidance: {
      tone: "professional",
      specificity: "specific",
      presupposition: "Based on available intelligence"
    },
    
    validatedAt: new Date(),
    validationId: `fallback_${Date.now()}`,
    validationMetadata: {
      leadCategory: lead.category || "unknown",
      leadLocations: lead.location_count || 1,
      enrichmentLevel: getEnrichmentLevel(lead),
      discoveryMethod: "fallback_path"
    },
    
    insight: {
      statement: intelligence.pain_point || "operational challenge",
      painPoint: intelligence.pain_point || "",
      opportunity: "Improving operations and consistency"
    },
    
    _locked: true
  }
}
```

---

## Rollout Strategy

### Phase 1: Deploy with Flag OFF

**Duration**: 3-5 days

**Configuration**:
```
EVIDENCE_VALIDATION_ENABLED=false
```

**What Happens**:
- Code deployed to production
- Evidence Validation Engine is loaded but NOT called
- All emails go through fallback path
- Fallback InsightObjects are created
- Everything behaves like current system

**Monitoring**:
- Email send rate (should be identical)
- Email open rate (should be identical)
- Reply rate (should be identical)
- Error logs (should be no new errors)

**Success Criteria**:
- ✅ Zero impact on production metrics
- ✅ No new errors in logs
- ✅ Same email volume as before

---

### Phase 2: Enable for Shadow Validation

**Duration**: 3-7 days

**Configuration**:
```
EVIDENCE_VALIDATION_ENABLED=shadow
```

**Code for Shadow Mode** (future enhancement):

```typescript
if (isShadowValidationMode()) {
  try {
    const realInsightObject = await validateEvidence(lead, intelligence)
    
    // Run real validation in parallel
    const shadowResult = {
      validationId: realInsightObject.validationId,
      status: realInsightObject.status,
      confidence: realInsightObject.confidence,
      selectedInsightType: realInsightObject.insightType,
      timestamp: new Date()
    }
    
    // Log to shadow_validation_logs table (for analysis)
    await logShadowValidation(shadowResult)
    
    // But use fallback path for actual email
    insightObject = createFallbackInsightObject(lead, intelligence)
    
    console.log(`📊 Shadow validation: ${realInsightObject.status}`)
  } catch (error) {
    console.error(`Shadow validation error (non-blocking): ${error}`)
    // Fallback to current path on error
    insightObject = createFallbackInsightObject(lead, intelligence)
  }
}
```

**What Happens**:
- Real Evidence Validation runs in parallel with production path
- Results are logged but NOT used for email decision
- All emails still go through fallback path
- Data collected for analysis

**Monitoring**:
- Compare shadow validation results vs production decisions
- Measure: How many would be rejected? How many would be marked PENDING?
- Confidence distribution in shadow vs production

**Success Criteria**:
- ✅ Shadow validation runs without errors
- ✅ Understand impact of new logic (what would change?)
- ✅ Data shows new engine is ready

---

### Phase 3: Enable for New Prospects Only

**Duration**: 5-10 days

**Configuration**:
```
EVIDENCE_VALIDATION_ENABLED=true
```

**Code Modification** (optional):

```typescript
// Only enable for new prospects, not existing ones
if (isEvidenceValidationEnabled() && isNewProspect(lead)) {
  insightObject = await validateEvidence(lead, intelligence)
  // ... handle status ...
} else {
  insightObject = createFallbackInsightObject(lead, intelligence)
}
```

**What Happens**:
- New prospects entering system use Evidence Validation
- Existing prospects continue on fallback path
- Gradual rollout reduces risk

**Monitoring**:
- New prospect send rate vs old path
- Compare APPROVED/PENDING/REJECTED distribution
- New prospect email quality metrics

---

### Phase 4: Full Enablement

**Duration**: After Phase 3 proves safe

**Configuration**:
```
EVIDENCE_VALIDATION_ENABLED=true
```

**What Happens**:
- All prospects use Evidence Validation path
- Fallback code still available (instant rollback)
- New system fully live

---

## Instant Rollback

### If Issues Detected

**In production**:
```bash
# Environment variable change
EVIDENCE_VALIDATION_ENABLED=false

# Restart application (or auto-reload)
```

**Result**:
- Immediate revert to current behavior
- No code deployment needed
- All new prospects use fallback path
- No data loss

**Timeline**: < 5 minutes

---

## Monitoring & Alerting

### Key Metrics to Track

**Phase 1 (Flag OFF)**:
```
send_rate: should stay constant
error_rate: should stay constant
fallback_path_usage: should be 100%
```

**Phase 2 (Shadow Mode)**:
```
shadow_validation_errors: should be 0
shadow_validation_conflicts: % where evidence path differs from fallback
shadow_rejected_count: how many prospects would be rejected
shadow_pending_count: how many would be marked PENDING
```

**Phase 3 (New Prospects Only)**:
```
new_prospect_send_rate: vs old prospect rate
new_prospect_email_quality: open rate, reply rate, conversion
evidence_rejected_rate: % of new prospects rejected
evidence_pending_rate: % of new prospects in PENDING state
```

**Phase 4 (Full Enablement)**:
```
overall_email_quality: open rate, reply rate, conversion
rejected_rate: % of all prospects rejected
pending_rate: % of all prospects in PENDING state
average_confidence: distribution of confidence scores
insight_type_distribution: which insights are selected most
```

---

## Rollback Triggers

### Automatic Rollback (if configured)

```typescript
// Pseudo-code for health check
const shouldRollback = () => {
  const metrics = getLastHourMetrics()
  
  return (
    metrics.error_rate > 0.05 || // > 5% errors
    metrics.send_rate < previousBaseline * 0.95 || // Send rate dropped >5%
    metrics.evidence_validation_failures > 10 // Too many failures
  )
}

if (shouldRollback()) {
  console.error("🚨 ROLLBACK TRIGGERED")
  setEnvironmentVariable("EVIDENCE_VALIDATION_ENABLED", "false")
  notifyOncall("Evidence validation engine rolled back automatically")
}
```

### Manual Rollback

```bash
# Quick rollback command
EVIDENCE_VALIDATION_ENABLED=false app/restart

# Or via dashboard/admin panel
```

---

## Testing

### Pre-Deployment Testing

Before Phase 1 deployment:

```typescript
// Test fallback path works correctly
test("fallback insight object creation", async () => {
  const lead = mockLead()
  const intelligence = mockIntelligence()
  
  const fallback = createFallbackInsightObject(lead, intelligence)
  
  expect(fallback.status).toBe("APPROVED")
  expect(fallback.confidence).toBe(intelligence.confidence)
  expect(fallback.evidenceSources).toHaveLength(1)
})

// Test evidence validation code doesn't run when disabled
test("evidence validation disabled respects feature flag", async () => {
  process.env.EVIDENCE_VALIDATION_ENABLED = "false"
  
  const result = await generateOutboundEmail(mockRequest)
  
  // Should use fallback
  expect(result.insightObject.validationId).toContain("fallback_")
})

// Test evidence validation runs when enabled
test("evidence validation enabled calls new path", async () => {
  process.env.EVIDENCE_VALIDATION_ENABLED = "true"
  
  const result = await generateOutboundEmail(mockRequest)
  
  // Should use real validation (if configured in test)
  expect(result.insightObject.validationId).not.toContain("fallback_")
})
```

---

## Summary

**Feature Flag Design Provides**:
- ✅ Safe deployment (flag OFF initially)
- ✅ Parallel validation (shadow mode)
- ✅ Gradual rollout (new prospects first)
- ✅ Instant rollback (< 5 minutes)
- ✅ Zero-risk A/B testing
- ✅ Data collection without disruption

**Timeline**:
- Day 1: Deploy with flag OFF
- Days 2-3: Monitor zero-impact behavior
- Days 4-5: Enable shadow validation
- Days 6-7: Analyze shadow results
- Day 8+: Enable for new prospects only
- Day 15+: Full enablement if metrics healthy

**Rollback**:
- One environment variable change
- < 5 minutes to restore current behavior
- No code redeploy needed
- No data loss
