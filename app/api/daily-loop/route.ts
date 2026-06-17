import { NextResponse } from "next/server";

export async function POST() {
  // Feature: Daily content loop — database model removed from schema in Phase 3.4A
  return NextResponse.json(
    { error: "Feature unavailable", feature: "daily-loop" },
    { status: 503 }
  );
}

export async function PATCH() {
  // Feature: Daily content loop — database model removed from schema in Phase 3.4A
  return NextResponse.json(
    { error: "Feature unavailable", feature: "daily-loop" },
    { status: 503 }
  );
}
