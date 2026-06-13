import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function querySchema() {
  console.log("\n=== LIVE DATABASE SCHEMA CHECK ===\n");

  try {
    // 1. Check b2b_leads
    console.log("1️⃣  b2b_leads table structure:\n");
    const leadsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'b2b_leads'
      ORDER BY ordinal_position
    ` as Array<{column_name: string, data_type: string, is_nullable: string}>;

    leadsColumns.forEach(col => {
      console.log(
        `   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ' (nullable)'}`
      );
    });

    // 2. Check b2b_outreach
    console.log("\n2️⃣  b2b_outreach table structure:\n");
    const outreachColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'b2b_outreach'
      ORDER BY ordinal_position
    ` as Array<{column_name: string, data_type: string, is_nullable: string}>;

    outreachColumns.forEach(col => {
      console.log(
        `   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ' (nullable)'}`
      );
    });

    // 3. Check b2b_email_events
    console.log("\n3️⃣  b2b_email_events table structure:\n");
    const eventsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'b2b_email_events'
      ORDER BY ordinal_position
    ` as Array<{column_name: string, data_type: string, is_nullable: string}>;

    eventsColumns.forEach(col => {
      console.log(
        `   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ' (nullable)'}`
      );
    });

    // 4. Row counts
    console.log("\n4️⃣  Row counts:\n");
    const leadCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM b2b_leads WHERE source != 'qa_system_test'` as Array<{count: bigint}>;
    const outreachCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM b2b_outreach` as Array<{count: bigint}>;
    const eventCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM b2b_email_events` as Array<{count: bigint}>;

    console.log(`   b2b_leads (production): ${leadCount[0].count}`);
    console.log(`   b2b_outreach: ${outreachCount[0].count}`);
    console.log(`   b2b_email_events: ${eventCount[0].count}`);

    // 5. Sample leads
    console.log("\n5️⃣  5 sample leads:\n");
    const sampleLeads = await prisma.$queryRaw`
      SELECT id, business_name, email, engagement_score, opportunity_score, heat_score, source
      FROM b2b_leads 
      WHERE source != 'qa_system_test'
      LIMIT 5
    ` as Array<any>;

    sampleLeads.forEach((lead, idx) => {
      console.log(`   ${idx + 1}. ${lead.business_name}`);
      console.log(`      ID: ${lead.id}, Email: ${lead.email}`);
      console.log(`      Engagement: ${lead.engagement_score}, Opportunity: ${lead.opportunity_score}, Heat: ${lead.heat_score}`);
    });

    // 6. Sample outreach
    console.log("\n6️⃣  5 sample outreach records:\n");
    const sampleOutreach = await prisma.$queryRaw`
      SELECT id, lead_id, resend_message_id, email_type, sent_at
      FROM b2b_outreach
      LIMIT 5
    ` as Array<any>;

    sampleOutreach.forEach((o, idx) => {
      console.log(`   ${idx + 1}. ID: ${o.id}, Lead ID: ${o.lead_id}`);
      console.log(`      Message ID: ${o.resend_message_id}`);
      console.log(`      Type: ${o.email_type}, Sent: ${o.sent_at}`);
    });

    // 7. Sample events
    console.log("\n7️⃣  5 sample events:\n");
    const sampleEvents = await prisma.$queryRaw`
      SELECT id, outreach_id, event_type, timestamp
      FROM b2b_email_events
      LIMIT 5
    ` as Array<any>;

    sampleEvents.forEach((e, idx) => {
      console.log(`   ${idx + 1}. ID: ${e.id}, Type: ${e.event_type}`);
      console.log(`      Outreach ID: ${e.outreach_id}, Timestamp: ${e.timestamp}`);
    });

    // 8. Verify critical columns
    console.log("\n8️⃣  CRITICAL COLUMN VERIFICATION:\n");
    console.log(`   lead_id on b2b_email_events: ${eventsColumns.some(col => col.column_name === 'lead_id') ? '✅ YES' : '❌ NO'}`);
    console.log(`   outreach_id on b2b_email_events: ${eventsColumns.some(col => col.column_name === 'outreach_id') ? '✅ YES' : '❌ NO'}`);
    console.log(`   lead_id on b2b_outreach: ${outreachColumns.some(col => col.column_name === 'lead_id') ? '✅ YES' : '❌ NO'}`);
    console.log(`   resend_message_id on b2b_outreach: ${outreachColumns.some(col => col.column_name === 'resend_message_id') ? '✅ YES' : '❌ NO'}`);
    console.log(`   heat_score on b2b_leads: ${leadsColumns.some(col => col.column_name === 'heat_score') ? '✅ YES' : '❌ NO'}`);
    console.log(`   engagement_score on b2b_leads: ${leadsColumns.some(col => col.column_name === 'engagement_score') ? '✅ YES' : '❌ NO'}`);
    console.log(`   opportunity_score on b2b_leads: ${leadsColumns.some(col => col.column_name === 'opportunity_score') ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

querySchema();
