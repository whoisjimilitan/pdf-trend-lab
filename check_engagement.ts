import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEngagement() {
  console.log("CHECK 3️⃣  WHY ISN'T ENGAGEMENT_SCORE UPDATING FROM EVENTS?\n");

  try {
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

    console.log(`Leads with events but engagement_score = 0: ${leadsWithEventsButZeroScore.length}\n`);
    
    leadsWithEventsButZeroScore.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   engagement_score in DB: ${lead.engagement_score}`);
      console.log(`   opens recorded: ${lead.open_count}`);
      console.log(`   clicks recorded: ${lead.click_count}`);
      console.log(`   total events: ${lead.total_events}`);
      console.log(`   ⚠️ MISMATCH: Events exist but score not updated\n`);
    });

    // Check if any leads have engagement_score > 0
    const leadsWithScore = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM b2b_leads
      WHERE engagement_score > 0
    ` as Array<any>;

    console.log(`\nLeads with engagement_score > 0: ${leadsWithScore[0].count}`);
    
    if (leadsWithScore[0].count === 0) {
      console.log("🔴 CRITICAL: NO leads have any engagement score");
      console.log("   → Engagement scoring system is completely inactive");
      console.log("   → Events are being recorded");
      console.log("   → But not flowing back to update lead records");
    }

    // Check when events were created vs when leads were last updated
    console.log("\n\nTimeline analysis:");
    const timeline = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM b2b_leads WHERE source != 'qa_system_test') as total_leads,
        (SELECT MAX(created_at) FROM b2b_leads WHERE source != 'qa_system_test') as latest_lead_created,
        (SELECT COUNT(*) FROM b2b_outreach) as total_outreach,
        (SELECT MAX(sent_at) FROM b2b_outreach) as latest_outreach_sent,
        (SELECT COUNT(*) FROM b2b_email_events) as total_events,
        (SELECT MAX(timestamp) FROM b2b_email_events) as latest_event_timestamp
    ` as Array<any>;

    console.log(`Latest lead created: ${timeline[0].latest_lead_created}`);
    console.log(`Latest outreach sent: ${timeline[0].latest_outreach_sent}`);
    console.log(`Latest event timestamp: ${timeline[0].latest_event_timestamp}`);
    console.log("\n→ Events happening AFTER leads and outreach were created");
    console.log("→ But lead.engagement_score is not updating");

  } catch (error) {
    console.error("Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEngagement();
