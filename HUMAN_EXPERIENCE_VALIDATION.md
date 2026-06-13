# HUMAN EXPERIENCE VALIDATION

**Objective**: Verify email renders correctly and reply tracking works without risking prospects

**Test Method**: Send to your own inbox, interact with it, verify webhook events

---

## TEST SEQUENCE

### Step 1: Send Test Email

**To**: whoisjimi.today@gmail.com

**From**: hello@saintandstoryltd.co.uk

**Subject**: "Multi-location operational consistency"

**Body**: Use exact text from haart follow-up (most complete example)

**Expected**: Email accepted by Resend with valid message ID

---

### Step 2: Receive & Inspect

**Check**:
- ✅ Subject line displays correctly
- ✅ Sender shows as "Saint & Story"
- ✅ Body text renders without corruption
- ✅ Signature appears correctly
- ✅ Reply-to address correct (hello@saintandstoryltd.co.uk)
- ✅ Mobile rendering (open on phone)
- ✅ All links clickable
- ✅ Images load (if any)

**Expected**: Professional, clean, conversion-ready

---

### Step 3: Open Email

**Action**: Open email in Gmail

**Verify**:
- ✅ Open event fires to Resend webhook
- ✅ b2b_email_events records `event_type='opened'`
- ✅ Timestamp recorded accurately
- ✅ Dashboard shows open activity

**Expected**: Open detected within 5 minutes

---

### Step 4: Click a Link

**Action**: Click the reply-to link or any call-to-action

**Verify**:
- ✅ Click event fires to Resend webhook
- ✅ b2b_email_events records `event_type='clicked'`
- ✅ Message ID matches sent email
- ✅ Click timestamp accurate

**Expected**: Click detected within 5 minutes

---

### Step 5: Reply to Email

**Action**: Reply to the test email with: "Yes, let's talk"

**Verify**:
- ✅ Reply arrives in hello@saintandstoryltd.co.uk inbox
- ✅ Resend webhook triggers (if configured)
- ✅ b2b_email_events records `event_type='replied'`
- ✅ Reply content stored
- ✅ REVENUE_MONITOR.md shows reply detected
- ✅ Dashboard classifies as "Positive interest"

**Expected**: Reply detected and classified within 5 minutes

---

## VALIDATION CHECKLIST

Email Quality:
- ☐ Subject line clear and specific
- ☐ Body text professional and error-free
- ☐ Signature complete
- ☐ Links working
- ☐ Mobile-friendly layout
- ☐ No rendering issues
- ☐ Reply-to address correct

Webhook Events:
- ☐ Open event recorded
- ☐ Click event recorded
- ☐ Reply event recorded
- ☐ All timestamps accurate
- ☐ Message ID linkage correct

Dashboard Tracking:
- ☐ REVENUE_MONITOR.md updates in real-time
- ☐ Events appear within 5 minutes
- ☐ Reply classification works
- ☐ No data loss or duplication

---

## SUCCESS CRITERIA

✅ **All human experience checks pass**

✅ **All webhook events detected**

✅ **Reply correctly classified**

**Result**: Entire human interaction loop validated

---

## IF ISSUES FOUND

**Email rendering issue**:
- Fix template
- Re-send test
- Verify fix

**Webhook not firing**:
- Check Resend webhook configuration
- Verify endpoint is receiving requests
- Check database inserts

**Reply not detected**:
- Check email parsing
- Verify reply-to address matching
- Check manual detection fallback

---

## NEXT STEP

Once validation passes:

1. System verified for human interaction
2. Safe to monitor real prospects
3. Proceed to V1 launch snapshot
4. Freeze system changes
5. Monitor for first real reply

---

**This test proves the entire loop works before measuring real results.**
