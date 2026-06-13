import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Follow-up strategy from REPLY_STRATEGY_BOOK
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
  console.log("\n=== TRACK A: EXECUTE FOLLOW-UPS ===\n");
  console.log("Target: 6 production clicked leads\n");

  // Get the 6 production clicked leads
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
    ORDER BY l.business_name
  ` as Array<{id: string, business_name: string, email: string}>;

  console.log(`Found ${clickedLeads.length} production clicked leads:\n`);

  const results = {
    sent: [] as Array<{business: string, email: string, messageId: string}>,
    failed: [] as Array<{business: string, email: string, error: string}>
  };

  for (const lead of clickedLeads) {
    const strategy = followUpStrategy[lead.business_name];
    
    if (!strategy) {
      console.log(`⚠️  ${lead.business_name}: No follow-up strategy defined`);
      continue;
    }

    try {
      console.log(`📧 ${lead.business_name} (${lead.email})...`);

      // Send via Resend
      const response = await resend.emails.send({
        from: "Saint & Story <hello@saintandstory.com>",
        to: lead.email,
        subject: strategy.subject,
        text: strategy.body,
        reply_to: "hello@saintandstory.com"
      });

      if (response.error) {
        console.log(`   ❌ Error: ${response.error.message}\n`);
        results.failed.push({
          business: lead.business_name,
          email: lead.email,
          error: response.error.message
        });
        continue;
      }

      const messageId = response.data.id;

      // Log in database
      await prisma.b2b_outreach.create({
        data: {
          lead_id: lead.id,
          resend_message_id: messageId,
          email_type: "reply_followup",
          subject: strategy.subject,
          body: strategy.body,
          sent_at: new Date()
        }
      });

      console.log(`   ✅ Sent (Message ID: ${messageId})\n`);

      results.sent.push({
        business: lead.business_name,
        email: lead.email,
        messageId: messageId
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`   ❌ Exception: ${(error as Error).message}\n`);
      results.failed.push({
        business: lead.business_name,
        email: lead.email,
        error: (error as Error).message
      });
    }
  }

  // Summary
  console.log("\n=== FOLLOW-UP EXECUTION SUMMARY ===\n");
  console.log(`✅ Sent: ${results.sent.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.sent.length > 0) {
    console.log("\n✅ SUCCESSFUL SENDS:\n");
    results.sent.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.business}`);
      console.log(`   Email: ${item.email}`);
      console.log(`   Message ID: ${item.messageId}\n`);
    });
  }

  if (results.failed.length > 0) {
    console.log("\n❌ FAILURES:\n");
    results.failed.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.business}`);
      console.log(`   Email: ${item.email}`);
      console.log(`   Error: ${item.error}\n`);
    });
  }

  console.log("=== NEXT: Monitor inbox for replies ===\n");

  await prisma.$disconnect();
}

executeFollowUps().catch(console.error);
