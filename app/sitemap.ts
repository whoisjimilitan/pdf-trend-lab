import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const BASE = "https://pdfseeds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const guidePages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/guide/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const sellPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/sell/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: BASE,               lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/store`,    lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    ...guidePages,
    ...sellPages,
  ];
}
