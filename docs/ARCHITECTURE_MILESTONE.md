# Architecture Milestone: Clean Dual-Pipeline Isolation

**Date**: 2026-06-13  
**Commit**: (see git tag v1-shadow-architecture-stable)  
**Status**: LOCKED FREEZE POINT

---

## Production Pipeline

```
Lead Input
  ↓
extractLeadIntelligence()
  ↓
validateIntelligenceSufficiency()
  ↓
generateRRTACopy() [RRTA: Recognition, Relief, Trust, Action]
  ↓
validateRRTA()
  ↓
ensureProspectPageExists()
  ↓
generateSubject() + buildEmailBody() + generateCTAText()
  ↓
Email Output (Approved or Rejected)
```

**File**: `lib/b2b-conversion-engine.ts`

**Invariant**: Production path contains ONLY email generation logic. No shadow system calls. No type bypasses.

---

## Shadow Pipeline

```
Lead Input (from Production)
  ↓
buildShadowInsight()
  ├─ buildInsight() [LeadIntelligence → Insight conversion]
  ├─ selectPrimaryInsight() [Rank by relevance]
  ├─ detectReadiness() [Determine timing readiness]
  └─ recordValidationObservation() [Log to ValidationLog]
  ↓
ValidationLog Entry (Insight Object + Metadata)
```

**File**: `lib/b2b-shadow-observer.ts`

**Invariant**: Shadow pipeline executes in parallel, never influencing production. Non-authoritative observer only.

---

## Insight Object: Canonical Contract

**File**: `lib/b2b-insight-object.ts`

**Immutable Core**:
```typescript
interface Insight {
  insightId: string
  insightType: string
  statement: string       // Core claim (immutable)
  painPoint: string       // Problem statement
  opportunity: string     // Solution path
  confidence: number      // 0.0-1.0
  status: InsightStatus
  framingLevel: FramingLevel
  evidenceSources: EvidenceSource[]
  contradictions: Contradiction[]
  validatedAt: Date
  validationId: string
}
```

**Law**: This interface is the SINGLE SOURCE OF TRUTH for all downstream systems.

**Renderer Constraint**: Renderers MUST NOT modify insight meaning. They may only express the same insight at different depths.

---

## System Boundaries

### Production ↔ Shadow Separation

| Aspect | Production | Shadow |
|--------|-----------|--------|
| Entry | Lead object | Same lead object |
| Output | Email to send | ValidationLog entry |
| Authority | Makes decisions | Observer only |
| Influence | Affects prospect interaction | No influence |
| Type Safety | Fully typed, no bypasses | Fully typed, no bypasses |
| Error Handling | Blocking (must fix) | Non-blocking (logs only) |

### Clean Isolation Guarantees

✔ **No "as any" casts** anywhere in shadow or production paths  
✔ **No duplicate pipelines** - single implementation per path  
✔ **No circular imports** - dependency graph is acyclic  
✔ **No cross-contamination** - shadow observer not imported in production  
✔ **Type safety enforced** - Insight is canonical contract  

---

## Locked Constraints (from earlier phases)

### Constraint 1: Promotion Thresholds Are Calibration Parameters
Thresholds in `lib/evidence-validation-flags.ts` are adjustable based on observed data. Initial values are starting points, not final policy.

### Constraint 2: Authority Transition Rules Are Guardrails
Authority transition is guarded but not immutable. Engineering override possible for debugging/testing. Policy, not physics.

### Constraint 3: Observer Engine Must Not Diverge Hidden
All differences from current system are logged explicitly. No implicit logic divergence. All changes documented.

---

## What This Milestone Enables

✅ Safe shadow mode deployment (non-blocking, non-influencing)  
✅ Data accumulation for statistical validation  
✅ Clean foundation for renderer layer (Page, Card, Email, Conversation)  
✅ Reusable Insight Object across all systems  
✅ Audit trail for all decisions (production + shadow)  

---

## What Comes Next

**Phase D onwards**: Renderers accept InsightObject and express it appropriately:
- Page Renderer: Full narrative with evidence
- Card Renderer: Operator summary with actionability
- Email Renderer: RRTA-integrated messaging
- Conversation Renderer: Turn-by-turn dialogue

Each renderer reads the same immutable Insight Object. No divergence possible.

---

## Verification

This milestone was audited for:

✔ Production pipeline isolation  
✔ Shadow pipeline isolation  
✔ Type system consistency  
✔ No type bypasses (as any)  
✔ No duplicate implementations  
✔ No cross-contamination  
✔ Data flow separation  
✔ Comparison reporter readiness  

All checks passed. System is clean and ready for renderer layer.

---

**Status**: FROZEN. Future changes reference this commit as baseline.
