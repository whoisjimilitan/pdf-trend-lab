import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[/api/daily-loop] POST");
  const { niche, keyword, date } = await req.json();
  const loop = await prisma.dailyLoop.create({ data: { niche, keyword, date, status: "in-progress" } });
  return NextResponse.json(loop);
}

export async function PATCH(req: Request) {
  console.log("[/api/daily-loop] PATCH");
  const { id, field, value } = await req.json();
  const updated = await prisma.dailyLoop.update({ where: { id }, data: { [field]: value } });
  return NextResponse.json(updated);
}
