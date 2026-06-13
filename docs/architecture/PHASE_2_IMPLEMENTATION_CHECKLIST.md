# Phase 2 Implementation Checklist

⚠️ **STATUS: SUPERSEDED**

**Replaced by**: PHASE_2_REVISED_CHECKLIST.md  
**Reason**: This checklist is based on over-engineered design (1,940 LOC, 6 components). Use revised checklist for approved design (870 LOC, 4 components).

**DO NOT USE THIS CHECKLIST. Use PHASE_2_REVISED_CHECKLIST.md instead.**

---

# Original Checklist (Archived)

**Status**: READY FOR IMPLEMENTATION (SUPERSEDED)  
**Design Document**: PHASE_2_APPROVAL_WORKFLOW_DESIGN.md (ALSO SUPERSEDED)  
**Start Date**: Ready now (DO NOT USE)

---

## Pre-Implementation Verification

### Baseline Sanity Checks

- [ ] v1-audit-resolved-stable tag exists: `git tag | grep v1-audit-resolved-stable`
- [ ] All frozen systems verified operational
- [ ] CURRENT_SYSTEM_BASELINE.md reviewed
- [ ] Phase 2 design document reviewed

### Environment Setup

- [ ] Node.js v18+ available
- [ ] Prisma CLI installed
- [ ] Database credentials configured (.env file)
- [ ] Git branch protection disabled for migration testing (if applicable)

---

## Files to Create (6 Core Components)

### 1. Approval Decision Engine

**File**: `lib/b2b-approval-decision-engine.ts`

**Checklist**:
- [ ] Create file
- [ ] Import ApprovalCriteria interface
- [ ] Implement evaluateApproval() function
- [ ] Implement confidenceCheck()
- [ ] Implement contradictionCheck()
- [ ] Implement evidenceCheck()
- [ ] Implement enrichmentCheck()
- [ ] Return ApprovalDecision with reasoning
- [ ] Export for testing
- [ ] Add TypeScript types
- [ ] Test with unit tests

**Lines of Code**: ~150

---

### 2. Approval Criteria Manager

**File**: `lib/b2b-approval-criteria.ts`

**Checklist**:
- [ ] Create file
- [ ] Define ApprovalCriteria interface
- [ ] Create DEFAULT_CRITERIA constant
- [ ] Create STRICT_CRITERIA constant
- [ ] Create PERMISSIVE_CRITERIA constant
- [ ] Implement getCriteria(name: string)
- [ ] Implement updateCriteria(name: string, updates: Partial<ApprovalCriteria>)
- [ ] Add validation for criteria values
- [ ] Export criteria sets
- [ ] Add JSDoc comments

**Lines of Code**: ~80

---

### 3. Approval Promotion Manager

**File**: `lib/b2b-approval-promotion-manager.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client
- [ ] Implement approveInsight() - create ApprovedInsight from ValidationLog
- [ ] Implement promoteInsight() - update status and log promotion
- [ ] Implement getApprovedInsights() - query by type/status
- [ ] Implement getInsightPromotionHistory() - fetch ApprovalPromotion records
- [ ] Implement status transition validation
- [ ] Implement atomic operations (no partial updates)
- [ ] Use shared Prisma singleton
- [ ] Add error handling
- [ ] Export all functions

**Lines of Code**: ~200

---

### 4. Insight Pool Manager

**File**: `lib/b2b-insight-pool-manager.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client
- [ ] Define InsightPoolQuery interface
- [ ] Implement getInsightPool() - flexible querying
- [ ] Implement getInsightsByType(insightType: string)
- [ ] Implement getActiveInsights()
- [ ] Implement getPromotedInsights()
- [ ] Implement getInsightMetrics() - join with PageEngagementLog
- [ ] Calculate engagement rate (engagementCount / impressionCount)
- [ ] Calculate conversion rate (conversionCount / impressionCount)
- [ ] Add pagination support
- [ ] Add indexes/optimization notes
- [ ] Export all functions

**Lines of Code**: ~180

---

### 5. Approval Batch Processor

**File**: `lib/b2b-approval-batch-processor.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client
- [ ] Import approval decision engine
- [ ] Import approval promotion manager
- [ ] Define BatchApprovalJob interface
- [ ] Implement runApprovalBatch() - batch evaluate and approve
- [ ] Implement approveValidationLog() - single record approval
- [ ] Implement getBatchStatus() - query job progress
- [ ] Add filtering by date, insightType, confidence
- [ ] Add error resilience (skip invalid entries)
- [ ] Make idempotent (same input = same result)
- [ ] Log results and errors
- [ ] Return summary statistics
- [ ] Support async execution

**Lines of Code**: ~220

---

### 6. Promotion Workflow Orchestrator

**File**: `lib/b2b-promotion-workflow-orchestrator.ts`

**Checklist**:
- [ ] Create file
- [ ] Import Prisma client
- [ ] Import insight pool manager
- [ ] Import approval promotion manager
- [ ] Define PromotionRule interface
- [ ] Define PromotionWorkflow interface
- [ ] Implement evaluatePromotionEligibility() - check readiness
- [ ] Implement promoteReadyInsights() - batch promotion
- [ ] Implement recordPromotion() - log ApprovalPromotion
- [ ] Add rule evaluation logic
- [ ] Add engagement metric thresholds
- [ ] Add date-based conditions
- [ ] Support manual approval override
- [ ] Validate status transitions

**Lines of Code**: ~200

---

## Database Changes

### Migration File to Create

**File**: `prisma/migrations/[date]_add_approval_workflow/migration.sql`

**Checklist**:
- [ ] Create migration directory
- [ ] Create migration.sql file
- [ ] Create ApprovedInsight table with all fields
- [ ] Create ApprovalPromotion table with all fields
- [ ] Add indexes (approvalStatus, insightType, confidenceScore, approvedAt, promotedAt)
- [ ] Add foreign key to ValidationLog (validationId)
- [ ] Add foreign key from ApprovalPromotion to ApprovedInsight
- [ ] Ensure indexes are efficient for Phase 3 queries
- [ ] Test migration: `npx prisma migrate dev --name add_approval_workflow`
- [ ] Verify schema: `npx prisma schema validate`

---

### Schema Changes

**File**: `prisma/schema.prisma`

**Checklist**:
- [ ] Add ApprovedInsight model after ValidationLog
- [ ] Add ApprovalPromotion model
- [ ] Define all fields (see design document)
- [ ] Add relationships (ValidationLog relation)
- [ ] Add indexes for queries (@@index decorators)
- [ ] Add unique constraint (validationId on ApprovedInsight)
- [ ] Validate schema: `npx prisma validate`
- [ ] Generate client: `npx prisma generate`

---

## Test Files to Create

### Unit Tests

**File**: `lib/__tests__/b2b-approval-decision-engine.test.ts`

**Test Cases**:
- [ ] Test confidence threshold check (pass/fail at boundary)
- [ ] Test contradiction count check
- [ ] Test evidence source count check
- [ ] Test enrichment level check
- [ ] Test combined criteria logic
- [ ] Test all approval criteria constants (default, strict, permissive)
- [ ] Test reasoning output

**Tests**: ~15–20

---

**File**: `lib/__tests__/b2b-approval-promotion-manager.test.ts`

**Test Cases**:
- [ ] Test approveInsight creates ApprovedInsight correctly
- [ ] Test immutable copy of ValidationLog data
- [ ] Test status transition validation
- [ ] Test promoteInsight records ApprovalPromotion
- [ ] Test getApprovedInsights queries by type
- [ ] Test getApprovedInsights queries by status
- [ ] Test getInsightPromotionHistory returns all promotions

**Tests**: ~12–15

---

**File**: `lib/__tests__/b2b-insight-pool-manager.test.ts`

**Test Cases**:
- [ ] Test getInsightsByType returns correct records
- [ ] Test getActiveInsights filters by status
- [ ] Test getPromotedInsights filters by status
- [ ] Test getInsightMetrics calculates engagement rate
- [ ] Test getInsightMetrics calculates conversion rate
- [ ] Test pagination (limit, offset)
- [ ] Test confidence threshold filtering

**Tests**: ~12–15

---

### Integration Tests

**File**: `lib/__tests__/b2b-approval-workflow.integration.test.ts`

**Test Cases**:
- [ ] ValidationLog → ApprovedInsight (approval flow)
- [ ] ApprovedInsight → Active (promotion flow)
- [ ] Active → Promoted (engagement-based)
- [ ] Promoted → Archived (retirement)
- [ ] Batch processing (multiple ValidationLog entries)
- [ ] Batch idempotency (running twice = same result)
- [ ] Engagement metrics join with PageEngagementLog
- [ ] Audit trail completeness (ApprovalPromotion records)

**Tests**: ~8–10

---

## TypeScript & Build Verification

### Compilation Checks

- [ ] `npx tsc --noEmit lib/b2b-approval-*.ts --skipLibCheck` → zero errors
- [ ] `npm run build` → success
- [ ] No TypeScript errors in new files
- [ ] All imports resolve correctly
- [ ] Prisma client types available

---

## Code Quality Checks

### Before Commit

- [ ] All functions exported (no internal-only functions without JSDoc)
- [ ] All interfaces exported (TypeScript contracts clear)
- [ ] Comments on complex logic only (not obvious code)
- [ ] No console.log() calls (use logger or remove)
- [ ] Error handling for all database operations
- [ ] No hardcoded values (use constants or parameters)
- [ ] Consistent naming (camelCase for functions, PascalCase for types)

---

## Verification Tests

### Run These Before Marking Phase 2 Complete

```bash
# Prisma validation
npx prisma validate

# TypeScript check
npx tsc --noEmit --skipLibCheck

# Build
npm run build

# Unit tests
npm test -- b2b-approval

# Integration tests
npm test -- b2b-approval-workflow.integration
```

All must PASS ✅

---

## Integration Checklist

### Verify No Changes to Frozen Systems

- [ ] Insight schema unchanged
- [ ] ValidationLog schema unchanged
- [ ] PageEngagementLog schema unchanged
- [ ] Shadow observer code unchanged
- [ ] Renderers unchanged
- [ ] Conversion engine unchanged
- [ ] No modifications to v1 baselines

### Verify New System Integration

- [ ] ApprovedInsight created from ValidationLog correctly
- [ ] ValidationLog data immutably copied (never modified)
- [ ] ApprovalPromotion records all state transitions
- [ ] Engagement metrics correctly joined from PageEngagementLog
- [ ] Status transitions follow state machine (new → active → promoted → archived)
- [ ] All decisions logged with reasoning

---

## Documentation Checklist

### Code Documentation

- [ ] JSDoc comments on all exported functions
- [ ] Type definitions clear and documented
- [ ] Approval criteria values documented
- [ ] Promotion rules documented
- [ ] Error conditions documented

### User-Facing Documentation

- [ ] Approval criteria guide (how to adjust thresholds)
- [ ] Promotion rules guide (how to configure promotion logic)
- [ ] Configuration reference (environment variables, if any)

---

## Git Workflow

### Before Committing

```bash
# Verify branch is clean
git status

# Check what will be committed
git diff --cached

# Verify against baseline
git diff v1-audit-resolved-stable

# Should show: 6 new files + 1 migration + 1 schema update
```

### Commit Message Format

```
feat: Phase 2 approval workflow implementation

Core components:
- b2b-approval-decision-engine.ts (criteria evaluation)
- b2b-approval-promotion-manager.ts (lifecycle management)
- b2b-approval-criteria.ts (configurable thresholds)
- b2b-insight-pool-manager.ts (querying and metrics)
- b2b-approval-batch-processor.ts (batch processing)
- b2b-promotion-workflow-orchestrator.ts (engagement-based promotion)

Database:
- ApprovedInsight table (immutable copy of validated insights)
- ApprovalPromotion table (audit trail of state transitions)
- Migration: [date]_add_approval_workflow

Design:
- Insight data immutable (copy-only)
- ValidationLog immutable (source of truth)
- Status transitions follow state machine
- All decisions logged (ApprovalPromotion)
- Configurable criteria and promotion rules

Tests:
- Unit tests for decision engine, promotion manager, pool manager
- Integration tests for end-to-end workflow
- All tests passing

No changes to frozen systems.
```

---

## Success Criteria

### Must Pass Before Completion

- ✅ All 6 core files created and tested
- ✅ Database migration applied successfully
- ✅ Prisma schema validated
- ✅ TypeScript compilation: zero errors
- ✅ npm run build: success
- ✅ All unit tests: PASS
- ✅ All integration tests: PASS
- ✅ Frozen systems unchanged
- ✅ Approval decision engine configurable
- ✅ Promotion workflow working
- ✅ Audit trail complete

### Post-Completion Verification

- ✅ ValidationLog → ApprovedInsight pipeline functional
- ✅ ApprovedInsights queryable by type/status/confidence
- ✅ Engagement metrics correctly calculated
- ✅ State transitions follow rules
- ✅ Promotion history complete

---

## Estimated Effort

| Component | Lines | Est. Time | Testing |
|-----------|-------|-----------|---------|
| Decision Engine | 150 | 1h | 30min |
| Criteria Manager | 80 | 30min | 15min |
| Promotion Manager | 200 | 2h | 45min |
| Pool Manager | 180 | 1.5h | 45min |
| Batch Processor | 220 | 2h | 1h |
| Orchestrator | 200 | 2h | 1h |
| Migration | 50 | 30min | 30min |
| Schema Update | 60 | 30min | 30min |
| Tests (3 files) | 800+ | 4h | — |
| **Total** | **1,940** | **~14h** | **~5h** |

**Estimated completion**: 1–2 days of focused implementation

---

## Rollback Plan

If implementation breaks anything:

```bash
# Revert to v1-audit-resolved-stable
git checkout v1-audit-resolved-stable

# Or keep branch, fix, and cherry-pick
git revert HEAD~N
```

All new code is isolated to Phase 2 files. No modifications to frozen systems means clean rollback.

---

## Next Steps After Phase 2 Completion

1. **Phase 3: Engagement Signal Interpretation**
   - Use ApprovedInsights from Phase 2
   - Integrate PageEngagementLog metrics
   - Develop readiness scoring

2. **Phase 4: Prospect Page Rendering**
   - Use ApprovedInsights + renderProspectPage()
   - Deploy rendered pages
   - Track engagement

3. **Phase 5: Recognition → Relief → Trust → Action**
   - Transform insights into messaging
   - Apply psychology framework
   - Shadow test new strategies

---

**This checklist is comprehensive. Follow it step-by-step. All checkboxes should be ✅ before considering Phase 2 complete.**
