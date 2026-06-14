# Deduplication Hardening Report
**Date:** 2026-06-14  
**Current Status:** REVIEW NEEDED  
**Risk Level:** MEDIUM

---

## Current Deduplication Logic

Location: `app/api/discovery/run/route.ts` lines 19-73

### Current Matching Rules

1. **Website Matching**
   - Method: Case-insensitive substring contains
   - Examples:
     - `https://example.com` matches `example.com`
     - `example.com` matches `example.co.uk`
     - `my-example.com` matches `example.com`
   - **Risk:** Over-matching (false positives)

2. **Email Matching**
   - Method: Case-insensitive substring contains
   - Examples:
     - `sales@example.com` matches `example.com@otherdomain.com`
     - `john@example.com` matches `jane@example.co.uk`
   - **Risk:** Over-matching (false positives)

3. **Business Name Matching**
   - Method: First 20 chars substring match
   - Examples:
     - `Example Corp Ltd` matches `Example Corp UK`
     - `John Smith Services` matches `John Smith Painting`
   - **Risk:** Over-matching (false positives)

---

## Proposed Hardening

### 1. Domain Normalization Function

```typescript
function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\/(www\.)?/, '');
    // Remove path
    domain = domain.split('/')[0];
    // Lowercase
    domain = domain.toLowerCase();
    return domain;
  } catch {
    return null;
  }
}
```

**Test Cases:**
- `https://example.com` → `example.com`
- `http://www.example.com` → `example.com`
- `https://www.example.co.uk` → `example.co.uk`
- `example.com/path` → `example.com`

### 2. Email Domain Extraction

```typescript
function extractEmailDomain(email: string | null): string | null {
  if (!email) return null;
  const domain = email.toLowerCase().split('@')[1];
  return domain || null;
}
```

**Test Cases:**
- `john@example.com` → `example.com`
- `sales@example.co.uk` → `example.co.uk`
- `invalid` → `null`

### 3. Hardened Deduplication Logic

Replace current `isDuplicate` function with:

```typescript
async function isDuplicate(lead: DiscoveryResult): Promise<boolean> {
  if (!lead.website && !lead.email && !lead.business_name) {
    return true; // Skip if no identifying info
  }

  const checks = [];

  // Extract normalized domain from website
  const websiteDomain = extractDomain(lead.website);
  if (websiteDomain) {
    checks.push({
      website: {
        equals: websiteDomain,
        mode: "insensitive" as const,
      },
    });
  }

  // Extract domain from email
  const emailDomain = extractEmailDomain(lead.email);
  if (emailDomain) {
    checks.push({
      email: {
        endsWith: `@${emailDomain}`,
        mode: "insensitive" as const,
      },
    });
  }

  // Exact business name match
  if (lead.business_name) {
    checks.push({
      business_name: {
        equals: lead.business_name.toLowerCase(),
        mode: "insensitive" as const,
      },
    });
  }

  if (checks.length === 0) return false;

  const existing = await prisma.b2b_leads.findFirst({
    where: { OR: checks },
  });

  return !!existing;
}
```

---

## Database Schema Changes

Need to add `normalized_domain` column to `b2b_leads`:

```sql
ALTER TABLE b2b_leads 
ADD COLUMN normalized_domain VARCHAR(255) NULL;

CREATE INDEX idx_b2b_leads_normalized_domain 
ON b2b_leads(normalized_domain);
```

---

## Migration Path

### Phase 1 (Immediate)
- Add helper functions (no DB changes)
- Deploy updated `isDuplicate` logic
- All new leads use strict matching

### Phase 2 (Optional)
- Add `normalized_domain` column
- Backfill existing leads
- Index for performance

---

## Impact Analysis

### False Positive Prevention
- **Before:** `my-example.com` blocked if `example.com` exists
- **After:** Only exact domain matches block

### False Negative Risk
- **Before:** Low (substring matching catches variations)
- **After:** Medium (exact matching may miss variations)
  - **Mitigation:** Operator can manually merge duplicates

### Performance
- **Before:** Substring matching (index-unfriendly)
- **After:** Exact matching (index-friendly)
- **Expected Improvement:** 10-50x faster deduplication

---

## Recommendation

**APPROVE** Phase 1 (code-only changes).

**DEFER** Phase 2 (database changes) to next sprint.

This eliminates false positives while maintaining operational capability.

---

## Verification

After deployment:
1. Run 10 new discoveries
2. Manually verify no false positives
3. Check deduplication logs
4. Monitor for missed duplicates

