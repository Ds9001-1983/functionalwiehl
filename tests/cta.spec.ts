import { expect, test } from "@playwright/test";
import {
  BN_CODE_REGEX,
  BN_CODE_ZEICHEN,
  BN_WHATSAPP_TEXT,
  CTA,
  whatsappBlackNovember,
} from "../lib/cta";
import fixture from "./fixtures/live-ctas.json";

/**
 * DER kritischste Test des Projekts: Die Superchat-Automation des Kunden
 * hängt an byte-genau diesen WhatsApp-URLs (inkl. vorausgefüllter Texte).
 * Geprüft wird beides:
 *  1. lib/cta.ts === Live-Site-Fixture (eingefroren 27.10.2026, Quelle der Wahrheit)
 *  2. Jede gerenderte CTA-URL === lib/cta.ts (keine Drift im Markup)
 */

test.describe("CTA-Konstanten gegen Live-Fixture", () => {
  test("WhatsApp: genau die drei Live-Varianten, byte-identisch", () => {
    // Exakter Mengenvergleich: Jede neue Live-Variante fällt hier auf.
    expect([...fixture.whatsapp].sort()).toEqual(
      [CTA.whatsappProbetraining, CTA.whatsappMitglied, CTA.whatsappAllgemein].sort()
    );
  });

  test("Calendly-, Tel- und Mail-Links sind byte-identisch zur Live-Site", () => {
    expect(fixture.calendly).toContain(CTA.calendly);
    expect(fixture.tel).toContain(CTA.tel);
    expect(fixture.mailto).toContain(CTA.mail);
    expect(fixture.mailto).toContain(CTA.mailRecht);
  });

  test("Black November: Nachricht, Präfix und noscript-Link wie live", () => {
    expect(BN_WHATSAPP_TEXT).toBe(fixture.bn.text);
    expect(CTA.whatsappBlackNovemberPrefix).toBe(fixture.bn.prefix);
    expect(CTA.whatsappBlackNovemberPrefix).toBe(
      "https://wa.me/492262752717?text=" + encodeURIComponent(BN_WHATSAPP_TEXT)
    );
    expect(CTA.whatsappBlackNovemberNoscript).toBe(fixture.bn.noscript);
  });

  test("Black November: Aktionscode-Format wie live", () => {
    expect(BN_CODE_ZEICHEN).toBe(fixture.bn.zeichen);
    expect(BN_CODE_REGEX.source).toBe(fixture.bn.codeRegex);
    // Regex und Alphabet decken sich Zeichen für Zeichen
    for (let c = 32; c < 127; c++) {
      const zeichen = String.fromCharCode(c);
      expect(BN_CODE_REGEX.test(`BN-${zeichen.repeat(4)}`), zeichen).toBe(BN_CODE_ZEICHEN.includes(zeichen));
    }
  });

  test("Black November: whatsappBlackNovember() baut den Live-Link, fremde Codes werfen", () => {
    expect(whatsappBlackNovember("BN-AB2C")).toBe(fixture.bn.prefix + "BN-AB2C");
    for (const falsch of ["BN-I0O1", "bn-ab2c", "BN-ABC", "BN-ABCDE", "XY-AB2C", ""]) {
      expect(() => whatsappBlackNovember(falsch), falsch).toThrow();
    }
  });

  test("Black November: Teaser-Link auf die LP mit UTM wie live", () => {
    expect("https://functional-wiehl.de" + CTA.blackNovemberLp).toBe(fixture.bn.teaser);
  });
});

// P2a ergänzt "/black-november/" (BN-Links dort per Regex auf Präfix + Code).
const SEITEN = ["/", "/koerpermasse/", "/impressum/", "/datenschutz/", "/barrierefreiheit/"];

const ERLAUBT = new Set<string>([
  CTA.whatsappProbetraining,
  CTA.whatsappMitglied,
  CTA.whatsappAllgemein,
  CTA.calendly,
  CTA.tel,
  CTA.mail,
  // Impressum und Datenschutz nennen wie live info@
  CTA.mailRecht,
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
