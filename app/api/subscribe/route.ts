import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, productSlug, country, source } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  try {
    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: { productSlug, country, source },
      create: { email, productSlug, country, source },
    });
    return NextResponse.json({ ok: true, id: subscriber.id });
  } catch {
    return NextResponse.json({ error: "Could not save email" }, { status: 500 });
  }
}

export async function GET() {
  const subscribers = await prisma.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subscribers);
}
