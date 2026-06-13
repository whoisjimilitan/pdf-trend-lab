# SENDING READINESS CHECKLIST

**Date**: 2026-06-13

**Purpose**: Verify Saint & Story can reliably send follow-up emails

---

## EMAIL INFRASTRUCTURE CHECKS

### 1. Domain Configuration

**Check**: Is saintandstory.com verified in Resend?

**Current Status**: ❌ **NOT VERIFIED**

**Evidence**: Follow-up execution failed with:
```
Error: The saintandstory.com domain is not verified. 
Please, add and verify your domain on https://resend.com/domains
```

**Required Action**: 
- [ ] Log into Resend dashboard
- [ ] Navigate to Domains
- [ ] Add saintandstory.com
- [ ] Complete verification (DNS records)
- [ ] Re-test send

**Blocking**: YES — Cannot send emails until domain is verified

---

### 2. SPF Record

**Check**: Is SPF record configured for saintandstory.com?

**Current Status**: ⏳ **UNKNOWN** (blocked by domain verification)

**Required Record**:
```
v=spf1 include:sendingdomain.resend.dev ~all
```

**Verification Method**:
```bash
dig saintandstory.com txt | grep spf
```

**Required Action**:
- [ ] Verify SPF record in DNS
- [ ] Confirm includes Resend sendingdomain
- [ ] Test with: https://mxtoolbox.com/spf.aspx

**Blocking**: YES until domain verified

---

### 3. DKIM Configuration

**Check**: Is DKIM signing enabled for saintandstory.com?

**Current Status**: ⏳ **UNKNOWN** (blocked by domain verification)

**Expected Setup**:
- Resend generates DKIM records
- Domain DNS updated with CNAME records
- Email signing enabled by default

**Verification Method**:
```bash
dig resend._domainkey.saintandstory.com cname
```

**Blocking**: YES until domain verified

---

### 4. DMARC Policy

**Check**: Is DMARC policy configured?

**Current Status**: ⏳ **UNKNOWN** (blocked by domain verification)

**Recommended Policy**:
```
v=DMARC1; p=quarantine; rua=mailto:bounce@saintandstory.com
```

**Verification Method**:
```bash
dig _dmarc.saintandstory.com txt
```

**Blocking**: NO (soft fail acceptable, but recommended)

---

### 5. Reply Inbox

**Check**: Does reply-to address work?

**Current Setup**: reply_to: "hello@saintandstory.com"

**Current Status**: ⏳ **UNTESTED**

**Required Action**:
- [ ] Verify hello@saintandstory.com inbox exists
- [ ] Confirm forwarding is set up (if needed)
- [ ] Test: Send email to hello@saintandstory.com, verify receipt
- [ ] Confirm replies can be read by team

**Blocking**: NO (but operational requirement)

---

### 6. Bounce Handling

**Check**: Are hard bounces handled correctly?

**Current Status**: ⏳ **CONFIGURED BUT UNTESTED**

**Resend Setup**:
- Webhook endpoint: `/api/b2b/webhooks/resend/`
- Webhook event: `email.bounced`
- Database table: `b2b_email_events`

**Expected Flow**:
```
Invalid email
    ↓
Email bounces (Resend)
    ↓
Webhook fires: event_type = 'bounced'
    ↓
b2b_email_events updated
    ↓
Lead marked for follow-up review
```

**Current Status**: Schema ready, but needs test

**Required Action**:
- [ ] Send test email to invalid address (e.g., nonexistent@test.com)
- [ ] Verify Resend webhook fires
- [ ] Confirm event recorded in b2b_email_events
- [ ] Check lead status updated

**Blocking**: NO (but important for data quality)

---

### 7. Unsubscribe Handling

**Check**: Can recipients unsubscribe?

**Current Status**: ⏳ **CONFIGURED BUT UNTESTED**

**Resend Setup**:
- Unsubscribe link: Auto-added by Resend
- Webhook event: `email.complained`
- Expected handling: Mark lead as do-not-contact

**Required Action**:
- [ ] Verify email templates include unsubscribe link
- [ ] Test unsubscribe flow
- [ ] Confirm webhook captures `email.complained`
- [ ] Verify lead marked as opted-out

**Blocking**: NO (but required for compliance)

---

## CRITICAL GATE: DOMAIN VERIFICATION

**Current Blocker**: saintandstory.com NOT verified in Resend

**Until Resolved**: No emails can be sent

**Resolution Path**:
1. Go to: https://resend.com/domains
2. Click: "Add Domain"
3. Enter: saintandstory.com
4. Follow: DNS verification steps
5. Wait: DNS propagation (5-15 minutes)
6. Verify: Domain status shows "Verified"

---

## READINESS SUMMARY

| Item | Status | Blocking? |
|------|--------|-----------|
| Domain verified | ❌ NO | **YES** |
| SPF configured | ⏳ Unknown | YES (after domain) |
| DKIM configured | ⏳ Unknown | YES (after domain) |
| DMARC configured | ⏳ Unknown | NO |
| Reply inbox working | ⏳ Unknown | NO |
| Bounce handling | ⏳ Untested | NO |
| Unsubscribe handling | ⏳ Untested | NO |

---

## FINAL VERDICT

```
READY_TO_SEND = NO

BLOCKING ISSUE: Domain not verified in Resend

ACTION REQUIRED: Verify saintandstory.com domain in Resend dashboard

ESTIMATED TIME: 15-30 minutes (includes DNS propagation)

AFTER DOMAIN VERIFIED: Re-run this checklist to confirm all DNS records propagated
```

---

## NEXT STEPS

1. **Immediately**: Verify saintandstory.com domain in Resend
2. **After verification**: Confirm DNS records propagated (SPF, DKIM, DMARC)
3. **Once confirmed**: Update this checklist to READY_TO_SEND = YES
4. **Then**: Execute FOLLOWUP_EXECUTION_PLAN.md

---

## REFERENCE LINKS

- Resend Domains: https://resend.com/domains
- SPF Validator: https://mxtoolbox.com/spf.aspx
- DKIM Checker: https://mxtoolbox.com/dkim.aspx
- DMARC Analyzer: https://mxtoolbox.com/dmarc.aspx
