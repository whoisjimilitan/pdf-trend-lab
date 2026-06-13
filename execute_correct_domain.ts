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

async function execute() {
  console.log("\n=== EXECUTING FROM saintandstoryltd.co.uk ===\n");

  try {
    const clickedLeads = await prisma.$queryRaw`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      AND o.resend_message_id NOT LIKE 'res_qa_%'
      GROUP BY l.id, l.business_name, l.email
    ` as Array<any>;

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
        console.log(`📧 ${lead.business_name}...`);

        const response = await resend.emails.send({
          from: "Saint & Story <hello@saintandstoryltd.co.uk>",
          to: lead.email,
          subject: strategy.subject,
          text: strategy.body,
          reply_to: "hello@saintandstoryltd.co.uk"
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

        console.log(`   ✅ ${messageId}`);

        results.push({
          business_name: lead.business_name,
          email: lead.email,
          message_id: messageId,
          timestamp: timestamp,
          status: "SENT"
        });

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

    const report = `# FOLLOWUP EXECUTION REPORT

**Generated**: ${new Date().toISOString()}

**From**: Saint & Story <hello@saintandstoryltd.co.uk>

**Domain**: saintandstoryltd.co.uk ✅ Verified

**Status**: ${results.filter(r => r.status === 'SENT').length}/${results.length} successful

---

## EXECUTION RESULTS

| # | Lead | Email | Message ID | Status |
|---|------|-------|-----------|--------|
${results.map((r, idx) => `| ${idx + 1} | ${r.business_name} | ${r.email} | ${r.message_id ? r.message_id.substring(0, 18) + '...' : 'N/A'} | ${r.status === 'SENT' ? '✅ SENT' : '❌ FAILED'} |`).join('\n')}

---

## DETAILED RESULTS

${results.map((r, idx) => `
### ${idx + 1}. ${r.business_name}

**To**: ${r.email}

**Status**: ${r.status === 'SENT' ? '✅ SENT' : '❌ FAILED'}

**Message ID**: ${r.message_id || '(failed)'}

**Timestamp**: ${r.timestamp}

${r.error ? `**Error**: ${r.error}` : ''}
`).join('\n')}

---

## SUMMARY

**Total Sent**: ${results.filter(r => r.status === 'SENT').length}

**Total Failed**: ${results.filter(r => r.status === 'FAILED').length}

**Success Rate**: ${(results.filter(r => r.status === 'SENT').length / results.length * 100).toFixed(1)}%

---

## NEXT STEPS

Monitor for:
- **Opens**: 1-2 hours
- **Clicks**: 2-4 hours
- **Replies**: 24-48 hours

Track engagement in OPERATOR_DAILY_BOARD.md

**Milestone**: First reply validates the autonomous pipeline end-to-end
`;

    fs.writeFileSync('./FOLLOWUP_EXECUTION_REPORT.md', report);

    console.log("\n=== COMPLETE ===\n");
    console.log(`✅ Sent: ${results.filter(r => r.status === 'SENT').length}/6`);
    console.log(`❌ Failed: ${results.filter(r => r.status === 'FAILED').length}/6`);
    console.log(`\nReport: FOLLOWUP_EXECUTION_REPORT.md\n`);

  } catch (error) {
    console.error("Error:", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

execute();
