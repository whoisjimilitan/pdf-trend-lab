import { Resend } from "resend";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

const leads = [
  { name: "Cornerstone Sales and Lettings", email: "contact@cornerstoneleeds.co.uk", subject: "Multi-location scale — doing it consistently", body: "Hi there,\n\nMulti-location operations need operational consistency. Most platforms are one-size-fits-all.\n\nWe specialize in making multi-location work without friction.\n\nWould a quick conversation help?\n\nBest,\nSaint & Story" },
  { name: "Monroe Estate Agents (Alwoodley)", email: "contact@monroeestateagents.com", subject: "Alwoodley properties - white-glove relocation standard", body: "Hi there,\n\nI've been thinking about your business. Alwoodley clients expect premium service, and that includes how relocations are handled.\n\nHigh-value clients notice the difference when relocation logistics are seamless.\n\nWould it help if I showed you exactly how we've supported similar premium agents?\n\nIf so, could we grab 15 minutes to discuss your specific client profile?\n\nBest,\nSaint & Story" },
  { name: "Westpoint Pharmacy", email: "info@westfieldpharmacy.co.uk", subject: "Pharmacy customer retention during relocations", body: "Hi there,\n\nThanks for your interest.\n\nWe help pharmacies maintain customer relationships when customers relocate. Retention matters in your business.\n\nWith your customer base, smooth transitions probably mean a lot.\n\nWould it make sense to chat about how this works? 10 minutes next week?\n\nBest,\nSaint & Story" },
  { name: "haart Estate and Lettings Agents Leeds", email: "contact@haart.co.uk", subject: "Multi-location operational consistency", body: "Hi team,\n\nI wanted to reach out directly because I think we might have something specific to your business.\n\nManaging consistent quality across multiple locations is complex. We make it simple.\n\nI'd like to share one specific thing we do differently with multi-location operations.\n\nWould a quick call next week work?\n\nBest,\nSaint & Story" },
  { name: "Greater London Properties - Bloomsbury Estate Agents", email: "contact@greaterlondonproperties.co.uk", subject: "London luxury - relocation as competitive advantage", body: "Hi there,\n\nLondon luxury agents don't have time for logistics logistics. We handle it.\n\nI have 3 specific ideas for Bloomsbury-area agents. Worth 10 minutes?\n\nCan we schedule for next week?\n\nBest,\nSaint & Story" },
  { name: "Linley & Simpson Student Lettings Agent - Leeds", email: "contact@linleyandsimpson.co.uk", subject: "Student lettings logistics — 2 questions", body: "Hi there,\n\nThanks for your interest in our recent note about student relocations.\n\nI wanted to reach out directly because I think we might have something specific to your business.\n\nStudent lettings are high-volume and high-turnover. Managing that without friction is hard. We specialize in making student relocations work smoothly.\n\nQuick question: Would it be useful if I sent you 3 specific ideas for student relocation efficiency?\n\nIf yes, we could grab 10 minutes next week to discuss.\n\nLooking forward to hearing from you.\n\nBest,\nSaint & Story" }
];

async function send() {
  console.log("\n=== SENDING 6 FOLLOW-UPS ===\n");
  
  const results: any[] = [];
  
  for (const lead of leads) {
    try {
      console.log(`📧 ${lead.name}...`);
      
      const response = await resend.emails.send({
        from: "Saint & Story <hello@saintandstoryltd.co.uk>",
        to: lead.email,
        subject: lead.subject,
        text: lead.body,
        reply_to: "hello@saintandstoryltd.co.uk"
      });
      
      if (response.error) {
        console.log(`   ❌ ${response.error.message}`);
        results.push({
          name: lead.name,
          email: lead.email,
          status: "FAILED",
          error: response.error.message
        });
      } else {
        console.log(`   ✅ ${response.data.id}`);
        results.push({
          name: lead.name,
          email: lead.email,
          status: "SENT",
          message_id: response.data.id,
          timestamp: new Date().toISOString()
        });
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.log(`   ❌ ${(error as Error).message}`);
      results.push({
        name: lead.name,
        email: lead.email,
        status: "FAILED",
        error: (error as Error).message
      });
    }
  }
  
  const report = `# FOLLOWUP EXECUTION REPORT

**Executed**: ${new Date().toISOString()}

**From**: Saint & Story <hello@saintandstoryltd.co.uk>

**Status**: ${results.filter((r: any) => r.status === 'SENT').length}/${results.length} successful

---

## RESULTS

${results.map((r: any, i: number) => `
### ${i + 1}. ${r.name}

**To**: ${r.email}

**Status**: ${r.status === 'SENT' ? '✅ SENT' : '❌ FAILED'}

**Message ID**: ${r.message_id || 'N/A'}

${r.error ? `**Error**: ${r.error}` : ''}
`).join('\n')}

---

## SUMMARY

**Sent**: ${results.filter((r: any) => r.status === 'SENT').length}/6

**Failed**: ${results.filter((r: any) => r.status === 'FAILED').length}/6

---

## NEXT

Monitor for replies within 24-48 hours.
`;
  
  fs.writeFileSync('./FOLLOWUP_EXECUTION_REPORT.md', report);
  
  console.log("\n=== REPORT ===\n");
  console.log(`✅ Sent: ${results.filter((r: any) => r.status === 'SENT').length}/6`);
  console.log(`❌ Failed: ${results.filter((r: any) => r.status === 'FAILED').length}/6`);
  console.log(`\nFull report: FOLLOWUP_EXECUTION_REPORT.md\n`);
}

send();
