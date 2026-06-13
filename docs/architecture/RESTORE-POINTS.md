# Restore Points

Immutable baselines. Safe to restore if phase breaks.

---

## v1-shadow-architecture-stable

**Tag**: `v1-shadow-architecture-stable`  
**Commit**: `5a81c96ec890c27c35914126e17b244c890c35a3`  
**Date**: 2026-06-12

### Contains
- Production email generation pipeline
- Shadow observer pattern (non-authoritative learning)
- Evidence validation engine
- Readiness detection
- Relevance selection
- Complete isolation between production and shadow

### Restore
```bash
git checkout v1-shadow-architecture-stable
```

---

## v1-renderer-foundation-stable

**Tag**: `v1-renderer-foundation-stable`  
**Commit**: `1474c84a0e90787fcf615224e1f3f7a0dce68c09`  
**Date**: 2026-06-13

### Contains
- Card renderer (1–3 sentence observations)
- Email renderer (3–8 paragraph deepening)
- Prospect page renderer (HTML page structure)
- All renderers: pure expression, zero logic
- Insight object immutable

### Restore
```bash
git checkout v1-renderer-foundation-stable
```

---

## v1-engagement-instrumentation-stable

**Tag**: `v1-engagement-instrumentation-stable`  
**Commit**: `f00ab12efb2f6d0169e33ec9c0e3ec0fde3488cc`  
**Date**: 2026-06-13

### Contains
- Page engagement tracking infrastructure
- Atomic operation counters (race-condition-free)
- Pure logging (no scoring, ranking, optimization)
- Unique constraint enforcement
- Shared Prisma singleton pattern
- Migration schema (PageEngagementLog table)

### Restore
```bash
git checkout v1-engagement-instrumentation-stable
```

---

## phase2-architecture-frozen

**Tag**: `phase2-architecture-frozen`  
**Commit**: `b2be34a` (phase2-architecture-finalized)  
**Date**: 2026-06-13

### Status
- ✅ Architecture FROZEN
- ❌ Implementation NOT STARTED
- ❌ Schema NOT DEPLOYED
- ❌ No code written

### Contains
- ApprovalStatus enum (NEW, ACTIVE, PROMOTED, ARCHIVED)
- ApprovedInsight model (7 fields, metadata-only, no duplication)
- ApprovalPromotion model (7 fields, immutable audit trail)
- FK constraints (both onDelete: Restrict)
- Lifecycle timestamp derivation pattern documented
- All 8 indexes documented
- Enum consistency verified
- All design documentation updated

### Restore
```bash
# Restore entire state
git checkout phase2-architecture-frozen

# Restore just schema
git checkout phase2-architecture-frozen -- prisma/schema.prisma

# View schema at this point
git show phase2-architecture-frozen:prisma/schema.prisma
```

### When to Use
- Before Phase 2 implementation begins (reference point)
- If Phase 2 implementation needs to restart (safe baseline)
- To verify what was locked before code changes
- As source-of-truth for frozen architecture

### When NOT to Use
- During normal Phase 2 implementation (keep moving forward)
- After Phase 2 is complete (move to next restore point)

---

## Restore Strategy

If current work breaks:

1. Identify which baseline is still valid
2. `git checkout <tag>`
3. Create new branch: `git checkout -b fix/<issue>`
4. Resume from known-good state

Example:
```bash
git checkout phase2-architecture-frozen
git checkout -b fix/approval-service
```

---

**STATUS**: LOCKED. All baselines safe to restore. Phase 2 architecture frozen at b2be34a.
