# Follow-Up Engine Plan
**Date:** 2026-06-14  
**Phase:** Design (Pre-Implementation)  
**Scope:** Lead lifecycle state machine + automatic queue generation

---

## Current State

All 99 leads are in `NEW` state (pipeline_stage = "NEW").

---

## Proposed Lead Lifecycle

### State Machine

```
NEW
  ↓
CONTACTED (email sent)
  ├─ OPENED (email opened)
  │  ├─ CLICKED (link clicked)
  │  │  ├─ REPLIED (prospect responded)
  │  │  │  └─ QUALIFIED (response indicates interest)
  │  │  │     └─ MEETING_BOOKED
  │  │  │        └─ WON (closed)
  │  │  │
  │  │  └─ NO_RESPONSE (7 days+)
  │  │     └─ LOST
  │  │
  │  └─ NO_CLICK (7 days+)
  │     └─ NEEDS_FOLLOWUP
  │
  └─ NOT_OPENED (7 days+)
     └─ NEEDS_FOLLOWUP

LOST (final)
WON (final)
NOT_INTERESTED (final)
```

### States Defined

| State | Meaning | Auto-Transition | Manual? |
|-------|---------|-----------------|---------|
| NEW | Lead created, brief generated | Yes (→CONTACTED) | ✓ |
| CONTACTED | Email sent to prospect | No | ✓ |
| OPENED | Prospect opened email | Yes (email tracking) | ✓ |
| CLICKED | Prospect clicked link in email | Yes (link tracking) | ✓ |
| REPLIED | Prospect sent reply | No | ✓ |
| QUALIFIED | Response indicates real interest | No | ✓ |
| MEETING_BOOKED | Calendar appointment set | No | ✓ |
| WON | Deal closed | No | ✓ |
| LOST | No response after follow-up | No | ✓ |
| NOT_INTERESTED | Prospect explicitly declined | No | ✓ |
| NEEDS_FOLLOWUP | Auto-flagged for next sequence | No | Auto |

---

## Queue Generation Rules

### READY_TODAY (Morning Queue)

**Criteria:**
- `lead_tier = 'A'`
- `engagement_score >= 30`
- `pipeline_stage IN ('NEW', 'NEEDS_FOLLOWUP')`
- `last_contacted_at < TODAY - 7 days` (or never contacted)

**Purpose:** Fresh outreach targets

**Sort By:**
1. `engagement_score` DESC
2. `lead_tier` (A > B > C)
3. `created_at` ASC

---

### FOLLOWUP_TODAY (Follow-Up Queue)

**Criteria:**
- `pipeline_stage = 'OPENED'` AND `last_email_opened_at < TODAY - 3 days`
- OR `pipeline_stage = 'CLICKED'` AND `last_email_clicked_at < TODAY - 3 days` AND no reply
- OR `pipeline_stage = 'CONTACTED'` AND `last_contacted_at < TODAY - 7 days` AND not opened

**Purpose:** Re-engage prospects who showed interest but went silent

**Sort By:**
1. `last_email_clicked_at` ASC (most recent interest first)
2. `engagement_score` DESC
3. `lead_tier` (A > B > C)

---

## Database Schema Changes

### Add to `b2b_leads`

```typescript
pipeline_stage           String    @default("NEW")  // Enum: NEW, CONTACTED, OPENED, CLICKED, REPLIED, QUALIFIED, MEETING_BOOKED, WON, LOST, NOT_INTERESTED, NEEDS_FOLLOWUP

// Tracking timestamps
last_contacted_at       DateTime?
last_email_sent_at      DateTime?
last_email_opened_at    DateTime?
last_email_clicked_at   DateTime?
last_reply_at           DateTime?

// Counters
email_send_count        Int       @default(0)
email_open_count        Int       @default(0)
email_click_count       Int       @default(0)
followup_count          Int       @default(0)

// Flags
needs_followup          Boolean   @default(false)
is_qualified            Boolean   @default(false)
```

### New Table: `b2b_lead_events`

```typescript
model b2b_lead_events {
  id                String     @id @default(cuid())
  lead_id          String
  lead             b2b_leads  @relation(fields: [lead_id], references: [id])
  
  event_type       String     // "EMAIL_SENT", "EMAIL_OPENED", "EMAIL_CLICKED", "REPLY_RECEIVED", "STATUS_CHANGED"
  event_data       Json?      // { "email_id": "...", "old_state": "NEW", "new_state": "CONTACTED" }
  
  created_at       DateTime   @default(now())
  
  @@index([lead_id])
  @@index([event_type])
  @@index([created_at])
}
```

---

## Implementation Phases

### Phase 1: Queue Generation (No DB Changes)
- Add `generateReadyTodayQueue()` function
- Add `generateFollowupTodayQueue()` function
- Dashboard shows both queues
- **Timeline:** 1 day

### Phase 2: State Tracking (Schema Changes)
- Add columns to `b2b_leads`
- Populate from email service webhooks
- Auto-transition rules
- **Timeline:** 3 days

### Phase 3: Email Integration (External)
- Connect to email service webhooks
- Track opens/clicks
- Auto-populate `last_email_opened_at`, `last_email_clicked_at`
- **Timeline:** 5 days (depends on email provider)

---

## Success Metrics

1. **READY_TODAY accuracy:** 0 duplicates, 0 stale leads
2. **FOLLOWUP_TODAY completeness:** 100% of silent prospects captured
3. **State transition speed:** < 1 second for queue generation
4. **Operator efficiency:** Operator spends < 5 min reviewing queues

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Incorrect lead state | Manual override in UI |
| False positives in FOLLOWUP | Operator can adjust thresholds |
| Missing webhook events | Fallback to timestamp-based logic |

---

## Next: Implementation

Ready to implement Phase 1 (queue generation functions) immediately.

