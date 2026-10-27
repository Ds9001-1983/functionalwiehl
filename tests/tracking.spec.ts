import { expect, test, type Page } from "@playwright/test";
import { trackEvent, trackPageview, type EventName } from "../lib/tracking";
import {
  einwilligungSetzen,
  pixelAufrufe,
  trackerAbfangen,
  TRACKER_URL,
  warteAufPixel,
  whatsappAbfangen,
  type PixelAufruf,
} from "./helpers/meta-recorder";

/**
 * Event-Zuordnung der Website (design-p2.md 0.5, design-review (a)-9):
 * Website-Klicks gehen an Meta nur als Custom Events FW_* und nur mit Marketing-Einwilligung,
 * nie als Contact oder Lead (Contact gibt es nur auf der BN-LP, Lead nur aus n8n per CAPI).
 * GA4 nur mit Statistik-Einwilligung, Consent Mode v2 mit ad_* denied vor config.
 */

const PIXEL_ID = "965083147995308";

/** ersten WhatsApp-Link der Seite auslösen (per DOM-Klick: kein Überdecken durch Banner oder Sticky) */
async function whatsappKlick(page: Page) {
  const link = page.locator('a[href^="https://wa.me/"]').first();
  const href = await link.getAttribute("href");
  await link.evaluate((el: HTMLElement) => el.click());
  return href;
}

const keinContactOderLead = (aufrufe: PixelAufruf[]) =>
  aufrufe.filter((c) => c[0] === "track" && (c[1] === "Contact" || c[1] === "Lead"));

test.describe("Website im Browser", () => {
  test.beforeEach(async ({ context }) => {
    await trackerAbfangen(context);
    await whatsappAbfangen(context);
  });

  test("ohne Einwilligung: auch nach einem WhatsApp-Klick kein Request an Tracker", async ({ page }) => {
    const tracker: string[] = [];
    page.on("request", (r) => {
      if (TRACKER_URL.test(r.url())) tracker.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await whatsappKlick(page);
    await page.waitForTimeout(800);
    expect(tracker).toEqual([]);
    expect(await page.evaluate(() => [typeof window.fbq, typeof window.gtag])).toEqual(["undefined", "undefined"]);
  });

  test("mit Einwilligung: Pixel mit autoConfig aus, Klick = FW_WhatsApp_Klick, nie Contact oder Lead", async ({
    page,
    context,
    baseURL,
  }) => {
    await einwilligungSetzen(context, baseURL!, { statistik: true, marketing: true });
    await page.goto("/");
    const start = await warteAufPixel(page, 3);
    // autoConfig vor init (sonst sammelt Meta Button-Klicks und Formulardaten selbst)
    expect(start.slice(0, 3)).toEqual([["set", "autoConfig", false, PIXEL_ID], ["init", PIXEL_ID], ["track", "PageView"]]);
    expect(await page.evaluate(() => [window.__fwPixel, (window.fbq as unknown as { disablePushState?: boolean }).disablePushState])).toEqual([
      { quelle: "consent", autoConfig: false },
      true,
    ]);

    const href = await whatsappKlick(page);
    await expect.poll(async () => (await pixelAufrufe(page)).filter((c) => c[0] === "trackCustom").length).toBe(1);
    const [klick] = (await pixelAufrufe(page)).filter((c) => c[0] === "trackCustom");
    expect(klick[1]).toBe("FW_WhatsApp_Klick");
    const daten = klick[2] as Record<string, string>;
    expect(daten.page).toBe("/");
    expect(daten.position).toBeTruthy();
    expect(["probetraining", "mitglied", "allgemein"]).toContain(daten.ziel);
    expect(href).toMatch(/^https:\/\/wa\.me\/492262752717/);
    expect(keinContactOderLead(await pixelAufrufe(page))).toEqual([]);

    // GA4: Consent Mode default (ad_* denied, analytics granted) vor config, Klick als Event mit Beacon
    const dataLayer = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? []).map((a) => JSON.parse(JSON.stringify([...a])))
    );
    const consentIndex = dataLayer.findIndex((e) => e[0] === "consent" && e[1] === "default");
    const configIndex = dataLayer.findIndex((e) => e[0] === "config");
    expect(consentIndex).toBeGreaterThanOrEqual(0);
    expect(consentIndex).toBeLessThan(configIndex);
    expect(dataLayer[consentIndex][2]).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    expect(dataLayer[configIndex]).toEqual([
      "config",
      "G-H41716E7JE",
      { allow_google_signals: false, allow_ad_personalization_signals: false },
    ]);
    const klickEvent = dataLayer.find((e) => e[0] === "event" && e[1] === "whatsapp_click");
    expect(klickEvent?.[2]).toMatchObject({ page: "/", transport_type: "beacon" });
  });

  test("nur Marketing: FW-Event an Meta, GA4 lädt nie", async ({ page, context, baseURL }) => {
    const google: string[] = [];
    page.on("request", (r) => {
      if (/google/.test(r.url())) google.push(r.url());
    });
    await einwilligungSetzen(context, baseURL!, { statistik: false, marketing: true });
    await page.goto("/");
    await warteAufPixel(page, 3);
    await whatsappKlick(page);
    await expect.poll(async () => (await pixelAufrufe(page)).filter((c) => c[0] === "trackCustom").length).toBe(1);
    expect(google).toEqual([]);
    expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
  });

  test("nur Statistik: GA4-Event, kein Pixel", async ({ page, context, baseURL }) => {
    const meta: string[] = [];
    page.on("request", (r) => {
      if (/facebook/.test(r.url())) meta.push(r.url());
    });
    await einwilligungSetzen(context, baseURL!, { statistik: true, marketing: false });
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe("function");
    await whatsappKlick(page);
    await expect
      .poll(() =>
        page.evaluate(() =>
          ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? []).some(
            (a) => a[0] === "event" && a[1] === "whatsapp_click"
          )
        )
      )
      .toBe(true);
    expect(meta).toEqual([]);
    expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
  });

  test("Client-Navigation: je Seitenwechsel ein PageView, init nur einmal", async ({ page, context, baseURL }) => {
    await einwilligungSetzen(context, baseURL!, { statistik: true, marketing: true });
    await page.goto("/");
    await warteAufPixel(page, 3);
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (p: string) => void } } }).next.router.push("/impressum/")
    );
    await page.waitForURL((url) => url.pathname === "/impressum/");
    await expect.poll(async () => (await pixelAufrufe(page)).filter((c) => c[1] === "PageView").length).toBe(2);
    expect((await pixelAufrufe(page)).filter((c) => c[0] === "init")).toHaveLength(1);
  });
});

test.describe("trackEvent / trackPageview (ohne Browser)", () => {
  test.skip(({ isMobile }) => isMobile, "Unit-Tests, einmal genügt");

  type Umgebung = { gtag: unknown[][]; fbq: unknown[][] };
  const g = globalThis as unknown as { window?: unknown; document?: unknown };

  function umgebung(wahl: { statistik: boolean; marketing: boolean } | null): Umgebung {
    const aufrufe: Umgebung = { gtag: [], fbq: [] };
    g.window = {
      location: { pathname: "/preise/" },
      gtag: (...a: unknown[]) => aufrufe.gtag.push(a),
      fbq: (...a: unknown[]) => aufrufe.fbq.push(a),
    };
    g.document = { cookie: wahl ? `fw_consent=${encodeURIComponent(JSON.stringify({ ...wahl, ts: "x" }))}` : "" };
    return aufrufe;
  }

  test.afterEach(() => {
    delete g.window;
    delete g.document;
  });

  test("Zuordnung: Klicks als FW_* an Meta, Check-up nie an Meta, GA4-Namen unverändert", () => {
    const erwartet: Record<EventName, string | null> = {
      whatsapp_click: "FW_WhatsApp_Klick",
      tel_click: "FW_Anruf_Klick",
      mail_click: "FW_Mail_Klick",
      calendly_click: "FW_Telefontermin_Klick",
      checkup_submit: null,
    };
    for (const [name, metaName] of Object.entries(erwartet) as [EventName, string | null][]) {
      const aufrufe = umgebung({ statistik: true, marketing: true });
      trackEvent(name, { position: "hero", preset: name === "whatsapp_click" ? "mitglied" : undefined });
      expect(aufrufe.gtag, name).toEqual([
        [
          "event",
          name,
          {
            position: "hero",
            ...(name === "whatsapp_click" ? { preset: "mitglied" } : { preset: undefined }),
            page: "/preise/",
            transport_type: "beacon",
          },
        ],
      ]);
      if (metaName) {
        const daten: Record<string, string> = { page: "/preise/", position: "hero" };
        if (name === "whatsapp_click") daten.ziel = "mitglied";
        expect(aufrufe.fbq, name).toEqual([["trackCustom", metaName, daten]]);
      } else {
        expect(aufrufe.fbq, name).toEqual([]);
      }
    }
  });

  test("ohne Entscheidung nichts, sonst nur die erlaubte Kategorie", () => {
    let a = umgebung(null);
    trackEvent("whatsapp_click", { position: "header", preset: "probetraining" });
    trackPageview("/x/");
    expect(a).toEqual({ gtag: [], fbq: [] });

    a = umgebung({ statistik: false, marketing: false });
    trackEvent("tel_click", { position: "footer" });
    trackPageview("/x/");
    expect(a).toEqual({ gtag: [], fbq: [] });

    a = umgebung({ statistik: true, marketing: false });
    trackEvent("tel_click", { position: "footer" });
    trackPageview("/x/");
    expect(a.fbq).toEqual([]);
    expect(a.gtag).toHaveLength(2);
    expect(a.gtag[1]).toEqual(["event", "page_view", { page_path: "/x/" }]);

    a = umgebung({ statistik: false, marketing: true });
    trackEvent("mail_click", { position: "kontakt" });
    trackPageview("/x/");
    expect(a.gtag).toEqual([]);
    expect(a.fbq).toEqual([
      ["trackCustom", "FW_Mail_Klick", { page: "/preise/", position: "kontakt" }],
      ["track", "PageView"],
    ]);
  });

  test("kein Website-Event wird zu Contact oder Lead", () => {
    for (const name of ["whatsapp_click", "tel_click", "mail_click", "calendly_click", "checkup_submit"] as EventName[]) {
      for (const preset of ["probetraining", "mitglied", "allgemein", undefined] as const) {
        const a = umgebung({ statistik: true, marketing: true });
        trackEvent(name, { position: "hero", preset });
        expect(a.fbq.filter((c) => c[0] === "track")).toEqual([]);
      }
    }
  });
});
