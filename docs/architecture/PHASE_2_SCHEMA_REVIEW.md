# Phase 2 Schema & Architecture Review

**Status**: SCHEMA VALIDATION  
**Date**: 2026-06-13  
**Objective**: Verify frozen design is sound before implementation

---

## 1. APPROVEDINSIGHT SCHEMA REVIEW

### Current Proposed Schema

```prisma
model ApprovedInsight {
  id                String    @id @default(cuid())
  validationId      String    @unique
  validationLog     ValidationLog @relation(fields: [validationId], references: [validationId])
  approvalStatus    String    @default("new")
  approvedAt        DateTime  @default(now())
  activatedAt       DateTime?
  promotedAt        DateTime?
  archivedAt        DateTime?
  promotionHistory  ApprovalPromotion[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([approvalStatus])
  @@index([approvedAt])
  @@unique([validationId])
}
```

### Field-by-Field Analysis

| Field | Type | Purpose | Necessary? | Risk |
|-------|------|---------|-----------|------|
| id | String PK | Unique identifier | ✅ YES | None |
| validationId | String FK UNIQUE | Reference to source validation | ✅ YES (critical) | None |
| validationLog | Relation | JOIN to ValidationLog | ✅ YES | Join cost in Phase 3 |
| approvalStatus | String | Current lifecycle state | ✅ YES | None |
| approvedAt | DateTime | Approval timestamp | ✅ YES | None |
| activatedAt | DateTime? | Activation timestamp | ⚠️ QUESTION | See below |
| promotedAt | DateTime? | Promotion timestamp | ⚠️ QUESTION | See below |
| archivedAt | DateTime? | Archive timestamp | ⚠️ QUESTION | See below |
| promotionHistory | Relation | Link to ApprovalPromotion | ✅ YES | None |
| createdAt | DateTime | Record creation | ✅ YES | None |
| updatedAt | DateTime | Last update | ✅ YES | None |

### Analysis of Timestamp Fields

**Current approach**: Duplicate timestamps (activatedAt, promotedAt, archivedAt) in ApprovedInsight AND ApprovalPromotion

**Problem**: Data duplication
- When status transitions, BOTH tables are updated
- Risk of inconsistency (ApprovedInsight.activatedAt ≠ ApprovalPromotion.decidedAt for new→active)
- Maintenance burden (two sources of truth for same fact)

**Query impact**:
```typescript
// Current design requires checking two places:
const activation = approvedInsight.activatedAt || latestPromotion?.decidedAt
// Error-prone: which is authoritative?
```

**Recommendation**: 

**Option A (Recommended)**: Remove from ApprovedInsight, keep only in ApprovalPromotion
```prisma
model ApprovedInsight {
  id                String    @id @default(cuid())
  validationId      String    @unique
  validationLog     ValidationLog @relation(...)
  approvalStatus    String    @default("new")
  approvedAt        DateTime  @default(now())
  promotionHistory  ApprovalPromotion[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([approvalStatus])
  @@index([approvedAt])
  @@unique([validationId])
}

// Query activation date:
const approval = await getApprovedInsights({ id })
const activation = approval.promotionHistory.find(p => p.toStatus === "active")?.decidedAt
```

**Benefit**: Single source of truth (ApprovalPromotion is authoritative)  
**Trade-off**: One extra JOIN to get transition timestamps (Phase 3 will do this anyway)  
**Impact**: Eliminates inconsistency risk, cleaner data model

**Option B (Current)**: Keep all timestamps in both tables
**Risk**: Sync burden, inconsistency, maintenance complexity

---

## 2. APPROVALPROMOTION SCHEMA REVIEW

### Current Proposed Schema

```prisma
model ApprovalPromotion {
  id                String    @id @default(cuid())
  approvedInsightId String
  approvedInsight   ApprovedInsight @relation(fields: [approvedInsightId], references: [id])
  fromStatus        String
  toStatus          String
  promotionReason   String    @db.Text
  decidedAt         DateTime  @default(now())
  decidedBy         String?
  
  @@index([approvedInsightId])
  @@index([decidedAt])
}
```

### Field Analysis

| Field | Type | Purpose | Complete? |
|-------|------|---------|-----------|
| id | String PK | Unique record ID | ✅ YES |
| approvedInsightId | FK | Link to approval | ✅ YES |
| fromStatus | String | Previous state | ✅ YES |
| toStatus | String | New state | ✅ YES |
| promotionReason | String | Why transition | ✅ YES |
| decidedAt | DateTime | When decided | ✅ YES |
| decidedBy | String? | Who decided | ✅ YES (important for audit) |

### Audit Trail Completeness

**Question**: Does this fully capture lifecycle history?

**Test Case 1**: new → active → promoted → archived
```
ApprovalPromotion records:
1. id=1, fromStatus="new", toStatus="active", decidedAt=T1, decidedBy="system"
2. id=2, fromStatus="active", toStatus="promoted", decidedAt=T2, decidedBy="user123"
3. id=3, fromStatus="promoted", toStatus="archived", decidedAt=T3, decidedBy="system"

Query "what is current status?":
  SELECT toStatus FROM ApprovalPromotion WHERE approvedInsightId=? ORDER BY decidedAt DESC LIMIT 1
  → "archived" ✅

Query "when was it activated?":
  SELECT decidedAt FROM ApprovalPromotion WHERE approvedInsightId=? AND toStatus="active"
  → T1 ✅

Query "who promoted it?":
  SELECT decidedBy FROM ApprovalPromotion WHERE approvedInsightId=? AND toStatus="promoted"
  → "user123" ✅
```

**Test Case 2**: new → promoted (skip active)
```
Current schema allows this? 
  fromStatus="new", toStatus="promoted" ✓
  
Is this valid?
  According to design: new → active → promoted (mandatory intermediate step)
  Current schema: does NOT enforce this ✗
```

**Issue Found**: No state machine validation in schema

**Recommendation**: Add constraint validation (not in schema, but in application code)

```typescript
const validTransitions = {
  "new": ["active"],
  "active": ["promoted", "archived"],
  "promoted": ["archived"],
  "archived": []
}

// Enforce before creating ApprovalPromotion
if (!validTransitions[fromStatus].includes(toStatus)) {
  throw Error(`Invalid transition: ${fromStatus} → ${toStatus}`)
}
```

**Schema modification needed?**: No (validation in code is sufficient)

---

## 3. VALIDATIONLOG RELATIONSHIPS REVIEW

### Current Relationship Design

```prisma
// ApprovedInsight → ValidationLog
model ApprovedInsight {
  validationId      String    @unique
  validationLog     ValidationLog @relation(fields: [validationId], references: [validationId])
}
```

### Relationship Integrity Questions

**Question 1**: Can a ValidationLog be referenced by multiple ApprovedInsights?

Current schema: NO (ApprovedInsight.validationId is UNIQUE)
✅ Correct: Each validation should be approved at most once

**Question 2**: What happens if ValidationLog is deleted?

Current schema: No cascade delete defined
⚠️ Risk: ApprovedInsight orphaned

**Recommendation**: Add explicit relationship rule

```prisma
model ApprovedInsight {
  validationId      String    @unique
  validationLog     ValidationLog @relation(fields: [validationId], references: [validationId], onDelete: Restrict)
  // onDelete: Restrict prevents deleting ValidationLog if ApprovedInsight references it
}
```

**Impact**: Prevents orphaned records. ValidationLog becomes immutable once approved.
**Trade-off**: Cannot delete ValidationLog if already approved (but that's the desired behavior)

**Recommendation**: ✅ ADD `onDelete: Restrict` to relationship

---

## 4. PHASE 3 QUERY PATTERNS ANALYSIS

### What Phase 3 Will Need

Phase 3 will query: ApprovedInsight + PageEngagementLog + ValidationLog

**Phase 3 Query 1**: "Get active insights ranked by engagement"
```sql
SELECT 
  ai.id, ai.validationId, ai.approvalStatus,
  vl.selectedInsightType, vl.confidenceScore,
  COALESCE(pel.engagementCount, 0) as engagementCount,
  COALESCE(pel.impressionCount, 0) as impressionCount,
  CASE WHEN pel.impressionCount > 0 
    THEN (pel.engagementCount::float / pel.impressionCount) 
    ELSE 0 END as engagementRate
FROM ApprovedInsight ai
JOIN ValidationLog vl ON ai.validationId = vl.validationId
LEFT JOIN PageEngagementLog pel ON ai.id = pel.insightId
WHERE ai.approvalStatus = 'active'
ORDER BY engagementRate DESC
```

**Index needs**:
- ✅ ApprovedInsight.approvalStatus (already proposed)
- ✅ ValidationLog.validationId (FK supports this)
- ✅ PageEngagementLog.insightId (already exists)

**Phase 3 Query 2**: "Get insights promoted in last 7 days"
```sql
SELECT ai.*, ap.decidedAt
FROM ApprovedInsight ai
JOIN ApprovalPromotion ap ON ai.id = ap.approvedInsightId
WHERE ap.toStatus = 'promoted' 
  AND ap.decidedAt >= NOW() - INTERVAL '7 days'
ORDER BY ap.decidedAt DESC
```

**Index needs**:
- ✅ ApprovalPromotion.decidedAt (already proposed)
- ⚠️ ApprovalPromotion.toStatus (NOT proposed, but would speed this query)

**Phase 3 Query 3**: "Get all insights by type with engagement"
```sql
SELECT 
  vl.selectedInsightType,
  COUNT(ai.id) as totalApproved,
  COUNT(CASE WHEN ai.approvalStatus = 'active' THEN 1 END) as activeCount,
  AVG(vl.confidenceScore) as avgConfidence
FROM ApprovedInsight ai
JOIN ValidationLog vl ON ai.validationId = vl.validationId
GROUP BY vl.selectedInsightType
```

**Index needs**:
- ✅ ValidationLog.selectedInsightType (derived via FK)

### Missing Index Identified

**Recommendation**: Add index on ApprovalPromotion.toStatus

```prisma
model ApprovalPromotion {
  // ... fields ...
  @@index([approvedInsightId])
  @@index([decidedAt])
  @@index([toStatus])  // ← ADD THIS
}
```

**Justification**: Phase 3 will filter by toStatus ("active", "promoted", "archived")  
**Cost**: Minimal (one additional index)  
**Benefit**: 10-100x faster Phase 3 queries

---

## 5. REDUNDANT FIELDS ANALYSIS

### Checking for Redundancy

**Field**: approvalStatus in ApprovedInsight

Is it redundant?
- Could derive from: ApprovalPromotion.toStatus (latest transition)
- But would require JOIN + MAX(decidedAt) every query
- Cost: One join + subquery vs simple string comparison
- **Verdict**: NOT redundant (worth storing for query performance)

**Field**: createdAt in ApprovedInsight

Is it redundant?
- Always equals: (first ApprovalPromotion).decidedAt where fromStatus="new"
- Could be derived but would require complex query
- **Verdict**: NOT redundant (acceptable convenience field)

**Field**: activatedAt, promotedAt, archivedAt in ApprovedInsight

Is it redundant?
- YES, directly derived from ApprovalPromotion transitions
- **Verdict**: REDUNDANT (should remove per recommendation in section 1)

**Recommendation**: Remove activatedAt, promotedAt, archivedAt from ApprovedInsight

---

## 6. INDEX RECOMMENDATIONS

### Current Proposed Indexes

```prisma
ApprovedInsight {
  @@index([approvalStatus])
  @@index([approvedAt])
  @@unique([validationId])
}

ApprovalPromotion {
  @@index([approvedInsightId])
  @@index([decidedAt])
}
```

### Analysis by Query Type

| Query | Indexes Needed | Current | Missing |
|-------|---|---|---|
| Find by approvalStatus | approvalStatus | ✅ | — |
| Find by approvedAt range | approvedAt | ✅ | — |
| Find by validationId | validationId (unique) | ✅ | — |
| Find promotions by insight | approvedInsightId | ✅ | — |
| Find recent promotions | decidedAt | ✅ | — |
| Find by toStatus | toStatus | ❌ | ⚠️ Needed for Phase 3 |
| Find by fromStatus | fromStatus | ❌ | Optional |
| Composite: status + date | (approvalStatus, approvedAt) | Partial | ⚠️ Consider composite |

### Recommended Changes

**1. Add index on ApprovalPromotion.toStatus**
```prisma
@@index([toStatus])  // Phase 3 will filter by this
```

**2. Consider composite index for common Phase 2 query**
```prisma
// Query: "Get all active insights approved in last 7 days"
@@index([approvalStatus, approvedAt])  // Composite
```

**Trade-off**: Additional indexes increase write cost (by ~5-10%) but dramatically improve read queries  
**Phase 3 benefit**: 10-100x faster engagement ranking queries

---

## 7. APPROVALPROMOTION LIFECYCLE HISTORY COMPLETENESS

### State Machine Validation

**Allowed transitions**:
```
new → active
active → promoted
active → archived
promoted → archived
```

**Schema captures**:
- ✅ From state (fromStatus)
- ✅ To state (toStatus)
- ✅ When (decidedAt)
- ✅ Who (decidedBy)
- ✅ Why (promotionReason)

**Can reconstruct full history?**
```typescript
const history = await getApprovalHistory(approvedInsightId)
// Result: chronological list of all transitions
// Current state: history[0].toStatus (latest)
// Timeline: all decidedAt dates
// Audit trail: all decidedBy users
```

✅ **Verdict**: ApprovalPromotion fully captures what's needed

**Edge cases handled?**

1. **What if user manually edits status?**
   - Current design doesn't prevent manual updates to approvalStatus
   - Recommendation: Record all changes via ApprovalPromotion, never direct updates
   - Enforcement: Application code only

2. **What if user archives without promoting?**
   - Active → Archived directly is allowed
   - Correct per design (not an error)

3. **What if user undoes a promotion?**
   - Current schema: promoted → active not allowed
   - Correct: promotions are one-directional

---

## SUMMARY OF FINDINGS

### Issues Found

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|---|
| Duplicate timestamps | 🟡 Medium | ApprovedInsight | Remove activatedAt, promotedAt, archivedAt; derive from ApprovalPromotion |
| Missing onDelete rule | 🟡 Medium | ApprovedInsight ↔ ValidationLog | Add onDelete: Restrict |
| Missing toStatus index | 🟡 Medium | ApprovalPromotion | Add @@index([toStatus]) for Phase 3 |
| No transition validation | 🟢 Low | Application | Add state machine validation in code (not schema) |

### Recommendations (Prioritized)

#### Priority 1: Fix Timestamp Redundancy ✅ CRITICAL

**Change**: Remove timestamp fields from ApprovedInsight

```prisma
// Before
activatedAt       DateTime?
promotedAt        DateTime?
archivedAt        DateTime?

// After
// (Deleted)
```

**Reason**: Eliminates data duplication, improves consistency  
**Impact**: Phase 3 must JOIN ApprovalPromotion for timestamps (unavoidable join anyway)  
**Risk**: Low (query impact minimal, clarity improved)

---

#### Priority 2: Add Foreign Key Constraint ✅ RECOMMENDED

```prisma
model ApprovedInsight {
  validationLog     ValidationLog @relation(
    fields: [validationId], 
    references: [validationId],
    onDelete: Restrict  // ← Add this
  )
}
```

**Reason**: Prevent orphaned records, enforce referential integrity  
**Impact**: ValidationLog becomes immutable once approved (desired)  
**Risk**: None (correct behavior)

---

#### Priority 3: Add toStatus Index ✅ RECOMMENDED

```prisma
model ApprovalPromotion {
  @@index([toStatus])  // ← Add this
}
```

**Reason**: Phase 3 will heavily filter by toStatus (active, promoted, archived)  
**Impact**: 10-100x faster Phase 3 queries  
**Risk**: Minimal write cost increase (~5%)

---

#### Priority 4: Consider Composite Index (OPTIONAL)

```prisma
model ApprovedInsight {
  @@index([approvalStatus, approvedAt])  // ← Optional optimization
}
```

**Reason**: "Get active insights approved since X" is common query  
**Impact**: Faster Phase 2 queries  
**Risk**: Minimal

---

## Phase 3 Compatibility Assessment

### Will current schema support Phase 3?

**Phase 3 needs**:
- ✅ Query ApprovedInsight by status
- ✅ Query ApprovalPromotion by promotion type (toStatus)
- ✅ JOIN with ValidationLog for insight data
- ✅ JOIN with PageEngagementLog for engagement metrics
- ✅ Historical promotion timeline
- ✅ Who made each decision

**Current schema supports all of these?** 
✅ **YES** (with recommended indexes added)

**Any breaking changes in Phase 3?**
❌ **NO** (Phase 2 schema is forward-compatible)

---

## REVISED SCHEMA (After Recommendations)

```prisma
model ApprovedInsight {
  id                String    @id @default(cuid())
  
  validationId      String    @unique
  validationLog     ValidationLog @relation(
    fields: [validationId], 
    references: [validationId],
    onDelete: Restrict  // ← ADDED
  )
  
  approvalStatus    String    @default("new")
  approvedAt        DateTime  @default(now())
  // activatedAt, promotedAt, archivedAt REMOVED ✅
  
  promotionHistory  ApprovalPromotion[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([approvalStatus])
  @@index([approvedAt])
  @@index([approvalStatus, approvedAt])  // ← ADDED (optional)
  @@unique([validationId])
}

model ApprovalPromotion {
  id                String    @id @default(cuid())
  
  approvedInsightId String
  approvedInsight   ApprovedInsight @relation(fields: [approvedInsightId], references: [id])
  
  fromStatus        String
  toStatus          String
  promotionReason   String    @db.Text
  decidedAt         DateTime  @default(now())
  decidedBy         String?
  
  @@index([approvedInsightId])
  @@index([decidedAt])
  @@index([toStatus])  // ← ADDED
}
```

---

## FINAL GO / NO-GO RECOMMENDATION

### Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Single source of truth | ✅ PASS | ValidationLog canonical (after removing redundant timestamps) |
| Referential integrity | ✅ PASS | With onDelete: Restrict added |
| Phase 3 compatibility | ✅ PASS | Schema supports all Phase 3 queries |
| Index strategy | ✅ PASS | After adding toStatus and composite indexes |
| Audit trail completeness | ✅ PASS | ApprovalPromotion captures full history |
| Query performance | ✅ PASS | Adequate indexes for Phase 2 and 3 |
| No redundancy | ⚠️ CONDITIONAL | After removing timestamp duplicates |

### Critical Issues

**None.** All issues are minor and easily fixed before implementation.

### Recommended Changes Before Implementation

**MUST HAVE** (Do before coding):
1. ✅ Remove activatedAt, promotedAt, archivedAt from ApprovedInsight
2. ✅ Add onDelete: Restrict to ValidationLog relationship

**SHOULD HAVE** (Do before coding):
3. ✅ Add @@index([toStatus]) to ApprovalPromotion
4. ✅ Add @@index([approvalStatus, approvedAt]) to ApprovedInsight (optional but recommended)

**NICE TO HAVE** (Can add later):
5. ⚠️ Add state machine validation in code (not schema)

---

## FINAL RECOMMENDATION

### ✅ GO FOR IMPLEMENTATION

**Conditions**:
1. Update PHASE_2_REVISED_DESIGN.md with recommended schema changes (remove timestamps, add indexes, add onDelete constraint)
2. Update prisma/schema.prisma BEFORE creating migration
3. All other aspects of design are sound

**What's working well**:
- ✅ Single source of truth architecture (after timestamp cleanup)
- ✅ Clear audit trail
- ✅ Forward-compatible with Phase 3
- ✅ Appropriate indexes
- ✅ No data redundancy (after cleanup)

**What needs fixing**:
- 🔧 Remove 3 timestamp fields from ApprovedInsight
- 🔧 Add onDelete: Restrict constraint
- 🔧 Add toStatus index
- 🔧 Add composite index (optional)

**Risk if changes NOT made**:
- 🔴 Timestamp inconsistency bugs (medium risk)
- 🟡 Orphaned records possible (low likelihood, high impact)
- 🟡 Phase 3 query performance degradation (noticeable but recoverable)

**Estimated fix time**: 5 minutes to update documentation

---

**RECOMMENDATION: GO FOR IMPLEMENTATION WITH SCHEMA UPDATES**

Update design documents and schema, then proceed with Phase 2 coding.
