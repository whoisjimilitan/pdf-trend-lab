# Operator UI Audit
**Date:** 2026-06-14  
**Status:** GAPS IDENTIFIED  
**Priority:** HIGH (blocks operator workflow)

---

## Current State

**Dashboard Location:** `/farm/dashboard`

**Current Content:** Seed/product management only

**B2B Lead Visibility:** ❌ NONE

---

## Required Lead Information

### Per-Lead Detail View

All of the following must be visible in the operator UI:

| Data | Status | Location | Priority |
|------|--------|----------|----------|
| Business name | ❌ Not visible | - | 1 |
| Business category | ❌ Not visible | - | 1 |
| Website | ❌ Not visible | - | 1 |
| Email | ❌ Not visible | - | 1 |
| Phone | ❌ Not visible | - | 1 |
| Lead tier (A/B/C) | ❌ Not visible | - | 1 |
| Engagement score | ❌ Not visible | - | 1 |
| Pipeline stage | ❌ Not visible | - | 1 |
| **Prospect Brief** | ❌ Not visible | - | 1 |
| - Industry segment | ❌ Not visible | - | 1 |
| - Business type | ❌ Not visible | - | 1 |
| - Challenges | ❌ Not visible | - | 1 |
| - Opportunities | ❌ Not visible | - | 1 |
| - Suggested value prop | ❌ Not visible | - | 1 |
| - Decision maker titles | ❌ Not visible | - | 1 |
| **Outreach Angle** | ❌ Not visible | - | 1 |
| - Primary angle | ❌ Not visible | - | 1 |
| - Primary hook | ❌ Not visible | - | 1 |
| - Secondary angle | ❌ Not visible | - | 1 |
| - Secondary hook | ❌ Not visible | - | 1 |
| - Reasoning | ❌ Not visible | - | 1 |
| **Email Draft** | ❌ Not visible | - | 1 |
| - Subject line | ❌ Not visible | - | 1 |
| - Email body | ❌ Not visible | - | 1 |
| Engagement history | ❌ Not visible | - | 2 |

---

## Required List Views

### READY_TODAY Queue

**Purpose:** First thing operator sees at 07:00 UTC

**Criteria:**
- Tier A leads
- Engagement score >= 30
- Pipeline stage = "NEW"

**Columns:**
- ☑️ Business name
- ☑️ Category
- ☑️ Email (copy-ready)
- ☑️ Phone (for manual callback)
- ☑️ Score
- ☑️ Brief preview (challenges + value prop)

**Actions:**
- [View full brief]
- [View email draft]
- [Mark as contacted]
- [Mark as not interested]

**Status:** ❌ Not implemented

---

### FOLLOWUP_TODAY Queue

**Purpose:** Identify prospects who need re-engagement

**Criteria:**
- Tier A or B
- Pipeline stage IN (OPENED, CLICKED, CONTACTED_7DAYS+)

**Columns:**
- ☑️ Business name
- ☑️ Last action (opened / clicked / contacted)
- ☑️ Days since last action
- ☑️ Score

**Status:** ❌ Not implemented

---

## Missing Functionality

### 1. Lead List Page

**URL:** `/b2b/leads` (proposed)

**Features:**
- ☑️ Search by business name / email / category
- ☑️ Filter by tier (A, B, C)
- ☑️ Filter by pipeline stage (NEW, CONTACTED, etc)
- ☑️ Sort by engagement score
- ☑️ Bulk actions (mark as contacted, export)

**Status:** ❌ Not implemented

---

### 2. Lead Detail Page

**URL:** `/b2b/leads/[id]` (proposed)

**Sections:**
1. **Business Info**
   - Name, category, website, email, phone
   - Tier badge, engagement score

2. **Prospect Brief** (JSON display)
   - Industry segment
   - Business type
   - Likely challenges (bullet list)
   - Likely opportunities (bullet list)
   - Suggested value prop
   - Decision maker titles
   - Opportunity score

3. **Outreach Angle** (JSON display)
   - Primary angle + hook
   - Secondary angle + hook
   - Reasoning paragraph

4. **Email Draft**
   - Subject line (editable)
   - Email body (editable)
   - [Send] button
   - [Save draft] button

5. **Engagement History**
   - Timeline of interactions
   - Last contacted date
   - Reply status

6. **Actions**
   - [Mark as contacted]
   - [Mark as replied]
   - [Mark as qualified]
   - [Mark as not interested]
   - [Edit brief]
   - [Regenerate email]

**Status:** ❌ Not implemented

---

### 3. Today's Workflow Dashboard

**URL:** `/b2b/workflow` (proposed)

**Layout:**
```
┌─────────────────────────────────────┐
│ TODAY'S OUTREACH SUMMARY            │
├─────────────────────────────────────┤
│ READY_TODAY: 6 leads                │
│ FOLLOWUP_TODAY: 3 leads             │
│ CONTACTED_TODAY: 0                  │
│ REPLIES_TODAY: 0                    │
└─────────────────────────────────────┘

┌─ READY_TODAY ─────────────────────┐
│ 1. [A] Greater London Properties   │
│    Email ready | Score: 40         │
│ 2. [A] haart Estate Agents         │
│    Email ready | Score: 40         │
│ ... (6 total)                      │
└───────────────────────────────────┘

┌─ FOLLOWUP_TODAY ──────────────────┐
│ (None yet - new system)            │
└───────────────────────────────────┘
```

**Status:** ❌ Not implemented

---

## Implementation Priority

### MVP (Critical Path)
1. Lead list page with READY_TODAY queue
2. Lead detail page with brief + angle + email
3. "Mark as contacted" action

**Effort:** 2-3 days
**Unblocks:** Operator workflow

### Phase 2
4. FOLLOWUP_TODAY queue
5. Engagement history tracking
6. Email editing/revision

**Effort:** 2 days
**Improves:** Efficiency, tracking

### Phase 3
7. Bulk actions
8. Advanced filtering
9. Analytics dashboard

**Effort:** 1 week
**Improves:** Scale operations

---

## Design Constraints

**Must maintain:**
- Simple, fast, mobile-friendly
- No unnecessary features
- Copy-ready emails (no formatting required)
- Single-click "contact" flow

**Should avoid:**
- Complex analytics
- Dashboard widgets
- Feature bloat
- Custom styling per category

---

## Next Steps

1. Build Lead List component (`/b2b/leads`)
2. Build Lead Detail component (`/b2b/leads/[id]`)
3. Create "Contact" API action
4. Integrate into `/farm/dashboard`
5. Test operator workflow end-to-end

**Estimated timeline:** 3 days for MVP

