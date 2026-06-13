import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditDuplicates() {
  console.log("🔍 PHASE 2.1 DATA AUDIT\n");

  // Check for duplicate discovered_business_id in qualified_businesses
  console.log("1️⃣  Checking qualified_businesses for duplicate discovered_business_id...\n");
  try {
    const qb_dupes = await prisma.$queryRaw`
      SELECT discovered_business_id, COUNT(*)::int as count
      FROM qualified_businesses
      GROUP BY discovered_business_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    if (Array.isArray(qb_dupes) && qb_dupes.length === 0) {
      console.log("✅ qualified_businesses: CLEAN (0 duplicates)\n");
    } else {
      console.log("❌ DUPLICATES FOUND IN qualified_businesses:\n");
      console.table(qb_dupes);
    }
  } catch (error) {
    console.error("Error querying qualified_businesses:", error);
  }

  // Check for duplicate qualified_business_id in b2b_leads
  console.log("2️⃣  Checking b2b_leads for duplicate qualified_business_id...\n");
  try {
    const bl_dupes = await prisma.$queryRaw`
      SELECT qualified_business_id, COUNT(*)::int as count
      FROM b2b_leads
      WHERE qualified_business_id IS NOT NULL
      GROUP BY qualified_business_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    if (Array.isArray(bl_dupes) && bl_dupes.length === 0) {
      console.log("✅ b2b_leads: CLEAN (0 duplicates)\n");
    } else {
      console.log("❌ DUPLICATES FOUND IN b2b_leads:\n");
      console.table(bl_dupes);
    }
  } catch (error) {
    console.error("Error querying b2b_leads:", error);
  }

  // Summary counts
  console.log("3️⃣  Summary Counts:\n");
  try {
    const qb_count = await prisma.qualified_businesses.count();
    const bl_count = await prisma.b2b_leads.count();
    const db_count = await prisma.discovered_businesses.count();

    console.log(`discovered_businesses: ${db_count} rows`);
    console.log(`qualified_businesses: ${qb_count} rows`);
    console.log(`b2b_leads: ${bl_count} rows\n`);
  } catch (error) {
    console.error("Error querying counts:", error);
  }

  console.log("✅ AUDIT COMPLETE");
  await prisma.$disconnect();
}

auditDuplicates().catch(console.error);
