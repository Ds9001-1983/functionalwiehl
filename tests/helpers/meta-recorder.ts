import type { BrowserContext, Page } from "@playwright/test";

/**
 * Tracker in der Abnahme: Jeder Request an Meta oder Google wird im Kontext abgefangen,
 * bevor er das Netz erreicht. So sendet kein Test echte Events an den Pixel 965083147995308
 * oder an GA4 (die LP lädt den Pixel ohne Einwilligung!). Jeder Test, der /black-november/
 * öffnet, muss trackerAbfangen() aufrufen.
 *
 * - fbevents.js → Recorder: übernimmt die Warteschlange des fbq-Stubs (wie das echte Script)
 *   und schreibt jeden Aufruf nach window.__pixelAufrufe.
 * - gtag/js → leeres Script (dataLayer bleibt prüfbar)
 * - alles andere (Pixel-GIF, collect) → 204
 */

export const TRACKER_URL =
  /connect\.facebook\.net|facebook\.com\/tr|googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net/;

const FBEVENTS_RECORDER = `(function () {
  var f = window.fbq;
  if (!f) return;
  var log = (window.__pixelAufrufe = window.__pixelAufrufe || []);
  function rec() { log.push(JSON.parse(JSON.stringify(Array.prototype.slice.call(arguments)))); }
  f.callMethod = rec;
  var q = f.queue || [];
  f.queue = [];
  for (var i = 0; i < q.length; i++) rec.apply(null, q[i]);
})();`;

export type TrackerProtokoll = {
  /** alle abgefangenen Tracker-URLs in Reihenfolge */
  requests: string[];
  /** Anzahl Ladevorgänge von fbevents.js */
  fbevents: () => number;
  google: () => number;
  meta: () => number;
};

export async function trackerAbfangen(context: BrowserContext): Promise<TrackerProtokoll> {
  const requests: string[] = [];
  await context.route(TRACKER_URL, (route) => {
    const url = route.request().url();
    requests.push(url);
    if (/connect\.facebook\.net\/.*fbevents\.js/.test(url)) {
      return route.fulfill({ contentType: "application/javascript", body: FBEVENTS_RECORDER });
    }
    if (/googletagmanager\.com\/gtag\/js/.test(url)) {
      return route.fulfill({ contentType: "application/javascript", body: "" });
    }
    return route.fulfill({ status: 204, body: "" });
  });
  return {
    requests,
    fbevents: () => requests.filter((u) => /fbevents\.js/.test(u)).length,
    google: () => requests.filter((u) => /google/.test(u)).length,
    meta: () => requests.filter((u) => /facebook/.test(u)).length,
  };
}

/** Aufrufe an fbq, z. B. ["init","965083147995308"], ["track","Contact",{…},{eventID:"bnc-…"}] */
export type PixelAufruf = [string, ...unknown[]];

export async function pixelAufrufe(page: Page): Promise<PixelAufruf[]> {
  return page.evaluate(() => (window as unknown as { __pixelAufrufe?: PixelAufruf[] }).__pixelAufrufe ?? []);
}

/** wartet, bis der Recorder geladen ist und mindestens `anzahl` Aufrufe aufgezeichnet hat */
export async function warteAufPixel(page: Page, anzahl = 1): Promise<PixelAufruf[]> {
  await page.waitForFunction(
    (n) => ((window as unknown as { __pixelAufrufe?: unknown[] }).__pixelAufrufe ?? []).length >= n,
    anzahl
  );
  return pixelAufrufe(page);
}

/**
 * wa.me abfangen. Im selben Tab mit 204: Die Navigation wird verworfen, die LP bleibt stehen,
 * Zustand und Beacons bleiben prüfbar. Ein neues Fenster (window.open, Desktop) bekommt eine
 * leere Seite, sonst meldet Playwright es nie als geöffnet. Liefert die angefragten URLs samt
 * auslösender Seite (null = neues Fenster, dessen Frame beim Request noch nicht existiert).
 */
export async function whatsappAbfangen(context: BrowserContext) {
  const aufrufe: { url: string; seite: Page | null }[] = [];
  await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, (route) => {
    let seite: Page | null = null;
    try {
      seite = route.request().frame().page();
    } catch {
      // Navigation eines gerade geöffneten Fensters (window.open)
    }
    aufrufe.push({ url: route.request().url(), seite });
    if (!seite) return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>wa.me</title>" });
    return route.fulfill({ status: 204, body: "" });
  });
  return aufrufe;
}

/** Consent-Cookie wie der Banner es schreibt */
export async function einwilligungSetzen(
  context: BrowserContext,
  baseURL: string,
  wahl: { statistik: boolean; marketing: boolean }
) {
  const wert = encodeURIComponent(JSON.stringify({ ...wahl, ts: "2026-10-27T10:00:00.000Z" }));
  await context.addCookies([{ name: "fw_consent", value: wert, url: baseURL }]);
}
