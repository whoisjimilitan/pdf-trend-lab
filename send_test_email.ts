import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTest() {
  console.log("\n=== HUMAN EXPERIENCE VALIDATION TEST ===\n");
  console.log("Sending test email to your inbox...\n");

  try {
    const response = await resend.emails.send({
      from: "Saint & Story <hello@saintandstoryltd.co.uk>",
      to: "whoisjimi.today@gmail.com",
      subject: "Test: Multi-location operational consistency",
      text: `Hi Jimi,

I wanted to reach out directly because I think we might have something specific to your business.

Managing consistent quality across multiple locations is complex. We make it simple.

I'd like to share one specific thing we do differently with multi-location operations.

Would a quick call next week work?

Best,
Saint & Story`,
      reply_to: "hello@saintandstoryltd.co.uk"
    });

    if (response.error) {
      console.log(`❌ FAILED TO SEND: ${response.error.message}`);
      return;
    }

    const messageId = response.data.id;

    console.log(`✅ EMAIL SENT SUCCESSFULLY\n`);
    console.log(`Message ID: ${messageId}`);
    console.log(`To: whoisjimi.today@gmail.com`);
    console.log(`From: hello@saintandstoryltd.co.uk`);
    console.log(`Sent: ${new Date().toISOString()}\n`);
    console.log(`NEXT STEPS:\n`);
    console.log(`1. Check whoisjimi.today@gmail.com inbox`);
    console.log(`2. Open the email (triggers delivery confirmation)`);
    console.log(`3. Click a link in the email (triggers click event)`);
    console.log(`4. Reply to the email with: "Yes, let's talk"`);
    console.log(`5. Come back and we'll verify all events were captured\n`);
    console.log(`MESSAGE_ID_FOR_TRACKING: ${messageId}`);

  } catch (error) {
    console.log(`❌ ERROR: ${(error as Error).message}`);
  }
}

sendTest();
