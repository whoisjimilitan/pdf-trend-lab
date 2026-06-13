# Migration Matrix: Current → Proposed Architecture

**Date**: 2026-06-13  
**Purpose**: Explicit decision matrix for each component. Maps current system to proposed Evidence Validation Engine.  
**Status**: Ready for Implementation

---

## Component Actions

### Group A: Reuse As-Is (No Changes)

#### ✅ b2b-rrta-validator.ts

| Aspect | Detail |
|--------|--------|
| **Current Role** | Validates RRTA copy format (Recognition/Relief/Trust/Action structure) |
| **Proposed Role** | Remains RRTA format validator, positioned AFTER evidence validation |
| **Change** | None. Reposition in pipeline only. |
| **Risk** | None. No code changes. |
| **Implementation** | Keep file unchanged. Update b2b-conversion-engine.ts to call after evidence validation. |
| **Testing** | Existing tests pass without modification. |

---

### Group B: Extend (Add Functionality)

#### 🔧 b2b-intelligence-extract.ts

| Aspect | Detail |
|--------|--------|
| **Current Role** | Extracts pain_point, business_pattern, operational_challenge from lead record |
| **Proposed Role** | Same, but with evidence provenance tracking |
| **Changes Needed** | Add evidence source tracking to LeadIntelligence interface |
| **What Gets Added** | evide nceSources array: { sourceId, sourceName, strength, foundAt, rawData, weight } |
| **Backward Compatibility** | ✅ YES — Adding fields, not removing |
| **Risk** | Low. Additive only. |
| **Implementation Steps** | 1. Extend LeadIntelligence interface with evidenceSources<br/>2. Populate evidence sources in each extract function<br/>3. Update confidence calculation to use source weights (weighted sum, not average)<br/>4. Leave existing code path unchanged |
| **Testing** | Add tests for evidence source population. Existing tests should still pass. |

**Current Code**:
```typescript
interface LeadIntelligence {
  pain_point: string
  business_pattern: string
  operational_challenge: string
  confidence: number // 0-1, averaged
}
```

**New Code**:
```typescript
interface LeadIntelligence {
  // ... existing fields ...
  evidenceSources: {
    sourceId: string
    sourceName: string
    strength: number
    foundAt?: string
    rawData?: string
    weight: number
  }[]
  sourceWeights: Map<string, number>
}
```

---

#### 🔧 b2b-conversion-engine.ts

| Aspect | Detail |
|--------|--------|
| **Current Role** | Orchestrates: Intelligence → RRTA → Validation → Email |
| **Proposed Role** | Orchestrates: Intelligence → Evidence Validation → RRTA → Validation → Email |
| **Changes Needed** | Insert new Phase 1.5: Evidence Validation |
| **What Changes** | Add call to validateEvidence() between intelligence extraction and RRTA generation |
| **Backward Compatibility** | ✅ YES — Adding phase, not removing |
| **Risk** | Low. Phases are independent. |
| **Implementation Steps** | 1. Import validateEvidence from new b2b-evidence-validator<br/>2. After intelligence extraction, call validateEvidence<br/>3. Check returned status (APPROVED/PENDING/REJECTED)<br/>4. Handle three states (approve/pending/reject)<br/>5. Pass InsightObject to RRTA generation<br/>6. Log to validation_logs table |
| **Testing** | Add tests for new phase. Verify rejection handling for all three states. |

**Current Flow**:
```typescript
Phase 1: extractLeadIntelligence() → Intelligence object
Phase 2: generateRRTACopy() → RRTACopy
Phase 3: validateRRTA() → RRTA validation result
Phase 4: generateEmail() → Email
```

**New Flow**:
```typescript
Phase 1: extractLeadIntelligence() → Intelligence object
Phase 1.5: validateEvidence() → InsightObject (NEW)
Phase 2: generateRRTACopy(insightObject) → RRTACopy
Phase 3: validateRRTA() → RRTA validation result
Phase 4: generateEmail() → Email
```

---

### Group C: Modify (Signature/Behavior Change)

#### 🔄 b2b-rrta-generator.ts → Email Renderer (Phase 6)

| Aspect | Detail |
|--------|--------|
| **Current Role** | Generates RRTA copy from Intelligence |
| **Proposed Role** | Email Renderer: Expresses InsightObject at email depth |
| **Changes Needed** | 1. Change function signature<br/>2. Use InsightObject instead of Intelligence<br/>3. Use confidence to modulate framing intensity<br/>4. Use framingLevel to set tone |
| **Backward Compatibility** | ⚠️ BREAKING — Signature changes |
| **Risk** | Medium. Requires code changes, but logic stays same. |
| **Timeline** | Phase 2 (after evidence validation exists) |
| **Implementation Steps** | 1. Rename generateRRTACopy → (internal implementation)<br/>2. Create emailRenderer function that accepts InsightObject<br/>3. Use insightObject.confidence for framing<br/>4. Use insightObject.framingLevel for tone<br/>5. Update callers in b2b-conversion-engine |
| **Testing** | Update all tests to pass InsightObject. Verify framing modulates correctly. |

**Current Signature**:
```typescript
generateRRTACopy(
  businessName: string,
  category: string,
  intelligence: LeadIntelligence
): RRTACopy
```

**New Signature** (Phase 6):
```typescript
async function renderEmail(
  insightObject: Readonly<InsightObject>,
  lead: EnrichedLead
): Promise<Email> {
  // Same Recognition/Relief/Trust/Action logic
  // But uses insightObject.confidence for framing intensity
  // Uses insightObject.framingLevel ("assertive"|"gentle"|"speculative")
}
```

---

### Group D: Build New Files

#### 🆕 b2b-evidence-validator.ts (Phase 1.5)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Validate evidence quality and generate InsightObject |
| **Exports** | validateEvidence(), detectContradictions(), calculateConfidence() |
| **Dependencies** | b2b-intelligence-extract.ts, b2b-insight-definitions.ts |
| **Size** | ~600-800 lines |
| **Risk** | Low. New file, no impacts. |
| **Timeline** | Phase 1.5 (Immediate, critical path) |
| **Key Functions** | validateEvidence(), gatherEvidenceSources(), detectContradictions(), calculateContinuousConfidence(), determineStatus() |

---

#### 🆕 b2b-insight-definitions.ts (Phase 1.5)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Define all insight types with their evidence rules |
| **Exports** | CUSTOMER_RELOCATION_INSIGHT, OPERATIONAL_CONSISTENCY_INSIGHT, etc. |
| **Structure** | Each insight type defines: evidenceSources[], contradictions[], statement, opportunity |
| **Size** | ~400-600 lines (can grow as new insight types added) |
| **Risk** | Low. Configuration file, no logic. |
| **Timeline** | Phase 1.5 (Immediate, critical path) |
| **Maintainability** | Easy to add new insight types. Just add new constant. |

---

#### 🆕 b2b-validation-logger.ts (Phase 1.5)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Log validation decisions to validation_logs table |
| **Exports** | logValidationDecision(), recordEngagement(), evaluateOutcome() |
| **Dependencies** | Prisma client, validation_logs table |
| **Size** | ~300-400 lines |
| **Risk** | Low. Straightforward logging. |
| **Timeline** | Phase 1.5 (After database migration) |
| **Learning** | Enables future analysis of: selectedBecause, rejectedInsights, accuracy metrics |

---

#### 🆕 validation_logs table (Phase 1.5 - Database)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Store evidence validation decisions and outcomes |
| **Type** | Prisma model |
| **Fields** | validationId, selectedInsightType, selectedBecause, rejectedInsights, confidence, status, evidenceSources, contradictions, kpiMetrics, etc. |
| **Size** | See DESIGN_EVIDENCE_VALIDATION_ENGINE.md for full schema |
| **Risk** | Very low. New table, no existing dependencies. |
| **Timeline** | Phase 1.5 - Database Setup |
| **Indexes** | status, selectedInsightType, kpiInsightAccuracy, conversionStatus |

---

#### 🆕 Insight Object Type

| Aspect | Detail |
|--------|--------|
| **Purpose** | Immutable contract between validation and renderers |
| **Location** | Integrated into b2b-evidence-validator.ts |
| **Immutability** | TypeScript readonly enforcement |
| **Passed To** | Card Renderer, Email Renderer, Page Renderer, Conversation Renderer |
| **Risk** | Very low. Type definition only. |
| **Timeline** | Phase 1.5 (as part of evidence validator) |

---

### Group E: Build New Components (Future Phases)

#### 🆕 Card Renderer (Phase 6)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Express InsightObject as physical/digital card |
| **Input** | InsightObject |
| **Output** | Card object with gateway positioning |
| **Constraint** | Must express SAME insight as email/page/conversation |
| **Timeline** | Phase 6 (after Layer 5 complete) |
| **Risk** | Low. Follows same pattern as email renderer. |

---

#### 🆕 Page Renderer (Phase 6)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Express InsightObject as prospect page |
| **Input** | InsightObject |
| **Output** | Page object with validation/proof focus |
| **Constraint** | Must express SAME insight as card/email/conversation |
| **Timeline** | Phase 6 (after Layer 5 complete) |
| **Risk** | Low. Follows same pattern. |

---

#### 🆕 Conversation Renderer (Phase 6)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Express InsightObject as conversation script |
| **Input** | InsightObject |
| **Output** | Conversation script with dialogue format |
| **Constraint** | Must express SAME insight as card/email/page |
| **Timeline** | Phase 6 (after Layer 5 complete) |
| **Risk** | Low. Follows same pattern. |

---

## Implementation Sequencing

### Critical Path (Must Do First)

| Phase | Component | Action | Duration |
|-------|-----------|--------|----------|
| **1.5A** | b2b-intelligence-extract.ts | EXTEND | 1-2 hours |
| **1.5B** | validation_logs table | CREATE | 30 min |
| **1.5C** | b2b-evidence-validator.ts | BUILD NEW | 3-4 hours |
| **1.5C** | b2b-insight-definitions.ts | BUILD NEW | 2-3 hours |
| **1.5C** | b2b-validation-logger.ts | BUILD NEW | 1-2 hours |
| **1.5D** | b2b-conversion-engine.ts | EXTEND | 1-2 hours |
| **2** | b2b-rrta-generator.ts | MODIFY | 1-2 hours |

**Total Critical Path**: ~12-16 hours

### Safe-to-Parallel

- 1.5A and 1.5B can run in parallel (independent)
- 1.5C tasks can run in parallel (builders can work in isolation)
- 1.5D depends on 1.5C completion
- Phase 2 depends on Phase 1.5D completion

---

## Risk Summary

### By Severity

| Risk Level | Component | Mitigation |
|-----------|-----------|-----------|
| **🟢 LOW** | b2b-rrta-validator.ts (REUSE) | None needed |
| **🟢 LOW** | validation_logs (NEW TABLE) | Additive, no schema changes |
| **🟢 LOW** | b2b-evidence-validator.ts (NEW) | Independent new module |
| **🟢 LOW** | b2b-validation-logger.ts (NEW) | Independent new module |
| **🟢 LOW** | Renderers (Phase 6) | Built on stable InsightObject |
| **🟡 MEDIUM** | b2b-rrta-generator.ts (MODIFY) | Change isolated to signature. Test thoroughly. |
| **🟡 MEDIUM** | b2b-intelligence-extract.ts (EXTEND) | Additive only. Backward compatible. |
| **🟡 MEDIUM** | b2b-conversion-engine.ts (EXTEND) | New phase insertion. Test all error paths. |

### No Red Flags

No components pose integration risk or require rewrites.

---

## Success Criteria

✅ **Green**: Implementation complete when:
- All new files created and tested
- All extend operations complete and backward-compatible
- validation_logs table created and accessible
- b2b-conversion-engine successfully calls evidence validation phase
- InsightObject flows from validation to RRTA generation without data loss
- All existing tests pass
- New tests cover evidence validation logic

---

## Conclusion

**Safe to proceed with implementation.**

- 60% code already exists
- No rewrites needed
- All changes are additive or isolated
- Risk is low across all components
- Parallel work is possible to accelerate timeline

**Recommended**: Begin with Phase 1.5A-C in parallel, then 1.5D.
