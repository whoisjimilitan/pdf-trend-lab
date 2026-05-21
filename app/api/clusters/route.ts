import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[/api/clusters] POST");
  const { name, theme, emotionalCore, opportunityIds } = await req.json();
  const cluster = await prisma.cluster.create({
    data: {
      name, theme, emotionalCore,
      opportunities: { connect: opportunityIds.map((id: string) => ({ id })) },
    },
    include: { opportunities: true },
  });
  return NextResponse.json(cluster);
}

export async function GET() {
  const clusters = await prisma.cluster.findMany({
    include: { opportunities: true },
    orderBy: { createdAt: "desc" },
  });
  const unclustered = await prisma.opportunity.findMany({
    where: { clusterId: null },
    orderBy: { opportunityScore: "desc" },
  });
  return NextResponse.json({ clusters, unclustered });
}
