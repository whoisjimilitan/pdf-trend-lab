# MONITORING PROTOCOL

**Phase**: Operations Mode (V1 Frozen)

**Duration**: Until first business result (reply, meeting, or critical failure)

**Update**: Daily

---

## PRIMARY RESPONSIBILITY

Monitor for business results, not engineering metrics.

**Only metric that matters**: Replies received

---

## DAILY CHECKLIST

### Morning (9 AM)

- [ ] Check webhook events in database
  - Any new events for 6 message IDs?
  - Look for: delivered, opened, clicked, replied
  
- [ ] Update DAILY_REVENUE_REPORT.md
  - Record counts: sent, delivered, opened, clicked, replied
  
- [ ] Update REVENUE_MONITOR.md
  - Log any new engagement events per prospect
  
- [ ] Check inbox (hello@saintandstoryltd.co.uk)
  - Any replies from prospects?
  - Manual fallback if webhook misses

### Afternoon (2 PM)

- [ ] Check for new webhook events
- [ ] Any new opens or clicks?
- [ ] Any replies?
- [ ] Update reports if changed

### Evening (5 PM)

- [ ] Final check for replies
- [ ] Summarize day's activity
- [ ] Note any issues

---

## WHEN A REPLY ARRIVES

**Immediate (within 5 minutes)**:

1. [ ] Classify the reply:
   - ✅ Positive interest → Escalate immediately
   - ⚠️ Objection → Log objection, determine response
   - 🔄 Referral → Log referral, follow up
   - ❌ Not interested → Log, respect preference
   - 🤖 Auto-response → Note, wait for real reply

2. [ ] Update REVENUE_MONITOR.md
   - Log reply, timestamp, classification
   
3. [ ] Update DAILY_REVENUE_REPORT.md
   - Increment "Replied" counter
   - Increment "Positive Replies" if applicable

4. [ ] Alert if positive
   - Notify stakeholder
   - Escalate to next action (meeting scheduling)

---

## WHEN A POSITIVE REPLY ARRIVES

**Critical milestone** — This validates the entire pipeline

**Steps**:
1. [ ] Verify sender is legitimate
2. [ ] Classify as positive interest
3. [ ] Schedule meeting per FIRST_MEETING_PLAYBOOK.md
4. [ ] Log in CRM
5. [ ] Create opportunity record
6. [ ] Update revenue forecast

**This is the moment the autonomous system proves itself.**

---

## WHEN A MEETING IS BOOKED

1. [ ] Create opportunity record
2. [ ] Schedule in calendar
3. [ ] Prepare meeting notes per FIRST_MEETING_PLAYBOOK.md
4. [ ] Track outcome (pilot agreed, product discussed, next steps defined)

---

## WHAT NOT TO DO

🚫 **DO NOT MODIFY**:
- Discovery logic
- Scoring algorithms
- Outreach templates
- Follow-up sequences
- Webhook configuration
- Automation workflows

🚫 **DO NOT ADJUST** while monitoring:
- Prompts
- Message timing
- Lead ranking
- Selection criteria
- Automation rules

🚫 **DO NOT TOUCH** the system until:
- First reply received, OR
- 72 hours elapsed with 0 engagement, OR
- Critical delivery failure occurs

---

## CRITICAL ALERTS

🚨 **Alert immediately if**:

1. **Delivery failures > 2**
   - Check Resend status
   - Investigate email quality
   
2. **Positive reply received**
   - This is success validation
   
3. **Meeting opportunity detected**
   - This is revenue entry point
   
4. **No activity for 48 hours**
   - Check webhook endpoint
   - Verify Resend integration

---

## WEEKLY SUMMARY

**Every Friday 5 PM**:

1. [ ] Total replies received: ___
2. [ ] Positive replies: ___
3. [ ] Meetings scheduled: ___
4. [ ] Opportunities created: ___
5. [ ] Revenue: ___

**Analysis**:
- Are replies coming in?
- What % are positive?
- Are meetings converting?
- What's the bottleneck?

---

## ITERATION TRIGGER

**After first real data arrives** (replies, meetings, or 72h with nothing):

1. [ ] Analyze what worked
2. [ ] Analyze what didn't
3. [ ] Propose V1.1 changes (if minor) or V2 redesign (if major)
4. [ ] Unfreeze only the components that need improvement
5. [ ] Re-freeze and test
6. [ ] Monitor again

---

## SUCCESS CONDITION

**When this phase ends**:

- [ ] First reply received (if positive) OR
- [ ] First meeting booked OR
- [ ] Root cause diagnosed for why nothing happened

At that point, you have data to improve.

---

## IMPORTANT

**Do not get nervous.**

The system is working. It's generating real message IDs, being accepted by Resend, and waiting for human response.

Humans have different rhythms than software.

Give it 48-72 hours minimum before concluding anything.

Trust the system. Monitor the metrics. Wait for replies.

---

**System locked. Monitoring active. Awaiting first business result.**
