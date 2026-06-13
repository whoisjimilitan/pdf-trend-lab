# Phase 2 Implementation Checklist (Revised)

**Status**: READY FOR IMPLEMENTATION  
**Approved Design**: PHASE_2_REVISED_DESIGN.md  
**Estimated Effort**: 13 hours (1 week)

---

## Pre-Implementation

### Baseline Verification

- [ ] v1-audit-resolved-stable tag exists
- [ ] CURRENT_SYSTEM_BASELINE.md reviewed
- [ ] PHASE_2_ARCHITECTURE_REVIEW.md reviewed
- [ ] PHASE_2_REVISED_DESIGN.md approved
- [ ] Environment: Node.js, Prisma, Database ready
- [ ] Git branch: clean, on main

---

## Files to Create (4 Core + 3 Tests = 7 Total)

### Core Implementation (4 Files)

#### 1. Approval Decision Engine

**File**: `lib/b2b-approval-decision-engine.ts`

**Checklist**:
- [ ] Create file
- [ ] Define ApprovalCriteria interface
- [ ] Define ApprovalDecision interface
- [ ] Implement evaluateApproval() function
- [ ] Implement confidenceCheck() helper
- [ ] Implement evidenceCheck() helper
- [ ] Implement contradictionCheck() helper
- [ ] Implement enrichmentCheck() helper
- [ ] Generate reasoning string for decision
- [ ] Return ApprovalDecision (approved: boolean, reasoning: string)
- [ ] Export all functions and types
- [ ] No database calls
- [ ] No engagement data
- [ ] Pure function (deterministic)

**Est. LOC**: 120  
**Completed**: ☐

---

#### 2. Approval Criteria Manager

**File**: `lib/b2b-approval-criteria.ts`

**Checklist**:
- [ ] Create file
- [ ] Define ApprovalCriteria interface
- [ ] Create DEFAULT_CRITERIA constant
- [ ] Create STRICT_CRITERIA constant
- [ ] Create PERMISSIVE_CRITERIA constant
- [ ] Implement getCriteria(name: string) function
- [ ] Implement updateCriteria(name: string, updates: Partial) function
- [ ] Add validation for criteria values
- [ ] Export all criteria presets
- [ ] Add JSDoc comments
- [ ] No database operations
- [ ] Configurable (not hardcoded)

**Est. LOC**: 80  
**Completed**: ☐

---

#### 3. Approval Service

**File**: `lib/b2b-approval-service.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client (shared singleton)
- [ ] Import decision engine
- [ ] Define ApprovedInsight interface (return type)
- [ ] Implement approveValidationLog():
  - [ ] Query ValidationLog by validationId
  - [ ] Call evaluateApproval()
  - [ ] If approved: create ApprovedInsight with reference only
  - [ ] Store validationId (FK), approvalStatus, approvedAt
  - [ ] Do NOT copy insight data
  - [ ] Return created ApprovedInsight
  - [ ] If rejected: return null
- [ ] Implement promoteInsight():
  - [ ] Validate status transition (new → active → promoted → archived)
  - [ ] Update ApprovedInsight.approvalStatus
  - [ ] Set timestamp (activatedAt / promotedAt / archivedAt)
  - [ ] Create ApprovalPromotion record
  - [ ] Return ApprovalPromotion
- [ ] Implement getApprovedInsights():
  - [ ] Support filters: status, since, insightType
  - [ ] Join ValidationLog for insight data
  - [ ] No ranking or sorting
  - [ ] Return ApprovedInsight[] with joined data
- [ ] Implement getApprovalHistory():
  - [ ] Query ApprovalPromotion records
  - [ ] Return sorted by decidedAt DESC
- [ ] Use shared Prisma singleton
- [ ] All operations atomic
- [ ] Error handling for all database ops
- [ ] Export all functions

**Est. LOC**: 150  
**Completed**: ☐

---

#### 4. Approval Batch Processor

**File**: `lib/b2b-approval-batch-processor.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client
- [ ] Import approval service
- [ ] Import decision engine
- [ ] Define BatchApprovalJob interface
- [ ] Implement runApprovalBatch():
  - [ ] Query ValidationLog matching filters
  - [ ] For each ValidationLog entry:
    - [ ] Call evaluateApproval()
    - [ ] If approved: call approveValidationLog()
    - [ ] If rejected: skip (log in summary)
    - [ ] Catch and log errors
  - [ ] Return BatchApprovalJob with summary
  - [ ] Support filters: since, insightType, minConfidence
- [ ] Implement getBatchStatus():
  - [ ] Query batch job status
  - [ ] Return BatchApprovalJob
- [ ] Make idempotent (same input = same result)
- [ ] Non-blocking (can run async)
- [ ] Error resilience (skip invalid entries)
- [ ] Comprehensive logging
- [ ] Export all functions

**Est. LOC**: 140  
**Completed**: ☐

---

### Test Implementation (3 Files)

#### 5. Decision Engine Tests

**File**: `lib/__tests__/b2b-approval-decision-engine.test.ts`

**Test Cases**:
- [ ] Test 1: Confidence threshold pass (0.75 > 0.65)
- [ ] Test 2: Confidence threshold fail (0.55 < 0.65)
- [ ] Test 3: Evidence count pass (3 > 2)
- [ ] Test 4: Evidence count fail (1 < 2)
- [ ] Test 5: Contradiction count pass (1 ≤ 1)
- [ ] Test 6: Contradiction count fail (2 > 1)
- [ ] Test 7: Enrichment level pass (partial acceptable)
- [ ] Test 8: Enrichment level fail (minimal not acceptable for strict)
- [ ] Test 9: Status allowed (APPROVED in allowedStatuses)
- [ ] Test 10: Status not allowed (REJECTED_FOR_NOW not in allowedStatuses)
- [ ] Test 11: All criteria pass → APPROVED
- [ ] Test 12: One criterion fails → REJECTED
- [ ] Test 13: Reasoning string generated correctly
- [ ] Test 14: DEFAULT_CRITERIA works
- [ ] Test 15: STRICT_CRITERIA works
- [ ] Test 16: PERMISSIVE_CRITERIA works

**Est. Tests**: 16  
**Est. LOC**: 100  
**Completed**: ☐

---

#### 6. Approval Service Tests

**File**: `lib/__tests__/b2b-approval-service.test.ts`

**Test Cases**:
- [ ] Test 1: approveValidationLog() creates ApprovedInsight
- [ ] Test 2: validationId is stored (reference only)
- [ ] Test 3: No insight data is copied (just reference)
- [ ] Test 4: approvalStatus set to "new"
- [ ] Test 5: approvedAt timestamp set
- [ ] Test 6: Approved insight is queryable
- [ ] Test 7: Rejected validation returns null
- [ ] Test 8: promoteInsight() updates status
- [ ] Test 9: Status transition new → active works
- [ ] Test 10: activatedAt timestamp set
- [ ] Test 11: ApprovalPromotion record created
- [ ] Test 12: Invalid transition rejected (e.g., new → archived)
- [ ] Test 13: getApprovedInsights() filters by status
- [ ] Test 14: getApprovedInsights() filters by date
- [ ] Test 15: getApprovalHistory() returns all promotions
- [ ] Test 16: getApprovedInsights() joins ValidationLog data

**Est. Tests**: 16  
**Est. LOC**: 120  
**Completed**: ☐

---

#### 7. Integration Tests

**File**: `lib/__tests__/b2b-approval-workflow.integration.test.ts`

**Test Cases**:
- [ ] Test 1: ValidationLog → ApprovedInsight (full flow)
- [ ] Test 2: Approval decision applied correctly
- [ ] Test 3: ApprovedInsight status: "new"
- [ ] Test 4: Status transition new → active
- [ ] Test 5: ApprovalPromotion audit trail complete
- [ ] Test 6: Batch processing multiple ValidationLogs
- [ ] Test 7: Batch idempotency (same input = same result)
- [ ] Test 8: Error resilience (invalid entries skipped)
- [ ] Test 9: Batch summary counts correct
- [ ] Test 10: Queries join ValidationLog + ApprovedInsight
- [ ] Test 11: Insight data is not duplicated
- [ ] Test 12: ValidationLog remains immutable
- [ ] Test 13: Edge case: confidence = threshold (exactly 0.65)
- [ ] Test 14: Edge case: evidence = threshold (exactly 2)
- [ ] Test 15: Edge case: contradictions = threshold (exactly 1)

**Est. Tests**: 15  
**Est. LOC**: 80  
**Completed**: ☐

---

## Database Migration

### Schema Changes

**File**: `prisma/schema.prisma`

**Checklist**:
- [ ] Add ApprovedInsight model after ValidationLog
- [ ] Define all fields (id, validationId, approvalStatus, timestamps, etc.)
- [ ] Add relationship to ValidationLog (fields, references)
- [ ] Add @@unique([validationId])
- [ ] Add @@index decorators (approvalStatus, approvedAt, validationId)
- [ ] Add ApprovalPromotion model
- [ ] Define all fields (id, approvedInsightId, fromStatus, toStatus, etc.)
- [ ] Add relationship to ApprovedInsight (fields, references)
- [ ] Add @@index decorators (approvedInsightId, decidedAt)
- [ ] Validate schema: `npx prisma validate`
- [ ] Generate client: `npx prisma generate`

**Est. LOC**: 60  
**Completed**: ☐

---

### Migration File

**File**: `prisma/migrations/[date]_add_approval_workflow/migration.sql`

**Checklist**:
- [ ] Create migration directory
- [ ] Create migration.sql file
- [ ] CREATE TABLE ApprovedInsight with all fields
- [ ] CREATE UNIQUE INDEX on validationId
- [ ] CREATE INDEX on approvalStatus
- [ ] CREATE INDEX on approvedAt
- [ ] CREATE INDEX on validationId
- [ ] CREATE TABLE ApprovalPromotion with all fields
- [ ] CREATE INDEX on approvedInsightId
- [ ] CREATE INDEX on decidedAt
- [ ] Add foreign key constraints (if not auto-generated)
- [ ] Test migration: `npx prisma migrate dev --name add_approval_workflow`
- [ ] Verify schema synced: `npx prisma validate`

**Est. LOC**: 20  
**Completed**: ☐

---

## TypeScript & Build Verification

### Compilation Checks

- [ ] All 4 core files compile: `npx tsc --noEmit lib/b2b-approval-*.ts --skipLibCheck`
- [ ] All 3 test files compile: `npx tsc --noEmit lib/__tests__/b2b-approval-*.test.ts --skipLibCheck`
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] Prisma types available (after `npx prisma generate`)

### Build Verification

- [ ] `npm run build` succeeds
- [ ] No new TypeScript errors introduced
- [ ] No regression in existing code

**Completed**: ☐

---

## Test Execution

### Unit Tests

- [ ] `npm test -- b2b-approval-decision-engine` — All tests pass
- [ ] `npm test -- b2b-approval-service` — All tests pass
- [ ] `npm test -- b2b-approval-workflow.integration` — All tests pass
- [ ] Test coverage ≥ 80%

### Test Count

- [ ] Total tests: ~47 (16 + 16 + 15)
- [ ] All passing
- [ ] No skipped tests

**Completed**: ☐

---

## Code Quality

### Before Commit

- [ ] No `console.log()` (use logger or remove)
- [ ] All functions exported (public API clear)
- [ ] All interfaces exported (TypeScript contracts clear)
- [ ] Comments on complex logic only
- [ ] No hardcoded values (use constants or parameters)
- [ ] Error handling for all database operations
- [ ] Consistent naming (camelCase functions, PascalCase types)

### Git Status

- [ ] `git status` shows only Phase 2 files
- [ ] No modifications to frozen systems (shadow, renderers, conversion engine)
- [ ] No modifications to ValidationLog, PageEngagementLog schemas
- [ ] No modifications to Insight object

**Completed**: ☐

---

## Frozen Systems Verification

### Verify No Unintended Changes

- [ ] `git diff v1-audit-resolved-stable -- lib/b2b-conversion-engine.ts` — No changes
- [ ] `git diff v1-audit-resolved-stable -- lib/b2b-shadow-observer.ts` — No changes
- [ ] `git diff v1-audit-resolved-stable -- lib/renderers/` — No changes
- [ ] `git diff v1-audit-resolved-stable -- lib/page-engagement-tracker.ts` — No changes
- [ ] `git diff v1-audit-resolved-stable -- prisma/schema.prisma | grep -v "ApprovedInsight\|ApprovalPromotion"` — No other changes

**Completed**: ☐

---

## Phase 2 Completion Checklist

### All Components Implemented

- [ ] Approval Decision Engine (120 LOC)
- [ ] Approval Criteria Manager (80 LOC)
- [ ] Approval Service (150 LOC)
- [ ] Approval Batch Processor (140 LOC)
- [ ] Tests (300 LOC)
- [ ] Migration + Schema (80 LOC)
- [ ] **Total: 870 LOC**

### All Tests Passing

- [ ] Unit tests: 32 passing
- [ ] Integration tests: 15 passing
- [ ] **Total: 47 tests passing**

### All Verification Passed

- [ ] TypeScript: zero errors
- [ ] Build: success
- [ ] Frozen systems: unchanged
- [ ] No duplication: ValidationLog is canonical
- [ ] No engagement logic: all deferred to Phase 3

### Ready for Commit

- [ ] `git status` clean
- [ ] All files created
- [ ] All tests passing
- [ ] No regressions

**Completed**: ☐

---

## Success Metrics

✅ ValidationLog remains immutable source  
✅ ApprovedInsight stores only metadata (no duplication)  
✅ ApprovalPromotion records all state transitions  
✅ Approval decisions logged with reasoning  
✅ Approved insights queryable by status/type/date  
✅ No engagement logic in Phase 2  
✅ 4 focused components (not 6)  
✅ 870 LOC (not 1,940)  
✅ 1 week effort (not 2 weeks)  
✅ All tests passing  
✅ TypeScript: zero errors  
✅ Ready for Phase 3  

---

## Effort Breakdown

| Task | Estimate | Status |
|------|----------|--------|
| Decision Engine | 2h | ☐ |
| Criteria Manager | 1h | ☐ |
| Approval Service | 2.5h | ☐ |
| Batch Processor | 1.5h | ☐ |
| Decision Engine Tests | 1.5h | ☐ |
| Service Tests | 1.5h | ☐ |
| Integration Tests | 1.5h | ☐ |
| Schema + Migration | 1h | ☐ |
| Build + Verification | 1h | ☐ |
| **Total** | **13h** | ☐ |

---

## Next Steps After Completion

1. ✅ All items checked
2. ✅ Create commit: `phase2-architecture-freeze`
3. ✅ Tag if needed: (optional, not required)
4. ✅ Push to origin
5. ✅ Begin Phase 3 with clean foundation

---

**STATUS: READY FOR IMPLEMENTATION**

**Do NOT begin until all checklist items are reviewed.**

**Follow this checklist sequentially. Mark each task complete as it's done.**

**Expected completion: 1 week from start.**
