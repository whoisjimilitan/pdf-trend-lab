# Phase 2: Insight Approval Workflow

⚠️ **STATUS: SUPERSEDED**

**Replaced by**: PHASE_2_REVISED_DESIGN.md  
**Reason**: Over-engineered. Contained duplicate data storage, premature optimization, and Phase 3 logic. See PHASE_2_ARCHITECTURE_REVIEW.md for details.

**DO NOT IMPLEMENT THIS DESIGN. Use PHASE_2_REVISED_DESIGN.md instead.**

---

# Original Design (Archived)

**Status**: DESIGN PHASE (SUPERSEDED)  
**Date**: 2026-06-13  
**Objective**: Create promotion pipeline between validated insights (ValidationLog) and approved insights (production ready)

---

## Design Overview

```
ValidationLog (Shadow Validation)
     ↓
     ├─→ Approval Decision Engine
     │      ├─→ Confidence threshold check
     │      ├─→ Evidence sufficiency check
     │      ├─→ Contradiction severity check
     │      └─→ Readiness assessment
     ↓
ApprovedInsight (Production Storage)
     ↓
     ├─→ Insight Pool Manager
     │      ├─→ Organize by insightType
     │      ├─→ Track promotion history
     │      └─→ Manage lifecycle (new → active → promoted → archived)
     ↓
Consumption (Phase 3+)
     ├─→ Email Insights (production messaging)
     ├─→ Page Insights (rendered on prospect pages)
     └─→ Engagement Analysis (signals vs predictions)
```

---

## System Architecture

### Input: ValidationLog Schema (Existing)

From shadow pipeline, contains:
- validationId (unique)
- prospectId
- selectedInsightType
- confidenceScore (0.0–1.0)
- confidenceBand (PROVEN, HIGH_CONFIDENCE, MODERATE, LOW, SPECULATION)
- status (APPROVED, PENDING_MORE_EVIDENCE, REJECTED_FOR_NOW)
- evidenceSourcesJson (array)
- contradictionsJson (array)
- contradictionsCount
- leadCategory
- enrichmentLevel (full, partial, minimal)
- Outcome tracking (emailSent, pageVisited, ctaClicked, conversionStatus)

### Output: ApprovedInsight Schema (NEW)

```prisma
model ApprovedInsight {
  id                      String    @id @default(cuid())
  
  // Reference to source validation
  validationId            String    @unique
  validationLog           ValidationLog @relation(fields: [validationId], references: [validationId])
  
  // Insight data (immutable copy from ValidationLog)
  insightType             String
  insightStatement        String    @db.Text
  painPoint               String    @db.Text
  opportunity             String    @db.Text
  
  // Approval metadata
  confidenceScore         Float     // 0.0–1.0 (copied from ValidationLog)
  confidenceBand          String    // PROVEN, HIGH_CONFIDENCE, MODERATE, LOW, SPECULATION
  evidenceSourceCount     Int
  contradictionsCount     Int
  enrichmentLevel         String    // full, partial, minimal
  
  // Lifecycle state
  approvalStatus          String    @default("new")
  // States: new → active → promoted → archived
  // new: just approved, not yet in use
  // active: currently available for consumption
  // promoted: moved to higher priority tier
  // archived: retired from active use
  
  approvedAt              DateTime  @default(now())
  activatedAt             DateTime?
  promotedAt              DateTime?
  archivedAt              DateTime?
  
  // Promotion tracking
  promotionHistory        ApprovalPromotion[]
  
  // Engagement metrics (populated from PageEngagementLog)
  impressionCount         Int       @default(0)
  engagementCount         Int       @default(0)
  conversionCount         Int       @default(0)
  
  // Metadata
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  
  @@index([approvalStatus])
  @@index([insightType])
  @@index([confidenceScore])
  @@index([approvedAt])
  @@index([promotedAt])
}

model ApprovalPromotion {
  id                      String    @id @default(cuid())
  
  approvedInsightId       String
  approvedInsight         ApprovedInsight @relation(fields: [approvedInsightId], references: [id])
  
  fromStatus              String    // new, active, promoted
  toStatus                String    // active, promoted, archived
  promotionReason         String    @db.Text
  
  // Decision data
  decisionType            String    // manual_approval, metric_threshold, engagement_signal
  decisionCriteria        String    @db.Text // JSON: what criteria triggered promotion
  
  // Decision maker info
  decidedAt               DateTime  @default(now())
  decidedBy               String?   // System or user ID
  
  createdAt               DateTime  @default(now())
  
  @@index([approvedInsightId])
  @@index([fromStatus])
  @@index([toStatus])
  @@index([decidedAt])
}
```

---

## Core Components (NEW FILES REQUIRED)

### 1. Approval Decision Engine
**File**: `lib/b2b-approval-decision-engine.ts`

**Purpose**: Evaluate ValidationLog entries and determine approval/rejection

**Exports**:
```typescript
// Approval criteria (configurable)
export interface ApprovalCriteria {
  minConfidence: number           // 0.0–1.0 (e.g., 0.65)
  maxContradictions: number       // max acceptable contradictions
  minEvidenceSources: number      // min required evidence sources
  requiredEnrichmentLevel: string // full, partial, minimal
  allowedStatuses: string[]       // APPROVED, PENDING_MORE_EVIDENCE, REJECTED_FOR_NOW
}

// Approval decision
export interface ApprovalDecision {
  validationId: string
  approved: boolean
  confidenceScore: number
  reasoning: string
  criteria: ApprovalCriteria
  timestamp: Date
}

// Main function
export function evaluateApproval(
  validationLog: ValidationLogData,
  criteria: ApprovalCriteria
): ApprovalDecision
```

**Logic**:
- Check confidence score ≥ minConfidence
- Check contradictions ≤ maxContradictions
- Check evidenceSources ≥ minEvidenceSources
- Check enrichmentLevel meets requirement
- Return APPROVED/REJECTED with reasoning

**Constraints**:
- Pure function (no side effects)
- No database writes
- Deterministic (same input → same decision)
- Configurable criteria (not hardcoded)

---

### 2. Approval Promotion Manager
**File**: `lib/b2b-approval-promotion-manager.ts`

**Purpose**: Manage ApprovedInsight lifecycle and state transitions

**Exports**:
```typescript
export interface InsightPromotion {
  approvedInsightId: string
  fromStatus: "new" | "active" | "promoted"
  toStatus: "active" | "promoted" | "archived"
  promotionReason: string
  decisionType: "manual_approval" | "metric_threshold" | "engagement_signal"
  decisionCriteria: Record<string, unknown>
}

export async function approveInsight(
  validationLog: ValidationLogData,
  criteria: ApprovalCriteria
): Promise<ApprovedInsight>

export async function promoteInsight(
  approvedInsightId: string,
  promotion: InsightPromotion
): Promise<ApprovedInsight>

export async function getApprovedInsights(
  insightType?: string,
  status?: string
): Promise<ApprovedInsight[]>

export async function getInsightPromotionHistory(
  approvedInsightId: string
): Promise<ApprovalPromotion[]>
```

**Operations**:
- Create ApprovedInsight from ValidationLog (immutable copy)
- Record approval timestamp
- Track promotion history
- Query insights by type/status/date
- Update lifecycle states

**Constraints**:
- Never modify Insight data (copy-only)
- Always log promotions (audit trail)
- Atomic state transitions (no partial updates)
- Validate status transitions (new → active → promoted → archived only)

---

### 3. Approval Criteria Manager
**File**: `lib/b2b-approval-criteria.ts`

**Purpose**: Manage approval thresholds and decision rules

**Exports**:
```typescript
export interface ApprovalCriteria {
  minConfidence: number
  maxContradictions: number
  minEvidenceSources: number
  requiredEnrichmentLevel: string
  allowedStatuses: string[]
}

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
- Criteria are configurable but immutable once applied
- All metrics must be justifiable
- Default criteria set by stakeholder approval
- Can create variant criteria sets (strict, permissive, etc.)

---

### 4. Insight Pool Manager
**File**: `lib/b2b-insight-pool-manager.ts`

**Purpose**: Organize and query approved insights by type, status, readiness

**Exports**:
```typescript
export interface InsightPoolQuery {
  insightType?: string
  status?: "new" | "active" | "promoted" | "archived"
  minConfidence?: number
  limit?: number
  offset?: number
}

export async function getInsightPool(
  query: InsightPoolQuery
): Promise<ApprovedInsight[]>

export async function getInsightsByType(
  insightType: string
): Promise<ApprovedInsight[]>

export async function getActiveInsights(): Promise<ApprovedInsight[]>

export async function getPromotedInsights(): Promise<ApprovedInsight[]>

export async function getInsightMetrics(
  approvedInsightId: string
): Promise<{
  impressionCount: number
  engagementCount: number
  conversionCount: number
  engagementRate: number
  conversionRate: number
}>
```

**Operations**:
- Query by type (customer_relocation, consistency_challenge, etc.)
- Query by status (new, active, promoted)
- Query by confidence threshold
- Calculate engagement metrics
- Support pagination

**Constraints**:
- No modification of Insight data
- Read-only access patterns
- Efficient queries (indexed on status, type, confidence)

---

### 5. Approval Batch Processor
**File**: `lib/b2b-approval-batch-processor.ts`

**Purpose**: Run approval workflows on batches of ValidationLog entries

**Exports**:
```typescript
export interface BatchApprovalJob {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  totalValidations: number
  approvedCount: number
  rejectedCount: number
  startedAt: DateTime
  completedAt?: DateTime
  errors?: string[]
}

export async function runApprovalBatch(
  criteria: ApprovalCriteria,
  filters?: {
    since?: DateTime
    insightType?: string
    minConfidence?: number
  }
): Promise<BatchApprovalJob>

export async function getBatchStatus(jobId: string): Promise<BatchApprovalJob>

export async function approveValidationLog(
  validationId: string,
  criteria: ApprovalCriteria
): Promise<ApprovedInsight | null>
```

**Logic**:
- Query ValidationLog entries matching filters
- Evaluate each against criteria
- Batch create ApprovedInsight records
- Log results and errors
- Return summary

**Constraints**:
- Non-blocking (can run async)
- Atomic per validation (approve or skip, never partial)
- Idempotent (running twice = same result)
- Error resilience (skip invalid entries, log reasons)

---

### 6. Promotion Workflow Orchestrator
**File**: `lib/b2b-promotion-workflow-orchestrator.ts`

**Purpose**: Manage insight promotions based on engagement metrics

**Exports**:
```typescript
export interface PromotionWorkflow {
  insightId: string
  currentStatus: string
  eligibleForPromotion: boolean
  promotionReason?: string
  recommendedNextStatus?: string
}

export interface PromotionRule {
  fromStatus: string
  toStatus: string
  criteria: {
    minEngagementRate?: number
    minConversions?: number
    minDaysActive?: number
    manualApprovalRequired?: boolean
  }
}

export async function evaluatePromotionEligibility(
  approvedInsightId: string
): Promise<PromotionWorkflow>

export async function promoteReadyInsights(
  rules: PromotionRule[]
): Promise<{ promoted: string[], skipped: string[] }>

export async function recordPromotion(
  approvedInsightId: string,
  toStatus: string,
  reason: string
): Promise<ApprovalPromotion>
```

**Logic**:
- Check engagement metrics (from PageEngagementLog join)
- Evaluate against promotion rules
- Recommend or execute promotion
- Record decision in ApprovalPromotion
- Update ApprovedInsight status

**Constraints**:
- Promotion rules are configurable
- Manual approval option available
- Audit trail required
- Cannot skip steps (new → active → promoted → archived only)

---

## Database Schema Changes

### New Tables

```prisma
model ApprovedInsight {
  // See schema above
}

model ApprovalPromotion {
  // See schema above
}
```

### New Migration

**File**: `prisma/migrations/[date]_add_approval_workflow/migration.sql`

Creates:
- ApprovedInsight table
- ApprovalPromotion table
- Indexes on approval status, insight type, confidence, approval date
- Indexes on promotion status and decision date
- Foreign key to ValidationLog

---

## Integration Points

### Input: From ValidationLog
- Consume ValidationLog entries (shadow pipeline output)
- Copy decision data to ApprovedInsight
- Reference validationId for traceability

### Input: From PageEngagementLog
- Join on insightId to calculate engagement metrics
- Update impression/engagement/conversion counts
- Use metrics for promotion eligibility

### Output: To Insight Pool
- ApprovedInsights become queryable pool
- Organized by type, status, confidence
- Ready for Phase 3 consumption

### No Changes To:
- ❌ Insight schema
- ❌ ValidationLog schema
- ❌ PageEngagementLog schema
- ❌ Shadow pipeline
- ❌ Renderers
- ❌ Production email generation

---

## Workflow States

### Insight Lifecycle

```
VALIDATION (Shadow Pipeline)
     ↓
ValidationLog (stored, status = APPROVED/PENDING_MORE_EVIDENCE/REJECTED_FOR_NOW)
     ↓
APPROVAL DECISION
     ↓
ApprovedInsight created (status = "new")
     ↓
ACTIVATION (manual or automatic)
     ↓
ApprovedInsight (status = "active")
     ↓ (optional, engagement-based)
PROMOTION (higher priority tier)
     ↓
ApprovedInsight (status = "promoted")
     ↓
ARCHIVAL (retirement or replacement)
     ↓
ApprovedInsight (status = "archived")
```

### Approval Status Transition Matrix

| From | To | Condition | Actor |
|------|----|-----------| ------|
| new | active | Manual approval or auto-approval enabled | User or System |
| active | promoted | Engagement metrics meet threshold OR manual | User or System |
| promoted | archived | Retirement decision OR superceded | User or System |
| active | archived | Retirement decision | User |
| new | archived | Rejected upon review | User |

---

## Configuration

### Approval Criteria (Configurable)

Default values:
```typescript
{
  minConfidence: 0.65,              // Moderate confidence threshold
  maxContradictions: 1,              // Allow 1 weak contradiction
  minEvidenceSources: 2,             // Require 2+ evidence sources
  requiredEnrichmentLevel: "partial", // Accept partial enrichment
  allowedStatuses: ["APPROVED", "PENDING_MORE_EVIDENCE"]
}
```

Can be overridden by:
- Command-line parameter
- Environment variable
- Database configuration
- User interface (Phase 3+)

### Promotion Rules (Configurable)

Default rules:
```typescript
{
  new → active: automatic (immediate or after review period)
  active → promoted: engagement rate > 15% OR manual approval
  promoted → archived: engagement rate < 5% for 30 days OR manual
  any → archived: manual at any time
}
```

---

## Testing Strategy

### Unit Tests

- `b2b-approval-decision-engine.test.ts`
  - Test each approval criterion independently
  - Test combined criteria logic
  - Test confidence thresholds (boundary conditions)
  - Test contradiction count logic

- `b2b-approval-promotion-manager.test.ts`
  - Test ApprovedInsight creation
  - Test status transitions
  - Test promotion history tracking

- `b2b-insight-pool-manager.test.ts`
  - Test queries by type
  - Test queries by status
  - Test queries by confidence
  - Test metric calculations

### Integration Tests

- `b2b-approval-workflow.integration.test.ts`
  - ValidationLog → ApprovedInsight → Active → Promoted
  - Engagement metrics from PageEngagementLog
  - Promotion rules evaluation
  - Batch processing

### Safety Checks

- ✅ Insight data is never modified (immutable copy only)
- ✅ ValidationLog is never modified (source of truth)
- ✅ Status transitions follow state machine rules
- ✅ All promotions are logged in ApprovalPromotion
- ✅ Engagement metrics join correctly

---

## Acceptance Criteria

### Must Have
- ✅ ApprovedInsight schema in Prisma
- ✅ Approval decision engine (configurable criteria)
- ✅ Approval promotion manager (lifecycle management)
- ✅ Insight pool manager (queries and metrics)
- ✅ Batch processor (ValidationLog → ApprovedInsight)
- ✅ Status transition audit trail (ApprovalPromotion)
- ✅ No modification of Insight data
- ✅ No modification of frozen systems

### Should Have
- ✅ Approval criteria presets (default, strict, permissive)
- ✅ Promotion workflow orchestrator
- ✅ Engagement metric calculations
- ✅ Configuration management

### Nice to Have
- Approval dashboard (UI for manual decisions)
- Approval analytics (success rates by type)
- A/B testing framework for criteria

---

## Phase 2 Deliverables

1. **Database Migration**
   - ApprovedInsight table
   - ApprovalPromotion table
   - Prisma model definitions

2. **Core Implementation** (6 files)
   - Approval decision engine
   - Approval promotion manager
   - Approval criteria manager
   - Insight pool manager
   - Approval batch processor
   - Promotion workflow orchestrator

3. **Integration**
   - ValidationLog → ApprovedInsight pipeline
   - PageEngagementLog metric calculations
   - Status transition state machine

4. **Tests**
   - Unit tests (decision logic)
   - Integration tests (end-to-end workflow)
   - Safety verification

5. **Documentation**
   - Approval criteria guide
   - Promotion rules guide
   - Configuration reference

---

## Success Metrics

- ✅ 100% of validated insights evaluated for approval
- ✅ Approval decisions logged with reasoning
- ✅ Approved insights queryable by type/status/confidence
- ✅ Promotion history complete audit trail
- ✅ Zero modification of Insight data
- ✅ All transitions follow state machine rules
- ✅ Engagement metrics correctly joined from PageEngagementLog

---

**This design is ready for implementation. Begin Phase 2 coding.**
