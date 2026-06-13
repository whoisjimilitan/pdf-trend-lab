# Phase 2 Architecture Snapshot

**Frozen**: 2026-06-13  
**Commit**: b2be34a  
**Snapshot Purpose**: Exact schema definitions at architecture freeze point

---

## Schema Definitions (Exact Copy from Freeze Point)

### ApprovalStatus Enum

```prisma
enum ApprovalStatus {
  NEW
  ACTIVE
  PROMOTED
  ARCHIVED
}
```

**Valid Values**:
- `NEW` — Insight approved, awaiting activation
- `ACTIVE` — Insight activated for review/use
- `PROMOTED` — Insight promoted (Phase 3 only)
- `ARCHIVED` — Insight archived (Phase 3 only)

**Enum Type**: Type-safe, compile-time verified, database enforced

---

### ApprovedInsight Model

```prisma
model ApprovedInsight {
  id                String          @id @default(cuid())
  
  // Single reference to ValidationLog (canonical insight source)
  validationId      String          @unique
  validationLog     ValidationLog   @relation(
    fields: [validationId],
    references: [validationId],
    onDelete: Restrict
  )
  
  // Approval metadata only (do NOT duplicate insight data)
  approvalStatus    ApprovalStatus  @default(NEW)
  approvedAt        DateTime        @default(now())
  // Lifecycle timestamps DERIVED from ApprovalPromotion (no duplication)
  
  // Audit trail
  promotionHistory  ApprovalPromotion[]
  
  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([approvalStatus])
  @@index([approvedAt])
  @@index([approvalStatus, approvedAt])
  @@unique([validationId])
}
```

**Field Ownership**:
- `id`: Primary key
- `validationId`: Immutable reference to ValidationLog (unique)
- `validationLog`: Relation to ValidationLog (one-to-one)
- `approvalStatus`: Approval state (NEW → ACTIVE → PROMOTED → ARCHIVED)
- `approvedAt`: When this approval record was created
- `promotionHistory`: Relation to ApprovalPromotion records (one-to-many)
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

**Indexes**:
1. `@@index([approvalStatus])` — Fast filtering by status
2. `@@index([approvedAt])` — Fast date-range queries
3. `@@index([approvalStatus, approvedAt])` — Fast combined filtering
4. `@@unique([validationId])` — Enforce one approval per validation

**Foreign Keys**:
- To ValidationLog: `onDelete: Restrict` (prevents ValidationLog deletion)

**Constraints**:
- Do NOT add: activatedAt, promotedAt, archivedAt (derive from ApprovalPromotion)
- Do NOT duplicate insight data from ValidationLog
- Do NOT add engagement data (Phase 3 only)

---

### ApprovalPromotion Model

```prisma
model ApprovalPromotion {
  id                String          @id @default(cuid())
  
  // Reference to approved insight (with delete protection)
  approvedInsightId String
  approvedInsight   ApprovedInsight @relation(
    fields: [approvedInsightId],
    references: [id],
    onDelete: Restrict
  )
  
  // State transition record
  fromStatus        ApprovalStatus
  toStatus          ApprovalStatus
  promotionReason   String          @db.Text
  
  // Decision metadata
  decidedAt         DateTime        @default(now())
  decidedBy         String?
  
  @@index([approvedInsightId])
  @@index([decidedAt])
  @@index([toStatus])
  @@index([approvedInsightId, decidedAt])
}
```

**Field Ownership**:
- `id`: Primary key
- `approvedInsightId`: Reference to ApprovedInsight (mutable FK)
- `approvedInsight`: Relation to ApprovedInsight (many-to-one)
- `fromStatus`: Previous state (ApprovalStatus enum)
- `toStatus`: New state (ApprovalStatus enum)
- `promotionReason`: Why this transition occurred
- `decidedAt`: When transition was recorded
- `decidedBy`: Who authorized the transition (optional)

**Indexes**:
1. `@@index([approvedInsightId])` — Fast reverse lookup (given insight, get all promotions)
2. `@@index([decidedAt])` — Fast timeline queries
3. `@@index([toStatus])` — Fast filtering by promotion type
4. `@@index([approvedInsightId, decidedAt])` — Fast history reconstruction (ordered)

**Foreign Keys**:
- To ApprovedInsight: `onDelete: Restrict` (prevents cascade deletion of audit trail)

**Constraints**:
- Immutable (insert-only audit log)
- All transitions must be recorded
- Cannot delete records without first removing ApprovedInsight

---

## Ownership Map

### ValidationLog (Canonical Source)

**Owned Fields**:
- selectedInsightType
- selectedBecause (reasoning)
- confidenceScore (0.0–1.0)
- confidenceBand
- status (APPROVED/PENDING_MORE_EVIDENCE/REJECTED_FOR_NOW)
- evidenceSourceCount
- contradictionsCount
- enrichmentLevel
- leadCategory
- leadLocations

**Owner**: Shadow pipeline  
**Immutable**: YES (never modified after creation)  
**Referenced By**: ApprovedInsight (via validationId FK)  
**Duplicated Where**: NOWHERE (single source of truth)

### ApprovedInsight (Approval Metadata)

**Owned Fields**:
- approvalStatus (approval state: NEW → ACTIVE → PROMOTED → ARCHIVED)
- approvedAt (when approval was recorded)

**Owner**: Approval workflow  
**Immutable**: NO (status changes via promotions)  
**Stores**: Metadata only, no insight data duplicated  
**References**: ValidationLog (immutable FK)  
**Referenced By**: ApprovalPromotion (for audit trail)

### ApprovalPromotion (Lifecycle History)

**Owned Fields**:
- fromStatus → toStatus (state transition)
- promotionReason (why)
- decidedAt (when)
- decidedBy (who)

**Owner**: Approval workflow  
**Immutable**: YES (insert-only audit log, never modified)  
**Stores**: Full lifecycle history  
**References**: ApprovedInsight (for tracking which insight)  
**Referenced By**: None (terminal table)

---

## Lifecycle Timestamp Derivation

### Stored (In ApprovalPromotion)
```typescript
// All timestamps stored as decided_at
decidedAt: DateTime
```

### Derived (From ApprovalPromotion)
```typescript
// activatedAt = when status transitioned to ACTIVE
const activatedAt = promotionHistory
  .find(p => p.toStatus === "ACTIVE")?.decidedAt

// promotedAt = when status transitioned to PROMOTED
const promotedAt = promotionHistory
  .find(p => p.toStatus === "PROMOTED")?.decidedAt

// archivedAt = when status transitioned to ARCHIVED
const archivedAt = promotionHistory
  .find(p => p.toStatus === "ARCHIVED")?.decidedAt
```

### Rationale
- Single source of truth (ApprovalPromotion)
- No sync burden (no duplicate updates)
- Consistent (query always returns current truth)
- Audit trail complete (can reconstruct any point in time)

---

## Foreign Key Rules

### ApprovedInsight → ValidationLog

```
Relationship: Many-to-One (many ApprovedInsight can reference one ValidationLog? NO)
Cardinality: One-to-One (unique validationId FK)
Constraint: onDelete: Restrict
Effect: Cannot delete ValidationLog if referenced by ApprovedInsight
```

**Why RESTRICT**:
- ValidationLog is canonical, immutable source
- Once referenced, must be preserved
- Enforces data integrity
- Prevents accidental loss of validation data

### ApprovalPromotion → ApprovedInsight

```
Relationship: Many-to-One
Cardinality: Many ApprovalPromotion per ApprovedInsight
Constraint: onDelete: Restrict
Effect: Cannot delete ApprovedInsight if ApprovalPromotion records exist
```

**Why RESTRICT**:
- ApprovalPromotion is permanent audit trail
- Cannot be silently cascade-deleted
- Enforces immutability of approval history
- Prevents loss of decision records
- Compliant with audit/compliance requirements

---

## Enum Values Reference

### Valid ApprovalStatus Values

```
NEW      ✅ Used in: ApprovedInsight.approvalStatus default, ApprovalPromotion transitions
ACTIVE   ✅ Used in: ApprovalPromotion transitions
PROMOTED ✅ Used in: ApprovalPromotion transitions (Phase 3 only)
ARCHIVED ✅ Used in: ApprovalPromotion transitions (Phase 3 only)
```

### Valid Transitions

```
NEW → ACTIVE       ✅ Activation
NEW → ARCHIVED     ✅ Reject (skip to archived)
ACTIVE → PROMOTED  ✅ Promotion (Phase 3)
ACTIVE → ARCHIVED  ✅ Archival (Phase 3)
PROMOTED → ARCHIVED ✅ Archival (Phase 3)
```

### Invalid Transitions

```
ACTIVE → NEW       ❌ Cannot revert to NEW
PROMOTED → ACTIVE  ❌ Cannot revert to previous status
ARCHIVED → *       ❌ ARCHIVED is terminal state
```

---

## Index Performance

### ApprovedInsight Indexes (3)

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `(approvalStatus)` | Fast status filtering | WHERE approvalStatus = 'ACTIVE' |
| `(approvedAt)` | Fast date-range queries | WHERE approvedAt > '2026-06-01' |
| `(approvalStatus, approvedAt)` | Fast combined filtering | WHERE approvalStatus = 'ACTIVE' AND approvedAt > '2026-06-01' |

**Performance**: O(log n) instead of O(n) full table scan

### ApprovalPromotion Indexes (4)

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `(approvedInsightId)` | Fast reverse lookup | WHERE approvedInsightId = '...' |
| `(decidedAt)` | Fast timeline queries | WHERE decidedAt > '2026-06-01' |
| `(toStatus)` | Fast type filtering | WHERE toStatus = 'PROMOTED' |
| `(approvedInsightId, decidedAt)` | Fast history reconstruction | WHERE approvedInsightId = '...' ORDER BY decidedAt |

**Performance**: 10-100x faster Phase 3 queries

---

## Constraints Summary

### Hard Constraints (Cannot be changed)

1. ApprovalStatus enum has exactly 4 values: NEW, ACTIVE, PROMOTED, ARCHIVED
2. ApprovedInsight has exactly 7 fields (no additions without formal review)
3. ApprovalPromotion has exactly 7 fields (no additions without formal review)
4. Both FK relationships use `onDelete: Restrict` (not CASCADE, not SetNull)
5. Lifecycle timestamps NOT stored in ApprovedInsight
6. No insight data duplicated from ValidationLog
7. ApprovalPromotion is insert-only (immutable)

### Soft Constraints (Guided by design)

1. Keep Phase 2 scope to approval-only (no engagement logic)
2. Use derived timestamps for activatedAt/promotedAt/archivedAt
3. Validate status transitions before recording
4. Log all promotion decisions with reason and decision-maker
5. Support simple filtering (status, type, date) without ranking

---

## Snapshot Verification

**Date**: 2026-06-13  
**Commit**: b2be34a  
**Schema Status**: LOCKED  
**Implementation Status**: NOT STARTED  
**Migration Status**: NOT CREATED  
**Database Status**: UNCHANGED  

This snapshot is exact copy of `prisma/schema.prisma` at commit b2be34a.

Any deviation from this snapshot requires formal architectural review before implementation proceeds.

