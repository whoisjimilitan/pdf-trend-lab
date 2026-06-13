import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugChain() {
  console.log("\n=== TRACK B: ENGAGEMENT SCORE UPDATE CHAIN DIAGNOSTIC ===\n");

  try {
    // Step 1: Identify leads with event mismatches
    console.log("STEP 1️⃣  LEADS WITH EVENTS BUT SCORE = 0\n");
    
    const mismatchedLeads = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count,
        COUNT(DISTINCT e.id) as total_events,
        MAX(e.timestamp) as latest_event,
        MAX(l.updated_at) as lead_last_updated
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.engagement_score = 0
      AND COUNT(DISTINCT e.id) > 0
      GROUP BY l.id, l.business_name, l.engagement_score, l.updated_at
      HAVING COUNT(DISTINCT e.id) > 0
      ORDER BY total_events DESC
    ` as Array<any>;

    console.log(`Found ${mismatchedLeads.length} leads with mismatches:\n`);
    
    mismatchedLeads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   engagement_score in DB: ${lead.engagement_score}`);
      console.log(`   Total events: ${lead.total_events} (opens: ${lead.open_count}, clicks: ${lead.click_count})`);
      console.log(`   Latest event: ${lead.latest_event}`);
      console.log(`   Lead last updated: ${lead.lead_last_updated}`);
      
      const timeDiff = new Date(lead.latest_event).getTime() - new Date(lead.lead_last_updated).getTime();
      const minutesDiff = Math.floor(timeDiff / 60000);
      console.log(`   ⏱️  Time since last update: ${minutesDiff} minutes`);
      console.log(`   🤔 Events arrived but score wasn't updated\n`);
    });

    // Step 2: Compare leads WITH scores
    console.log("\n\nSTEP 2️⃣  LEADS WITH CORRECT SCORES (engagement_score > 0)\n");
    
    const workingLeads = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count,
        COUNT(DISTINCT e.id) as total_events,
        MAX(e.timestamp) as latest_event,
        MAX(l.updated_at) as lead_last_updated
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.engagement_score > 0
      GROUP BY l.id, l.business_name, l.engagement_score, l.updated_at
      ORDER BY l.engagement_score DESC
      LIMIT 3
    ` as Array<any>;

    console.log(`Sample of leads with working scores:\n`);
    workingLeads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   engagement_score: ${lead.engagement_score}`);
      console.log(`   Total events: ${lead.total_events}`);
      console.log(`   Lead last updated: ${lead.lead_last_updated}\n`);
    });

    // Step 3: Find the pattern - what's different?
    console.log("\nSTEP 3️⃣  WHAT'S DIFFERENT BETWEEN WORKING AND BROKEN?\n");

    const comparison = await prisma.$queryRaw`
      SELECT
        'With_Score' as group_type,
        COUNT(DISTINCT l.id) as lead_count,
        COUNT(DISTINCT e.id) as event_count,
        MIN(l.updated_at) as oldest_update,
        MAX(l.updated_at) as newest_update
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.engagement_score > 0
      
      UNION ALL
      
      SELECT
        'Without_Score' as group_type,
        COUNT(DISTINCT l.id) as lead_count,
        COUNT(DISTINCT e.id) as event_count,
        MIN(l.updated_at) as oldest_update,
        MAX(l.updated_at) as newest_update
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.engagement_score = 0
    ` as Array<any>;

    console.log("Leads with score > 0:");
    const withScore = comparison.find(row => row.group_type === 'With_Score');
    console.log(`  Count: ${withScore?.lead_count}`);
    console.log(`  Last updated range: ${withScore?.oldest_update} to ${withScore?.newest_update}`);
    console.log(`  Total events in group: ${withScore?.event_count}`);

    console.log("\nLeads with score = 0:");
    const withoutScore = comparison.find(row => row.group_type === 'Without_Score');
    console.log(`  Count: ${withoutScore?.lead_count}`);
    console.log(`  Last updated range: ${withoutScore?.oldest_update} to ${withoutScore?.newest_update}`);
    console.log(`  Total events in group: ${withoutScore?.event_count}`);

    // Step 4: Check for any update/trigger logic
    console.log("\n\nSTEP 4️⃣  POSSIBLE ROOT CAUSES\n");

    console.log("Hypothesis 1: Update job runs periodically, not in real-time");
    console.log("  Evidence: Some leads have scores, some don't");
    console.log("  → Check if there's a cron job or scheduled task updating engagement_score\n");

    console.log("Hypothesis 2: Update logic triggers on certain conditions");
    console.log("  Evidence: 15/45 leads have scores, 30 don't");
    console.log("  → Check if score only updates for certain email_type or source\n");

    console.log("Hypothesis 3: Update job failed partway through");
    console.log("  Evidence: Latest events are from 09:21:24, but updates may not have run since");
    console.log("  → Check error logs for failed updates\n");

    console.log("Hypothesis 4: Manual update was run once, then not repeated");
    console.log("  Evidence: 15 leads got updated on first run");
    console.log("  → Check git history for update scripts or one-off queries\n");

    // Step 5: Check what the correct engagement_score SHOULD be
    console.log("\nSTEP 5️⃣  WHAT ENGAGEMENT_SCORE SHOULD BE (if formula exists)\n");

    const shouldBeScores = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score as current_score,
        (COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) * 10) as opens_value,
        (COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) * 20) as clicks_value,
        (COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) * 10) +
        (COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) * 20) as calculated_score
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.engagement_score
      ORDER BY calculated_score DESC
      LIMIT 10
    ` as Array<any>;

    console.log("If formula is: opens×10 + clicks×20\n");
    shouldBeScores.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   Current: ${lead.current_score}, Should be: ${lead.calculated_score}`);
      if (lead.current_score !== lead.calculated_score) {
        console.log(`   ⚠️  MISMATCH: ${lead.calculated_score - lead.current_score} points off\n`);
      }
    });

  } catch (error) {
    console.error("Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

debugChain().catch(console.error);
