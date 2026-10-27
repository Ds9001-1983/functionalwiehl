import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Prototyp-Schutz: solange nicht freigeschaltet, alles sperren
  // (zusätzlich X-Robots-Tag-Header in next.config.ts).
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // /wp-json/ ist der Klickspeicher der BN-Kampagne (n8n), kein Inhalt
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/wp-json/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
