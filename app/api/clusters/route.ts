import { NextResponse } from "next/server";

export async function POST() {
  // Feature: Cluster management — incomplete implementation
  // TODO: Add Cluster & Opportunity models to schema.prisma before enabling
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function GET() {
  // Feature: Cluster management — incomplete implementation
  // Returns empty state until models are added to schema
  return NextResponse.json({ clusters: [], unclustered: [] });
}
