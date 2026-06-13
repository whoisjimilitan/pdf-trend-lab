# Phase 2: Revised Approval Workflow Design (APPROVED)

**Status**: ✅ FROZEN — APPROVED ARCHITECTURE  
**Date**: 2026-06-13  
**Previous Review**: PHASE_2_ARCHITECTURE_REVIEW.md  
**Replaces**: PHASE_2_APPROVAL_WORKFLOW_DESIGN.md (superseded)

---

## Core Design Principle

**Single Source of Truth**

```
ValidationLog (canonical insight data)
       ↓ (immutable reference)
ApprovedInsight (approval metadata only)
       ↓ (join when needed)
Queries
```

**No duplication. ValidationLog is authoritative.**

---

## System Architecture

### Input: ValidationLog (Existing)

Shadow pipeline output. Contains:
- validationId (unique)
- selectedInsightType
- selectedBecause (reasoning)
- confidenceScore (0.0–1.0)
- confidenceBand
- status (APPROVED/PENDING_MORE_EVIDENCE/REJECTED_FOR_NOW)
- evidenceSourceCount
- contradictionsCount
- enrichmentLevel

**This is the canonical insight storage. Do not duplicate.**

### Output: ApprovedInsight (NEW)

```prisma
model ApprovedInsight {
  id                String    @id @default(cuid())
  
  // SINGLE REFERENCE (immutable)
  validationId      String    @unique
  validationLog     ValidationLog @relation(
    fields: [validationId],
    references: [validationId],
    onDelete: Restrict
  )
  
  // LIFECYCLE METADATA ONLY
  approvalStatus    ApprovalStatus  @default(NEW)
  // States: NEW → ACTIVE → PROMOTED → ARCHIVED
  
  // APPROVAL TIMESTAMP (ONLY)
  approvedAt        DateTime  @default(now())
  // Lifecycle timestamps derived from ApprovalPromotion (no duplication)
  
  // AUDIT TRAIL
  promotionHistory  ApprovalPromotion[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([approvalStatus])
  @@index([approvedAt])
  @@index([approvalStatus, approvedAt])
  @@unique([validationId])
}

model ApprovalPromotion {
  id                String    @id @default(cuid())
  
  approvedInsightId String
  approvedInsight   ApprovedInsight @relation(
    fields: [approvedInsightId],
    references: [id],
    onDelete: Restrict  // Audit trail is immutable
  )
  
  fromStatus        ApprovalStatus
  toStatus          ApprovalStatus
  promotionReason   String          @db.Text
  decidedAt         DateTime        @default(now())
  decidedBy         String?
  
  @@index([approvedInsightId])
  @@index([decidedAt])
  @@index([toStatus])
  @@index([approvedInsightId, decidedAt])
}
```

**Guarantees**:
- ✅ ApprovedInsight stores ONLY approval metadata (no duplication)
- ✅ No insight data is duplicated from ValidationLog
- ✅ No lifecycle timestamps duplicated from ApprovalPromotion
- ✅ ValidationLog is immutable source of insight data
- ✅ ApprovalPromotion is authoritative audit trail
- ✅ All state transitions logged with full history
- ✅ onDelete: Restrict on both FK relationships (prevents orphaned records and cascade deletion)
- ✅ Lifecycle timestamps derived when needed (activatedAt, promotedAt, archivedAt)

**Phase 2 Final Architecture Patch Applied** (2026-06-13):
- ✅ PATCH 1: Lifecycle timestamp duplication removed (activatedAt, promotedAt, archivedAt NOT in ApprovedInsight)
- ✅ PATCH 2: Explicit `onDelete: Restrict` added to ApprovalPromotion → ApprovedInsight FK
- ✅ PATCH 3: All 8 query optimization indexes documented (3 for ApprovedInsight, 4 for ApprovalPromotion)
- ✅ PATCH 4: Single source of truth enforced (zero duplication across tables)

**Lifecycle Timestamp Derivation**:
```typescript
// activatedAt = first ApprovalPromotion where toStatus=ACTIVE
const activated = promotionHistory.find(p => p.toStatus === "ACTIVE")?.decidedAt

// promotedAt = first ApprovalPromotion where toStatus=PROMOTED
const promoted = promotionHistory.find(p => p.toStatus === "PROMOTED")?.decidedAt

// archivedAt = first ApprovalPromotion where toStatus=ARCHIVED
const archived = promotionHistory.find(p => p.toStatus === "ARCHIVED")?.decidedAt
```

---

## Approved Components (4 Total)

### Component 1: Approval Decision Engine

**File**: `lib/b2b-approval-decision-engine.ts`

**Purpose**: Evaluate ValidationLog against criteria. Answer: "Should this be approved?"

**Interface**:
```typescript
export interface ApprovalCriteria {
  minConfidence: number              // e.g., 0.65
  maxContradictions: number          // e.g., 1
  minEvidenceSources: number         // e.g., 2
  requiredEnrichmentLevel: string    // full, partial, minimal
  allowedStatuses: string[]          // APPROVED, PENDING_MORE_EVIDENCE, etc.
}

export interface ApprovalDecision {
  validationId: string
  approved: boolean
  confidenceScore: number
  reasoning: string
  criteria: ApprovalCriteria
  timestamp: Date
}

export function evaluateApproval(
  validationLog: ValidationLogData,
  criteria: ApprovalCriteria
): ApprovalDecision
```

**Logic**:
- Check confidence ≥ minConfidence
- Check contradictions ≤ maxContradictions
- Check evidenceSources ≥ minEvidenceSources
- Check enrichmentLevel meets requirement
- Check status in allowedStatuses
- Return APPROVED/REJECTED with reasoning

**Constraints**:
- Pure function (no database)
- No engagement data
- Deterministic (same input = same output)
- Configurable criteria (not hardcoded)

**Est. LOC**: 120

---

### Component 2: Approval Criteria Manager

**File**: `lib/b2b-approval-criteria.ts`

**Purpose**: Store and manage approval criteria presets.

**Interface**:
```typescript
export interface ApprovalCriteria {
  minConfidence: number
  maxContradictions: number
  minEvidenceSources: number
  requiredEnrichmentLevel: string
  allowedStatuses: string[]
}

// Predefined presets
export const DEFAULT_CRITERIA: ApprovalCriteria = {
  minConfidence: 0.65,
  maxContradictions: 1,
  minEvidenceSources: 2,
  requiredEnrichmentLevel: "partial",
  allowedStatuses: ["APPROVED", "PENDING_MORE_EVIDENCE"]
}

export const STRICT_CRITERIA: ApprovalCriteria = {
  minConfidence: 0.85,
  maxContradictions: 0,
  minEvidenceSources: 3,
  requiredEnrichmentLevel: "full",
  allowedStatuses: ["APPROVED"]
}

export const PERMISSIVE_CRITERIA: ApprovalCriteria = {
  minConfidence: 0.50,
  maxContradictions: 2,
  minEvidenceSources: 1,
  requiredEnrichmentLevel: "minimal",
  allowedStatuses: ["APPROVED", "PENDING_MORE_EVIDENCE", "REJECTED_FOR_NOW"]
}

export function getCriteria(name: string): ApprovalCriteria
export function updateCriteria(name: string, updates: Partial<ApprovalCriteria>): void
```

**Constraints**:
- Criteria are immutable once applied to an approval
- Can create new variants
- Cannot modify historical criteria
- All values must be justifiable

**Est. LOC**: 80

---

### Component 3: Approval Service

**File**: `lib/b2b-approval-service.ts`

**Purpose**: Main API for approval operations. Orchestrate decision engine with database.

**Interface**:
```typescript
export async function approveValidationLog(
  validationId: string,
  criteria: ApprovalCriteria
): Promise<ApprovedInsight | null>
// Evaluates ValidationLog against criteria
// If approved: creates ApprovedInsight (status: NEW)
// If rejected: returns null
// Does NOT duplicate insight data (references only)

export async function promoteInsight(
  approvedInsightId: string,
  toStatus: ApprovalStatus,
  reason: string
): Promise<ApprovalPromotion>
// Records status transition in ApprovalPromotion
// Updates approvalStatus in ApprovedInsight
// No engagement data needed
// Valid transitions: NEW → ACTIVE → PROMOTED → ARCHIVED

export async function getApprovedInsights(
  filters?: {
    status?: string
    since?: Date
    insightType?: string
  }
): Promise<ApprovedInsight[]>
// Simple filtering (no ranking, no scoring)
// Joins ValidationLog to return insight data
// Returns: ApprovedInsight + ValidationLog data

export async function getApprovalHistory(
  approvedInsightId: string
): Promise<ApprovalPromotion[]>
// Get promotion history audit trail
```

**Constraints**:
- Uses shared Prisma singleton
- All database operations atomic
- No engagement data required
- No automatic promotion logic
- No ranking or scoring

**Est. LOC**: 150

---

### Component 4: Approval Batch Processor

**File**: `lib/b2b-approval-batch-processor.ts`

**Purpose**: Batch-evaluate ValidationLog entries and create ApprovedInsights.

**Interface**:
```typescript
export interface BatchApprovalJob {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  totalValidations: number
  approvedCount: number
  rejectedCount: number
  startedAt: DateTime
  completedAt?: DateTime
}

export async function runApprovalBatch(
  criteria: ApprovalCriteria,
  filters?: {
    since?: Date
    insightType?: string
    minConfidence?: number
  }
): Promise<BatchApprovalJob>
// Query ValidationLog entries matching filters
// Evaluate each against criteria
// Create ApprovedInsights for approved entries
// Log results and errors
// Return job summary

export async function getBatchStatus(jobId: string): Promise<BatchApprovalJob>
// Query batch job status
```

**Constraints**:
- Atomic per validation (approve or skip)
- Idempotent (same input = same result)
- Error resilience (skip invalid entries)
- Non-blocking (can run async)
- Logs all decisions

**Est. LOC**: 140

---

## Deferred to Phase 3 (NOT PHASE 2)

The following are explicitly deferred. Do NOT implement in Phase 2:

❌ **Insight Pool Manager**
- Ranking by engagement
- Scoring by metrics
- Performance thresholds
- Insight pool queries

❌ **Promotion Orchestrator**
- Engagement-based promotion rules
- Automatic promotion logic
- Automatic archival logic
- Performance-based decisions

❌ **Engagement Ranking**
- Rank insights by impression count
- Rank by engagement rate
- Rank by conversion rate
- Sorting/ordering by metrics

❌ **Engagement Thresholds**
- Minimum engagement thresholds
- Minimum conversion thresholds
- Time-based decay rules
- Performance scoring

❌ **Automatic Promotion Logic**
- Promote if engagement > 15%
- Archive if engagement < 5% for 30 days
- Any metric-based automation
- Any learning-based decisions

**Reason**: These require PageEngagementLog metrics that aren't populated until Phase 3. Phase 2 does NOT have this data.

---

## Approval Workflow (Phase 2 Only)

```
ValidationLog (shadow pipeline output)
     ↓
[Approval Decision Engine]
  Apply criteria
  Confidence ≥ 0.65?
  Evidence ≥ 2 sources?
  Contradictions ≤ 1?
     ↓
DECISION: APPROVED or REJECTED
     ↓
ApprovedInsight created (status: NEW)
  └─→ validationId (reference only, immutable)
  └─→ approvalStatus: NEW
  └─→ approvedAt: now()
     ↓
[Manual Activation]
User manually approves
     ↓
promoteInsight()
  Status: NEW → ACTIVE
  Reason: "Approved for active use"
  ApprovalPromotion logged
     ↓
ApprovedInsight (status: ACTIVE)
  └─→ activatedAt: now()
     ↓
Query: "Get all active insights"
  ✓ Can answer in Phase 2
  ✓ No engagement data needed
  ✓ No ranking/scoring
  ✓ Simple filters (status, type, since)
     ↓
Ready for Phase 3
  (but NO automatic promotion yet)
```

---

## Query Patterns (Phase 2)

### Get Approved Insight WITH Data

```typescript
const approved = await getApprovedInsights({ status: ApprovalStatus.ACTIVE })

// Result includes:
// - approved.id
// - approved.validationId
// - approved.approvalStatus (ACTIVE)
// - approved.approvedAt
// - approved.activatedAt (derived)
// - validationLog (joined): {
//   - selectedInsightType
//   - confidenceScore
//   - confidenceBand
//   - evidenceSourceCount
//   - contradictionsCount
//   - enrichmentLevel
// }
```

### Get Approval History

```typescript
const history = await getApprovalHistory(approvedInsightId)

// Result: ApprovalPromotion[]
// - NEW → ACTIVE (approved)
// - ACTIVE → PROMOTED (future, Phase 3)
// - PROMOTED → ARCHIVED (future, Phase 3)
```

---

## Schema Changes

### Migration: `add_approval_workflow`

**New Tables**:
- ApprovedInsight (approval metadata)
- ApprovalPromotion (audit trail)

**Indexes**:
- ApprovedInsight.approvalStatus (fast filtering)
- ApprovedInsight.approvedAt (fast date range queries)
- ApprovedInsight.validationId (FK lookup)
- ApprovalPromotion.approvedInsightId (reverse lookup)
- ApprovalPromotion.decidedAt (audit trail)

**Foreign Keys**:
- ApprovedInsight.validationId → ValidationLog.validationId
- ApprovalPromotion.approvedInsightId → ApprovedInsight.id

**Constraints**:
- ApprovedInsight.validationId UNIQUE (one approval per validation)

---

## No Changes To

❌ ValidationLog schema (immutable source)  
❌ PageEngagementLog schema (not used in Phase 2)  
❌ Insight object contract (frozen)  
❌ Shadow observer pipeline (frozen)  
❌ Renderers (frozen)  
❌ Production email generation (frozen)  

---

## Testing Strategy (Phase 2)

### Unit Tests

**`b2b-approval-decision-engine.test.ts`**:
- Test confidence threshold evaluation
- Test evidence count evaluation
- Test contradiction count evaluation
- Test enrichment level evaluation
- Test combined criteria logic
- Test reasoning output
- Test all criteria presets

**`b2b-approval-criteria.test.ts`**:
- Test criteria presets (default, strict, permissive)
- Test criteria retrieval
- Test criteria updates

**`b2b-approval-service.test.ts`**:
- Test approveValidationLog creates record
- Test promoteInsight updates status
- Test status transition validation
- Test getApprovedInsights filtering
- Test getApprovalHistory returns transitions

### Integration Tests

**`b2b-approval-workflow.integration.test.ts`**:
- ValidationLog → ApprovedInsight (approval)
- ApprovedInsight (new) → (active) (promotion)
- Batch processing multiple ValidationLog entries
- Idempotency (running twice = same result)
- Audit trail completeness

**Test Count**: ~25 total (vs 40+ in original design)

---

## Expected Implementation Scope

### Files to Create

**Core Implementation** (4 files):
- `lib/b2b-approval-decision-engine.ts` (120 LOC)
- `lib/b2b-approval-criteria.ts` (80 LOC)
- `lib/b2b-approval-service.ts` (150 LOC)
- `lib/b2b-approval-batch-processor.ts` (140 LOC)

**Tests** (3 files):
- `lib/__tests__/b2b-approval-decision-engine.test.ts` (100 LOC)
- `lib/__tests__/b2b-approval-service.test.ts` (120 LOC)
- `lib/__tests__/b2b-approval-workflow.integration.test.ts` (80 LOC)

**Database** (1 file):
- `prisma/migrations/[date]_add_approval_workflow/migration.sql` (80 LOC)

### Schema Changes

**`prisma/schema.prisma`**:
- Add ApprovedInsight model
- Add ApprovalPromotion model
- Add indexes and constraints
- `npx prisma generate`

### Total Implementation Effort

| Category | LOC | Effort |
|----------|-----|--------|
| Core (4 components) | 490 | 6 hours |
| Tests (3 files) | 300 | 3 hours |
| Schema + migration | 80 | 1 hour |
| Integration + verification | — | 3 hours |
| **Total** | **870** | **13 hours** |

---

## Success Criteria

✅ ApprovedInsight created without duplicating insight data  
✅ Approval decisions logged with reasoning  
✅ Status transitions recorded in ApprovalPromotion  
✅ Approved insights queryable by status/type/date  
✅ ValidationLog remains immutable source  
✅ All tests passing  
✅ TypeScript: zero errors  
✅ npm run build: success  
✅ No engagement logic in Phase 2  
✅ Clean foundation for Phase 3  

---

## Next Phase (Phase 3)

Phase 3 will add engagement-based promotion:

```
ApprovedInsight (status=ACTIVE) + PageEngagementLog
  ↓
Engagement Analysis (join metrics)
  ↓
Promotion Rules (engagement thresholds)
  ↓
Rank insights by performance
  ↓
Automatic promotion (ACTIVE → PROMOTED) or archival (ACTIVE → ARCHIVED)
```

Phase 2 does NOT implement this. Phase 3 will be clean addition on top.

---

## Approval Checklist

- [ ] Design reviewed and approved
- [ ] No duplicate data from ValidationLog
- [ ] Single source of truth (ValidationLog)
- [ ] All engagement logic deferred to Phase 3
- [ ] 4 focused components
- [ ] Clear phase boundary
- [ ] 870 LOC total (55% reduction)
- [ ] Ready to implement in 1 week

---

**STATUS: FROZEN — APPROVED FOR IMPLEMENTATION**

**Next Step**: Create PHASE_2_REVISED_CHECKLIST.md with implementation tasks.

**Do NOT implement code until checklist is complete.**
