import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import fs from "fs";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const followUpStrategy: Record<string, {subject: string, body: string}> = {
  "haart Estate and Lettings Agents Leeds": {
    subject: "Multi-location operational consistency",
    body: `Hi team,

I wanted to reach out directly because I think we might have something specific to your business.

Managing consistent quality across multiple locations is complex. We make it simple.

I'd like to share one specific thing we do differently with multi-location operations.

Would a quick call next week work?

Best,
Saint & Story`
  },
  "Monroe Estate Agents (Alwoodley)": {
    subject: "Alwoodley properties - white-glove relocation standard",
    body: `Hi there,

I've been thinking about your business. Alwoodley clients expect premium service, and that includes how relocations are handled.

High-value clients notice the difference when relocation logistics are seamless.

Would it help if I showed you exactly how we've supported similar premium agents?

If so, could we grab 15 minutes to discuss your specific client profile?

Best,
Saint & Story`
  },
  "Linley & Simpson Student Lettings Agent - Leeds": {
    subject: "Student lettings logistics — 2 questions",
    body: `Hi there,

Thanks for your interest in our recent note about student relocations.

I wanted to reach out directly because I think we might have something specific to your business.

Student lettings are high-volume and high-turnover. Managing that without friction is hard. We specialize in making student relocations work smoothly.

Quick question: Would it be useful if I sent you 3 specific ideas for student relocation efficiency?

If yes, we could grab 10 minutes next week to discuss.

Looking forward to hearing from you.

Best,
Saint & Story`
  },
  "Greater London Properties - Bloomsbury Estate Agents": {
    subject: "London luxury - relocation as competitive advantage",
    body: `Hi there,

London luxury agents don't have time for logistics logistics. We handle it.

I have 3 specific ideas for Bloomsbury-area agents. Worth 10 minutes?

Can we schedule for next week?

Best,
Saint & Story`
  },
  "Cornerstone Sales and Lettings": {
    subject: "Multi-location scale — doing it consistently",
    body: `Hi there,

Multi-location operations need operational consistency. Most platforms are one-size-fits-all.

We specialize in making multi-location work without friction.

Would a quick conversation help?

Best,
Saint & Story`
  },
  "Westpoint Pharmacy": {
    subject: "Pharmacy customer retention during relocations",
    body: `Hi there,

Thanks for your interest.

We help pharmacies maintain customer relationships when customers relocate. Retention matters in your business.

With your customer base, smooth transitions probably mean a lot.

Would it make sense to chat about how this works? 10 minutes next week?

Best,
Saint & Story`
  }
};

async function executeFollowUps() {
  console.log("\n=== PRE-EXECUTION VALIDATION ===\n");

  try {
    // Get the 6 production clicked leads
    const clickedLeads = await prisma.$queryRaw`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        l.source,
        o.id as outreach_id,
        o.resend_message_id,
        COUNT(DISTINCT CASE WHEN e.event_type = 'replied' THEN e.id END) as reply_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      AND o.resend_message_id NOT LIKE 'res_qa_%'
      GROUP BY l.id, l.business_name, l.email, l.source, o.id, o.resend_message_id
    ` as Array<any>;

    console.log(`Found ${clickedLeads.length} production clicked leads\n`);

    // CHECK 1: No QA records
    console.log("CHECK 1️⃣  No QA records included");
    const qaRecords = clickedLeads.filter((l: any) => l.source === 'qa_system_test');
    const check1Pass = qaRecords.length === 0;
    console.log(check1Pass ? `   ✅ PASS: 0 QA records\n` : `   ❌ FAIL: ${qaRecords.length} QA records found\n`);

    // CHECK 2: No duplicate sends
    console.log("CHECK 2️⃣  No duplicate sends");
    const existingFollowups = await prisma.$queryRaw`
      SELECT DISTINCT lead_id, COUNT(*) as count
      FROM b2b_outreach
      WHERE email_type = 'reply_followup'
      GROUP BY lead_id
      HAVING COUNT(*) > 0
    ` as Array<any>;
    
    const check2Pass = existingFollowups.length === 0;
    console.log(check2Pass ? `   ✅ PASS: No duplicate follow-ups\n` : `   ❌ FAIL: Found duplicates\n`);

    // CHECK 3: No prior replies
    console.log("CHECK 3️⃣  No prior replies");
    const withReplies = clickedLeads.filter((l: any) => (l.reply_count || 0) > 0);
    const check3Pass = withReplies.length === 0;
    console.log(check3Pass ? `   ✅ PASS: No prior replies\n` : `   ❌ FAIL: ${withReplies.length} already replied\n`);

    // CHECK 4: Show final emails
    console.log("CHECK 4️⃣  Final follow-up emails\n");
    clickedLeads.forEach((lead: any, idx: number) => {
      const strategy = followUpStrategy[lead.business_name];
      console.log(`${idx + 1}. ${lead.business_name}`);
      console.log(`   To: ${lead.email}`);
      console.log(`   Subject: ${strategy?.subject}`);
      console.log(`   Body preview: ${strategy?.body.substring(0, 50)}...`);
      console.log('');
    });

    const allCheckPass = check1Pass && check2Pass && check3Pass;

    if (!allCheckPass) {
      console.log("❌ VALIDATION FAILED - DO NOT EXECUTE");
      return;
    }

    console.log("✅ ALL CHECKS PASSED - PROCEEDING WITH EXECUTION\n");

    // EXECUTE
    console.log("=== EXECUTING FOLLOWS ===\n");

    const results: Array<{
      business_name: string;
      email: string;
      message_id: string | null;
      timestamp: string;
      status: string;
      error?: string;
    }> = [];

    for (const lead of clickedLeads) {
      const strategy = followUpStrategy[lead.business_name];
      const timestamp = new Date().toISOString();

      try {
        console.log(`📧 ${lead.business_name} (${lead.email})...`);

        const response = await resend.emails.send({
          from: "Saint & Story <hello@saintandstory.com>",
          to: lead.email,
          subject: strategy.subject,
          text: strategy.body,
          reply_to: "hello@saintandstory.com"
        });

        if (response.error) {
          console.log(`   ❌ ${response.error.message}`);
          results.push({
            business_name: lead.business_name,
            email: lead.email,
            message_id: null,
            timestamp: timestamp,
            status: "FAILED",
            error: response.error.message
          });
          continue;
        }

        const messageId = response.data.id;

        // Log to database
        await prisma.b2b_outreach.create({
          data: {
            lead_id: lead.id,
            resend_message_id: messageId,
            email_type: "reply_followup",
            subject: strategy.subject,
            body: strategy.body,
            sent_at: new Date(timestamp)
          }
        });

        console.log(`   ✅ Sent (${messageId})`);

        results.push({
          business_name: lead.business_name,
          email: lead.email,
          message_id: messageId,
          timestamp: timestamp,
          status: "SENT"
        });

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const errorMsg = (error as Error).message;
        console.log(`   ❌ ${errorMsg}`);
        results.push({
          business_name: lead.business_name,
          email: lead.email,
          message_id: null,
          timestamp: timestamp,
          status: "FAILED",
          error: errorMsg
        });
      }
    }

    // Generate report
    const report = `# FOLLOWUP EXECUTION REPORT

**Generated**: ${new Date().toISOString()}

**Status**: ${results.filter(r => r.status === 'SENT').length}/${results.length} successful

---

## EXECUTION RESULTS

| Lead | Email | Message ID | Sent | Status |
|------|-------|-----------|------|--------|
${results.map(r => `| ${r.business_name} | ${r.email} | ${r.message_id ? r.message_id.substring(0, 20) + '...' : 'N/A'} | ${r.timestamp.substring(11, 19)} | ${r.status} |`).join('\n')}

---

## DETAILS

${results.map((r, idx) => `
### ${idx + 1}. ${r.business_name}

- **Email**: ${r.email}
- **Status**: ${r.status}
- **Message ID**: ${r.message_id || 'Failed'}
- **Send time**: ${r.timestamp}
${r.error ? `- **Error**: ${r.error}` : ''}

`).join('\n')}

---

## SUMMARY

**Total sent**: ${results.filter(r => r.status === 'SENT').length}

**Total failed**: ${results.filter(r => r.status === 'FAILED').length}

**Success rate**: ${(results.filter(r => r.status === 'SENT').length / results.length * 100).toFixed(1)}%

---

## NEXT STEPS

Monitor for:
- Opens (within 1-2 hours)
- Clicks (within 2-4 hours)
- Replies (within 24-48 hours)

Track in OPERATOR_DAILY_BOARD.md

First reply = validation of autonomous pipeline
`;

    fs.writeFileSync('./FOLLOWUP_EXECUTION_REPORT.md', report);

    console.log("\n=== EXECUTION COMPLETE ===\n");
    console.log(`✅ Sent: ${results.filter(r => r.status === 'SENT').length}`);
    console.log(`❌ Failed: ${results.filter(r => r.status === 'FAILED').length}`);
    console.log(`\nReport: FOLLOWUP_EXECUTION_REPORT.md`);

  } catch (error) {
    console.error("Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

executeFollowUps();
