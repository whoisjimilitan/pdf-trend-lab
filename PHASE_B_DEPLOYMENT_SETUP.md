# Phase B: Pre-Deployment Setup Guide

**Date**: 2026-06-13  
**Status**: Phase B code complete, setup required before testing

---

## Prerequisites

### 1. Install Dependencies

```bash
npm install
```

This installs the `uuid` package needed by the Observer Engine.

**Verify**:
```bash
npm list uuid
# Should show: uuid@9.x.x
```

### 2. Regenerate Prisma Types

The ValidationLog model was added in Phase A migration. Regenerate Prisma types:

```bash
npx prisma generate
```

This creates the Prisma client with ValidationLog support.

**Verify**:
```bash
ls -la node_modules/.prisma/client/
# Should include generated Prisma client with ValidationLog types
```

### 3. Apply Phase A Migration (if not already done)

Ensure the ValidationLog table exists in your database:

```bash
npx prisma migrate deploy
```

**For Local Development (SQLite)**:
```bash
# Migration will auto-apply to local sqlite database
npx prisma migrate deploy
```

**For Production (Neon PostgreSQL)**:
```bash
# Verify connection string is set
echo $DATABASE_URL

# Deploy migration
npx prisma migrate deploy
```

**Verify**:
```bash
npx prisma db push --skip-generate
# Or query the database directly:
# SELECT * FROM "ValidationLog" LIMIT 1;
```

---

## TypeScript Compilation

After setup, verify TypeScript compiles without errors:

```bash
npx tsc --noEmit
```

Expected output: No errors

---

## Phase B Testing

### Run Parity Validation Test

```bash
npx jest lib/__tests__/b2b-parity-validation.test.ts --verbose
```

Expected output:
```
PASS  lib/__tests__/b2b-parity-validation.test.ts
  Phase B: Observer Engine Parity Validation
    Individual prospect parity
      ✓ Prospect 001: customer_relocation insight should be selected
      ✓ Prospect 002: consistency_challenge insight should be selected
      ✓ Prospect 003: no approved insights (low confidence)
    Readiness detection
      ✓ Ready now when recent change + retention decline
      ✓ Ready later when expansion planned + moderate churn
    Evidence validation
      ✓ Contradiction with WEAK level should reduce confidence minimally
    Batch parity test
      ✓ Batch parity across 3 prospects
    Immutability
      ✓ InsightObject is locked and immutable
    No hidden divergence
      ✓ Observer engine should log any difference from current system

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

### Verify Non-Blocking Logging

Create a test to confirm logging failures don't break production:

```typescript
// In your integration test:
const mockLogger = jest.spyOn(prisma.validationLog, 'create').mockRejectedValueOnce(new Error('DB error'))

const result = await runObserverEngine(input)

// Should still return success, logging error caught
expect(result.status).toBe('success')
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to log'))
```

---

## Environment Configuration

### Development (Shadow Mode Testing)

```bash
# .env.local or .env.development
EVIDENCE_VALIDATION_MODE=shadow
DATABASE_URL=file:./dev.db  # or your test database
```

### Production Deployment

Before deploying to production shadow mode:

```bash
# .env.production or deployment configuration
EVIDENCE_VALIDATION_MODE=shadow
DATABASE_URL=<your-neon-postgres-url>
```

---

## Deployment Checklist

### Pre-Deployment Phase (Before Shadow Mode)

- [ ] Run `npm install` to add uuid dependency
- [ ] Run `npx prisma generate` to regenerate types
- [ ] Run `npx prisma migrate deploy` to apply ValidationLog table
- [ ] Run `npx tsc --noEmit` to verify TypeScript compilation
- [ ] Run `npx jest lib/__tests__/b2b-parity-validation.test.ts` to verify parity
- [ ] Review test output for any divergences
- [ ] Verify all 10 tests pass
- [ ] Check ValidationLog table exists: `npx prisma db execute --stdin` → `SELECT COUNT(*) FROM "ValidationLog";`

### Shadow Mode Deployment

- [ ] Verify EVIDENCE_VALIDATION_MODE=shadow in environment
- [ ] Redeploy application
- [ ] Monitor application logs for: "Evidence Validation Engine: SHADOW MODE"
- [ ] Verify no production errors after deployment
- [ ] Check ValidationLog table starts receiving entries
- [ ] Monitor for any logging errors (should be non-blocking)

### Post-Deployment Monitoring

- [ ] Daily: Check for divergence patterns in ValidationLog
- [ ] Daily: Monitor for logging errors (non-blocking, should not affect production)
- [ ] Weekly: Query promotion threshold metrics
- [ ] Monitor: Sample count, conversion rate, engagement quality, insight accuracy

---

## Troubleshooting

### Issue: "Cannot find module 'uuid'"

**Cause**: uuid package not installed

**Solution**:
```bash
npm install uuid
npm install --save-dev @types/uuid  # if TypeScript complains
```

### Issue: "Property 'validationLog' does not exist on type 'PrismaClient'"

**Cause**: Prisma types not regenerated

**Solution**:
```bash
npx prisma generate
npx prisma db push  # or migrate deploy
```

### Issue: ValidationLog table doesn't exist

**Cause**: Migration not applied

**Solution**:
```bash
npx prisma migrate deploy
# For SQLite dev: npx prisma db push
# For PostgreSQL prod: npx prisma migrate deploy --name validation_logs
```

### Issue: Tests fail with divergence >5%

**Cause**: Observer Engine logic differs from current system

**Solution**:
1. Review divergence report in test output
2. Identify which insight types are diverging
3. Compare Observer Engine logic with current system code
4. Adjust Observer Engine to match (do NOT deploy with >5% divergence)
5. Re-run tests
6. When 95%+ parity confirmed, proceed

### Issue: Logging is blocking production

**Cause**: Logging errors not caught properly

**Solution**:
- All logging functions should be non-blocking (async without await in hot path)
- Check that logging errors are caught and logged (not thrown)
- Verify try-catch in b2b-validation-logger.ts
- Consider using async queue if logging falls behind

---

## Testing with Production Data

After initial parity test passes, expand to 100 production prospects:

### Step 1: Export Prospect Sample

```typescript
// In your database query:
const prospects = await db.prospect.findMany({
  take: 100,
  orderBy: { created_at: 'desc' }
})

// Extract: prospectId, businessName, leadCategory, leadLocations, enrichment data
// Create mock data or load directly from database
```

### Step 2: Update Test File

Replace MOCK_PROSPECTS in `lib/__tests__/b2b-parity-validation.test.ts` with real data:

```typescript
const PRODUCTION_PROSPECTS: ObserverEngineInput[] = [
  // 100 real prospects with actual data
]

describe('Phase B: Production Parity Test', () => {
  test('Parity across 100 production prospects', async () => {
    const results = await batchParityTest(PRODUCTION_PROSPECTS)
    expect(results.matchRate).toBeGreaterThanOrEqual(0.95)
    
    if (results.divergences.length > 0) {
      console.log('Divergences found:', results.divergences)
    }
  })
})
```

### Step 3: Run Production Parity Test

```bash
npx jest lib/__tests__/b2b-parity-validation.test.ts --testNamePattern="Production Parity" --verbose
```

### Step 4: Analyze Results

- If 95%+ parity: Approved for shadow mode
- If <95% parity: Fix Observer Engine, re-test
- Review divergences: Are they acceptable or indicate bugs?

---

## Deployment Commands (Quick Reference)

```bash
# 1. Install dependencies
npm install

# 2. Regenerate Prisma types
npx prisma generate

# 3. Apply database migration
npx prisma migrate deploy

# 4. Verify TypeScript
npx tsc --noEmit

# 5. Run tests
npx jest lib/__tests__/b2b-parity-validation.test.ts --verbose

# 6. Build application
npm run build

# 7. Deploy to production with EVIDENCE_VALIDATION_MODE=shadow
# (Configure environment variable in your deployment)

# 8. Monitor logs for Observer Engine startup
# Expected: "Evidence Validation Engine: SHADOW MODE"
```

---

## Next Steps After Setup

1. **Run parity tests** (Step 2 above)
2. **If 95%+ parity**: Proceed to shadow mode deployment
3. **If <95% parity**: Debug, adjust Observer Engine, re-test
4. **Deploy to shadow mode**: Set EVIDENCE_VALIDATION_MODE=shadow
5. **Monitor for 1000+ samples**: Collect data for Phase C promotion decision
6. **Phase C**: Evaluate promotion thresholds and decide authority transition

---

## Support & Debugging

**Phase B Implementation**: See [PHASE_B_COMPLETE.md](PHASE_B_COMPLETE.md)  
**Constraints**: See [PHASE_B_CONSTRAINTS.md](PHASE_B_CONSTRAINTS.md)  
**Prime Directive**: See [PRIME_DIRECTIVE.md](PRIME_DIRECTIVE.md)  

---

**Status**: Setup guide complete. Ready to execute setup steps.
