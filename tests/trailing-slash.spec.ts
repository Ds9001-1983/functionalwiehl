import { expect, test } from "@playwright/test";

/**
 * Trailing Slash (proxy.ts + skipTrailingSlashRedirect in next.config.ts):
 * Seiten bekommen den Slash per 308 mit byte-gleicher Query (UTM, fbclid aus den Ads).
 * /wp-json/… wird NIE umgeleitet: n8n (GET) und der Beacon der LP (POST) folgen
 * keinem Redirect – ein 308 hieße still verlorene Klickdaten.
 */

const ohneRedirect = { maxRedirects: 0 } as const;

/** Pfad + Query aus dem Location-Header (absolut oder relativ). */
function ziel(location: string | undefined) {
  const url = new URL(location ?? "", "http://basis.invalid");
  return url.pathname + url.search;
}

test.describe("Trailing Slash", () => {
  test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

  test("/impressum → 308 auf /impressum/ mit unveränderter Query", async ({ request }) => {
    const query = "?utm_source=facebook&utm_campaign=bn26&fbclid=IwAR0_Ab-c.d";
    const res = await request.get(`/impressum${query}`, ohneRedirect);
    expect(res.status()).toBe(308);
    expect(ziel(res.headers()["location"])).toBe(`/impressum/${query}`);
  });

  test("kodierte Query-Werte bleiben inhaltlich gleich (Leerzeichen, Umlaute, +)", async ({ request }) => {
    const query = "?utm_content=Black%20November&ort=K%C3%B6ln&plus=a%2Bb";
    const res = await request.get(`/impressum${query}`, ohneRedirect);
    expect(res.status()).toBe(308);
    const location = new URL(res.headers()["location"] ?? "", "http://basis.invalid");
    expect(location.pathname).toBe("/impressum/");
    // `next start` serialisiert die Query vor dem Proxy per URLSearchParams (%20 → +) – die Werte zählen
    expect([...location.searchParams]).toEqual([...new URLSearchParams(query)]);
  });

  test("Ads-URL ohne Slash: /black-november?… → 308 auf /black-november/?…", async ({ request }) => {
    const res = await request.get("/black-november?utm_source=facebook&fbclid=abc", ohneRedirect);
    expect(res.status()).toBe(308);
    expect(ziel(res.headers()["location"])).toBe("/black-november/?utm_source=facebook&fbclid=abc");
  });

  test("Seiten mit Slash und Startseite mit Query antworten direkt mit 200", async ({ request }) => {
    for (const pfad of ["/", "/?utm=1", "/impressum/", "/koerpermasse/"]) {
      const res = await request.get(pfad, ohneRedirect);
      expect(res.status(), pfad).toBe(200);
    }
  });

  test("Klickspeicher-Pfade unter /wp-json werden nie umgeleitet", async ({ request }) => {
    const antworten = [
      await request.get("/wp-json/sb-bn/v1/click/BN-ZZZZ", ohneRedirect),
      await request.get("/wp-json/sb-bn/v1/click/BN-ZZZZ/", ohneRedirect),
      await request.post("/wp-json/sb-bn/v1/click", {
        ...ohneRedirect,
        headers: { "Content-Type": "text/plain" },
        data: JSON.stringify({ code: "BN-ZZZZ" }),
      }),
    ];
    for (const res of antworten) {
      // bis P2 404 (Route fehlt), danach 401/200/204 – aber nie ein Redirect
      expect(Math.floor(res.status() / 100), `${res.url()} → ${res.status()}`).not.toBe(3);
      expect(res.headers()["location"], res.url()).toBeUndefined();
    }
    expect([401, 404]).toContain(antworten[0].status());
  });

  test("API-Routen, Dateien und RSC-Requests laufen ohne Proxy-Redirect", async ({ request }) => {
    const api = await request.post("/api/checkup", { ...ohneRedirect, data: {} });
    expect(api.status()).toBe(422);

    for (const datei of ["/robots.txt", "/sitemap.xml", "/icon.png"]) {
      const res = await request.get(datei, ohneRedirect);
      expect(res.status(), datei).toBe(200);
    }

    const rsc = await request.get("/impressum", { ...ohneRedirect, headers: { rsc: "1" } });
    expect(rsc.status()).not.toBe(308);
  });
});

test("interne Links enden vor ? und # mit Slash (Link ergänzt ihn nicht mehr)", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const pfad = href.split(/[?#]/)[0];
    expect(pfad.endsWith("/") || /\.[^/]+$/.test(pfad), href).toBe(true);
  }
});
