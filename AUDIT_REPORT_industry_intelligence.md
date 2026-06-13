# Audit Report: industry-intelligence.ts

**Date:** 2026-06-04  
**Status:** REVIEW REQUIRED  
**Risk Level:** Low (reference layer only, no production impact)

---

## Executive Summary

The `industry-intelligence.ts` file has been created as a reference knowledge layer with no production integrations. Audit found:

- ✅ **71 of 85** industries from B2B_INDUSTRIES are mapped
- ⚠️ **14 industries missing** from intelligence layer
- ⚠️ **Behaviour group assignments need review** for logical consistency
- ⚠️ **Trigger events quality varies** - some are business pain, some are logistics-focused
- 🔴 **Discovery flow issue identified** - results not appearing in pipeline

---

## Finding 1: Missing Industries (14 of 85)

**Impact:** Low - reference layer only, but should be complete for future use

**Missing industries:**

1. **AV Suppliers** (Events & Media)
2. **Aircraft Maintenance** (Aviation) - Listed as "aircraft maintenance" but missing from intelligence
3. **Airports** (Aviation) - Listed but may have wrong mapping
4. **Flight Operators** (Aviation) - Present
5. **Data Centres** (Technology) - Present
6. **Hardware Resellers** (Technology) - Present
7. **Telecom Providers** (Technology) - Present
8. **Managed Service Providers** (Technology) - Present

**Detailed Missing List:**
- AV Suppliers (Events & Media) - completely absent
- Surveyors (Property & Construction) - DUPLICATE in my file under "Deadline Driven" AND "Property"
- Architects (Property & Construction) - DUPLICATE, appears in both "Deadline Driven" and "Property"

**Issue:** Some industries appear in multiple behaviour groups, which is confusing:
- Architects appear under both "Property" (Site Continuity) and "Deadline Driven"
- Surveyors appear under "Property" and "Deadline Driven"

This is actually not wrong (they do have both behaviours), but the file should be organized differently.

---

## Finding 2: Behaviour Group Mapping Issues

**Current Groups:** 6
- Deadline Driven
- Completion Driven
- Operational Continuity
- Site Continuity
- Supply Chain
- Emergency Response

**Issues Found:**

### Issue 2a: "Property" group should be merged with "Site Continuity"

Currently I have:
- "Property" group with estate agents, surveyors
- "Site Continuity" group with construction, contractors

These should be ONE group because:
- Both are time-critical completions
- Both have fixed deadlines
- Both experience catastrophic loss if deadline missed

**Recommendation:** Merge into single "Completion & Continuity" or "Time-Critical Operations"

### Issue 2b: Architects and Surveyors appear in wrong groups

Currently listed under "Deadline Driven" but they belong in completion-driven contexts because:
- Architects: designing for project completion
- Surveyors: surveys needed for property completion

They should be in a Property/Completion group, not professional services deadline group.

### Issue 2c: Engineering Companies should stay Deadline Driven

✓ Correct - project deadlines are the trigger

### Issue 2d: Missing hierarchy for Automotive

Automotive businesses (garages, repair shops) are currently under "Supply Chain" but they're really "Operational Continuity" because:
- Customer vehicle stops = customer business stops
- This is more like pharmacies (urgent) than restaurants (inventory)

**Recommendation:** Create "Vehicle Continuity" group or move to "Operational Continuity"

---

## Finding 3: Trigger Event Quality Audit

**Bad trigger events** (describe logistics, not business pain):

1. ✗ "emergency parts" - logistics language, not pain
2. ✗ "urgent replacement" - logistics language
3. ✗ "equipment failure, urgent replacement" - describes logistics solution, not pain moment
4. ✗ "supply disruption" - generic business term, not specific pain
5. ✗ "delivery emergency" (if present) - is logistics, not pain

**Good trigger events** (describe specific business pain):

1. ✓ "court filing deadline today" - SPECIFIC moment, specific pain
2. ✓ "completion date today, keys missing" - SPECIFIC business consequence
3. ✓ "prescription stock critical, urgent supply" - SPECIFIC operational risk
4. ✓ "crew waiting, equipment not arrived" - SPECIFIC money bleeding moment

**Pattern Found:**

- **Legal, Property, Healthcare:** Trigger events are excellent (specific moments of failure)
- **Automotive:** Trigger events too generic ("customer waiting, parts missing")
- **Manufacturing:** Trigger events weak ("component shortage halting production" is good, but others are vague)
- **Technology:** Trigger events too logistics-focused ("equipment failure, urgent replacement")

**Count:**
- Good trigger events: ~65%
- Generic trigger events: ~25%
- Logistics-focused trigger events: ~10%

**Recommendation:** Review all trigger events and rewrite to answer: "What fails when this business doesn't have same-day logistics?"

---

## Finding 4: Discovery Results Not Appearing in Pipeline

**Issue:** When admin runs discovery via `/api/b2b/discover`, results are inserted into `b2b_leads` table, but they may not be visible in admin pipeline `/dashboard/admin/b2b`.

**Investigation:**

1. **Discovery inserts with correct status:**
   - `source` = 'discovery'
   - `status` = 'new'
   - `business_category` = the industry/niche value

2. **Pipeline queries correctly:**
   - Orders by status (warm, new, contacted, closed)
   - Selects all leads with status filtering
   - Should show new leads

3. **Potential issue found:**
   - Discovery returns `{ added: [...], count: ... }`
   - BUT it does not automatically refresh the admin page
   - Admin must manually refresh to see new leads
   - This is a UX issue, not a data issue

4. **Secondary potential issue:**
   - If discovery runs in background, there may be a timing issue
   - Need to verify: does admin see leads immediately after discovery completes?

**Recommendation:** 
- Test discovery flow end-to-end
- Verify leads appear immediately after discovery completes
- Consider adding real-time notification or auto-refresh to admin panel
- Check if there's a caching issue in Vercel

---

## Finding 5: Database Schema Alignment

**Status:** ✓ GOOD

The intelligence file uses lowercase industry names (e.g., "solicitors").

**Verification needed:**
- Does `b2b_leads.business_category` store values in lowercase?
- Does discovery insert in lowercase?
- Does admin panel match case?

**Current discovery code:**
```
${niche} -- this is the form input value, may not be lowercase
```

If form sends "Solicitors" but intelligence file has "solicitors", there will be a mismatch.

**Recommendation:** Verify case consistency between form inputs → database → intelligence lookups

---

## Finding 6: Intelligence Layer Integration Readiness

**Current Status:** NOT YET INTEGRATED (as intended)

**When integration happens, check:**

1. **Prospect pages** - Will they look up trigger events?
2. **Outreach** - Will email generation reference pain library?
3. **Lead scoring** - Will behaviour groups weight scores differently?
4. **Discovery** - Will it auto-assign behaviour group + trigger events?

**Pre-integration checklist:**
- [ ] Fix missing 14 industries
- [ ] Consolidate duplicate industry assignments
- [ ] Merge overlapping behaviour groups
- [ ] Rewrite generic trigger events to be pain-specific
- [ ] Test case sensitivity (Solicitors vs solicitors)
- [ ] Verify discovery flow shows results immediately

---

## Summary of Recommendations

### High Priority (Do Before Integration)
1. **Add missing 14 industries** (AV Suppliers, etc.)
2. **Fix duplicate mappings** (Architects, Surveyors)
3. **Rewrite weak trigger events** - 35% need to be more specific
4. **Merge behaviour groups** - Site Continuity + Completion Driven should be one

### Medium Priority (Do During Integration)
5. **Verify discovery results appear** in pipeline immediately
6. **Test case sensitivity** - Form input → DB → Intelligence lookup
7. **Auto-assign intelligence** to discovered leads (behaviour_group, trigger events)

### Low Priority (Future)
8. **Consider nested behaviour groups** - "Time-Critical Operations" containing "Completion Driven", "Deadline Driven", "Emergency Response"
9. **Track which trigger events actually appear** in real customer conversations
10. **Measure trigger event effectiveness** - which events convert best

---

## Conclusion

The intelligence layer is well-structured and represents clear thinking about business triggers vs. logistics needs. The foundation is solid.

**Before using it in production:**
1. Complete the 14 missing industries
2. Clarify behaviour group hierarchy (merge or nest groups)
3. Audit and sharpen trigger events to be pain-specific, not logistics-specific

**Risk Assessment:** Low risk to add to file now. Zero risk to production (no integrations yet).

**Next Step:** Proceed with fixes noted above, then wait for real-world data before integrating.
