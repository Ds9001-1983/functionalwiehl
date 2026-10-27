import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { BN_CODE_REGEX, CTA, whatsappBlackNovember } from "../lib/cta";
import fixture from "./fixtures/live-ctas.json";
import {
  einwilligungSetzen,
  pixelAufrufe,
  trackerAbfangen,
  TRACKER_URL,
  warteAufPixel,
  whatsappAbfangen,
  type PixelAufruf,
  type TrackerProtokoll,
} from "./helpers/meta-recorder";

/**
 * Black-November-LP (BN26) gegen die Live-Seite vom 27.10.2026 (bn.html, bn.md):
 * Inhalt und Head, Aktionscode, WhatsApp-Link byte-genau, Pixel ohne Einwilligung
 * (Entscheidung Dennis), Klickspeicher-Beacon, Dokumentgrenze und Wächter.
 * Alle Tracker und wa.me sind abgefangen (tests/helpers/meta-recorder.ts).
 */

const LP = "/black-november/";
const PIXEL_ID = "965083147995308";
const ESC = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BN_LINK = new RegExp(`^${ESC(CTA.whatsappBlackNovemberPrefix)}BN-[A-HJ-NP-Z2-9]{4}$`);

let tracker: TrackerProtokoll;
let wa: Awaited<ReturnType<typeof whatsappAbfangen>>;
let seitenfehler: string[];

test.beforeEach(async ({ page, context }) => {
  seitenfehler = [];
  page.on("pageerror", (e) => seitenfehler.push(e.message));
  tracker = await trackerAbfangen(context);
  wa = await whatsappAbfangen(context);
});

test.afterEach(() => {
  expect(seitenfehler, "JS-Fehler auf der LP (Runtime per Function.toString?)").toEqual([]);
});

/** Der Reload eines Wächters bricht den RSC-Abruf des Routers ab; WebKit meldet das als Seitenfehler */
function abgebrocheneRscAbrufeIgnorieren() {
  seitenfehler = seitenfehler.filter((m) => !/_rsc=/.test(m));
}

const nurDesktop = ({ isMobile }: { isMobile: boolean }) => isMobile;

async function aktionscode(page: Page) {
  return page.evaluate(() => sessionStorage.getItem("bn_code") ?? "");
}

/** CTA an den oberen Rand scrollen (der Consent-Banner liegt unten) und echt klicken */
async function klickeCta(page: Page, position: "hero" | "steps" | "final" | "sticky") {
  const cta = page.locator(`[data-bn-cta="${position}"]`);
  if (position !== "sticky") {
    await cta.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
  }
  await cta.click();
}

async function nurNotwendige(page: Page) {
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await banner.getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner).toBeHidden();
}

const istEvent = (name: string) => (c: PixelAufruf) => (c[0] === "track" || c[0] === "trackCustom") && c[1] === name;

test.describe("Auslieferung und Head", () => {
  test.skip(nurDesktop, "HTTP- und Head-Prüfung, einmal genügt");

  test("200 ohne Weiterleitung, auch mit UTM und fbclid aus der Anzeige", async ({ request }) => {
    for (const pfad of [LP, `${LP}?utm_source=facebook&utm_medium=paid&utm_campaign=bn26&fbclid=IwAR0_Ab-c.d`]) {
      const res = await request.get(pfad, { maxRedirects: 0 });
      expect(res.status(), pfad).toBe(200);
    }
  });

  test("Head wie live: Title, Description, noindex,follow, Canonical und OG mit Slash", async ({ page, request }) => {
    await page.goto(LP);
    await expect(page).toHaveTitle("Black November: 50 % auf dein Abo | Functional Wiehl 24/7");
    const meta = (sel: string) => page.locator(sel).first().getAttribute("content");
    expect(await meta('meta[name="description"]')).toBe(
      "Black November bei Functional Wiehl: 6 Monate 50 % auf dein Abo – 22,50 € statt 45 € im Monat. 24/7 geöffnet. Jetzt per WhatsApp sichern."
    );
    expect(await meta('meta[name="robots"]')).toBe("noindex, follow");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("https://functional-wiehl.de/black-november/");
    expect(await meta('meta[property="og:url"]')).toBe("https://functional-wiehl.de/black-november/");
    expect(await meta('meta[property="og:type"]')).toBe("website");
    expect(await meta('meta[property="og:title"]')).toBe("Black November: 50 % auf dein Abo – Functional Wiehl 24/7");
    expect(await meta('meta[property="og:description"]')).toBe(
      "6 Monate trainieren zum halben Preis. Jetzt per WhatsApp sichern."
    );
    expect(await meta('meta[name="theme-color"]')).toBe("#0b0b0b");
    expect(await meta('meta[name="facebook-domain-verification"]')).toBe("snffiuije1a574j1cpn13fi981px5k");
    // live ohne site_name und locale (das Root-Layout setzt beides für die Website)
    await expect(page.locator('meta[property="og:site_name"], meta[property="og:locale"]')).toHaveCount(0);

    // OG-Bild aus app/black-november/opengraph-image.jpg (nicht das der Website)
    const ogBild = (await meta('meta[property="og:image"]')) ?? "";
    expect(ogBild).toContain("/black-november/opengraph-image");
    expect(await meta('meta[property="og:image:width"]')).toBe("1076");
    expect(await meta('meta[property="og:image:height"]')).toBe("1350");
    const bild = await request.get(new URL(ogBild).pathname + new URL(ogBild).search);
    expect(bild.status()).toBe(200);
    expect(bild.headers()["content-type"]).toBe("image/jpeg");
  });

  test("Hero-Bild wird vorgeladen (LCP), alle Bilder liefern 200", async ({ page, request }) => {
    await page.goto(LP);
    await expect(page.locator('link[rel="preload"][as="image"][imagesrcset*="trainingsflaeche-img-0612"]')).toHaveCount(1);
    const quellen = await page.locator("img").evaluateAll((els) => els.map((el) => el.getAttribute("src") ?? ""));
    expect(quellen.length).toBe(5); // Logo, Hero, 3 Fotos
    for (const src of quellen) {
      const res = await request.get(src);
      expect(res.status(), src).toBe(200);
      expect(res.headers()["content-type"], src).toMatch(/^image\//);
    }
  });

  test("nicht in der Sitemap", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("black-november");
  });

  test("Skip-Link „Zum Angebot springen“ führt zu #angebot", async ({ page }) => {
    await page.goto(LP);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Zum Angebot springen" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#angebot$/);
  });
});

test.describe("Inhalt wie live", () => {
  test("Texte, Preise und Struktur; kein Website-Rahmen; keine kritischen A11y-Fehler", async ({ page }) => {
    await page.goto(LP);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Black November 50 % auf dein Abo");
    const main = page.locator("main#inhalt");
    for (const text of [
      "Black November · nur für kurze Zeit",
      "6 Monate trainieren zum halben Preis – in deinem Studio mitten in Wiehl, 24/7 geöffnet.",
      "22,50 Euro statt 45 Euro pro Monat in den ersten 6 Monaten",
      "Kein Formular, keine Online-Anmeldung: Nachricht ist vorbereitet, einfach absenden – wir melden uns.",
      "Ehrlich gerechnet, ohne Kleingedrucktes-Überraschung: 12 Monate Mitgliedschaft, davon die ersten 6 Monate zum halben Preis.",
      "*Bei Abschluss einer 12-monatigen Mitgliedschaft: 50 % auf den monatlichen Beitrag, 6 Monate lang. Danach 45,00 € pro Monat. Zzgl. einmaliger Startgebühr von 79,00 € und 20,00 € Chip-Kaution.",
      "Trainer vor Ort Mo–Fr 08:00–21:00 Uhr und So 10:00–14:00 Uhr.",
      "Anmeldung läuft ausschließlich über WhatsApp – schneller geht's nicht.",
      "Ab Monat 7 zahlst du den regulären Beitrag von 45,00 € pro Monat. Die Mitgliedschaft läuft insgesamt 12 Monate.",
      "Ja, einmalig 79,00 € plus 20,00 € Kaution für deinen Zugangschip.",
      'Wilhelm-Grümer-Weg 18, 51674 Wiehl – kostenlose Parkplätze direkt vor der Tür, Bushaltestelle „Wiehl Zentrum" 2 Minuten zu Fuß.',
      "22,50 € statt 45,00 € im Monat – nur zur Black-November-Aktion.",
      "Antwort direkt vom Functional-Team.",
    ]) {
      await expect(main.getByText(text, { exact: false }).first(), text).toBeAttached();
    }
    // Rechnung: Zeilen exakt wie live
    const zeilen = await page.locator("#angebot tr").evaluateAll((trs) =>
      trs.map((tr) => [...tr.children].map((z) => (z.textContent ?? "").trim()))
    );
    expect(zeilen).toEqual([
      ["Monat 1–6", "45,00 €22,50 € / Monat"],
      ["Monat 7–12", "45,00 € / Monat"],
      ["Startgebühr (einmalig)", "79,00 €"],
      ["Du sparst", "135,00 €"],
    ]);
    await expect(page.locator("#angebot caption")).toHaveText("Dein Black-November-Abo");
    // CTAs: Buttons wie live, Beschriftung je Position
    await expect(page.locator("[data-bn-cta]")).toHaveCount(4);
    await expect(page.locator('[data-bn-cta="steps"]')).toHaveText("Angebot per WhatsApp sichern");
    for (const p of ["hero", "final", "sticky"]) {
      await expect(page.locator(`[data-bn-cta="${p}"]`)).toHaveText("Jetzt per WhatsApp sichern");
    }
    await expect(page.locator("details summary")).toHaveText([
      "Was kostet das Abo nach den 6 Monaten?",
      "Gibt es eine Startgebühr?",
      "Wie melde ich mich an?",
      "Wie lange gilt das Angebot?",
      "Wo finde ich euch?",
    ]);
    const footer = page.locator("footer");
    await expect(footer).toContainText("Functional-Wiehl GmbH");
    await expect(footer).toContainText("Made with ❤️ by SUPERBRAND.marketing – Dein Superheld für deine Werbung.");
    expect(await footer.getByRole("link").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual([
      "https://www.google.com/maps/search/?api=1&query=Functional+Wiehl+Wilhelm-Gr%C3%BCmer-Weg+18+51674+Wiehl",
      "tel:+492262752717",
      "mailto:gym@functional-wiehl.de",
      "/",
      "/impressum/",
      "/datenschutz/",
      "https://superbrand.marketing",
    ]);
    await expect(footer.getByRole("button", { name: "Cookie-Einstellungen" })).toBeVisible();

    // Kein Website-Rahmen: kein Menü, keine A11y-Leiste, kein FAB, keine Website-Sticky-Leiste
    await expect(page.getByRole("navigation")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Barrierefreiheit" })).toHaveCount(0);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);

    const axe = await new AxeBuilder({ page }).disableRules(["meta-viewport"]).analyze();
    const kritisch = axe.violations.filter((v) => v.impact === "critical");
    expect(kritisch, kritisch.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`).join("\n")).toHaveLength(0);
  });

  test("ohne JavaScript: noscript-Link und Pixel-Bild wie live", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    await trackerAbfangen(ctx);
    const seite = await ctx.newPage();
    await seite.goto(LP);
    const hrefs = await seite.locator('a[href*="wa.me"]').evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual([CTA.whatsappBlackNovemberNoscript]);
    expect(CTA.whatsappBlackNovemberNoscript).toBe(fixture.bn.noscript);
    await expect(seite.locator(`img[src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"]`)).toHaveCount(1);
    await ctx.close();
  });
});

test.describe("Aktionscode und WhatsApp", () => {
  test("Code im Live-Format, bleibt im Tab gleich, ungültige Werte werden ersetzt", async ({ page }) => {
    await page.goto(LP);
    const code = await aktionscode(page);
    expect(code).toMatch(BN_CODE_REGEX);
    expect(await page.evaluate(() => window.__fwBn?.code)).toBe(code);
    await page.reload();
    expect(await aktionscode(page)).toBe(code);

    await page.evaluate(() => sessionStorage.setItem("bn_code", "BN-I0O1"));
    await page.reload();
    const neu = await aktionscode(page);
    expect(neu).toMatch(BN_CODE_REGEX);
    expect(neu).not.toBe("BN-I0O1");
  });

  test("Klick öffnet wa.me mit Präfix + Code byte-genau; Desktop im neuen Tab, die LP bleibt", async ({
    page,
    isMobile,
  }) => {
    await page.goto(LP);
    const code = await aktionscode(page);
    const popup = isMobile ? null : page.context().waitForEvent("page");
    await klickeCta(page, "hero");
    await expect.poll(() => wa.length).toBe(1);

    expect(wa[0].url).toBe(fixture.bn.prefix + code);
    expect(wa[0].url).toBe(whatsappBlackNovember(code));
    expect(wa[0].url).toMatch(BN_LINK);

    if (isMobile) {
      // mobil wie live: gleicher Tab nach 300 ms
      expect(wa[0].seite).toBe(page);
    } else {
      // Regression Live-Fehler: window.open(…,'noopener') gab null zurück, dann sprang zusätzlich der eigene Tab
      const neuerTab = await popup;
      expect(wa[0].seite).not.toBe(page);
      expect(await neuerTab!.evaluate(() => window.opener)).toBeNull();
      await page.waitForTimeout(600);
      expect(wa.filter((a) => a.seite === page)).toHaveLength(0);
    }
    expect(new URL(page.url()).pathname).toBe(LP);
  });

  test("alle vier CTAs erzeugen denselben Link; Contact genau einmal mit eventID bnc-<Code>", async ({ page, isMobile }) => {
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await nurNotwendige(page);
    const code = await aktionscode(page);

    const positionen = isMobile ? (["hero", "steps", "final", "sticky"] as const) : (["hero", "steps", "final"] as const);
    for (const [i, position] of positionen.entries()) {
      if (position === "sticky") {
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
        await expect(page.locator("[data-bn-sticky]")).toHaveAttribute("data-show", "true");
      }
      await klickeCta(page, position);
      await expect.poll(() => wa.length).toBe(i + 1);
    }
    expect(new Set(wa.map((a) => a.url))).toEqual(new Set([whatsappBlackNovember(code)]));

    const contact = (await pixelAufrufe(page)).filter(istEvent("Contact"));
    expect(contact).toEqual([
      [
        "track",
        "Contact",
        { content_name: "Black November WhatsApp", content_category: "black_november", cta_position: "hero" },
        { eventID: `bnc-${code}` },
      ],
    ]);
  });
});

test.describe("Pixel auf der LP (ohne Einwilligung, Entscheidung Dennis)", () => {
  test("init → PageView → ViewContent ohne Einwilligung, autoConfig wie live, disablePushState", async ({ page }) => {
    await page.goto(LP);
    const aufrufe = await warteAufPixel(page, 3);
    expect(aufrufe.slice(0, 3)).toEqual([
      ["init", PIXEL_ID],
      ["track", "PageView"],
      ["track", "ViewContent", { content_name: "Black November", content_category: "black_november" }, { eventID: expect.stringMatching(/^bnvc-[0-9a-z]+-[0-9a-z]+$/) }],
    ]);
    expect(aufrufe.some((c) => c[0] === "set")).toBe(false);
    expect(await page.evaluate(() => [window.__fwPixel, (window.fbq as unknown as { disablePushState?: boolean }).disablePushState])).toEqual([
      { quelle: "lp", autoConfig: true },
      true,
    ]);
    expect(tracker.fbevents()).toBe(1);
    expect(tracker.google()).toBe(0);
  });

  test("„Alle akzeptieren“ auf der LP startet nichts doppelt und lädt kein GA4", async ({ page }) => {
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await page.getByRole("dialog", { name: "Cookie-Einstellungen" }).getByRole("button", { name: "Alle akzeptieren" }).click();
    await page.waitForTimeout(800);
    const aufrufe = await pixelAufrufe(page);
    expect(aufrufe.filter((c) => c[0] === "init")).toHaveLength(1);
    expect(aufrufe.filter(istEvent("PageView"))).toHaveLength(1);
    expect(tracker.fbevents()).toBe(1);
    expect(tracker.google()).toBe(0);
    expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
  });

  test("BN_Engaged erst nach 15 s UND halber Seite – nur Zeit reicht nicht", async ({ page }) => {
    await page.clock.install();
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await page.clock.fastForward(16_000);
    await page.waitForTimeout(300);
    expect((await pixelAufrufe(page)).filter(istEvent("BN_Engaged"))).toHaveLength(0);

    await page.evaluate(() =>
      window.scrollTo({ top: (document.documentElement.scrollHeight - window.innerHeight) * 0.6, behavior: "instant" })
    );
    await expect.poll(async () => (await pixelAufrufe(page)).filter(istEvent("BN_Engaged")).length).toBe(1);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(300);
    const engaged = (await pixelAufrufe(page)).filter(istEvent("BN_Engaged"));
    expect(engaged).toEqual([
      ["trackCustom", "BN_Engaged", { content_name: "Black November" }, { eventID: expect.stringMatching(/^bnen-/) }],
    ]);
  });

  test("BN_Engaged: halbe Seite allein reicht nicht, nach 15 s kommt es genau einmal", async ({ page }) => {
    await page.clock.install();
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await page.evaluate(() =>
      window.scrollTo({ top: (document.documentElement.scrollHeight - window.innerHeight) * 0.6, behavior: "instant" })
    );
    await page.waitForTimeout(300);
    expect((await pixelAufrufe(page)).filter(istEvent("BN_Engaged"))).toHaveLength(0);
    await page.clock.fastForward(16_000);
    await expect.poll(async () => (await pixelAufrufe(page)).filter(istEvent("BN_Engaged")).length).toBe(1);
  });
});

test.describe("Klickspeicher-Beacon", () => {
  async function beaconsMitschneiden(page: Page) {
    // Spion am Prototyp. WebKit führt Init-Scripts beim (per 204 verworfenen) wa.me-Sprung
    // im selben Dokument erneut aus, deshalb die Liste nicht zurücksetzen.
    await page.addInitScript(() => {
      const w = window as unknown as { __beacons: { url: string; daten: Blob }[] };
      w.__beacons = w.__beacons || [];
      Object.defineProperty(Navigator.prototype, "sendBeacon", {
        configurable: true,
        writable: true,
        value: (url: string, daten: Blob) => {
          w.__beacons.push({ url: String(url), daten });
          return true;
        },
      });
    });
  }
  async function beacons(page: Page) {
    return page.evaluate(() =>
      Promise.all(
        (window as unknown as { __beacons: { url: string; daten: Blob }[] }).__beacons.map(async (b) => ({
          url: b.url,
          typ: b.daten.type,
          body: JSON.parse(await b.daten.text()),
        }))
      )
    );
  }

  test("ohne Einwilligung: Code, fbc nur aus der fbclid, keine Cookies gelesen", async ({ page, context, baseURL }) => {
    await beaconsMitschneiden(page);
    // Cookies sind da, dürfen ohne Einwilligung aber nicht gelesen werden
    await context.addCookies([
      { name: "_fbp", value: "fb.1.1761555000000.1234567890", url: baseURL! },
      { name: "_fbc", value: "fb.1.1761555000000.vomcookie", url: baseURL! },
    ]);
    await page.goto(`${LP}?utm_source=facebook&utm_campaign=bn26&fbclid=abc#angebot`);
    const code = await aktionscode(page);
    await klickeCta(page, "hero");
    await expect.poll(() => wa.length).toBe(1);

    const [beacon, ...rest] = await beacons(page);
    expect(rest).toHaveLength(0);
    expect(beacon.url).toBe("/wp-json/sb-bn/v1/click");
    expect(beacon.typ).toBe("text/plain");
    expect(Object.keys(beacon.body).sort()).toEqual(["code", "consent", "cta", "fbc", "fbp", "url"]);
    expect(beacon.body).toMatchObject({
      code,
      fbp: "",
      cta: "hero",
      consent: 0,
      url: `${baseURL}${LP}?utm_source=facebook&utm_campaign=bn26&fbclid=abc`,
    });
    expect(beacon.body.fbc).toMatch(/^fb\.1\.\d{13}\.abc$/);
    // bn_fbc nur mit Einwilligung
    expect(await page.evaluate(() => sessionStorage.getItem("bn_fbc"))).toBeNull();
  });

  test("mit Marketing-Einwilligung: _fbp und _fbc aus den Cookies, consent 1", async ({ page, context, baseURL }) => {
    await beaconsMitschneiden(page);
    await einwilligungSetzen(context, baseURL!, { statistik: false, marketing: true });
    await context.addCookies([
      { name: "_fbp", value: "fb.1.1761555000000.1234567890", url: baseURL! },
      { name: "_fbc", value: "fb.1.1761555000000.vomcookie", url: baseURL! },
    ]);
    await page.goto(`${LP}?fbclid=abc`);
    expect(await page.evaluate(() => sessionStorage.getItem("bn_fbc"))).toMatch(/^fb\.1\.\d{13}\.abc$/);
    await klickeCta(page, "steps");
    await expect.poll(() => wa.length).toBe(1);
    const [beacon] = await beacons(page);
    expect(beacon.body).toMatchObject({
      fbp: "fb.1.1761555000000.1234567890",
      fbc: "fb.1.1761555000000.vomcookie",
      cta: "steps",
      consent: 1,
    });
  });

  test("defekte fbclid (%E0) blockiert den WhatsApp-Klick nicht", async ({ page }) => {
    await page.goto(`${LP}?fbclid=%E0%A4%A`);
    await klickeCta(page, "hero");
    await expect.poll(() => wa.length).toBe(1);
  });
});

test.describe("Sticky-CTA", () => {
  test("mobil erst nach dem Hero sichtbar und fokussierbar, Desktop ausgeblendet", async ({ page, isMobile }) => {
    await page.goto(LP);
    const sticky = page.locator("[data-bn-sticky]");
    const knopf = sticky.locator("button");
    if (!isMobile) {
      await expect(sticky).toBeHidden();
      return;
    }
    await expect(sticky).toHaveAttribute("aria-hidden", "true");
    await expect(knopf).toHaveAttribute("tabindex", "-1");
    await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>("[data-bn-hero]")!;
      window.scrollTo({ top: hero.offsetTop + hero.offsetHeight, behavior: "instant" });
    });
    await expect(sticky).toHaveAttribute("data-show", "true");
    await expect(sticky).toHaveAttribute("aria-hidden", "false");
    await expect(knopf).toHaveAttribute("tabindex", "0");
    await expect(knopf).toBeInViewport();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(sticky).toHaveAttribute("aria-hidden", "true");
    await expect(knopf).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("Dokumentgrenze und Wächter", () => {
  test("„Zur Website“ ohne Einwilligung: auf der Startseite kein Pixel, auch nach Zurück und Vor", async ({ page }) => {
    const aufStartseite: string[] = [];
    page.on("request", (r) => {
      if (TRACKER_URL.test(r.url()) && new URL(r.frame().url()).pathname === "/") aufStartseite.push(r.url());
    });
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await nurNotwendige(page);
    await page.getByRole("link", { name: "Zur Website" }).click();
    await page.waitForURL((url) => url.pathname === "/");
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => [typeof window.fbq, window.__fwPixel])).toEqual(["undefined", undefined]);

    await page.goBack();
    await page.waitForURL((url) => url.pathname === LP);
    await page.goForward();
    await page.waitForURL((url) => url.pathname === "/");
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
    expect(aufStartseite).toEqual([]);
  });

  test("Verlassen per Client-Navigation ohne Einwilligung lädt neu, der Pixel ist danach weg", async ({ page }) => {
    await page.goto(LP);
    await warteAufPixel(page, 3);
    await page.evaluate(() => {
      (window as unknown as { __vorReload: boolean }).__vorReload = true;
      (window as unknown as { next: { router: { push: (p: string) => void } } }).next.router.push("/");
    });
    await page.waitForURL((url) => url.pathname === "/");
    await expect
      .poll(async () => {
        try {
          return await page.evaluate(() => [typeof window.fbq, "__vorReload" in window]);
        } catch {
          return ["navigiert"];
        }
      })
      .toEqual(["undefined", false]);
    abgebrocheneRscAbrufeIgnorieren();
  });

  test("Betreten per Client-Navigation lädt einmal neu, danach laufen Runtime und Pixel", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (p: string) => void } } }).next.router.push("/black-november/")
    );
    await page.waitForURL((url) => url.pathname === LP);
    await expect
      .poll(async () => {
        try {
          return await page.evaluate(() => Boolean(window.__fwBn) && typeof window.fbq === "function");
        } catch {
          return false;
        }
      })
      .toBe(true);
    expect((await warteAufPixel(page, 3)).filter(istEvent("ViewContent"))).toHaveLength(1);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bn_runtime_reload"))).toBeNull();
    abgebrocheneRscAbrufeIgnorieren();
  });
});
