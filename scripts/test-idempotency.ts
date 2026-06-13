import { PrismaClient } from '@prisma/client';
import { neon } from "@neondatabase/serverless";
import { runFullPipeline, RawBusinessDiscovery } from '../lib/four-layer-pipeline';

const prisma = new PrismaClient();
const sql = neon(process.env.DATABASE_URL!);

async function testIdempotency() {
  console.log("🧪 PHASE 2.1 IDEMPOTENCY TEST\n");
  console.log("Testing: Same business through Phase 4 twice should create zero new rows on second run\n");

  try {
    // Get a test business from discovered_businesses
    console.log("1️⃣  Getting test business from discovered_businesses...\n");
    const testBusiness = await prisma.$queryRaw`
      SELECT
        id, google_place_id, business_name, address, postcode,
        category, source, raw_data
      FROM discovered_businesses
      LIMIT 1
    ` as any[];

    if (!testBusiness || testBusiness.length === 0) {
      console.log("❌ No discovered businesses found. Cannot test idempotency.\n");
      process.exit(1);
    }

    const business = testBusiness[0];
    console.log(`✅ Test business: ${business.business_name} (${business.google_place_id})\n`);

    // Get reviews for this business
    console.log("2️⃣  Getting reviews for test business...\n");
    const discoveredId = business.id;

    const reviews = await sql`
      SELECT rating, text, author, time
      FROM reviews
      WHERE discovered_business_id = ${discoveredId}
      LIMIT 20
    `;

    const rawDiscovery: RawBusinessDiscovery = {
      placeId: business.google_place_id,
      name: business.business_name,
      address: business.address || '',
      postcode: business.postcode,
      category: business.category,
      source: business.source,
      reviews: (reviews as any[]).map((r: any) => ({
        rating: r.rating,
        text: r.text,
        author: r.author,
        time: r.time
      })),
      rawData: business.raw_data
    };

    console.log(`✅ Found ${reviews.length} reviews\n`);

    // Get baseline counts
    console.log("3️⃣  Getting baseline counts...\n");
    const beforeQB = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM qualified_businesses
    ` as any[];
    const beforeBL = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM b2b_leads
    ` as any[];

    const qbBefore = beforeQB[0].count;
    const blBefore = beforeBL[0].count;

    console.log(`qualified_businesses: ${qbBefore} rows`);
    console.log(`b2b_leads: ${blBefore} rows\n`);

    // RUN #1
    console.log("4️⃣  RUN #1: Processing business through Phase 4...\n");
    const result1 = await runFullPipeline(sql, rawDiscovery);
    console.log(`Result 1:`, result1, "\n");

    const afterRun1QB = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM qualified_businesses
    ` as any[];
    const afterRun1BL = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM b2b_leads
    ` as any[];

    const qbAfterRun1 = afterRun1QB[0].count;
    const blAfterRun1 = afterRun1BL[0].count;

    const qbDelta1 = qbAfterRun1 - qbBefore;
    const blDelta1 = blAfterRun1 - blBefore;

    console.log(`qualified_businesses: ${qbAfterRun1} rows (+${qbDelta1})`);
    console.log(`b2b_leads: ${blAfterRun1} rows (+${blDelta1})\n`);

    if (qbDelta1 !== 1 || blDelta1 !== 1) {
      console.log("⚠️  RUN #1 did not create expected rows. This might be normal if business didn't qualify.\n");
    }

    // RUN #2 - Same business again
    console.log("5️⃣  RUN #2: Processing SAME business again through Phase 4...\n");
    const result2 = await runFullPipeline(sql, rawDiscovery);
    console.log(`Result 2:`, result2, "\n");

    const afterRun2QB = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM qualified_businesses
    ` as any[];
    const afterRun2BL = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM b2b_leads
    ` as any[];

    const qbAfterRun2 = afterRun2QB[0].count;
    const blAfterRun2 = afterRun2BL[0].count;

    const qbDelta2 = qbAfterRun2 - qbAfterRun1;
    const blDelta2 = blAfterRun2 - blAfterRun1;

    console.log(`qualified_businesses: ${qbAfterRun2} rows (+${qbDelta2})`);
    console.log(`b2b_leads: ${blAfterRun2} rows (+${blDelta2})\n`);

    // VERDICT
    console.log("6️⃣  IDEMPOTENCY TEST VERDICT:\n");

    if (qbDelta2 === 0 && blDelta2 === 0) {
      console.log("✅ IDEMPOTENT - Second run created zero new rows");
      console.log("✅ System is safe for bridge deployment\n");
    } else {
      console.log("❌ NOT IDEMPOTENT - Second run created new rows");
      console.log(`   qualified_businesses delta: ${qbDelta2}`);
      console.log(`   b2b_leads delta: ${blDelta2}`);
      console.log("❌ System is NOT safe for bridge deployment\n");
      process.exit(1);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error during idempotency test:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testIdempotency();
