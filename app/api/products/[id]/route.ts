import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { opportunity: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (typeof body.published === "boolean") data.published = body.published;
  if (body.recordSale) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    data.salesCount = current.salesCount + 1;
    data.revenue = current.revenue + (Number(body.saleAmount) || 0);
  }
  if (typeof body.salesCount === "number") data.salesCount = body.salesCount;
  if (typeof body.revenue === "number") data.revenue = body.revenue;

  const updated = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
