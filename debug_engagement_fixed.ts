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
      GROUP BY l.id, l.business_name, l.engagement_score, l.updated_at
      HAVING COUNT(DISTINCT e.id) > 0
      ORDER BY COUNT(DISTINCT e.id) DESC
    ` as Array<any>;

    console.log(`Found ${mismatchedLeads.length} leads with mismatches:\n`);
    
    mismatchedLeads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   engagement_score: ${lead.engagement_score}`);
      console.log(`   Events: ${lead.total_events} (opens: ${lead.open_count}, clicks: ${lead.click_count})`);
      const timeDiff = new Date(lead.latest_event).getTime() - new Date(lead.lead_last_updated).getTime();
      const minutesDiff = Math.floor(timeDiff / 60000);
      console.log(`   Latest event: ${minutesDiff}+ minutes ago`);
      console.log(`   ⚠️  Events exist but score not updated\n`);
    });

    // Step 2: What SHOULD the scores be?
    console.log("\nSTEP 2️⃣  CALCULATED SCORES (If formula: opens×10 + clicks×20)\n");

    const calculatedScores = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score as current_score,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count,
        (COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) * 10) +
        (COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) * 20) as should_be_score
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.engagement_score
      ORDER BY should_be_score DESC
      LIMIT 10
    ` as Array<any>;

    calculatedScores.forEach((lead, idx) => {
      const matches = lead.current_score === lead.should_be_score;
      const status = matches ? '✅' : '⚠️';
      console.log(`${idx + 1}. ${status} ${lead.business_name}`);
      console.log(`   Current: ${lead.current_score} | Should be: ${lead.should_be_score}`);
      if (lead.open_count > 0 || lead.click_count > 0) {
        console.log(`   Events: ${lead.open_count} opens, ${lead.click_count} clicks`);
      }
      if (!matches) {
        console.log(`   ❌ DIFF: ${lead.should_be_score - lead.current_score} points`);
      }
      console.log('');
    });

    // Step 3: Distribution of correctness
    console.log("\nSTEP 3️⃣  SCORE CORRECTNESS DISTRIBUTION\n");

    const allLeads = await prisma.$queryRaw`
      SELECT
        l.id,
        l.business_name,
        l.engagement_score as current_score,
        (COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) * 10) +
        (COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) * 20) as calculated_score
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.engagement_score
    ` as Array<any>;

    const correct = allLeads.filter(l => l.current_score === l.calculated_score).length;
    const incorrect = allLeads.filter(l => l.current_score !== l.calculated_score).length;

    console.log(`Total production leads: ${allLeads.length}`);
    console.log(`Scores correct: ${correct} (${(correct/allLeads.length*100).toFixed(1)}%)`);
    console.log(`Scores incorrect: ${incorrect} (${(incorrect/allLeads.length*100).toFixed(1)}%)`);

    if (incorrect > 0) {
      console.log(`\n⚠️  PROBLEM: ${incorrect} leads have wrong engagement_score`);
      console.log(`   Likely cause: Update job didn't run, or only ran once\n`);
    }

    // Step 4: The two clicked production leads - what are their scores?
    console.log("\nSTEP 4️⃣  OUR 6 PRODUCTION CLICKED LEADS - WHAT'S THEIR SCORE STATUS?\n");

    const clickedLeads = await prisma.$queryRaw`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        l.engagement_score as current_score,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      AND o.resend_message_id NOT LIKE 'res_qa_%'
      GROUP BY l.id, l.business_name, l.email, l.engagement_score
      ORDER BY l.business_name
    ` as Array<any>;

    clickedLeads.forEach((lead, idx) => {
      const shouldScore = (lead.open_count * 10) + (lead.click_count * 20);
      const status = lead.current_score === shouldScore ? '✅' : '⚠️';
      console.log(`${idx + 1}. ${status} ${lead.business_name}`);
      console.log(`   Current score: ${lead.current_score}`);
      console.log(`   Should be: ${shouldScore}`);
      console.log('');
    });

  } catch (error) {
    console.error("Error:", (error as Error).message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugChain().catch(console.error);
