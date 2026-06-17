import type { MetadataRoute } from "next";

const BASE = "https://pdfseeds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Product table missing in Phase 3.4A — legacy content not prerendered
  // Dynamic pages (/store, /guide, /sell) will serve content at runtime

  return [
    { url: BASE,             lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/store`,  lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
  ];
}
