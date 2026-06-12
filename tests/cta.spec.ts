import { expect, test } from "@playwright/test";
import { CTA } from "../lib/cta";
import fixture from "./fixtures/live-ctas.json";

/**
 * DER kritischste Test des Projekts: Die Superchat-Automation des Kunden
 * hängt an byte-genau diesen WhatsApp-URLs (inkl. vorausgefüllter Texte).
 * Geprüft wird beides:
 *  1. lib/cta.ts === Live-Site-Fixture (Quelle der Wahrheit)
 *  2. Jede gerenderte CTA-URL === lib/cta.ts (keine Drift im Markup)
 */

test.describe("CTA-Konstanten gegen Live-Fixture", () => {
  test("WhatsApp-Probetraining-Link ist byte-identisch zur Live-Site", () => {
    expect(fixture.whatsapp).toContain(CTA.whatsappProbetraining);
  });

  test("WhatsApp-Vertrags-Link ist byte-identisch zur Live-Site", () => {
    expect(fixture.whatsapp).toContain(CTA.whatsappVertrag);
  });

  test("Calendly- und Tel-Links sind byte-identisch zur Live-Site", () => {
    expect(fixture.calendly).toContain(CTA.calendly);
    expect(fixture.tel).toContain(CTA.tel);
  });
});

const SEITEN = [
  "/",
  "/training-und-kurse/",
  "/personal-training/",
  "/24-7-fitnessstudio/",
  "/frauen-ab-50/",
  "/probetraining/",
  "/kursplan/",
  "/gesundheits-check/",
  "/ueber-uns/",
  "/kontakt/",
];

const ERLAUBT = new Set<string>([
  CTA.whatsappProbetraining,
  CTA.whatsappVertrag,
  CTA.calendly,
  CTA.tel,
  CTA.mail,
]);

for (const seite of SEITEN) {
  test(`gerenderte CTAs auf ${seite} matchen lib/cta.ts exakt`, async ({ page }) => {
    await page.goto(seite);
    const hrefs = await page
      .locator(
        'a[href*="whatsapp"], a[href*="wa.me"], a[href*="calendly"], a[href^="tel:"], a[href^="mailto:"]'
      )
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(ERLAUBT, `Unbekannte CTA-URL auf ${seite}: ${href}`).toContain(href!);
    }
  });
}
