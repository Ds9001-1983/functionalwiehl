import type { NextConfig } from "next";
import { REDIRECTS } from "./content/redirects";

const nextConfig: NextConfig = {
  // Formgleich mit WordPress → keine Redirect-Ketten beim Domain-Umzug
  trailingSlash: true,
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
