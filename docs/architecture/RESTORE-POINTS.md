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

## Restore Strategy

If current work breaks:

1. Identify which baseline is still valid
2. `git checkout <tag>`
3. Create new branch: `git checkout -b fix/<issue>`
4. Resume from known-good state

Example:
```bash
git checkout v1-renderer-foundation-stable
git checkout -b fix/engagement-tracking
```

---

**STATUS**: LOCKED. All baselines safe to restore.
