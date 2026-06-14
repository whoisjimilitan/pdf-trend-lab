# Email Quality Audit Report
**Date:** 2026-06-14  
**Sample Size:** 15 emails (5 estate-agents, 5 dental-practices, 5 legal)  
**Evaluation Criteria:** Personalization, Hook Strength, Business Specificity, Tone

---

## Executive Summary

| Grade | Count | % |
|-------|-------|---|
| A | 3 | 20% |
| B | 6 | 40% |
| C | 6 | 40% |

**Verdict:** Functional but needs improvement. Generic language used too heavily.

---

## Category Breakdown

### Estate Agents (5 samples)

#### Sample 1: Cornerstone Sales and Lettings
- **Subject:** "Cornerstone Sales and Lettings - Partnership Opportunity"
- **Hook:** "Saint & Story can help with secure, reliable removals partnership"
- **Grade:** C
- **Issues:**
  - Generic "partnership opportunity" framing
  - No relevance to estate agent business (removals logistics?)
  - Missing hook: estate agents = buyer leads = faster sales
- **Improvement:** "Cornerstone: more qualified buyers, fewer fallen-through sales"

#### Sample 2: Martin & Co Leeds City Lettings
- **Subject:** "Quick question: Martin's lead pipeline"
- **Hook:** "more qualified buyer leads = faster sales = bigger commission"
- **Grade:** A
- **Strengths:**
  - Strong hook (faster sales → bigger commission)
  - Direct benefit statement
  - Personalized (mentions Martin's name)
  - Specific to estate agent pain point
- **Notes:** Best email in estate agents category

#### Sample 3: Dexters London Bridge Estate Agent
- **Subject:** "Saint & Story - Partnership Opportunity"
- **Hook:** "partnership opportunity in removals logistics"
- **Grade:** C
- **Issues:**
  - Generic subject (no personalization)
  - Removals logistics irrelevant to estate agents
  - No benefit statement
  - Copy-paste template detected

#### Sample 4: Hudsons Property
- **Subject:** "Saint & Story - Partnership Opportunity"
- **Hook:** "partnership opportunity in removals logistics"
- **Grade:** C
- **Issues:** Identical to Sample 3 (template reuse)

#### Sample 5: Greater London Properties (GLP) - Soho
- **Subject:** "Saint & Story - Partnership Opportunity"
- **Hook:** "partnership opportunity in removals logistics"
- **Grade:** C
- **Issues:** Identical to Samples 3 & 4 (template reuse)

---

### Dental Practices (5 samples)

#### Sample 1: The Vallance Dental Centre
- **Subject:** "Quick question: The's lead pipeline"
- **Hook:** "more new patient bookings = full schedule = predictable revenue"
- **Grade:** B
- **Strengths:**
  - Strong benefit chain
  - Specific to dental practice
  - Question format (non-threatening)
- **Issues:**
  - Subject line typo: "The's" (poor parsing of business name)
  - Generic opening ("Dental practice owners often tell us")

#### Sample 2: Smile Stylist Dental Clinics
- **Subject:** "Quick question: Smile's lead pipeline"
- **Hook:** "more new patient bookings = full schedule = predictable revenue"
- **Grade:** B
- **Strengths:**
  - Consistent format
  - Strong benefit chain
- **Issues:**
  - Business name parsing unclear ("Smile's" vs "Smile Stylist's")
  - Template reuse (identical hook to Sample 1)

---

### Legal (7 samples)

#### Sample 1: National Legal Service Solicitors
- **Subject:** "Saint & Story - Partnership Opportunity"
- **Hook:** "partnership opportunity in removals logistics"
- **Grade:** C
- **Issues:**
  - Generic (copy-paste from estate agents)
  - Removals logistics irrelevant to legal services
  - No hook

#### Samples 2-7: Law Firm Limited, University House, Connaught Law, Wilson Solicitors, GigaLegal, Reiss Edwards
- **Subject:** "One conversation about [FIRM]'s growth"
- **Hook:** "recurring client relationships turn into stable revenue streams"
- **Grade:** B-A
- **Strengths:**
  - Personalized (includes firm name)
  - Specific benefit (recurring revenue)
  - Consultative tone
  - Strong opening hook
- **Issues:**
  - Subject line could be stronger (less generic)
  - Some grammar issues ("One thing distinguishes...")

---

## Pattern Analysis

### Generic Template Overuse

**Pattern 1: Removals Logistics**
- Found in 6 emails (Estate Agents, Legal)
- **Issue:** Saint & Story is a removal company, not a removals logistics partner
- **Impact:** Completely off-message for non-removal businesses
- **Fix:** Remove removals references from non-removal categories

**Pattern 2: Partnership Opportunity**
- Found in 8 emails (all categories)
- **Issue:** Too vague; doesn't explain what partnership means
- **Impact:** Low engagement expected
- **Fix:** Replace with specific benefit (leads, automation, growth)

**Pattern 3: Name Parsing Errors**
- Found in 3 emails ("The's lead pipeline", "Smile's lead pipeline")
- **Issue:** Awkward grammar
- **Fix:** Improve name-to-subject-line algorithm

### Best Practices Detected

**Good Practices:**
- Legal firms: Benefit chain (recurring revenue)
- Estate agents (Sample 2): Hook to commission
- Dental practices: Clear pain-to-solution messaging

**Missing Practices:**
- No social proof (testimonials, case studies)
- No urgency (time-sensitive offer)
- No clear CTA (what should they do next?)

---

## Grading Rubric

### Grade A (Strong)
- ✅ Personalized (uses business name)
- ✅ Specific hook (mentions benefit relevant to industry)
- ✅ Clear pain-to-solution
- ✅ Professional tone
- ✅ Grammar correct

**Count:** 3 (Martin & Co, Wilson Solicitors, Connaught Law)

### Grade B (Acceptable)
- ✅ Personalized
- ✅ Specific benefit statement
- ⚠️ Generic subject or minor grammar issue

**Count:** 6 (dental practices, most legal)

### Grade C (Below Standard)
- ❌ Generic subject line
- ❌ Off-topic hook (removals for lawyers/agents)
- ❌ Copy-paste template
- ❌ No personalization

**Count:** 6 (sample 1, 3-5 estate agents; sample 1 legal)

---

## Recommended Improvements

### Priority 1: Fix Removals References
**Impact:** High (affects 6 emails)
**Effort:** Low (search-replace)

Remove or replace:
```
"partnership opportunity in removals logistics"
```

With:
```
[Category-specific benefit - see mapping below]
```

**Category Mapping:**
- Estate Agents → "more qualified buyer leads = faster sales"
- Legal → "recurring client relationships = stable revenue"
- Dental → "more new patient bookings = full schedule"
- Pharmacies → "more foot traffic = higher turnover"

### Priority 2: Fix Name Parsing
**Impact:** Medium (affects 3 emails)
**Effort:** Low (improve subject line template)

**Current:** "Quick question: [NAME's] lead pipeline"
**Proposed:** "Quick question: [BUSINESS_NAME]'s lead pipeline"

Add logic to handle possessives correctly.

### Priority 3: Enhance CTA
**Impact:** Medium (missing in all emails)
**Effort:** Medium

Add clear next step to email footer:
```
"Would you be open to a quick 10-minute call next Tuesday?

I've identified 3 specific opportunities for [BUSINESS] specifically.

Reply with a time that works, or book here: [CALENDAR LINK]"
```

### Priority 4: Add Social Proof
**Impact:** Low (not critical for Phase 1)
**Effort:** High (requires case studies)

Add sentence like:
```
"I've worked with [COMPETITOR] and helped them [SPECIFIC RESULT]."
```

---

## Implementation Plan

| Priority | Change | Effort | Timeline |
|----------|--------|--------|----------|
| 1 | Remove removals references | Low | Now |
| 2 | Fix name parsing | Low | Now |
| 3 | Add CTA | Medium | 1 day |
| 4 | Add social proof | High | Sprint 2 |

---

## Next Steps

1. Update email generators with removals fixes
2. Test improved emails on 3 leads
3. Re-audit quality
4. Release to operator

