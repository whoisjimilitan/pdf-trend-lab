import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/factory/", "/engine/", "/hooks/", "/api/"],
    },
    sitemap: "https://pdfseeds.com/sitemap.xml",
  };
}
