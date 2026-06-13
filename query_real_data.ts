import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function queryData() {
  console.log("\n=== REAL DATABASE INSPECTION ===\n");

  try {
    // 5. Sample leads (with columns that actually exist)
    console.log("5️⃣  5 sample leads:\n");
    const sampleLeads = await prisma.$queryRaw`
      SELECT id, business_name, email, engagement_score, source, outreach_eligible, created_at
      FROM b2b_leads 
      WHERE source != 'qa_system_test'
      LIMIT 5
    ` as Array<any>;

    sampleLeads.forEach((lead, idx) => {
      console.log(`   ${idx + 1}. ${lead.business_name}`);
      console.log(`      ID: ${lead.id}`);
      console.log(`      Email: ${lead.email}`);
      console.log(`      Engagement Score: ${lead.engagement_score}`);
      console.log(`      Outreach Eligible: ${lead.outreach_eligible}`);
      console.log(`      Created: ${lead.created_at}\n`);
    });

    // 6. Sample outreach
    console.log("\n6️⃣  5 sample outreach records:\n");
    const sampleOutreach = await prisma.$queryRaw`
      SELECT id, lead_id, resend_message_id, email_type, sent_at, replied, replied_at
      FROM b2b_outreach
      LIMIT 5
    ` as Array<any>;

    sampleOutreach.forEach((o, idx) => {
      console.log(`   ${idx + 1}. Outreach ID: ${o.id}`);
      console.log(`      Lead ID: ${o.lead_id}`);
      console.log(`      Message ID: ${o.resend_message_id || 'NULL'}`);
      console.log(`      Type: ${o.email_type}`);
      console.log(`      Sent: ${o.sent_at}`);
      console.log(`      Replied: ${o.replied}, At: ${o.replied_at || 'N/A'}\n`);
    });

    // 7. Sample events
    console.log("\n7️⃣  5 sample events:\n");
    const sampleEvents = await prisma.$queryRaw`
      SELECT id, outreach_id, lead_id, event_type, timestamp
      FROM b2b_email_events
      ORDER BY timestamp DESC
      LIMIT 5
    ` as Array<any>;

    sampleEvents.forEach((e, idx) => {
      console.log(`   ${idx + 1}. Event ID: ${e.id}`);
      console.log(`      Type: ${e.event_type}`);
      console.log(`      Outreach ID: ${e.outreach_id || 'NULL'}`);
      console.log(`      Lead ID: ${e.lead_id || 'NULL'}`);
      console.log(`      Timestamp: ${e.timestamp}\n`);
    });

    // 8. Check for clicked events
    console.log("\n8️⃣  ENGAGEMENT SUMMARY:\n");
    const eventSummary = await prisma.$queryRaw`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM b2b_email_events
      GROUP BY event_type
      ORDER BY count DESC
    ` as Array<any>;

    eventSummary.forEach(row => {
      console.log(`   ${row.event_type}: ${row.count}`);
    });

    // 9. Check leads with clicks
    console.log("\n9️⃣  Leads with CLICKED events:\n");
    const clickedLeads = await prisma.$queryRaw`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN 1 END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN 1 END) as click_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.email
      ORDER BY click_count DESC
    ` as Array<any>;

    console.log(`   Total: ${clickedLeads.length}\n`);
    clickedLeads.forEach((lead, idx) => {
      console.log(`   ${idx + 1}. ${lead.business_name}`);
      console.log(`      Email: ${lead.email}`);
      console.log(`      Opens: ${lead.open_count}, Clicks: ${lead.click_count}\n`);
    });

  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

queryData();
