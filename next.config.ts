import type { NextConfig } from "next";
import { REDIRECTS } from "./content/redirects";

type HeaderRegel = Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>[number];

/**
 * Sicherheits-Header für alle Antworten (design-p3 §5, design-review (a)-21).
 * CSP bewusst ohne Skript-Regeln: Eine Nonce-CSP erzwingt dynamisches Rendern
 * (Doku 02-guides/content-security-policy.md) und kostet die statischen Seiten.
 * KEIN Strict-Transport-Security: Vercel setzt auf Custom Domains selbst
 * `max-age=63072000` nur für die jeweilige Subdomain (Vercel-Doku „Support for HSTS“,
 * per curl geprüft am 27.10.2026). Ein eigener Header käme doppelt (design-review (b) E15);
 * includeSubDomains wäre wegen Mail-Subdomains und Wildcard bei Alfahosting ohnehin falsch.
 */
const SICHERHEITS_HEADER = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

/**
 * Indexierbar sind nur die Hauptdomain (ohne www, Entscheidung 27.10.2026) und www, das
 * Vercel per 308 auf die Hauptdomain leitet. Next prüft `value` als ^…$ gegen den Host in
 * Kleinbuchstaben ohne Port (shared/lib/router/utils/prepare-destination.js, matchHas).
 * Jeder andere Host – *.vercel.app, Preview-URLs, localhost, fremde Hosts – bekommt noindex.
 */
const INDEXIERBARE_HOSTS ="(?:www\\.)?functional-wiehl\\.de";
const NOINDEX = { key: "X-Robots-Tag", value: "noindex, nofollow" };

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
    const regeln: HeaderRegel[] = [{ source: "/:path*", headers: SICHERHEITS_HEADER }];
    // Wird beim Build ausgewertet. NEXT_PUBLIC_ALLOW_INDEXING=true nur in Production
    // (docs/TODO-cutover.md): Dann bleibt allein die Hauptdomain indexierbar, auch die
    // Production-URL *.vercel.app nicht. Ohne das Flag (Preview, lokal): überall noindex.
    if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true") {
      regeln.push({ source: "/:path*", missing: [{ type: "host", value: INDEXIERBARE_HOSTS }], headers: [NOINDEX] });
    } else {
      regeln.push({ source: "/:path*", headers: [NOINDEX] });
    }
    return regeln;
  },
};

export default nextConfig;
