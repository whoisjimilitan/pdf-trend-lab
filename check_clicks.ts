import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runChecks() {
  console.log("\n=== THREE DEFINITIVE CHECKS ===\n");

  try {
    // CHECK 1: Trace every clicked event's outreach record
    console.log("CHECK 1️⃣  EVERY CLICKED EVENT - WHICH OUTREACH GENERATED THESE CLICKS?\n");
    
    const clickedEvents = await prisma.$queryRaw`
      SELECT
        l.business_name,
        l.email,
        o.id as outreach_id,
        o.resend_message_id,
        o.sent_at,
        o.email_type,
        e.event_type,
        e.timestamp as event_timestamp
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      ORDER BY e.timestamp DESC
    ` as Array<any>;

    console.log(`Total clicked events traced: ${clickedEvents.length}\n`);
    
    clickedEvents.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.business_name}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Outreach ID: ${row.outreach_id}`);
      console.log(`   Message ID: ${row.resend_message_id}`);
      console.log(`   Sent: ${row.sent_at}`);
      console.log(`   Clicked: ${row.event_timestamp}`);
      console.log(`   Message ID format: ${row.resend_message_id?.includes('_qa_') ? '⚠️ TEST FORMAT' : '✅ PRODUCTION'}\n`);
    });

    // CHECK 2: Distribution of ALL message ID formats
    console.log("\n\nCHECK 2️⃣  MESSAGE ID FORMAT DISTRIBUTION - PRODUCTION VS QA\n");
    
    const messageIdDistribution = await prisma.$queryRaw`
      SELECT
        CASE 
          WHEN resend_message_id LIKE 'res_qa_%' THEN 'TEST_FORMAT'
          WHEN resend_message_id LIKE 'res_%' THEN 'PRODUCTION_FORMAT'
          WHEN resend_message_id IS NULL THEN 'NULL'
          ELSE 'OTHER'
        END as format,
        COUNT(*) as count
      FROM b2b_outreach
      GROUP BY format
      ORDER BY count DESC
    ` as Array<any>;

    console.log("All outreach message ID formats:\n");
    messageIdDistribution.forEach(row => {
      console.log(`  ${row.format}: ${row.count}`);
    });

    const totalOutreach = messageIdDistribution.reduce((sum, row) => sum + row.count, 0);
    const testFormatCount = messageIdDistribution.find(row => row.format === 'TEST_FORMAT')?.count || 0;
    const prodFormatCount = messageIdDistribution.find(row => row.format === 'PRODUCTION_FORMAT')?.count || 0;
    
    console.log(`\nTotal outreach records: ${totalOutreach}`);
    console.log(`Test format (res_qa_%): ${testFormatCount} (${(testFormatCount/totalOutreach*100).toFixed(1)}%)`);
    console.log(`Production format (res_%): ${prodFormatCount} (${(prodFormatCount/totalOutreach*100).toFixed(1)}%)`);

    // CHECK 3: Why isn't engagement_score being updated?
    console.log("\n\nCHECK 3️⃣  WHY ISN'T ENGAGEMENT_SCORE UPDATING FROM EVENTS?\n");
    
    // Get leads that have events but still have engagement_score = 0
    const leadsWithEventsButZeroScore = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count,
        COUNT(DISTINCT e.id) as total_events
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.engagement_score = 0
      GROUP BY l.id, l.business_name, l.engagement_score
      HAVING COUNT(DISTINCT e.id) > 0
      ORDER BY total_events DESC
      LIMIT 10
    ` as Array<any>;

    console.log("Leads with events but engagement_score still = 0:\n");
    console.log(`Found: ${leadsWithEventsButZeroScore.length} leads\n`);
    
    leadsWithEventsButZeroScore.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   engagement_score in DB: ${lead.engagement_score}`);
      console.log(`   opens recorded: ${lead.open_count}`);
      console.log(`   clicks recorded: ${lead.click_count}`);
      console.log(`   total events: ${lead.total_events}`);
      console.log(`   ⚠️ MISMATCH: Events exist but score not updated\n`);
    });

    // Check if there's code that should calculate engagement_score
    console.log("\nPossible causes for score not updating:");
    console.log("1. No trigger/function updating engagement_score from events");
    console.log("2. Update query exists but hasn't been run");
    console.log("3. Events are on different table structure than expected");
    console.log("4. Engagement calculation depends on something else (pipeline broken)\n");

    // Check for any leads with engagement_score > 0
    const leadsWithScore = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM b2b_leads
      WHERE engagement_score > 0
    ` as Array<{count: bigint}>;

    console.log(`Leads with engagement_score > 0: ${leadsWithScore[0].count}`);
    
    if (leadsWithScore[0].count === 0n) {
      console.log("⚠️ CRITICAL: NO leads have any engagement score");
      console.log("   → Engagement scoring system is completely inactive");
    }

  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

runChecks();
