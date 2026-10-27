import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Trailing Slash wie WordPress: /impressum → 308 → /impressum/, Query (UTM, fbclid)
 * bleibt byte-gleich erhalten. Next selbst leitet wegen `skipTrailingSlashRedirect`
 * nicht mehr um (next.config.ts).
 *
 * NICHT umgeleitet (Matcher unten, hier zur Sicherheit noch einmal geprüft):
 * - /wp-json/… – Klickspeicher-Vertrag mit n8n (GET) und der LP (Beacon-POST)
 * - /api/…, /_next/…, Dateien mit Endung (robots.txt, sitemap.xml, Bilder)
 * - Pfade, die schon auf / enden (inkl. /), sowie RSC- und Prefetch-Requests
 *
 * Bewusst nicht wie im Doku-Beispiel `new URL(`${pathname}/`, …)`: das verliert die
 * Query und antwortet mit 307 (design-review.md (c)-1). Aber auch NICHT
 * `request.nextUrl.clone()`: NextURL formatiert den Pfad nach dem Slash-Zustand der
 * eingehenden URL und entfernt den angehängten Slash wieder (Next 16.4.3,
 * server/web/next-url.js → formatNextPathnameInfo; per Test nachgewiesen).
 * Deshalb eine normale URL aus request.url. Hinweis: Unter `next start` kommt die Query
 * hier schon per URLSearchParams serialisiert an (%20 → +), die Werte bleiben gleich.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.endsWith("/") || /^\/(?:wp-json|api|_next)(?:\/|$)/.test(pathname) || /\.[^/]*$/.test(pathname)) {
    return NextResponse.next();
  }
  const url = new URL(request.url);
  url.pathname += "/";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    {
      // alles außer _next, api, wp-json, Pfaden mit Punkt und Pfaden mit Slash am Ende
      source: "/((?!_next/|api(?:/|$)|wp-json(?:/|$)|.*\\.)(?!.*/$).+)",
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
      ],
    },
  ],
};
