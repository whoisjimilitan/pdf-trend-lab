# Phase B: Observer Engine — Constraints Locked

**Date**: 2026-06-13  
**Status**: Implementation proceeding under explicit constraints

---

## Constraint 1: Promotion Thresholds Are Calibration Parameters

The promotion thresholds defined in `lib/evidence-validation-flags.ts` are **initial calibration values**, NOT immutable policy.

```typescript
export const PROMOTION_THRESHOLDS = {
  MIN_SAMPLES: 1000,                    // Subject to adjustment
  MIN_CONVERSION_IMPROVEMENT: 0.15,     // Subject to adjustment
  MIN_ENGAGEMENT_QUALITY: 0.70,         // Subject to adjustment
  MIN_INSIGHT_ACCURACY: 0.90,           // Subject to adjustment
  MIN_STATISTICAL_SIGNIFICANCE: 0.95    // Subject to adjustment
}
```

**Locked Principle**: Observed variance in shadow mode data determines threshold adjustments. The system adapts to evidence, not the reverse.

**How Thresholds Change**:
1. Shadow mode runs, collects data
2. Analysis shows variance from expected performance
3. Thresholds adjusted based on observed distributions
4. Adjustment does not require code rewrites—config update only

**Why This Matters**: If calibration values lock to reality too tightly, the system becomes brittle. If they're too loose, promotion happens prematurely. Thresholds must be tuned based on real performance data.

---

## Constraint 2: Authority Transition Rules Are Guardrails, Not Locks

Authority transition is a system-level guardrail, NOT immutable policy. Engineering override must remain possible.

**Override scenarios**:
- Emergency debugging during production incident
- Testing specific promotion/demotion scenarios
- Explicit A/B testing (new system vs old system)
- Rollback if unexpected variance emerges

**Locked Implementation Detail**:
Override will require explicit engineering action—not automatic, not in normal decision path, not accidentally reachable.

Pseudo-code pattern:
```typescript
// Normal path: automatic promotion based on thresholds
if (shouldPromoteToAuthority()) {
  EVIDENCE_VALIDATION_MODE = "authority"
}

// Override path: explicit engineering action only
// Example: for debugging
setEvidenceValidationMode("authority", {
  reason: "manual_override_debugging",
  engineer: "name@company.com",
  ticket: "INC-12345"
})
```

**Why This Matters**: The system should promote itself based on evidence. But humans must always retain the ability to intervene, rollback, or debug without being locked out.

---

## Constraint 3: Phase B Observer Engine Must NOT Introduce Hidden Divergence

**LOCKED RULE**: Observer Engine logs differences only. No implicit logic diverges from current system.

### Prohibited in Phase B Observer Engine

❌ **Secondary weighting** — Observable: weighting evidence sources differently than current system  
❌ **Implicit ranking** — Observable: re-ranking insights compared to current system  
❌ **Hidden optimization** — Observable: adjusting confidence without stating why  
❌ **Unstated assumptions** — Observable: contradiction detection rules not in current system  
❌ **Undocumented confidence adjustments** — Observable: confidence calculations that don't match current flow  

### Required in Phase B Observer Engine

✅ **Exact parity** — Observer engine makes identical decisions as current system (initially)  
✅ **Mirrored logic** — Same discovery, same evidence evaluation, same contradiction handling  
✅ **Explicit logging** — Every difference is logged with reason  
✅ **Validation test coverage** — 100% of initial test cases should match current system exactly  

### Difference Logging Pattern

```typescript
// When observer engine decision differs from current system:

log({
  currentSystemDecision: "approved_insight_A",
  observerEngineDecision: "approved_insight_B",
  reason: "Current system selects based on [criteria]. Observer selects based on [criteria]. Difference: [specific point of divergence]",
  confidence: { current: 0.75, observer: 0.82 },
  timestamp: now()
})
```

### Parity Validation Test Plan

Phase B implementation will include:

1. **Test Suite**: 100 representative prospects
   - Expected: Observer engine makes identical decisions as current system
   - If divergence occurs: must be logged, analyzed, and decision made (keep or adjust)

2. **Divergence Report**: Any systematic differences between systems
   - Exactly what differs (decision type, confidence, evidence selection)
   - Why it differs (explicit architectural choice)
   - Impact on promotion decision (will this affect thresholds)

3. **Go/No-Go Gate**: Observer engine approved for shadow mode only if:
   - 95%+ decision parity with current system, OR
   - All divergences explained and logged, OR
   - Explicit decision made to keep improvements (with rationale)

---

## Implementation Rule

**Build the Observer Engine as a mirror of current system first.**

Only after parity is proven can evolution begin.

Pattern:
1. Observer Engine reads current system code
2. Replicates logic exactly
3. Logs differences
4. 100% parity test passes
5. Then: improvements can be added (with evidence)

**Why**: If observer engine diverges hidden in Phase B, you won't know which system is better during shadow mode. You need identical decision logic to isolate evidence validation as the variable.

---

## Authority Override (Technical Design)

Engineering override mechanism (design sketch for Phase C):

```typescript
// Phase B: no override needed (shadow mode, no authority)
// Phase C: override mechanism added if authority is active

interface AuthorityOverride {
  reason: "manual_debug" | "testing" | "emergency_rollback"
  engineer: string
  ticket: string
  timestamp: Date
  expiresAt: Date // Override automatically expires
  approved_by: string // Secondary approval required
}

function setEvidenceValidationMode(
  mode: EvidenceValidationMode,
  override?: AuthorityOverride
): void {
  if (override) {
    log_override(override)
    // Requires secondary approval before taking effect
    require_approval(override)
  }
  EVIDENCE_VALIDATION_MODE = mode
}
```

---

## Phase B Success Criteria

✅ Observer engine built  
✅ Runs in parallel with current system  
✅ Makes decisions in shadow mode  
✅ Logs all outcomes  
✅ 95%+ decision parity with current system initially  
✅ All divergences explicitly logged  
✅ Zero hidden logic  
✅ Ready for extended shadow mode data collection  

---

## Constraints Remain Throughout

These three constraints persist through Phase C, Phase D, and beyond:
1. Thresholds are calibration parameters (evolving, not fixed)
2. Authority is guarded but overrideable (engineering access remains)
3. Observer engine never diverges hidden (all changes explicit and logged)

---

**Status**: Constraints locked. Phase B implementation proceeding.
