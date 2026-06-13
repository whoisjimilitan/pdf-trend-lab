# CRITICAL VALIDATION TESTS
# Enriched Brief Integration

**Do not commit until all three tests pass.**

---

## CRITICAL TEST A: End-to-End Prospect Journey

### Goal
Prove the entire system works as a prospect experiences it.

### Step 1: Find a Real Lead
```sql
SELECT id, business_name, business_category, city, lead_state, status 
FROM b2b_leads 
WHERE lead_state = 'new' OR lead_state = 'recognized'
ORDER BY created_at DESC 
LIMIT 1;
```

Record: `lead_id`, `business_name`, `business_category`

Example output:
```
id: 42
business_name: "Westpoint Pharmacy"
business_category: "Pharmacies"
city: "Manchester"
lead_state: "new"
```

### Step 2: Verify Initial State
```sql
SELECT id, business_name, lead_state, status, transitioned_at 
FROM b2b_leads 
WHERE id = [YOUR_LEAD_ID];
```

Expected: `lead_state = 'new'` or `'recognized'`

### Step 3: Send Recognition Email (via Dashboard)
- Navigate to: `/dashboard/admin/b2b`
- Find your lead in the pipeline
- Click "Send Recognition Email"
- Check: Green ✓ banner appears with timestamp

Expected output in console:
```
[PROSPECT-AUDIT] {
  leadId: "42",
  industry: "Pharmacies",
  enrichedBriefGenerated: true,
  fallbackUsed: false,
  pendingConfirmation: false
}
```

### Step 4: Open Email Link
- Copy the recognition email link from your email client
- Expected format: `https://saintandstoryltd.co.uk/prospect/westpoint-pharmacy?reply=confirmed&lead_id=42&trigger=...`
- Open in browser

**Verify:**
- [ ] Page loads without error
- [ ] No 404
- [ ] No console errors

### Step 5: Read the Prospect Brief Naturally
- Scroll through the entire page slowly
- Read headline, reality, insight, proof sections
- Watch the engagement tracking banner (blue bar at top)
- Wait for "Confirmation received" message

Expected banner text:
```
Engaging experience mode active
Tab focus: ✓ | Scroll depth: [0-100]% | Section visibility: [✓/✗]
```

**Verify:**
- [ ] Enriched headline appears (industry-specific, mentions their situation)
- [ ] Enriched current reality section (reflects their business context)
- [ ] Enriched operational insight (uses "When" language)
- [ ] All text feels specific to their business, not generic

### Step 6: Trigger Engagement
- Continue scrolling (reach 30%+ scroll depth)
- OR wait for section visibility to trigger (read a full section)
- Watch for green "Confirmation received" message

Expected console output:
```
[PROSPECT-AUDIT] engagement_triggered: true {
  lead_id: "42",
  enrichedBriefUsed: true
}
```

### Step 7: Verify State Transition
```sql
SELECT id, business_name, lead_state, status, transitioned_at 
FROM b2b_leads 
WHERE id = 42;
```

**Verify:**
- [ ] lead_state changed to 'engaged' (was 'new' or 'recognized')
- [ ] transitioned_at has current timestamp
- [ ] status may have changed to 'warm' or stayed same

```sql
SELECT * FROM lead_state_transitions 
WHERE lead_id = 42 
ORDER BY created_at DESC 
LIMIT 3;
```

**Verify:**
- [ ] Entry shows: from_state='recognized' to_state='engaged'
- [ ] Timestamp is current

### TEST A Success Criteria
```
NEW → RECOGNIZED → ENGAGED (all automatic, no manual intervention)
```

✅ **PASS** if:
- State transitions happened automatically
- Enriched brief appeared on page
- Engagement triggered confirmation
- Database shows clean state chain

---

## CRITICAL TEST B: Enriched vs Generic Comparison

### Goal
Prove the enriched brief is noticeably better than generic copy.

### Step 1: Generate Generic Version
- Use a prospect page WITHOUT lead_id
- URL: `https://localhost:3000/prospect/westpoint-pharmacy`
- Screenshot: Hero + Pain + Mechanism + Transformation sections

OR use this from code:
```
getCategoryMessaging("Pharmacies")
```

Expected generic output:
```
Headline: "Specimen delays cost patient care."
Pain1: "Collections always run late."
Pain2: "Someone is always calling to check status."
Pain3: "You've accepted patient care delays as inevitable."
```

### Step 2: Generate Enriched Version
- Use same prospect with lead_id
- URL: `https://localhost:3000/prospect/westpoint-pharmacy?reply=confirmed&lead_id=42&trigger=test`
- Screenshot: Hero + Pain + Mechanism + Transformation sections

Expected enriched output (example):
```
Headline: "Your pharmacy stops losing time to slow deliveries—and reclaims focus for growth."
Pain1: "Your customers trust you. They rate you at 4 stars, which means you've already built a strong foundation."
Pain2: "When you systematically address slow deliveries, your customers notice immediately."
Pain3: "You're not just improving operations. You're freeing your entire team to work on what actually grows the business."
```

### Step 3: Side-by-Side Comparison

Create a comparison table:

| Aspect | Generic | Enriched | Better? |
|--------|---------|----------|---------|
| **Specificity** | "Specimen delays" | "Slow deliveries in your pharmacy" | ✓ Enriched |
| **Business Context** | Industry problem | Their specific situation | ✓ Enriched |
| **Emotional Resonance** | Generic pain | Reflects THEIR review rating | ✓ Enriched |
| **Language** | Prescriptive | Diagnostic (shows understanding) | ✓ Enriched |
| **Recognition Factor** | Could be anyone | Feels written for them | ✓ Enriched |

### Step 4: Evaluate Each Question

**Question 1: Is the enriched version noticeably more specific?**
- [ ] YES — Enriched mentions their pain_point or situation
- [ ] NO — Both feel equally generic
- [ ] MAYBE — Enriched has some specificity but could be better

**Question 2: Does it feel more intelligent?**
- [ ] YES — Enriched reflects understanding of their business
- [ ] NO — Both feel equally obvious
- [ ] MAYBE — Enriched shows some understanding

**Question 3: Does it create stronger recognition?**
- [ ] YES — Reader thinks "They really know my business"
- [ ] NO — Reader thinks "This could be for anyone"
- [ ] MAYBE — Some recognition but not strong

**Question 4: Would a business owner immediately notice?**
- [ ] YES — Obvious difference, prefer enriched
- [ ] NO — Both seem fine
- [ ] MAYBE — Need more leads to compare

### TEST B Success Criteria

✅ **PASS** if:
- Enriched version is noticeably more specific
- Shows evidence of understanding (pain_point, review_rating, city)
- Business owner would prefer enriched version
- Difference is material, not marginal

❌ **FAIL** if:
- Generic and enriched are nearly identical
- No meaningful difference in specificity
- Both feel equally impersonal

**If TEST B FAILS:** Stop here. Brief-enrichment.ts needs improvement before proceeding.

---

## CRITICAL TEST C: Fallback Safety

### Goal
Prove the system doesn't break when enrichment fails.

### Step 1: Force Brief Generation Failure
Edit: `/lib/brief-enrichment.ts`

Find:
```typescript
export function generateEnrichedBrief(lead: Lead): EnrichedBrief {
  const context = extractSignalContext(lead);
```

Add at the top:
```typescript
export function generateEnrichedBrief(lead: Lead): EnrichedBrief {
  throw new Error("[VALIDATION] Forced test failure in brief generation");
  const context = extractSignalContext(lead);
```

### Step 2: Load Prospect Page with lead_id
```
https://localhost:3000/prospect/westpoint-pharmacy?reply=confirmed&lead_id=42&trigger=test
```

**Expected behavior:**
- [ ] Page loads (no error page)
- [ ] Generic copy appears (NOT enriched)
- [ ] Engagement tracking still works
- [ ] State machine still works
- [ ] No error message shown to prospect
- [ ] Server logs show error (safe for us to see)

Expected console (server-side):
```
[PROSPECT] Failed to generate brief for lead 42: [VALIDATION] Forced test failure
```

Expected audit log:
```
[PROSPECT-AUDIT] {
  leadId: "42",
  enrichedBriefGenerated: false,
  fallbackUsed: true,
  pendingConfirmation: true
}
```

### Step 3: Verify Engagement Still Works
- Scroll the page
- Watch for "Confirmation received" message
- Check state transition happens

```sql
SELECT lead_state FROM b2b_leads WHERE id = 42;
```

Expected: `lead_state = 'engaged'`

### Step 4: Remove Test Failure
Delete the forced error from brief-enrichment.ts:
```typescript
throw new Error("[VALIDATION] Forced test failure in brief generation");
```

Verify the file builds cleanly:
```bash
npm run build
```

### TEST C Success Criteria

✅ **PASS** if:
- Page loads with fallback (generic copy)
- No prospect-facing error
- Engagement tracking works
- State machine works
- System is resilient to brief generation failure

---

## After All Three Tests Pass

Run this to clean up temporary code:

### Remove audit logs
Remove these lines from:

**page.tsx (lines ~120-130):**
```typescript
// Audit log for validation
console.log("[PROSPECT-AUDIT]", {
  ...
});
```

**ProspectBriefingPageV2.tsx (in confirmSelfIdentification):**
```typescript
// Audit log for validation
console.log("[PROSPECT-AUDIT] engagement_triggered: true", { ... });
```

### Final build check:
```bash
npm run build
```

### Commit
```bash
git add -A && git commit -m "feat(prospect-brief): integrate enriched brief generation with safe fallback

- Wire generateEnrichedBrief() into prospect page server-side
- Graceful fallback to generic copy if lead_id invalid or missing
- Map 5-section enriched brief into existing 7-section UI structure
- Preserve Mirror section (industry intelligence untouched)
- Keep all engagement tracking and state transitions unchanged
- Add briefMetadata collection for future briefType classification
- Add debug mode for development inspection (?debug=brief)
- Validated: E2E journey, enriched quality, fallback safety

Closes: enriched-brief-integration"
```

---

## Test Completion Checklist

- [ ] TEST A: End-to-end journey passed (NEW → RECOGNIZED → ENGAGED)
- [ ] TEST B: Enriched brief is clearly better than generic
- [ ] TEST C: Fallback safety verified

- [ ] Temporary audit logs removed
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Ready to commit

