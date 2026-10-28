import { expect, test } from "@playwright/test";
import robots from "../app/robots";
import { ENTFALLENE_ROUTEN, KEINE_WEITERLEITUNG, REDIRECTS } from "../content/redirects";
import { INHALT_STAND, PAGES } from "../lib/seo";

/**
 * Weiterleitungen aus content/redirects.ts, Location EXAKT inklusive #anker
 * (scripts/check-redirects.mjs prüft dasselbe nach dem Umschalten gegen die Live-Domain).
 * Alte WP-URLs stehen in Google, in Ads und auf Flyern – jeder Sprung zählt.
 */
test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

const ohneRedirect = { maxRedirects: 0 } as const;

/** Location-Header → Pfad + Query + Fragment (relativ oder absolut auf denselben Host). */
function ziel(location: string | undefined, basis: string) {
  const url = new URL(location ?? "", basis);
  expect(url.origin, `Location zeigt auf fremden Host: ${location}`).toBe(new URL(basis).origin);
  return url.pathname + url.search + url.hash;
}

test("jede Quelle leitet mit genau einem 308 aufs Ziel, mit und ohne Slash", async ({ request, baseURL }) => {
  for (const { source, destination } of REDIRECTS) {
    const formen = /\.(xml|jpg)$/.test(source) ? [source] : [source, `${source}/`];
    for (const pfad of formen) {
      const res = await request.get(pfad, ohneRedirect);
      expect(res.status(), pfad).toBe(308);
      expect(ziel(res.headers()["location"], baseURL!), pfad).toBe(destination);
    }
  }
});

test("Query aus Ads bleibt erhalten und steht vor dem Fragment", async ({ request, baseURL }) => {
  const res = await request.get("/preise/?utm_source=x&fbclid=abc", ohneRedirect);
  expect(res.status()).toBe(308);
  expect(ziel(res.headers()["location"], baseURL!)).toBe("/?utm_source=x&fbclid=abc#preise");
});

test("Pflicht-Ziele aus dem Plan", () => {
  const karte = Object.fromEntries(REDIRECTS.map((r) => [r.source, r.destination]));
  expect(karte["/gesundheits-check"]).toBe("/#checkup");
  expect(karte["/kontakt"]).toBe("/#kontakt");
  expect(karte["/preise"]).toBe("/#preise");
  expect(karte["/wp-sitemap.xml"]).toBe("/sitemap.xml");
  expect(karte["/author/web2330"]).toBe("/");
  expect(karte["/feed"]).toBe("/");
  expect(karte["/comments/feed"]).toBe("/");
  for (const route of ENTFALLENE_ROUTEN) expect(karte[route.replace(/\/$/, "")], route).toBeDefined();
  // Bleibende Seiten und die LP haben keine Regel (auch nicht ohne Slash)
  for (const pfad of KEINE_WEITERLEITUNG) {
    if (pfad === "/") continue;
    expect(karte[pfad.replace(/\/$/, "")], pfad).toBeUndefined();
  }
});

test("bleibende Seiten und die Ad-URL der LP antworten ohne Weiterleitung", async ({ request }) => {
  for (const pfad of [...KEINE_WEITERLEITUNG, "/black-november/?utm_source=facebook&utm_campaign=bn26&fbclid=x"]) {
    const res = await request.get(pfad, ohneRedirect);
    expect(Math.floor(res.status() / 100), `${pfad} → ${res.status()}`).not.toBe(3);
    expect(res.headers()["location"], pfad).toBeUndefined();
    // Die Landingpage selbst liefert P2a; bis zum Merge antwortet sie hier mit 404
    if (!pfad.startsWith("/black-november/")) expect(res.status(), pfad).toBe(200);
  }
});

test("übrige WordPress-Pfade liefern 404 statt Weiterleitung", async ({ request }) => {
  for (const pfad of ["/wp-login.php", "/xmlrpc.php", "/wp-admin/", "/wp-content/uploads/2025/06/gross-img_6210.jpeg"]) {
    const res = await request.get(pfad, ohneRedirect);
    expect(res.status(), pfad).toBe(404);
  }
});

test("sitemap.xml listet genau die bleibenden Seiten, ohne LP und entfallene Routen", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(urls.sort()).toEqual(Object.values(PAGES).map((p) => p.path).sort());
  expect(xml).not.toContain("black-november");
  for (const route of ENTFALLENE_ROUTEN) expect(urls, route).not.toContain(route);
  // lastmod für jede URL, damit Google die Seiten nach dem Umzug neu einliest
  expect([...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1].slice(0, 10))).toEqual(
    urls.map(() => INHALT_STAND)
  );
});

test("alte Sitemap aus der Search Console leitet auf die neue", async ({ request, baseURL }) => {
  const res = await request.get("/sitemap-6.xml", ohneRedirect);
  expect(res.status()).toBe(308);
  expect(ziel(res.headers()["location"], baseURL!)).toBe("/sitemap.xml");
});

test("robots.ts sperrt nach der Freischaltung /api/ und /wp-json/", () => {
  const vorher = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  try {
    const regeln = robots().rules;
    const disallow = [regeln].flat().flatMap((r) => [r.disallow ?? []].flat());
    expect(disallow).toEqual(expect.arrayContaining(["/api/", "/wp-json/"]));
  } finally {
    if (vorher === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    else process.env.NEXT_PUBLIC_ALLOW_INDEXING = vorher;
  }
});
