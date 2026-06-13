# SAINT & STORY V1 CONVERSION ENGINE
**Architecture & Implementation Plan**

**Date**: 2026-06-13  
**Status**: SPECIFICATION (not yet implemented)  
**Goal**: Single authoritative email generation system with mandatory RRTA framework and prospect page linkage

---

## EXECUTIVE SUMMARY

Current state: Email generation bypasses intelligence and framework, using hardcoded templates.

Target state: All outbound email flows through a unified conversion engine that:
- Injects lead intelligence automatically
- Validates Recognition/Relief/Trust/Action compliance (blocks sends if invalid)
- Links every email to a personalized prospect page
- Tracks engagement across email → page → reply
- Scores only actual behavior

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    OUTBOUND EMAIL REQUEST                       │
│  (initial outreach / follow-up / test / manual / future)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           b2b-conversion-engine.ts (SINGLE AUTHORITY)           │
│                                                                  │
│  Function: generateOutboundEmail(lead, context)                │
│  ├─ Input: Lead record + enrichment data                        │
│  ├─ Process:                                                    │
│  │  1. Extract intelligence (pain_point, patterns, obs)        │
│  │  2. Generate RRTA copy (automated via framework)            │
│  │  3. Generate CTA link (prospect page)                       │
│  │  4. Validate RRTA compliance (gate: 4/4 required)           │
│  │  5. Validate page linkage (gate: required)                  │
│  └─ Output: EmailCopy + PageURL (or rejection)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌─────────────────┬──────────────────┐
            ↓                 ↓                  ↓
    ┌──────────────┐  ┌────────────────┐  ┌──────────────┐
    │ GENERATION   │  │ VALIDATION     │  │ INTEGRATION  │
    │              │  │                │  │              │
    │ Intelligence │  │ RRTA Scoring   │  │ Page linked? │
    │ + Framework  │  │ 4/4 required   │  │ CTA present? │
    │ + CTA        │  │                │  │ URL valid?   │
    └──────────────┘  └────────────────┘  └──────────────┘
            ↓                 ↓                  ↓
            └─────────────────┼──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  APPROVED EMAIL  │
                    │  (RRAT 4/4)      │
                    │  (Page linked)   │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  SEND via Resend │
                    │  (hello@...)     │
                    └──────────────────┘
                              ↓
        ┌─────────────────────┬──────────────────┐
        ↓                     ↓                  ↓
    ┌────────────┐      ┌──────────────┐  ┌──────────────┐
    │ EMAIL OPEN │      │ PAGE VISIT   │  │ REPLY RECV   │
    │ (webhook)  │      │ (page route) │  │ (webhook)    │
    └────────────┘      └──────────────┘  └──────────────┘
        ↓                     ↓                  ↓
        └─────────────────────┼──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  ENGAGEMENT      │
                    │  TRACKING        │
                    │  (lead record)   │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  BEHAVIOR SCORE  │
                    │  (actual events) │
                    └──────────────────┘
```

---

## PHASE 1: CENTRALIZE EMAIL GENERATION

### Goal
One authoritative email generator. No hardcoded templates anywhere.

### Files to Create

**`lib/b2b-conversion-engine.ts`** (NEW - Core Engine)
```typescript
// Single source of truth for all outbound emails

interface ConversionEngineRequest {
  lead: EnrichedLead
  context: 'initial_outreach' | 'follow_up' | 'test' | 'manual' | 'campaign'
  triggerEvent?: string
}

interface ConversionEngineResult {
  recognition: string
  relief: string
  trust: string
  action: string
  cta_text: string
  cta_link: string
  prospect_page_id: string
  rrat_score: number  // 0-4
  validation_passed: boolean
  rejection_reason?: string
}

export async function generateOutboundEmail(
  request: ConversionEngineRequest
): Promise<ConversionEngineResult>
```

**`lib/b2b-intelligence-extract.ts`** (NEW - Intelligence Parser)
```typescript
// Extract intelligence from lead record

interface LeadIntelligence {
  pain_point: string
  business_pattern: string
  operational_challenge: string
  location_context: string
  industry_observation: string
  review_insight: string
}

export function extractLeadIntelligence(lead: EnrichedLead): LeadIntelligence
```

**`lib/b2b-rrta-generator.ts`** (NEW - Framework Application)
```typescript
// Convert intelligence to RRTA copy

interface RRTACopy {
  recognition: string
  relief: string
  trust: string
  action: string
}

export function generateRRTACopy(
  intelligence: LeadIntelligence,
  category: string
): RRTACopy
```

**`lib/b2b-rrta-validator.ts`** (NEW - Enforcement Gate)
```typescript
// Validate RRTA compliance

interface RRTAValidation {
  recognition_present: boolean
  relief_present: boolean
  trust_present: boolean
  action_present: boolean
  score: number  // 0-4
  passed: boolean  // true if 4/4
  issues: string[]
}

export function validateRRTA(copy: RRTACopy): RRTAValidation
```

### Files to Modify

**`execute_follow_ups.ts` → DELETE**
- This file hardcodes templates
- Replace all calls with conversion engine

**Any other email generation file** → AUDIT & MIGRATE
- `send_test_email.ts`
- `execute_simple.ts`
- `execute_correct_domain.ts`
- `final_execution.ts`
- Any API route that sends email

All must route through `b2b-conversion-engine.ts`

---

## PHASE 2: RRTA ENFORCEMENT

### Goal
Every email contains Recognition, Relief, Trust, Action. If not 4/4, reject send.

### Implementation

**`lib/b2b-rrta-validator.ts`** — Validation Gate

```typescript
export function validateRRTA(copy: RRTACopy): RRTAValidation {
  const checks = {
    recognition_present: checkRecognitionPresent(copy.recognition),
    relief_present: checkReliefPresent(copy.relief),
    trust_present: checkTrustPresent(copy.trust),
    action_present: checkActionPresent(copy.action)
  }

  const score = Object.values(checks).filter(Boolean).length
  const passed = score === 4

  return {
    ...checks,
    score,
    passed,
    issues: generateIssueList(checks)
  }
}

// Each check function ensures:
// - Not generic ("Managing X is complex", "We analyzed...", "What we learned")
// - Is specific ("One Thing That Stood Out: Your Y locations show Z pattern")
// - Passes "understood vs informed" test
```

### Validation Rules

**Recognition Must Contain**:
- Specific observation about their business (not category insight)
- Evidence from data (reviews, locations, patterns)
- "One Thing That Stood Out" or equivalent
- NOT "I think we might have something" (too generic)

**Relief Must Contain**:
- Their specific burden named
- Personal cost acknowledged
- "This Might Sound Familiar" or equivalent
- NOT "Managing X is hard" (universal statement)

**Trust Must Contain**:
- Proof we understand their specific problem
- Case study, quantified result, or process insight
- "We've built our process around" or equivalent
- NOT "We make it simple" (unsupported claim)

**Action Must Contain**:
- Validation question (not meeting request)
- Question that assumes understanding
- "Quick Question" or equivalent
- CTA that drives to prospect page (not "call next week")

### Enforcement

**Send Gate**:
```typescript
const validation = validateRRTA(emailCopy)
if (!validation.passed) {
  throw new Error(`RRTA validation failed: ${validation.issues.join(', ')}`)
  // Email BLOCKED - no exceptions
}
```

**Audit Trail**:
- Log every validation check
- Store RRAT scores in `b2b_outreach` table
- Flag any bypasses for manual review

---

## PHASE 3: PROSPECT PAGE INTEGRATION

### Goal
Every email links to personalized prospect page. CTA is mandatory and specific.

### Implementation

**Prospect Page Generation** (BEFORE Email Send)

```typescript
// In conversion engine, before generating email:

const prospectPage = await generateProspectPage(lead, {
  recognition: intelligenceExtract.observation,
  cta_link: true
})

const prospectPageUrl = prospectPage.public_url
```

**CTA Generation** (From RRTA Framework)

```typescript
// Not hardcoded. Generated from action component.

const ctaText = generateCTAFromAction(action)
// "When that happens, here's what changes" 
// not "Would you like a call?"

const ctaLink = prospectPageUrl
// Points to their personalized page
// NOT mailto, NOT calendar, NOT generic contact form
```

**Email Body Structure**

```
From: hello@saintandstoryltd.co.uk
To: [prospect email]

[Recognition paragraph]

[Relief paragraph]

[Trust paragraph]

[Action paragraph + CTA to prospect page]

---
Saint & Story
```

**Prospect Page Structure** (Mirror Narrative)

```
PROSPECT PAGE URL: /prospect-brief/[lead-id]

Contains:

1. Recognition (mirrors email)
   "One Thing That Stood Out: [observation]"

2. Relief (deepens email)
   "This Might Sound Familiar: [their burden + implications]"

3. Trust (adds proof)
   "We've Built Our Process Around: [case study + quantified result]"

4. Action (clear next step)
   "Let's Talk: [validation question with button]"

CTA Button Text: Generated from action, not generic
CTA Destination: Either book meeting or reply email
```

### Tracking Links

**Email → Page Mapping**:
```
b2b_outreach.id = message_id
├─ prospect_page_id
├─ prospect_page_url
└─ cta_link
```

**Engagement Tracking**:
```
b2b_email_events records:
├─ event_type: 'opened' / 'clicked' / 'replied'
├─ linked_page_id: [if clicked]
└─ click_destination: [prospect_page_url]
```

---

## PHASE 4: INTELLIGENCE INJECTION

### Goal
Automatic conversion of lead intelligence into RRTA copy.

### Data Sources

**From `b2b_leads`**:
- `business_name`
- `category`
- `location_count`
- `rating_average`
- `review_count`
- `source` (discovery method)

**From `b2b_enrichment`**:
- `pain_point_review` (actual customer review mentioning specific problem)
- `business_pattern` (operational pattern inferred from reviews)
- `operational_insight` (specific challenge they face)
- `industry_observation` (category-specific pattern)

**From `b2b_email_events`** (if follow-up):
- `event_type` (what engagement happened)
- Previous message content (what we said before)

### Conversion Logic

**Recognition** (from `pain_point_review` + `location_count`):
```
"One Thing That Stood Out: [business_name] operates X locations,
and your reviews consistently mention [specific pain point from review].
That's the bottleneck we help with."
```

**Relief** (from `business_pattern` + `operational_insight`):
```
"This Might Sound Familiar: [category] businesses often end up
[operational pattern]. For you specifically, that probably means
[personal cost of that pattern]."
```

**Trust** (from `category` + `industry_observation`):
```
"We've Built Our Process Around: [category] businesses like yours
that [specific challenge]. We've reduced that time/cost by X%
for similar businesses."
```

**Action** (from context + intelligence):
```
"Quick Question: When [operational_challenge] happens, does that
create [specific consequence they care about]?
[Link: Learn how we solve it]"
```

### Intelligence Quality Gate

**Before generating RRTA**:
```
if (!lead.pain_point_review) reject("No pain point identified")
if (lead.location_count < 1) reject("Cannot assess scale")
if (!lead.operational_insight) reject("No operational insight")
```

No email generated without sufficient intelligence.

---

## PHASE 5: TRACKING

### Goal
Complete visibility into email → page → engagement → reply flow.

### Database Schema Modifications

**`b2b_outreach` table** - ADD columns:
```sql
-- Prospect page
prospect_page_id: UUID (reference to prospect page record)
prospect_page_url: TEXT (public URL)

-- RRTA Framework
recognition_component: TEXT (actual text sent)
relief_component: TEXT (actual text sent)
trust_component: TEXT (actual text sent)
action_component: TEXT (actual text sent)
rrat_score: INTEGER (0-4)

-- CTA
cta_text: TEXT (actual button text)
cta_link: TEXT (destination URL)

-- Metadata
context_type: TEXT ('initial_outreach'|'follow_up'|'test'|'manual')
intelligence_sources: JSONB (which fields were used)
validation_passed: BOOLEAN
sent_at: TIMESTAMP
```

**`b2b_email_events` table** - ADD columns:
```sql
-- Page engagement
linked_page_id: UUID (if clicked to prospect page)
page_visited_at: TIMESTAMP
scroll_depth: DECIMAL (0-1, percentage of page scrolled)
time_on_page: INTEGER (seconds)
cta_click_location: TEXT (which CTA was clicked)

-- Reply engagement
reply_received_at: TIMESTAMP
reply_content: TEXT
reply_classified: BOOLEAN
reply_classification: TEXT ('positive'|'objection'|'referral'|'not_interested'|'auto_response')
```

### Webhook Events to Capture

**Resend Webhooks** (existing):
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.replied`
- `email.bounced`
- `email.complained`

**Prospect Page Events** (NEW):
- Page visit (route hit)
- Scroll depth (JS tracking)
- Time on page (JS tracking)
- CTA click (form submit or link click)

### Tracking Integration

**Email Click**:
```
Resend webhook: email.clicked
  ↓
If URL contains prospect_page_id:
  → Create b2b_email_events with linked_page_id
  → Trigger page engagement tracking
```

**Page CTA Click**:
```
User clicks CTA on prospect page
  ↓
Log to b2b_email_events with:
  - linked_page_id
  - cta_click_location
  - time_on_page
  - scroll_depth
```

**Reply**:
```
Resend webhook: email.replied
  ↓
Create b2b_email_events with:
  - reply_received_at
  - reply_content
  → Queue for classification
```

---

## PHASE 6: SCORING

### Goal
Score only reflects actual behavior. Remove theoretical scoring.

### Behavior-Only Scoring

**Current Problem**:
- Score influenced by "analysis" and "opportunity" that may not reflect reality
- No connection between score and actual engagement

**Solution**:

**Engagement Score** (ACTUAL BEHAVIOR):
```
engagement_score = (
  (opened ? 10 : 0) +
  (page_visited ? 20 : 0) +
  (cta_clicked ? 15 : 0) +
  (replied ? 50 : 0) +
  (positive_reply ? 50 : 0)
) / 145 * 100

Result: 0-100, purely behavioral
```

**Remove**:
- `opportunity_score` (theoretical)
- Any scoring based on "we think they need this"
- Any scoring not backed by actual engagement

**Heat Score** (REVISED):
```
heat_score = engagement_score

(Remove opportunity_score and intent_score multipliers)

This makes heat directly represent: "How much is this prospect actually engaging?"
```

### Scoring Gate

**No Score Updates** without engagement events:
```
if (no new event in last 24h) score stays static
if (new event) recalculate immediately
```

**Score Audit**:
```
Daily report: leads with mismatched scores
(score > engagement = investigate why)
```

---

## PHASE 7: HUMAN VALIDATION

### Goal
Before touching production, review samples for approval.

### Validation Samples

Generate (do NOT send):

**Initial Outreach (3 samples)**:
- Sample 1: Estate agent (haart-like profile)
- Sample 2: Pharmacy (Westpoint-like profile)
- Sample 3: Multi-location business (Cornerstone-like profile)

For each:
- Lead intelligence (what data was used)
- Generated email (full RRTA breakdown)
- Prospect page preview
- Engagement tracking diagram

**Follow-Up Outreach (3 samples)**:
- Follow-up after email opened (no click)
- Follow-up after link clicked (no page action)
- Follow-up after page visited (no CTA click)

For each:
- Context (what triggered this)
- Generated email
- How intelligence evolved
- New prospect page state

**Prospect Pages (3 samples)**:
- Page for initial outreach
- Page for follow-up (deepened insight)
- Page for high-engagement lead (personalized proof)

For each:
- Narrative flow (RRTA progression)
- CTA clarity
- Engagement tracking setup

### Review Checklist

**For User Review**:
- [ ] Recognition feels specific, not generic?
- [ ] Relief acknowledges their actual burden?
- [ ] Trust provides credible proof?
- [ ] Action is validation question, not meeting ask?
- [ ] Email flows naturally (not templated)?
- [ ] Page mirrors and deepens email?
- [ ] CTA is clear and points to page?
- [ ] Would YOU click this and feel understood?

**Approval Gate**:
```
User says: "Yes, this feels right" → Proceed to migration
User says: "This is still generic" → Debug RRTA generation
```

---

## PHASE 8: MIGRATION

### Goal
Audit current 6 prospects. Determine path forward.

### Current State Analysis

**For each of 6 currently-live prospects:**

1. **Did they receive generic copy?**
   - Email body matches hardcoded template? YES
   - No lead intelligence injected? YES
   - RRTA score < 4/4? YES

2. **Did they enter the page flow?**
   - Email contains link? NO
   - Page linked? NO
   - Engagement tracked? NO
   - CTA drives to page? NO

3. **What happened since send?**
   - Opened? (check webhook events)
   - Clicked? (check webhook events)
   - Replied? (check webhook events)
   - Page visited? (no)

### Recommendation Matrix

| Scenario | Action | Rationale |
|----------|--------|-----------|
| Opened but no click | Re-engage with new engine | Current email didn't drive action, new framework may |
| Clicked something | Check what (log missing) | If not page link, engagement is lost |
| Replied already | Leave as-is, log reply | Don't interrupt conversation |
| No engagement in 48h+ | Re-enter with new engine | Current didn't work, try new framework |
| High engagement | Log learning, don't re-send | Already moving, preserve momentum |

### Migration Execution

**Option A: Leave running** (if already engaged)
- Keep monitoring current email thread
- New engine only for NEW prospects going forward

**Option B: Re-enter with new engine** (if no engagement)
- Wait X days to ensure no delayed opens
- Send new follow-up using conversion engine
- Flag as "retry with new framework"
- Track difference in engagement

**Decision Rule**:
```
if (last_engagement < 24h) {
  recommendation = "LEAVE_RUNNING"
} else if (last_engagement > 48h && engagement_count === 0) {
  recommendation = "RE_ENTER_NEW_ENGINE"
} else {
  recommendation = "MONITOR_ONLY"
}
```

### Rollback Plan

**If new engine generates poor copy**:
1. Pause all new sends
2. Revert email sending to hold queue
3. Debug RRTA generation
4. Review validation logic
5. Re-test with human validation samples
6. Resume when fixed

**If prospect page linkage breaks**:
1. Revert page URL generation
2. Temporarily disable CTA validation
3. Send emails without page (stops engine from rejecting)
4. Fix page generation logic
5. Resume with pages

**If engagement drops**:
1. Audit: Is new email actually being sent?
2. Audit: Is page working?
3. Audit: Is tracking working?
4. A/B test: old template vs new engine (if feasible)
5. Revert if new framework underperforms consistently

---

## PHASE 9: OUTPUT REQUIREMENTS

### Architecture Diagram
✅ Above (see Architecture Diagram section)

### Files to Create

1. `lib/b2b-conversion-engine.ts` — Core engine
2. `lib/b2b-intelligence-extract.ts` — Intelligence parser
3. `lib/b2b-rrta-generator.ts` — RRTA copy generation
4. `lib/b2b-rrta-validator.ts` — Validation gate
5. `app/api/b2b/conversion-engine-test/route.ts` — Test endpoint
6. `scripts/generate-validation-samples.ts` — Generate 9 samples for review

### Files to Modify

1. `execute_follow_ups.ts` → Replace with conversion engine call
2. `send_test_email.ts` → Route through conversion engine
3. `execute_simple.ts` → Route through conversion engine
4. `app/api/b2b/outreach/route.ts` (if exists) → Route through conversion engine
5. `db/schema.prisma` → Add RRTA columns to b2b_outreach and b2b_email_events

### Files to Delete

1. Any hardcoded template files that become unnecessary

### Migration Plan
✅ Above (see Phase 8: Migration)

### Rollback Plan
✅ Above (see Rollback Plan section)

### Validation Checklist

**Pre-Implementation**:
- [ ] All hardcoded template files identified
- [ ] All email-sending code paths mapped
- [ ] Intelligence data availability verified
- [ ] Prospect page generation working
- [ ] Database schema changes planned

**Post-Implementation (before production)**:
- [ ] Conversion engine generates valid RRTA (4/4 tests pass)
- [ ] Validation gate blocks invalid copy
- [ ] Page generation and linking works
- [ ] 9 validation samples generated
- [ ] User has reviewed and approved samples
- [ ] Rollback process tested
- [ ] Tracking captures all events
- [ ] Scoring reflects behavior only

**Post-Launch Monitoring**:
- [ ] First email sends through new engine
- [ ] Webhook events received
- [ ] Page visit tracked
- [ ] Engagement scored correctly
- [ ] No regression vs baseline

---

## IMPLEMENTATION SEQUENCE

### Step 1: Create Core Engine (Phase 1-4)
- Build `b2b-conversion-engine.ts`
- Build `b2b-intelligence-extract.ts`
- Build `b2b-rrta-generator.ts`
- Build `b2b-rrta-validator.ts`
- Test locally (no sends)

### Step 2: Setup Tracking (Phase 5)
- Add columns to Prisma schema
- Create migration
- Test event capture

### Step 3: Generate Validation Samples (Phase 7)
- Run `generate-validation-samples.ts`
- Export 9 samples (3 initial, 3 follow-up, 3 pages)
- Output to `/CONVERSION_ENGINE_VALIDATION_SAMPLES.md`
- **PAUSE FOR USER REVIEW**

### Step 4: User Approval
- User reviews samples
- Approves or requests changes
- **Continue only after approval**

### Step 5: Migration (Phase 8)
- Audit 6 live prospects
- Determine recommendation for each
- Document in `CONVERSION_ENGINE_MIGRATION_PLAN.md`

### Step 6: Update Email Paths
- Modify all send files to use conversion engine
- Update database calls
- Run tests

### Step 7: Launch Monitoring
- Deploy to staging
- Test 1 send through conversion engine
- Verify all tracking works
- Monitor for 24h
- **Approval to move to production**

### Step 8: Production Launch
- Deploy conversion engine
- Monitor first 5 sends closely
- Check engagement metrics
- Document learnings

---

## SUCCESS CRITERIA

**Foolproof Conversion Engine**:
- ✅ No email sends without RRTA 4/4 validation
- ✅ Every email links to personalized prospect page
- ✅ Every email body generated from lead intelligence (not hardcoded)
- ✅ Every engagement tracked (email → page → reply)
- ✅ Every prospect page mirrors email narrative
- ✅ Scoring reflects behavior only
- ✅ No path bypasses framework

**Psychological Loop Is Live**:
- ✅ Prospect receives recognition (specific observation)
- ✅ Prospect feels relief (burden acknowledged)
- ✅ Prospect builds trust (proof provided)
- ✅ Prospect takes action (clicks to page)
- ✅ Prospect page deepens loop
- ✅ Reply captured and classified

---

## COMMITMENT

This engine makes it **impossible** to send generic outreach.

The framework is mandatory.

The prospect page is mandatory.

The intelligence injection is mandatory.

The RRTA validation is mandatory.

Or the email does not send.

No exceptions.

---

**Status**: SPECIFICATION READY FOR IMPLEMENTATION

