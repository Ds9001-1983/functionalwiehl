import { expect, test, type Page } from "@playwright/test";
import { BN_AKTION_ENDE, BN_ERSPARNIS, BN_FUSSNOTE, BN_PREIS, BN_STATT } from "../content/black-november";
import { EXTRAS, FRAGEN_LABEL, STARTGEBUEHR_HINWEIS, TARIFE } from "../content/preise";
import { BETREUUNGSZEITEN, CTA, KONTAKT } from "../lib/cta";

/**
 * Startseite als One-Pager wie live (Stand 27.10.2026): Anker, Reihenfolge, Inhalte und
 * Ziele der Links. Die CTA-Bytes selbst prüft tests/cta.spec.ts gegen die Live-Fixture.
 */

const ANKER = ["black-november-section", "leistung", "aktuelles", "preise", "checkup", "kontakt"];

/** Die 3 neuesten Reels vom 27.10.2026 (content/instagram-fallback.ts) */
const REELS = [
  "https://www.instagram.com/reel/De-H9Dmx0Rl/",
  "https://www.instagram.com/reel/DezWyEjozTx/",
  "https://www.instagram.com/reel/DehrYSmRfmJ/",
];

async function consentSchliessen(page: Page) {
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await banner.getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner).toBeHidden();
}

/** Abstand eines Elements vom Dokumentanfang */
async function oben(page: Page, selektor: string) {
  return page.locator(selektor).first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
}

test.describe("Aufbau", () => {
  test("jeder Anker genau einmal, in Live-Reihenfolge, keine doppelten IDs", async ({ page }) => {
    await page.goto("/");
    for (const id of ANKER) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);

    const doppelt = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(doppelt).toEqual([]);

    const positionen = [];
    for (const id of ANKER) positionen.push(await oben(page, `#${id}`));
    expect(positionen).toEqual([...positionen].sort((a, b) => a - b));

    // Galerie mit Körpermaße-Teaser liegt zwischen Check-up und Kontakt
    const teaser = await oben(page, 'a[href="/koerpermasse/"]');
    expect(teaser).toBeGreaterThan(positionen[4]);
    expect(teaser).toBeLessThan(positionen[5]);
  });

  test("kein horizontales Scrollen", async ({ page }) => {
    await page.goto("/");
    const ueberstand = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(ueberstand).toBe(0);
  });

  test("Direktaufruf /?utm_source=x#preise landet bei den Preisen (auch nach Hydration)", async ({ page }) => {
    await page.goto("/?utm_source=x#preise");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#preise")).toBeInViewport();
  });

  test("alte URL /preise/ führt über den 308 direkt zu #preise", async ({ page }) => {
    await page.goto("/preise/?utm_source=x");
    await expect(page).toHaveURL(/\/\?utm_source=x#preise$/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#preise")).toBeInViewport();
  });

  test("JSON-LD mit Monatspreisen, Betreuungszeiten und gym@, ohne FAQ", async ({ page }) => {
    await page.goto("/");
    const daten = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));
    expect(daten.some((d) => d["@type"] === "FAQPage")).toBe(false);
    const studio = daten.find((d) => Array.isArray(d["@type"]) && d["@type"].includes("HealthClub"));
    expect(studio).toMatchObject({
      name: "Functional Wiehl",
      legalName: KONTAKT.firma,
      email: KONTAKT.mail,
      priceRange: "37,00–59,00 € pro Monat",
    });
    expect(studio.alternateName).toBeUndefined();
    expect(studio.description).toContain("Mo–Fr 08:00–21:00");
  });
});

test.describe("Black-November-Teaser", () => {
  test("ist nach dem Aktionsende zurückgebaut (Datumstest)", async ({ page }) => {
    // Wird ab dem 10.11.2026 rot, solange der Teaser noch steht: Rückbau siehe
    // components/sections/black-november-teaser.tsx (Komponente, Einbindung und diese BN-Tests löschen).
    const vorbei = Date.now() > Date.parse(BN_AKTION_ENDE);
    await page.goto("/");
    await expect(
      page.locator("#black-november-section"),
      vorbei ? "BN26 ist vorbei – Teaser von der Startseite entfernen" : "Teaser fehlt während der Aktion"
    ).toHaveCount(vorbei ? 0 : 1);
  });

  test("Link exakt auf die LP mit UTM, Preis, Ersparnis und Fußnote wie live", async ({ page }) => {
    await page.goto("/");
    const teaser = page.locator("#black-november-section");
    await expect(teaser.getByRole("heading", { level: 2 })).toHaveText("Black November 50 % auf dein Abo");
    await expect(teaser.getByRole("link", { name: "Jetzt zum Angebot" })).toHaveAttribute("href", CTA.blackNovemberLp);
    await expect(teaser).toContainText(`${BN_PREIS}/ Monat*statt ${BN_STATT}`);
    await expect(teaser).toContainText(`Du sparst ${BN_ERSPARNIS}`);
    await expect(teaser).toContainText(BN_FUSSNOTE);
  });

  test("Klick lädt die LP als neues Dokument (kein Client-Routing)", async ({ page }) => {
    await page.goto("/");
    await consentSchliessen(page);
    await page.evaluate(() => Object.assign(window, { __startseiteMarker: true }));
    await page.locator("#black-november-section").getByRole("link", { name: "Jetzt zum Angebot" }).click();
    await page.waitForURL(
      (url) =>
        url.pathname === "/black-november/" &&
        url.search === "?utm_source=website&utm_medium=startseite&utm_campaign=bn26"
    );
    // Bei Client-Navigation bliebe das window-Objekt erhalten
    expect(await page.evaluate(() => "__startseiteMarker" in window)).toBe(false);
  });
});

test.describe("Inhalte", () => {
  test("#leistung: „Unsere Leistungen“ mit 6 Live-Texten, ohne Links", async ({ page }) => {
    await page.goto("/");
    const leistung = page.locator("#leistung");
    await expect(leistung.getByRole("heading", { level: 2 })).toHaveText("Unsere Leistungen");
    await expect(leistung).toContainText("Vielfältige Trainingsmöglichkeiten für alle Fitness-Level und Ziele");
    await expect(leistung.getByRole("heading", { level: 3 })).toHaveText([
      "Krafttraining",
      "Cardio Training",
      "Personal Training",
      "Gruppenkurse",
      "Körperanalyse",
      "Ernährungs Coaching",
    ]);
    await expect(leistung.locator("a")).toHaveCount(0);
  });

  test("#aktuelles: 3 neueste Reels mit Play-Symbol und Profil-Link, ohne Request an Meta", async ({ page }) => {
    const metaRequests: string[] = [];
    page.on("request", (req) => {
      if (/instagram\.com|cdninstagram|fbcdn/.test(req.url())) metaRequests.push(req.url());
    });
    await page.goto("/");
    const aktuelles = page.locator("#aktuelles");
    await aktuelles.scrollIntoViewIfNeeded();

    const kacheln = aktuelles.locator('a[href*="/reel/"]');
    await expect(kacheln).toHaveCount(3);
    expect(await kacheln.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual(REELS);
    for (const kachel of await kacheln.all()) {
      await expect(kachel).toHaveAttribute("target", "_blank");
      await expect(kachel).toHaveAttribute("rel", "noopener noreferrer");
      await expect(kachel.locator("img")).toHaveAttribute("alt", /\S/);
    }
    await expect(aktuelles.locator("svg.lucide-play")).toHaveCount(3);

    const profil = aktuelles.locator(`a[href="${CTA.instagram}"]`);
    await expect(profil).toHaveCount(1);
    await expect(profil).toHaveAttribute("rel", "noopener noreferrer");

    await page.waitForLoadState("networkidle");
    expect(metaRequests).toEqual([]);
  });

  test("#preise: Monatspreise, 4× „Buchen“ → Mitglied werden, Einmalig & Extras wörtlich", async ({ page }) => {
    await page.goto("/");
    const preise = page.locator("#preise");
    for (const preis of ["59,00 €", "45,00 €", "39,90 €", "37,00 €"]) await expect(preise).toContainText(preis);
    for (const t of TARIFE) await expect(preise).toContainText(`${t.preis}${t.einheit}${t.laufzeit}`);

    const buchen = preise.locator(`a[href="${CTA.whatsappMitglied}"]`);
    await expect(buchen).toHaveCount(4);
    await expect(buchen).toHaveText(["Buchen", "Buchen", "Buchen", "Buchen"]);
    await expect(preise.getByText(STARTGEBUEHR_HINWEIS)).toHaveCount(4);

    await expect(preise.getByRole("heading", { name: "Einmalig & Extras" })).toBeVisible();
    await expect(preise).toContainText("Ohne Vertrag trainieren oder dein Abo ergänzen");
    const zeilen = preise.locator("dl > div");
    await expect(zeilen).toHaveCount(EXTRAS.length);
    for (const [i, e] of EXTRAS.entries()) {
      await expect(zeilen.nth(i)).toContainText(e.name);
      await expect(zeilen.nth(i)).toContainText(e.preis);
      if (e.hinweis) await expect(zeilen.nth(i)).toContainText(e.hinweis);
    }
    await expect(preise.getByRole("link", { name: FRAGEN_LABEL })).toHaveAttribute("href", CTA.whatsappAllgemein);
    await expect(preise.locator(`a[href="${CTA.mail}"]`)).toHaveText("gym@functional-wiehl.de");
    await expect(preise).toContainText("02262 / 752717 (auch per WhatsApp)");
  });

  test("#checkup: Quiz steht direkt auf der Startseite", async ({ page }) => {
    await page.goto("/");
    const checkup = page.locator("#checkup");
    await expect(checkup.getByRole("heading", { name: "Fitness- & Gesundheits-Check-up" })).toBeVisible();
    await expect(checkup.getByRole("button", { name: /Los geht/ })).toBeVisible();
    await expect(checkup.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute("href", "/datenschutz/");
  });

  test("Galerie: Körpermaße-Teaser vor „Studio Galerie“ verlinkt /koerpermasse/", async ({ page }) => {
    await page.goto("/");
    const teaser = page.getByRole("link", { name: /Körpermaße Digital/ });
    await expect(teaser).toHaveAttribute("href", "/koerpermasse/");
    await expect(teaser).toContainText("Jetzt Körpermaße erfassen");
    const vorDerUeberschrift = await teaser.evaluate((link) => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => h.textContent === "Studio Galerie");
      return !!h2 && !!(link.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(vorDerUeberschrift).toBe(true);
  });

  test("#kontakt: Betreuungszeiten, Buttons und Anfahrt wie live", async ({ page }) => {
    await page.goto("/");
    const kontakt = page.locator("#kontakt");
    await expect(kontakt.getByRole("heading", { level: 2 })).toHaveText("Kontakt & Öffnungszeiten");
    for (const z of [BETREUUNGSZEITEN.zugang, ...BETREUUNGSZEITEN.zeilen]) {
      await expect(kontakt).toContainText(`${z.label}${z.wert}`);
    }
    await expect(kontakt.getByRole("link", { name: "Kontakt über WhatsApp" })).toHaveAttribute(
      "href",
      CTA.whatsappAllgemein
    );
    await expect(kontakt.getByRole("link", { name: "Jetzt Telefontermin vereinbaren" })).toHaveAttribute(
      "href",
      CTA.calendly
    );
    await expect(kontakt.locator(`a[href="${CTA.maps}"]`)).toContainText("Wilhelm-Grümer-Weg 18");
    await expect(kontakt.locator(`a[href="${CTA.tel}"]`)).toHaveText(KONTAKT.telefonAnzeige);
    await expect(kontakt.locator(`a[href="${CTA.mail}"]`)).toHaveText("gym@functional-wiehl.de");
    for (const text of [
      "Kostenlose Parkplätze direkt vor Ort",
      "Bushaltestelle „Wiehl Zentrum“ 2 Min. Fußweg",
      "Barrierefrei zugänglich",
      "So findest du uns",
    ]) {
      await expect(kontakt).toContainText(text);
    }
    await expect(kontakt.locator("video")).toHaveCount(1);
  });
});
