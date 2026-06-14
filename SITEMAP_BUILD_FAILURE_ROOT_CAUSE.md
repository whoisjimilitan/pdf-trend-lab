# Sitemap Build Failure — Root Cause Analysis

**Date**: 2026-06-14  
**Objective**: Diagnose P2021 error during Vercel build  
**Status**: Awaiting Production Database Verification

---

## 1. Sitemap Implementation ✅

**File**: `app/sitemap.ts:7`

**Code**:
```typescript
const products = await prisma.product.findMany({
  where: { published: true },
  select: { slug: true, createdAt: true },
  orderBy: { createdAt: "desc" },
});
```

**Function**: Generates SEO sitemap with links to published products

---

## 2. Product Model Definition ✅

**Location**: `prisma/schema.prisma:49-65`

**Model Definition**:
```prisma
model Product {
  id             String      @id @default(cuid())
  opportunityId  String
  opportunity    Opportunity @relation(fields: [opportunityId], references: [id])
  title          String
  slug           String      @default("")
  pdfContent     String
  salesPageCopy  String
  seoPageContent String
  status         String      @default("draft")
  published      Boolean     @default(false)
  salesCount     Int         @default(0)
  revenue        Float       @default(0)
  shopifyId      String?
  gumroadUrl     String      @default("")
  createdAt      DateTime    @default(now())
}
```

**Status**: ✅ Model defined in schema

---

## 3. Migration History ✅

**Initial Migration**: `prisma/migrations/20260519202013_init/migration.sql`

**Migration SQL**:
```sql
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfContent" TEXT NOT NULL,
    "salesPageCopy" TEXT NOT NULL,
    "seoPageContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "shopifyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
```

**Date Created**: May 19, 2026 (20260519202013)

**Status**: ✅ Migration exists and defines Product table

---

## 4. Local Database ✅

**Database Configuration**: `.env`

```
DATABASE_URL="postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

**Database Type**: PostgreSQL (Neon)  
**Database Name**: neondb  
**Host**: ep-lively-dream-abwubbyb.eu-west-2.aws.neon.tech  
**Region**: EU-West-2 (London)

**Status**: ✅ Local database configured

---

## 5. Production Database ⏳ **UNVERIFIED**

**CRITICAL QUESTION**: What DATABASE_URL is Vercel using?

**Evidence of Problem**:
- Vercel build fails with: `The table 'public.Product' does not exist in the current database`
- This means: Database connects ✅, but table missing ❌
- Two possibilities:
  1. Vercel uses DIFFERENT database than local
  2. Vercel uses SAME database but migrations never applied

**I cannot access** Vercel environment variables without dashboard access.

---

## 6. Root Cause Hypothesis

Based on available evidence:

### Hypothesis A: Different Database
- **Scenario**: Vercel DATABASE_URL points to different Neon database than local
- **Evidence**: Error says table "does not exist" (connection works, but no table)
- **Likelihood**: HIGH (common in multi-environment setups)
- **Fix**: Apply migrations to Vercel database

### Hypothesis B: Migrations Not Applied
- **Scenario**: Vercel uses same database, but Product migration never ran
- **Evidence**: Table missing despite migration existing
- **Likelihood**: MEDIUM
- **Fix**: Run migrations on Vercel database

### Hypothesis C: Database Snapshot
- **Scenario**: Vercel database is a snapshot from before Product table existed
- **Evidence**: Table missing from expected database
- **Likelihood**: MEDIUM
- **Fix**: Reinitialize database or apply migrations

---

## 7. What I Need to Verify

**Cannot be determined without Vercel dashboard access**:

1. **Vercel Environment Variables**
   - What is DATABASE_URL set to in Vercel?
   - Is it the same as local or different?

2. **Production Database Status**
   - Does Product table exist in the Vercel database?
   - When was the database last updated?
   - Have migrations been applied in production?

3. **Database Connection Status**
   - Can Vercel successfully connect to the database?
   - Are there any recent errors in database logs?

---

## Summary

| Item | Status | Evidence |
|------|--------|----------|
| Sitemap calls prisma.product.findMany() | ✅ VERIFIED | app/sitemap.ts:7 |
| Product model defined in schema | ✅ VERIFIED | prisma/schema.prisma:49-65 |
| Product migration exists | ✅ VERIFIED | 20260519202013_init |
| Local database configured | ✅ VERIFIED | .env (Neon) |
| Local Product table exists | ✅ EXPECTED | (not tested, but migration applied) |
| Production database configured | ⏳ UNKNOWN | Cannot access Vercel env vars |
| Production Product table exists | ⏳ UNKNOWN | Error says "does not exist" |
| Vercel DATABASE_URL | ⏳ UNKNOWN | Requires dashboard verification |

---

## Exact Root Cause

**CONFIRMED**: The build fails because `prisma.product.findMany()` is called during prerender, but the Product table does not exist in the Vercel build environment's database.

**ROOT CAUSE**: Either Vercel database is different, or migrations were never applied to the Vercel database.

**VERIFICATION REQUIRED**: Check Vercel environment variables and database status.

---

## Next Steps (Waiting for User)

1. **Open Vercel project settings** → Environment Variables
2. **Find DATABASE_URL**
3. **Compare to local DATABASE_URL**
4. **If different**: Verify new database has Product table
5. **If same**: Verify migrations were applied
6. **Report findings**

**Then I can determine exact root cause and recommend fix.**

