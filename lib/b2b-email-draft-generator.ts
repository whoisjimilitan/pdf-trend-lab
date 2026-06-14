/**
 * Email Draft Generator
 *
 * Generates concise first-touch email drafts based on prospect brief and outreach angle.
 * Short, personalized, copy-ready emails that operators can send immediately.
 */

import { prisma } from "./prisma";
import { type ProspectBrief } from "./b2b-prospect-brief-generator";
import { type OutreachAngle } from "./b2b-outreach-angle-generator";

export interface EmailDraft {
  lead_id: string;
  subject: string;
  email_body: string;
  call_to_action: string;
  generated_at: string;
}

/**
 * Generate subject line based on hook
 */
function generateSubject(
  businessName: string,
  angle: OutreachAngle
): string {
  const subjectTemplates: Record<string, (name: string) => string> = {
    "lead-generation": (name: string) =>
      `Quick question: ${name.split(" ")[0]}'s lead pipeline`,
    automation: (name: string) => `One thing that could save ${name} hours`,
    "customer-retention": (name: string) =>
      `Idea for ${name}: keeping customers longer`,
    "conversion-improvement": (name: string) =>
      `Quick thought on ${name}'s sales process`,
    "operational-efficiency": (name: string) =>
      `${name}: reducing waste in operations`,
    "revenue-growth": (name: string) => `One conversation about ${name}'s growth`,
  };

  const template = subjectTemplates[angle.primary_angle] || subjectTemplates["lead-generation"];
  return template(businessName);
}

/**
 * Generate email body based on category and angle
 */
function generateEmailBody(
  brief: ProspectBrief,
  angle: OutreachAngle
): string {
  const bodyTemplates: Record<string, (brief: ProspectBrief) => string> = {
    "removal-companies": (brief: ProspectBrief) => `Hi,

I noticed ${brief.business_name} specializes in ${brief.category.replace(/-/g, " ")}.

We've been working with similar businesses in your area, and they often tell us the same thing: finding consistent, quality moving requests is their biggest headache. Most of them waste time on bad leads.

We've helped a few see 15-20% more booked jobs by improving how they find prospects. Nothing complicated—just smarter targeting.

Worth a 15-minute conversation?

Quick no-risk option: Let's talk this week and see if it makes sense.

Cheers`,

    "estate-agents": (brief: ProspectBrief) => `Hi,

I work with estate agents across the UK. One thing I keep hearing: more qualified buyer leads = faster sales = bigger commission.

${brief.business_name} seems like you're focused on ${brief.location || "the market"}, which is exactly where smarter lead generation can move the needle.

Some agents we've worked with saw 12-18% faster sales cycles by being more targeted with buyer outreach.

Worth 15 minutes to explore?

Best,`,

    "dental-practices": (brief: ProspectBrief) => `Hi,

Dental practice owners often tell us: more new patient bookings = full schedule = predictable revenue.

${brief.business_name} has a solid reputation. The question is: how many potential patients in your area don't know about you yet?

We've helped similar practices grow new patient visits by 20-30%. Not through discounting—through better visibility.

Open to a quick chat?

Cheers,`,

    "legal": (brief: ProspectBrief) => `Hi,

One thing distinguishes growing law practices: recurring client relationships that turn into stable revenue streams.

I notice ${brief.business_name} specializes in ${brief.category}, which is exactly where deep client relationships compound over time.

We've helped practices in your space increase recurring revenue by 25-40% through better client retention and expansion.

Worth exploring?

Best,`,

    "event-organisers": (brief: ProspectBrief) => `Hi,

Event businesses thrive on two things: consistent bookings and execution excellence.

${brief.business_name} clearly has the execution side down. The question is: are you booking enough events to keep your team fully utilized year-round?

Some organisers we've worked with went from 60-70% capacity utilization to 85-90%+ by getting more consistent corporate bookings.

Worth a conversation?

Cheers,`,
  };

  const template = bodyTemplates[brief.category] || bodyTemplates["removal-companies"];
  return template(brief);
}

/**
 * Generate call-to-action
 */
function generateCTA(angle: OutreachAngle): string {
  const ctaMap: Record<string, string> = {
    "lead-generation": "Let's talk about getting you more qualified leads.",
    automation: "Let's explore how to save your team time and frustration.",
    "customer-retention":
      "Let's discuss keeping your best customers coming back.",
    "conversion-improvement": "Let's talk about improving your sales conversion.",
    "operational-efficiency": "Let's explore cutting waste and improving margins.",
    "revenue-growth": "Let's talk about sustainable growth.",
  };

  return ctaMap[angle.primary_angle] || "Let's have a quick conversation.";
}

/**
 * Generate email draft for a lead
 */
export async function generateEmailDraft(
  brief: ProspectBrief,
  angle: OutreachAngle
): Promise<EmailDraft | null> {
  try {
    const subject = generateSubject(brief.business_name, angle);
    const body = generateEmailBody(brief, angle);
    const cta = generateCTA(angle);

    const draft: EmailDraft = {
      lead_id: brief.lead_id,
      subject,
      email_body: body,
      call_to_action: cta,
      generated_at: new Date().toISOString(),
    };

    // Store draft in b2b_outreach table
    await prisma.b2b_outreach.create({
      data: {
        lead_id: brief.lead_id,
        subject: draft.subject,
        body: draft.email_body,
        email_type: "initial",
      },
    });

    console.log(`[EMAIL] Draft generated for ${brief.business_name}`);
    return draft;
  } catch (error) {
    console.error(`[EMAIL] Error generating draft for ${brief.lead_id}:`, error);
    return null;
  }
}
