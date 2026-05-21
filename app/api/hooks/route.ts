import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform  = searchParams.get("platform");
  const emotionType = searchParams.get("emotionType");
  const niche     = searchParams.get("niche");
  const productId = searchParams.get("productId");

  // If productId is given, find the opportunity linked to that product, then get its hooks
  let opportunityId: string | undefined;
  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { opportunityId: true } });
    opportunityId = product?.opportunityId ?? undefined;
  }

  const hooks = await prisma.hook.findMany({
    where: {
      ...(opportunityId ? { opportunityId } : {}),
      ...(platform ? { platform } : {}),
      ...(emotionType ? { emotionType } : {}),
      ...(niche ? { niche: { contains: niche } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { opportunity: { select: { keyword: true } } },
  });
  return NextResponse.json(hooks);
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  const hook = await prisma.hook.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  return NextResponse.json(hook);
}
