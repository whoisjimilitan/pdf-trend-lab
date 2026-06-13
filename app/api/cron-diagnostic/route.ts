import { neon } from "@neondatabase/serverless";

export const maxDuration = 60;

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const message = `CRON DIAGNOSTIC: ${timestamp}`;

  console.log(message);

  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);

      await sql`
        INSERT INTO cron_diagnostic_log (timestamp, message)
        VALUES (${timestamp}, ${message})
        ON CONFLICT DO NOTHING
      `;
    }
  } catch (error) {
    console.error("[CRON DIAGNOSTIC] Insert error:", error);
  }

  return Response.json({
    timestamp,
    message,
    status: "logged",
  });
}

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  return Response.json({
    timestamp,
    status: "healthy",
    endpoint: "/api/cron-diagnostic",
    schedule: "*/5 * * * *",
  });
}
