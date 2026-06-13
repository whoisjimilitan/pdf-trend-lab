# Prepopulated Email Template (Tier 2 Step 3)

**CTA → Prepopulated Email Continuity System**

Architecture: Landing Page CTA → `/api/dev/prepopulated-email` → Email client (mailto:) with prefilled subject + body

---

## Hard Rules (Locked Schema)

### Structure
Email MUST have exactly these components:
- `to`: recipient email address (prospect provides or prefilled)
- `subject`: Pattern recognition language + prospect name (max 60 chars)
- `body`: Exactly 3 sections in order

### Section 1: Observation (Observation frame)
**Rule**: Reference the landing page observation
- Specific to industry + city
- Soft inevitability tone
- No rhetorical questions
- Max 250 characters
- Frame: `specificObservation`

Example:
```
We're tracking what's happening in [industry] operations across [city]. 
This pattern of [operational coordination] is becoming standard practice.
```

### Section 2: Pattern Recognition (PatternRecognition frame)
**Rule**: Bridge observation to prospect's specific situation
- Reference the landing page implication
- Consultant tone (advisory, not persuasive)
- Specific to company name
- Max 250 characters
- Frame: `trackingPattern` or `softInevitability`

Example:
```
For [company], this would translate into structured visibility across 
[operational domain]. Right now, this visibility is distributed across 
emails, phone calls, and manual tracking.
```

### Section 3: Deferred Decision (DeferredDecision frame)
**Rule**: Open-ended invitation to discussion
- No sales pressure
- Single CTA: "When would be a good time to explore this together?"
- Max 250 characters
- Frame: `referenceLandingPageContent`

Example:
```
This is why we brought this to your attention now — it's becoming a 
standard expectation in your industry. When would be a good time to 
map this out together?
```

---

## Continuity Mapping

✓ Email references Landing Page observation (Section 1)
✓ Email references Landing Page implication (Section 2)
✓ Email asks for conversation, not commitment (Section 3)
✓ Tone: consultant throughout (no vendor language)
✓ Single narrative thread: observation → pattern → discussion

Expected click path:
```
User on Landing Page → Clicks "See what's next" CTA
→ Routed to /api/dev/prepopulated-email?industry=X&company=Y&city=Z
→ Email client opens with subject + body prefilled
→ Prospect reviews and sends
```

---

## Tone Compliance (Locked)

- ✗ Rhetorical questions ("Do you need?", "Are you interested?")
- ✗ Vendor-speak ("We help companies", "Our solution", "Sign up today")
- ✗ Marketing language ("industry-leading", "cutting-edge", "proven results")
- ✗ Separate CTA moment (invitation IS the CTA)
- ✓ Consultant tone (advisory, specific, soft)
- ✓ Soft inevitability (pattern, standard practice, becoming expectation)
- ✓ Deferred decision (when, together, explore)

---

## Visual Compliance (Tier 1 Locked)

Email is text-only (mailto: link), no styling.
- Colors: N/A (email client renders)
- Typography: N/A (email client renders)
- Icons: N/A (email client renders)
- Spacing: Standard email line breaks

---

## Validation Checklist (Before Shipping)

Email generation must pass ALL checks:

- [ ] Email has exactly 3 sections
- [ ] Section 1 (Observation) uses `specificObservation` frame only
- [ ] Section 2 (PatternRecognition) uses `trackingPattern` OR `softInevitability` frame
- [ ] Section 3 (DeferredDecision) uses `referenceLandingPageContent` frame only
- [ ] Subject line ≤ 60 characters
- [ ] Each section ≤ 250 characters
- [ ] No rhetorical questions in any section
- [ ] No vendor-speak or marketing language
- [ ] Industry name present in Section 1
- [ ] Company name present in Section 2
- [ ] City name present in Section 1
- [ ] Single CTA only (invitation to discuss)
- [ ] Tone is consultant, not vendor
- [ ] Email preserves continuity from Landing Page
- [ ] Mailto: link contains all context (to, subject, body)
- [ ] Validation passes with 0 violations

---

## Implementation Notes

**API Route**: `/api/dev/prepopulated-email`

Query parameters:
- `industry` (required): industry slug from URL (e.g., "logistics")
- `company` (required): company name from query param or fallback to industry name
- `city` (required): city name from query param or fallback to "your region"

Response options:
1. **Success** (GET): Return object with `mailto` link and structured email data
2. **Validation** (POST): Accept generated email, validate against schema, return PASS/FAIL
3. **Development** (GET with `?validate=true`): Return validation result inline

Default behavior: Generate email, validate, and return mailto: link.

---

## Error Handling

If validation fails:
- Return error with specific violations
- Do not generate mailto: link
- Log violations for debugging
- Example: `"violationCount": 2, "violations": ["rhetorical_question_detected", "vendor_speak_detected"]`

---

## Schema Reference

See `/tmp/tier2_step3_validation.json` for hard-locked JSON schema.
All generation MUST comply with schema constraints.
