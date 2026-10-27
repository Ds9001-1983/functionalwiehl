import { expect, test, type Page } from "@playwright/test";
import { RECHT } from "../content/recht";
import { CTA, KONTAKT } from "../lib/cta";
import { TEST_ENV } from "./helpers/test-env";

/**
 * Rechtsseiten: Pflichtangaben vorhanden, keine Entwurfs-Reste, keine Dienste der
 * alten WordPress-Seite. Reine Inhaltsprüfung, läuft deshalb nur im Projekt desktop.
 */

test.skip(({ isMobile }) => isMobile, "Inhalt ist geräteunabhängig");

async function hauptinhalt(page: Page, pfad: string): Promise<string> {
  const antwort = await page.goto(pfad);
  expect(antwort?.status()).toBe(200);
  return page.locator("main").innerText();
}

/** Gilt für alle drei Seiten: nichts, was nach Entwurf oder Platzhalter aussieht. */
const NIE_AUF_RECHTSSEITEN = [
  "Prototyp",
  "Entwurf",
  "wird ergänzt",
  "TODO",
  "<Frist",
  "<Datum",
  // Firmierung nur mit Bindestrich (Handelsregister)
  "Functional Wiehl GmbH",
];

for (const pfad of ["/impressum/", "/datenschutz/", "/barrierefreiheit/"]) {
  test(`${pfad}: keine Entwurfs- oder Platzhalter-Reste`, async ({ page }) => {
    const text = await hauptinhalt(page, pfad);
    for (const verboten of NIE_AUF_RECHTSSEITEN) {
      expect(text, `„${verboten}“ auf ${pfad}`).not.toContain(verboten);
    }
    expect(text).toContain(KONTAKT.firma);
  });
}

test("Impressum: Pflichtangaben nach § 5 DDG und § 18 MStV, ohne OS-Plattform", async ({ page }) => {
  const text = await hauptinhalt(page, "/impressum/");
  for (const pflicht of [
    "Angaben gemäß § 5 DDG",
    "Functional-Wiehl GmbH",
    KONTAKT.strasse,
    KONTAKT.plzOrt,
    "Peter Nelles und Cornelia Nelles",
    "Registergericht: Amtsgericht Köln",
    "Registernummer: HRB 54866",
    "DE240642364",
    "§ 18 Abs. 2 MStV",
    KONTAKT.telefonAnzeige,
    KONTAKT.mailRecht,
    RECHT.buero,
  ]) {
    expect(text, pflicht).toContain(pflicht);
  }
  expect(text).not.toContain("Streitschlichtung");
  await expect(page.locator('main a[href*="ec.europa.eu"]')).toHaveCount(0);
  // E-Mail wie live: info@ im Impressum
  await expect(page.locator('main a[href^="mailto:"]')).toHaveAttribute("href", CTA.mailRecht);
});

test("Datenschutz: Stand, Verantwortlicher, Rechte und alle Dienste der neuen Seite", async ({ page }) => {
  const text = await hauptinhalt(page, "/datenschutz/");
  // Löschdatum der DSE = BN_CLICK_DELETE_AT (Testwert entspricht dem echten Wert)
  const [jahr, monat, tag] = TEST_ENV.BN_CLICK_DELETE_AT.slice(0, 10).split("-");
  for (const pflicht of [
    `Stand: ${RECHT.stand}`,
    // Verantwortlicher mit PLZ/Ort und info@
    `${KONTAKT.strasse}\n${KONTAKT.plzOrt}`,
    KONTAKT.mailRecht,
    "Art. 7 Abs. 3 DSGVO",
    "Art. 77 DSGVO",
    "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",
    // Hosting und Logfiles
    "Vercel Inc.",
    "Region Frankfurt am Main",
    "Server-Logfiles",
    // Banner und Speicher auf dem Gerät
    "fw_consent",
    "fw_a11y",
    "bn_code",
    // Formulare (Art. 9) mit Weg und Löschfrist
    "Art. 9 Abs. 2 lit. a DSGVO",
    KONTAKT.mail,
    "Alfahosting GmbH",
    `spätestens ${RECHT.formularLoeschfrist} nach Eingang`,
    // Tracking
    "G-H41716E7JE",
    "Ohne Ihre Einwilligung wird Google Analytics nicht geladen.",
    "Auf unserer Aktionsseite /black-november/ wird das Meta-Pixel bereits beim Aufruf geladen",
    // Klickspeicher
    "Upstash",
    `spätestens am ${tag}.${monat}.${jahr}`,
    // Instagram ohne Datenfluss an Meta
    "Eine Verbindung zu Instagram oder Meta entsteht dabei nicht",
    "Vercel Blob",
    // Kontaktwege
    "Superchat",
    "Calendly",
  ]) {
    expect(text, pflicht).toContain(pflicht);
  }
});

test("Datenschutz: die drei Abschnitte vom 20.10.2026 stehen wörtlich drin", async ({ page }) => {
  const text = (await hauptinhalt(page, "/datenschutz/")).replace(/\s+/g, " ");
  for (const satz of [
    "Für die Kommunikation über WhatsApp nutzen wir die WhatsApp Business Platform (Cloud API) der Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland („Meta“). Die Nachrichten verwalten wir mit der Kommunikationssoftware Superchat der SuperX GmbH, die für uns als Auftragsverarbeiter tätig ist.",
    "Das Meta-Pixel wird nur geladen, wenn du im Cookie-Banner in Marketing-Cookies eingewilligt hast (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Deine Einwilligung kannst du jederzeit über die Cookie-Einstellungen widerrufen.",
    "Für die Erhebung und Übermittlung der Daten an Meta sind wir gemeinsam mit Meta verantwortlich (Art. 26 DSGVO); die Vereinbarung ist unter facebook.com/legal/controller_addendum abrufbar.",
    "Die Auswertung erfolgt auf einem Server unseres Dienstleisters SUPERBRAND.marketing (Dennis Sasse, Wiehl), der für uns als Auftragsverarbeiter tätig ist. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Erfolgsmessung unserer Werbung). Die gespeicherten Daten werden nach Abschluss der jeweiligen Aktion gelöscht.",
  ]) {
    expect(text).toContain(satz);
  }
});

test("Datenschutz: keine Muster-Reste und keine Dienste der WordPress-Seite", async ({ page }) => {
  const text = await hauptinhalt(page, "/datenschutz/");
  for (const alt of [
    // Muster-Reste
    "Cookiebot",
    "Newsletter",
    "Flash",
    "YouTube",
    "Social-Plug-in",
    "Warenkorb",
    "Facebook Ireland Ltd",
    "nicht über ein angemessenes Datenschutzniveau",
    "Anonymisierungsfunktion",
    "IP-Anonymisierung",
    // Dienste der WordPress-Seite
    "WordPress",
    "Complianz",
    "Matomo",
    "Smash Balloon",
    "Site Kit",
    "WPForms",
    "Popup Maker",
    "Webspace",
    // DSB-Absatz bleibt draußen, bis Conny eine DSB-Pflicht bestätigt
    "Datenschutzbeauftragte/r",
  ]) {
    expect(text, `„${alt}“ steht noch in der DSE`).not.toContain(alt);
  }
});

test("Datenschutz: Gliederung verlinkt jeden Abschnitt, Cookie-Einstellungen lassen sich öffnen", async ({
  page,
}) => {
  await page.goto("/datenschutz/");
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await banner.getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner).toBeHidden();

  const anker = await page
    .getByRole("navigation", { name: "Gliederung der Datenschutzerklärung" })
    .locator("a")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(anker.length).toBeGreaterThan(10);
  for (const href of anker) {
    await expect(page.locator(`main ${href}`), href!).toHaveCount(1);
  }

  await page.locator("main").getByRole("button", { name: "Cookie-Einstellungen" }).click();
  await expect(banner).toBeVisible();
});

test("Barrierefreiheit: Stand, Durchsetzungsstelle, kein Kursplan", async ({ page }) => {
  const text = await hauptinhalt(page, "/barrierefreiheit/");
  for (const pflicht of [
    `Stand: ${RECHT.stand}`,
    "Selbstbewertung",
    "Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen",
    "Carl-Miller-Straße 6, 39112 Magdeburg",
    "WCAG",
  ]) {
    expect(text, pflicht).toContain(pflicht);
  }
  expect(text).not.toContain("Kursplan");
});
