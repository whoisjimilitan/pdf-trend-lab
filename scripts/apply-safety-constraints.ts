import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applySafetyConstraints() {
  console.log("🔒 APPLYING SAFETY CONSTRAINTS\n");

  try {
    console.log("1️⃣  Adding UNIQUE constraint to qualified_businesses(discovered_business_id)...\n");
    await prisma.$executeRaw`
      ALTER TABLE qualified_businesses
      ADD CONSTRAINT uq_qualified_discovered_business
      UNIQUE (discovered_business_id)
    `;
    console.log("✅ Constraint added: qualified_businesses(discovered_business_id)\n");
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log("⚠️  Constraint already exists, skipping...\n");
    } else {
      console.error("❌ Error adding qualified_businesses constraint:", error);
      process.exit(1);
    }
  }

  try {
    console.log("2️⃣  Adding UNIQUE constraint to b2b_leads(qualified_business_id)...\n");
    await prisma.$executeRaw`
      ALTER TABLE b2b_leads
      ADD CONSTRAINT uq_b2b_leads_qualified_business
      UNIQUE (qualified_business_id)
    `;
    console.log("✅ Constraint added: b2b_leads(qualified_business_id)\n");
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log("⚠️  Constraint already exists, skipping...\n");
    } else {
      console.error("❌ Error adding b2b_leads constraint:", error);
      process.exit(1);
    }
  }

  console.log("✅ CONSTRAINTS APPLIED SUCCESSFULLY\n");
  console.log("System is now protected against duplicate qualified_business and lead rows.\n");

  await prisma.$disconnect();
}

applySafetyConstraints().catch(console.error);
