import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? "3"), 6);

  const source = await prisma.product.findFirst({
    where: { slug, published: true },
    include: { opportunity: { select: { niche: true, country: true } } },
  });

  if (!source) return NextResponse.json([]);

  const related = await prisma.product.findMany({
    where: {
      published: true,
      slug: { not: slug },
      opportunity: {
        OR: [
          { niche: source.opportunity.niche },
          { country: source.opportunity.country },
        ],
      },
    },
    include: { opportunity: { select: { minPrice: true } } },
    take: limit,
    orderBy: { salesCount: "desc" },
  });

  const result = related.map(p => ({
    slug: p.slug,
    title: p.title,
    price: `£${(p.opportunity.minPrice ?? 9.99).toFixed(2)}`,
  }));

  return NextResponse.json(result);
}
