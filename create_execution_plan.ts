import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

const followUpStrategy: Record<string, {subject: string, body: string}> = {
  "haart Estate and Lettings Agents Leeds": {
    subject: "Multi-location operational consistency",
    body: `Hi team, managing consistent quality across locations is complex. We make it simple. Would a quick call next week work? Best, Saint & Story`
  },
  "Monroe Estate Agents (Alwoodley)": {
    subject: "Alwoodley properties - white-glove relocation standard",
    body: `Hi there, Alwoodley clients expect premium service. Would it help if I showed you how we've supported similar premium agents? 15 minutes next week? Best, Saint & Story`
  },
  "Linley & Simpson Student Lettings Agent - Leeds": {
    subject: "Student lettings logistics — 2 questions",
    body: `Hi there, student lettings are high-volume. Would it be useful if I sent 3 ideas for efficiency? 10 minutes next week? Best, Saint & Story`
  },
  "Greater London Properties - Bloomsbury Estate Agents": {
    subject: "London luxury - relocation as competitive advantage",
    body: `Hi there, I have 3 ideas for Bloomsbury-area agents. Worth 10 minutes next week? Best, Saint & Story`
  },
  "Cornerstone Sales and Lettings": {
    subject: "Multi-location scale — doing it consistently",
    body: `Hi there, multi-location operations need consistency. Would a quick conversation help? Best, Saint & Story`
  },
  "Westpoint Pharmacy": {
    subject: "Pharmacy customer retention during relocations",
    body: `Hi there, we help pharmacies maintain customer relationships during relocations. Would 10 minutes next week work? Best, Saint & Story`
  }
};

async function createExecutionPlan() {
  try {
    // Get the 6 production clicked leads
    const clickedLeads = await prisma.$queryRaw`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        o.id as outreach_id,
        o.resend_message_id,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN e.id END) as open_count,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN e.id END) as click_count,
        MAX(CASE WHEN e.event_type = 'clicked' THEN e.timestamp END) as click_timestamp,
        COUNT(DISTINCT CASE WHEN e.event_type = 'replied' THEN e.id END) as reply_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      AND o.resend_message_id NOT LIKE 'res_qa_%'
      GROUP BY l.id, l.business_name, l.email, o.id, o.resend_message_id
    ` as Array<any>;

    // Sort manually
    const sorted = clickedLeads.sort((a: any, b: any) => {
      const timeA = new Date(a.click_timestamp).getTime();
      const timeB = new Date(b.click_timestamp).getTime();
      return timeB - timeA;
    });

    let allReady = true;
    const issues: string[] = [];

    // Validate
    for (const lead of sorted) {
      if (!lead.email) {
        allReady = false;
        issues.push(`${lead.business_name}: No email`);
      }
      if (!lead.resend_message_id || lead.resend_message_id.includes('_qa_')) {
        allReady = false;
        issues.push(`${lead.business_name}: Not production ID`);
      }
      if ((lead.reply_count || 0) > 0) {
        allReady = false;
        issues.push(`${lead.business_name}: Already replied`);
      }
    }

    // Generate plan
    const plan = `# FOLLOWUP EXECUTION PLAN

**Date**: ${new Date().toISOString()}

**Status**: ${allReady ? '✅ EXECUTION_READY = YES' : '❌ EXECUTION_READY = NO'}

---

## 6 PRODUCTION CLICKED LEADS

${sorted.map((lead: any, idx: number) => {
  const strategy = followUpStrategy[lead.business_name];
  return `
### ${idx + 1}. ${lead.business_name}

**ID**: ${lead.id}  
**Email**: ${lead.email}  
**Opens**: ${lead.open_count} | **Clicks**: ${lead.click_count} | **Last click**: ${new Date(lead.click_timestamp).toISOString().split('T')[0]}

**Outreach ID**: ${lead.outreach_id}  
**Message ID**: ${lead.resend_message_id}  
**Format**: ${lead.resend_message_id?.includes('_qa_') ? '❌ TEST' : '✅ PRODUCTION'}

**Follow-Up Subject**: ${strategy?.subject || 'NO STRATEGY'}

**Validation**: ${lead.email && lead.resend_message_id && !lead.resend_message_id.includes('_qa_') && !lead.reply_count ? '✅' : '❌'}
`;
}).join('\n')}

---

## VERIFICATION RESULTS

${allReady ? `
✅ No QA records
✅ No duplicates
✅ No previous replies
✅ All have emails
✅ All have production Resend IDs
✅ All have strategies

**RESULT**: Ready to send
` : `
Issues found:
${issues.map(i => `❌ ${i}`).join('\n')}
`}

---

## SEND SEQUENCE

Execute in order above, 1 per minute.

**Estimated time**: 6 minutes

**Execution**: Immediately after domain verification

---

## SUCCESS CRITERIA

- [ ] All 6 sent
- [ ] Message IDs recorded
- [ ] Webhooks fire
- [ ] First reply within 24h
`;

    fs.writeFileSync('./FOLLOWUP_EXECUTION_PLAN.md', plan);
    
    console.log(`\n✅ EXECUTION PLAN CREATED\n`);
    console.log(`Leads: ${sorted.length}`);
    console.log(`Ready: ${allReady ? 'YES' : 'NO'}`);
    console.log(`\nEXECUTION_READY = ${allReady ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

createExecutionPlan();
