import type { NextConfig } from "next";
import { REDIRECTS } from "./content/redirects";

const nextConfig: NextConfig = {
  // Formgleich mit WordPress → keine Redirect-Ketten beim Domain-Umzug
  trailingSlash: true,
  // Next ergänzt den Slash NICHT mehr selbst (sonst 308 auch auf /wp-json/sb-bn/v1/click/BN-…
  // → n8n-GET und Beacon-POST bekämen still keine Daten). Den Slash ergänzt proxy.ts
  // per 308 mit erhaltener Query, ausgenommen /wp-json, /api, /_next und Dateien.
  // trailingSlash bleibt für die von Next erzeugten URLs (Sitemap, Canonical) gesetzt;
  // <Link> übernimmt hrefs jetzt unverändert → interne Links immer mit Slash schreiben.
  // Belege: design-review.md (c)-1, Doku 05-config/01-next-config-js/skipTrailingSlashRedirect.md
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return REDIRECTS.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    // Prototyp läuft parallel zur Live-WP-Site → nicht indexieren.
    // Beim Domain-Umzug (docs/TODO-cutover.md) NEXT_PUBLIC_ALLOW_INDEXING=true setzen.
    if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
