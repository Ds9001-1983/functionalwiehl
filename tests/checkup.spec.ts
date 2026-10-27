import { createServer } from "node:net";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  CHECKUP_TEXTE as T,
  EINWILLIGUNG,
  KEINE_ANGABE,
  pfadFuer,
  type CheckupAntworten,
  type CheckupPayload,
} from "../content/checkup-fragen";
import { POST } from "../app/api/checkup/route";
import { CTA } from "../lib/cta";
import { erwarteTestMail, holeTestMails } from "./helpers/mails";
import { TEST_ENV } from "./helpers/test-env";

/**
 * Check-up end-to-end: Quiz im Browser (beide Projekte), POST /api/checkup/ per HTTP und der
 * Route-Handler direkt (Versandfehler). Echte Einsendungen landen in der Testsenke des
 * JSON-Mailtransports (FORM_TO = abnahme@example.invalid), nie per SMTP.
 *
 * Das Quiz läuft bis zum Umbau der Startseite (P1a) unter /gesundheits-check/; danach leitet
 * die Route auf /#checkup um, der Test bleibt gültig.
 */
const QUIZ_SEITE = "/gesundheits-check/";
const API = "/api/checkup/";

const eindeutig = (wer: string) => `${wer} ${crypto.randomUUID().slice(0, 8)}`;

async function quizOeffnen(page: Page, consent: "notwendig" | "statistik" = "notwendig") {
  await page.goto(QUIZ_SEITE);
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  if (consent === "notwendig") {
    await banner.getByRole("button", { name: "Nur notwendige" }).click();
  } else {
    await banner.getByRole("button", { name: "Einstellungen" }).click();
    await banner.getByLabel("Marketing (Meta Pixel)").uncheck();
    await banner.getByRole("button", { name: "Auswahl speichern" }).click();
  }
  await page.getByRole("button", { name: T.startButton }).click();
}

/** Prüft Zähler und Fokus des Schritts, wählt die Optionen und klickt „Weiter →“. */
async function antworte(page: Page, nummer: number, titel: string, auswahl: string | string[] = []) {
  await expect(page.getByRole("heading", { name: titel, exact: true })).toBeFocused();
  await expect(page.getByText(`Frage ${nummer} von 27`, { exact: true })).toBeVisible();
  for (const wert of [auswahl].flat()) await page.getByRole("button", { name: wert, exact: true }).click();
  await page.getByRole("button", { name: T.weiter }).click();
}

/** Kürzester Pfad (Gesundheit → Stressabbau, überall „Nein“) bis zum Kontakt-Schritt */
async function bisZumKontakt(page: Page) {
  await antworte(page, 2, "Dein Beruf", "gemischt");
  await antworte(page, 3, "Dein Stresslevel", "groß");
  await antworte(page, 4, "Dein Fitnesslevel", "niedrig");
  await antworte(page, 5, "Deine Trainingsziele", "Gesundheit und Lifestyle");
  await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Stressabbau");
  await antworte(page, 8, "Bisherige Versuche deine Ziele zu erreichen");
  await antworte(page, 8, "Hast du bereits im Fitnessstudio trainiert?", "Nein");
  await antworte(page, 9, "Was für ein Training hast du gemacht?");
  await antworte(page, 10, "Wie häufig möchtest du in Zukunft trainieren?", "1x pro Woche");
  for (const [nummer, titel] of [
    [11, "Bist du in ärztlicher Behandlung?"],
    [12, "Hast du eine Herz-Kreislauf Erkrankung?"],
    [14, "Hast du eine Venenerkrankung?"],
    [16, "Hast du eine Atemwegs-Erkrankung?"],
    [18, "Hast du eine Stoffwechsel-Erkrankung?"],
    [20, "Hast du orthopädische Beschwerden?"],
    [22, "Hast du eine psychische Erkrankung?"],
    [23, "Hast du sonstige Erkrankungen?"],
    [24, "Nimmst du regelmäßig Medikamente?"],
    [26, "Hattest du eine OP in den letzten 12 Monaten?"],
  ] as const) {
    await antworte(page, nummer, titel, "Nein");
  }
  await expect(page.getByRole("heading", { name: T.kontaktTitel })).toBeFocused();
}

async function kontaktAusfuellen(page: Page, name: string, email = "test@example.com") {
  await page.locator("#checkup-name").fill(name);
  await page.locator("#checkup-email").fill(email);
  await page.locator("#checkup-telefon").fill("0151 / 123 456-78");
  await page.getByRole("checkbox", { name: /Datenschutzerklärung/ }).check();
  await page.getByRole("checkbox", { name: /Gesundheitsdaten/ }).check();
}

/** Die Quiz-Karte (Next hat außerdem einen eigenen Route-Announcer mit role="alert") */
const quiz = (page: Page) => page.locator('[data-slot="checkup-quiz"]');

const absendeAnfrage = (page: Page) =>
  page.waitForRequest((r) => new URL(r.url()).pathname === API && r.method() === "POST");

test.describe("Quiz im Browser", () => {
  test("Pfad Muskeln mit Gewicht: Durchlauf bis zur Erfolgsmeldung, lesbare Mail an FORM_TO", async ({
    page,
    request,
  }) => {
    await quizOeffnen(page);
    await antworte(page, 2, "Dein Beruf", "sitzend");
    await antworte(page, 3, "Dein Stresslevel", "mittel");
    await antworte(page, 4, "Dein Fitnesslevel", "hoch");
    await antworte(page, 5, "Deine Trainingsziele", "Muskeln & Körperstruktur");
    await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Muskelaufbau");

    await expect(page.getByRole("heading", { name: "Deine Gewichts-Angaben" })).toBeFocused();
    await expect(page.getByText("Frage 7 von 27", { exact: true })).toBeVisible();
    await page.getByLabel("Aktuelles Gewicht (kg) *").fill("82.5");
    await page.getByLabel("Wunschgewicht (kg) *").fill("75");
    await page.getByRole("button", { name: T.weiter }).click();

    // F7E entfällt im Muskel-Pfad (wie live)
    await antworte(page, 8, "Hast du bereits im Fitnessstudio trainiert?", "Ja");
    await antworte(page, 9, "Was für ein Training hast du gemacht?", ["Geräte", "Kurse"]);
    await antworte(page, 10, "Wie häufig möchtest du in Zukunft trainieren?", "3x pro Woche");
    await antworte(page, 11, "Bist du in ärztlicher Behandlung?", "Nein");
    await antworte(page, 12, "Hast du eine Herz-Kreislauf Erkrankung?", "Ja");
    await antworte(page, 13, "Welche Erkrankung hast du?", ["Bluthochdruck", "KHK"]);
    await antworte(page, 14, "Hast du eine Venenerkrankung?", "Nein");
    await antworte(page, 16, "Hast du eine Atemwegs-Erkrankung?", "Nein");
    await antworte(page, 18, "Hast du eine Stoffwechsel-Erkrankung?", "Nein");
    await antworte(page, 20, "Hast du orthopädische Beschwerden?", "Ja");
    await antworte(page, 21, "Welche orthopädischen Beschwerden hast du?"); // ohne Auswahl
    await antworte(page, 22, "Hast du eine psychische Erkrankung?", "Nein");

    // „Nein“ schließt die übrigen Optionen aus
    await expect(page.getByRole("heading", { name: "Hast du sonstige Erkrankungen?" })).toBeFocused();
    await page.getByRole("button", { name: "Krebs", exact: true }).click();
    await page.getByRole("button", { name: "Nein", exact: true }).click();
    await expect(page.getByRole("button", { name: "Krebs", exact: true })).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: T.weiter }).click();

    await antworte(page, 24, "Nimmst du regelmäßig Medikamente?", "Ja");
    await antworte(page, 25, "Welche nimmst du?", "Schmerzmittel");
    await antworte(page, 26, "Hattest du eine OP in den letzten 12 Monaten?", "Nein");

    await expect(page.getByRole("heading", { name: T.kontaktTitel })).toBeFocused();
    await expect(page.getByText("Frage 27 von 27", { exact: true })).toBeVisible();
    const name = eindeutig("Test Muskel");
    await kontaktAusfuellen(page, name, "muskel@example.com");

    const anfrage = absendeAnfrage(page);
    await page.getByRole("button", { name: T.absenden }).click();
    const payload = (await anfrage).postDataJSON() as CheckupPayload;
    await expect(page.getByRole("status").getByText(T.erfolgText)).toBeVisible();
    await expect(page.getByRole("heading", { name: T.erfolgTitel })).toBeFocused();

    expect(payload.pfad).toEqual([
      "2", "3", "4", "5", "F6A", "7", "8", "9", "10", "11", "12", "13", "14", "16", "18", "20", "21",
      "22", "23", "24", "25", "26",
    ]);
    expect(payload.antworten).toMatchObject({
      beruf: "sitzend",
      trainingsziele: "Muskeln & Körperstruktur",
      aktuelles_gewicht: 82.5,
      wunschgewicht: 75,
      training_art: ["Geräte", "Kurse"],
      herz_kreislauf_details: ["Bluthochdruck", "KHK"],
      orthopaedische_details: [KEINE_ANGABE],
      sonstige_erkrankungen: ["Nein"],
      medikamente_details: ["Schmerzmittel"],
    });
    expect(payload).toMatchObject({ fw_hp: "", einwilligungDatenschutz: true, einwilligungGesundheit: true });
    expect(payload.dauerMs).toBeGreaterThan(1_500);

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: name });
    expect(mail.betreff).toBe(`Neuer Check-up über die Website – ${name}`);
    expect(mail.antwortAn).toBe("muskel@example.com");
    for (const zeile of [
      `Name: ${name}`,
      "E-Mail: muskel@example.com",
      "Telefon: 0151 / 123 456-78",
      `[x] ${EINWILLIGUNG.gesundheit}`,
      "Dein Beruf: sitzend",
      "Deine Trainingsziele: Muskeln & Körperstruktur",
      "Fokusbereich: Muskelaufbau",
      "Aktuelles Gewicht (kg): 82,5",
      "Wunschgewicht (kg): 75",
      "Was für ein Training hast du gemacht? Geräte, Kurse",
      "Hast du eine Herz-Kreislauf Erkrankung? Ja",
      "  → Welche Erkrankung hast du? Bluthochdruck, KHK",
      "  → Welche orthopädischen Beschwerden hast du? Keine Angabe",
      "Hast du sonstige Erkrankungen? Nein",
      "  → Welche nimmst du? Schmerzmittel",
      "Hattest du eine OP in den letzten 12 Monaten? Nein",
    ]) {
      expect(mail.text.split("\n"), zeile).toContain(zeile);
    }
    expect(mail.text).not.toContain("Bisherige Versuche");
  });

  test("Zurück über den Verlauf: Auswahl bleibt, verlassene Zweige werden nicht gesendet", async ({
    page,
    request,
  }) => {
    await quizOeffnen(page);
    await expect(page.getByRole("heading", { name: "Dein Beruf" })).toBeFocused();
    await page.getByRole("button", { name: T.zurueck }).click();
    await page.getByRole("button", { name: T.startButton }).click();

    await antworte(page, 2, "Dein Beruf", "Schichtdienst");
    await antworte(page, 3, "Dein Stresslevel", "niedrig");
    await antworte(page, 4, "Dein Fitnesslevel", "mittel");
    await antworte(page, 5, "Deine Trainingsziele", "Gesundheit und Lifestyle");
    await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Rückentraining");
    await antworte(page, 7, "Deine Problemzonen", "Rücken");
    await expect(page.getByRole("heading", { name: "Bisherige Versuche deine Ziele zu erreichen" })).toBeFocused();

    // zweimal zurück, Auswahl ist noch da, dann der andere Zweig (ohne Problemzonen)
    await page.getByRole("button", { name: T.zurueck }).click();
    await expect(page.getByRole("heading", { name: "Deine Problemzonen" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Rücken", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: T.zurueck }).click();
    await expect(page.getByRole("button", { name: "Rückentraining", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Stressabbau");
    await antworte(page, 8, "Bisherige Versuche deine Ziele zu erreichen", ["Sport", "Ernährung"]);
    await antworte(page, 8, "Hast du bereits im Fitnessstudio trainiert?", "Nein");
    await antworte(page, 9, "Was für ein Training hast du gemacht?");
    await antworte(page, 10, "Wie häufig möchtest du in Zukunft trainieren?", "2x pro Woche");
    await antworte(page, 11, "Bist du in ärztlicher Behandlung?", "Ja");
    // erst Ja mit Detail, dann zurück auf Nein: die Details dürfen nicht mitgehen
    await antworte(page, 12, "Hast du eine Herz-Kreislauf Erkrankung?", "Ja");
    await page.getByRole("button", { name: "Herzinfarkt", exact: true }).click();
    await page.getByRole("button", { name: T.zurueck }).click();
    await antworte(page, 12, "Hast du eine Herz-Kreislauf Erkrankung?", "Nein");
    for (const [nummer, titel] of [
      [14, "Hast du eine Venenerkrankung?"],
      [16, "Hast du eine Atemwegs-Erkrankung?"],
      [18, "Hast du eine Stoffwechsel-Erkrankung?"],
      [20, "Hast du orthopädische Beschwerden?"],
      [22, "Hast du eine psychische Erkrankung?"],
      [23, "Hast du sonstige Erkrankungen?"],
      [24, "Nimmst du regelmäßig Medikamente?"],
      [26, "Hattest du eine OP in den letzten 12 Monaten?"],
    ] as const) {
      await antworte(page, nummer, titel, "Nein");
    }

    // vom Kontakt-Schritt zurück und wieder vor
    await page.getByRole("button", { name: T.zurueck }).click();
    await expect(page.getByRole("heading", { name: "Hattest du eine OP in den letzten 12 Monaten?" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Nein", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: T.weiter }).click();

    const name = eindeutig("Test Zurueck");
    await kontaktAusfuellen(page, name);
    const anfrage = absendeAnfrage(page);
    await page.getByRole("button", { name: T.absenden }).click();
    const payload = (await anfrage).postDataJSON() as CheckupPayload;
    await expect(page.getByRole("status").getByText(T.erfolgText)).toBeVisible();

    expect(payload.pfad).toEqual(pfadFuer(payload.antworten));
    expect(payload.pfad).not.toContain("F6D");
    expect(payload.pfad).not.toContain("13");
    expect(payload.antworten).not.toHaveProperty("problemzonen");
    expect(payload.antworten).not.toHaveProperty("herz_kreislauf_details");
    expect(payload.antworten).toMatchObject({
      gesundheit_fokus: "Stressabbau",
      bisherige_versuche: ["Sport", "Ernährung"],
      training_art: [KEINE_ANGABE],
    });

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: name });
    expect(mail.text).toContain("Bisherige Versuche: Sport, Ernährung");
    expect(mail.text).not.toContain("Problemzonen");
    expect(mail.text).not.toContain("Herzinfarkt");
  });

  test("Gewicht: leere Felder und Werte außerhalb 35–250 kg werden angemahnt", async ({ page }) => {
    await quizOeffnen(page);
    await antworte(page, 2, "Dein Beruf", "stehend");
    await antworte(page, 3, "Dein Stresslevel", "mittel");
    await antworte(page, 4, "Dein Fitnesslevel", "mittel");
    await antworte(page, 5, "Deine Trainingsziele", "Muskeln & Körperstruktur");
    await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Figurtraining");

    const aktuell = page.getByLabel("Aktuelles Gewicht (kg) *");
    const wunsch = page.getByLabel("Wunschgewicht (kg) *");
    await expect(aktuell).toHaveAttribute("placeholder", "z.B. 75");
    await expect(wunsch).toHaveAttribute("placeholder", "z.B. 70");

    await page.getByRole("button", { name: T.weiter }).click();
    await expect(quiz(page).getByRole("alert")).toHaveText(T.gewichtFehlt);
    await aktuell.fill("80");
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(quiz(page).getByRole("alert")).toHaveText(T.gewichtFehlt);
    await wunsch.fill("20");
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(quiz(page).getByRole("alert")).toHaveText(T.gewichtBereich);
    await expect(wunsch).toHaveAttribute("aria-invalid", "true");

    await wunsch.fill("70.4");
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(page.getByRole("heading", { name: "Hast du bereits im Fitnessstudio trainiert?" })).toBeFocused();
    await page.getByRole("button", { name: T.zurueck }).click();
    await expect(aktuell).toHaveValue("80");
    await expect(wunsch).toHaveValue("70.4");
    await expect(quiz(page).getByRole("alert")).toHaveCount(0);
  });

  test("Absenden: Pflichtfelder vorher, Fehler ehrlich (429, 5xx, Netz), Erfolg nur bei res.ok", async ({ page }) => {
    const status = [429, 502, 503, 0];
    let anfragen = 0;
    await page.route(`**${API}`, (route) => {
      anfragen += 1;
      const s = status.shift();
      if (s === 0) return route.abort("failed");
      return s
        ? route.fulfill({ status: s, json: { ok: false } })
        : route.fulfill({ status: 200, json: { ok: true } });
    });

    await quizOeffnen(page);
    await bisZumKontakt(page);
    const absenden = page.getByRole("button", { name: T.absenden });
    const erfolg = page.getByText(T.erfolgText);
    const fehler = quiz(page).getByRole("alert");

    // ohne Einwilligungen und mit ungültigem Telefon schickt der Browser nichts ab
    await page.locator("#checkup-name").fill("Test Fehler");
    await page.locator("#checkup-email").fill("fehler@example.com");
    await page.locator("#checkup-telefon").fill("ruf mich an");
    await absenden.click();
    expect(await page.locator("#checkup-telefon").evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(
      true
    );
    await kontaktAusfuellen(page, "Test Fehler", "fehler@example.com");
    await page.getByRole("checkbox", { name: /Gesundheitsdaten/ }).uncheck();
    await absenden.click();
    expect(anfragen).toBe(0);
    await page.getByRole("checkbox", { name: /Gesundheitsdaten/ }).check();

    const sende = async () => {
      const anfrage = absendeAnfrage(page);
      await absenden.click();
      await anfrage;
    };
    await sende(); // 429
    await expect(fehler).toContainText(T.fehlerZuVieleAnfragen);
    await expect(fehler.getByRole("link", { name: T.fehlerWhatsApp })).toHaveAttribute("href", CTA.whatsappAllgemein);
    await expect(erfolg).toHaveCount(0);

    for (let i = 0; i < 3; i++) {
      await sende(); // 502, 503, Netzfehler
      await expect(fehler).toContainText(T.fehler);
      await expect(fehler).not.toContainText(T.fehlerZuVieleAnfragen);
      await expect(erfolg).toHaveCount(0);
    }
    expect(anfragen).toBe(4);

    await sende();
    await expect(erfolg).toBeVisible();
    expect(anfragen).toBe(5);
  });

  test("keine kritischen oder schweren A11y-Fehler in Frage- und Kontakt-Schritt", async ({ page }) => {
    await quizOeffnen(page);
    const pruefe = async () => {
      // Farbübergänge (transition-colors) erst abwarten, sonst misst axe Zwischenfarben
      await quiz(page).evaluate((karte) => Promise.all(karte.getAnimations({ subtree: true }).map((a) => a.finished)));
      const axe = await new AxeBuilder({ page }).include('[data-slot="checkup-quiz"]').analyze();
      const schwer = axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(schwer, schwer.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`).join("\n")).toHaveLength(0);
    };
    await page.getByRole("button", { name: "gemischt", exact: true }).click();
    await pruefe();
    await page.getByRole("button", { name: T.weiter }).click();
    await bisZumKontaktAb3(page);
    await kontaktAusfuellen(page, "Test A11y");
    await pruefe();
  });
});

/** wie bisZumKontakt, aber ab Schritt 3 (Schritt 2 ist schon beantwortet) */
async function bisZumKontaktAb3(page: Page) {
  await antworte(page, 3, "Dein Stresslevel", "groß");
  await antworte(page, 4, "Dein Fitnesslevel", "niedrig");
  await antworte(page, 5, "Deine Trainingsziele", "Gesundheit und Lifestyle");
  await antworte(page, 6, "SUPER DA KÖNNEN WIR DIR BEI HELFEN", "Wohlbefinden steigern");
  await antworte(page, 8, "Bisherige Versuche deine Ziele zu erreichen", "Medizinisch (z.B. Physio)");
  await antworte(page, 8, "Hast du bereits im Fitnessstudio trainiert?", "Ja");
  await antworte(page, 9, "Was für ein Training hast du gemacht?", "Kurse");
  await antworte(page, 10, "Wie häufig möchtest du in Zukunft trainieren?", "4x+ pro Woche");
  for (const [nummer, titel] of [
    [11, "Bist du in ärztlicher Behandlung?"],
    [12, "Hast du eine Herz-Kreislauf Erkrankung?"],
    [14, "Hast du eine Venenerkrankung?"],
    [16, "Hast du eine Atemwegs-Erkrankung?"],
    [18, "Hast du eine Stoffwechsel-Erkrankung?"],
    [20, "Hast du orthopädische Beschwerden?"],
    [22, "Hast du eine psychische Erkrankung?"],
    [23, "Hast du sonstige Erkrankungen?"],
    [24, "Nimmst du regelmäßig Medikamente?"],
    [26, "Hattest du eine OP in den letzten 12 Monaten?"],
  ] as const) {
    await antworte(page, nummer, titel, "Nein");
  }
}

test.describe("Tracking", () => {
  const TRACKER = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;
  type Aufruf = unknown[];

  test.beforeEach(async ({ page }) => {
    await page.route(TRACKER, (route) => route.fulfill({ status: 200, body: "" }));
    await page.route(`**${API}`, (route) => route.fulfill({ status: 200, json: { ok: true } }));
  });

  test("checkup_submit geht nur mit Statistik-Einwilligung an GA4, ohne Inhalte", async ({ page }) => {
    await quizOeffnen(page, "statistik");
    await bisZumKontakt(page);
    await kontaktAusfuellen(page, "Test Tracking");
    await page.getByRole("button", { name: T.absenden }).click();
    await expect(page.getByText(T.erfolgText)).toBeVisible();

    const events = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? [])
        .map((eintrag) => Array.from(eintrag))
        .filter((a) => a[0] === "event" && a[1] === "checkup_submit")
    );
    expect(events).toHaveLength(1);
    const params = events[0][2] as Record<string, unknown>;
    expect(Object.keys(params).sort()).toEqual(["page", "position", "transport_type"]);
    expect(params.position).toBe("quiz");
    expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
  });

  test("ohne Statistik-Einwilligung kein checkup_submit", async ({ page }) => {
    // gtag-Attrappe: Würde das Quiz ohne Einwilligung tracken, landete der Aufruf hier
    await page.addInitScript(() => {
      const w = window as unknown as { __aufrufe: unknown[][]; gtag: (...a: unknown[]) => void };
      w.__aufrufe = [];
      w.gtag = (...a: unknown[]) => w.__aufrufe.push(a);
    });
    await quizOeffnen(page, "notwendig");
    await bisZumKontakt(page);
    await kontaktAusfuellen(page, "Test Ohne Tracking");
    await page.getByRole("button", { name: T.absenden }).click();
    await expect(page.getByText(T.erfolgText)).toBeVisible();
    const aufrufe = await page.evaluate(() => (window as unknown as { __aufrufe: Aufruf[] }).__aufrufe);
    expect(aufrufe.filter((a) => a[1] === "checkup_submit")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------------------------

/** Gültige Antworten für den kürzesten Pfad (wie bisZumKontakt) */
const ANTWORTEN: CheckupAntworten = {
  beruf: "gemischt",
  stresslevel: "groß",
  fitnesslevel: "niedrig",
  trainingsziele: "Gesundheit und Lifestyle",
  gesundheit_fokus: "Stressabbau",
  bisherige_versuche: ["Sport", "Ernährung"],
  fitnessstudio_erfahrung: "Nein",
  training_art: [KEINE_ANGABE],
  trainingsfrequenz: "1x pro Woche",
  aerztliche_behandlung: "Nein",
  herz_kreislauf: "Ja",
  herz_kreislauf_details: ["Bluthochdruck"],
  venenerkrankung: "Nein",
  atemwegs_erkrankung: "Nein",
  stoffwechsel_erkrankung: "Nein",
  orthopaedische_beschwerden: "Nein",
  psychische_erkrankung: "Nein",
  sonstige_erkrankungen: ["Nein"],
  regelmaessige_medikamente: "Nein",
  op_letzte_12_monate: "Nein",
};

function payload(name: string, extra: Partial<Record<keyof CheckupPayload, unknown>> = {}) {
  return {
    antworten: ANTWORTEN,
    pfad: pfadFuer(ANTWORTEN),
    kontakt: { name, email: "api@example.com", telefon: "02262 752717" },
    einwilligungDatenschutz: true,
    einwilligungGesundheit: true,
    fw_hp: "",
    dauerMs: 95_000,
    ...extra,
  };
}

test.describe("POST /api/checkup/ (HTTP)", () => {
  test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

  test("gültig vom eigenen Origin → 200 no-store, Mail an FORM_TO mit Reply-To, Betreff ohne Gesundheitsdaten", async ({
    request,
    baseURL,
  }) => {
    const name = eindeutig("Test API");
    const res = await request.post(API, { headers: { Origin: new URL(baseURL!).origin }, data: payload(name) });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers()["cache-control"]).toBe("no-store");

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: name });
    expect(mail.an).toEqual([TEST_ENV.FORM_TO]);
    expect(mail.antwortAn).toBe("api@example.com");
    expect(mail.betreff).toBe(`Neuer Check-up über die Website – ${name}`);
    expect(mail.text).toMatch(/^Eingang: \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2} Uhr$/m);
    expect(mail.text).toContain("Text-Stand 2026-10");
    expect(mail.text).toContain("  → Welche Erkrankung hast du? Bluthochdruck");
    expect(mail.text).toContain("Fokusbereich: Stressabbau");
    expect(mail.text).toContain("Gesundheitsdaten (Art. 9 DSGVO)");
    expect(mail.text).not.toMatch(/undefined|\[object/);
  });

  test("Honeypot gefüllt oder unmöglich schnell → 200 ohne Versand", async ({ request }) => {
    const name = eindeutig("Test Bot");
    for (const extra of [{ fw_hp: "https://spam.example" }, { dauerMs: 400 }]) {
      const res = await request.post(API, { data: payload(name, extra) });
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    }
    // Gegenprobe: dieselbe Anfrage ohne Bot-Merkmal kommt an, die beiden davor nicht
    await request.post(API, { data: payload(`${name} echt`) });
    await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: `${name} echt` });
    expect(await holeTestMails(request, { betreff: name })).toHaveLength(1);
  });

  test("Herkunft, Format und Größe: 403, 415, 400, 413", async ({ request }) => {
    const gueltig = payload("Test Format");
    const fremd = await request.post(API, { headers: { Origin: "https://evil.example" }, data: gueltig });
    expect(fremd.status()).toBe(403);
    expect(await fremd.json()).toEqual({ ok: false, fehler: "herkunft" });
    expect((await request.post(API, { headers: { Origin: "null" }, data: gueltig })).status()).toBe(403);

    const text = await request.post(API, {
      headers: { "Content-Type": "text/plain" },
      data: JSON.stringify(gueltig),
    });
    expect(text.status()).toBe(415);

    for (const kaputt of ["{kaputt", "[]", "null", '"x"']) {
      const res = await request.post(API, { headers: { "Content-Type": "application/json" }, data: kaputt });
      expect(res.status(), kaputt).toBe(400);
      expect(await res.json()).toEqual({ ok: false, fehler: "json" });
    }

    const gross = await request.post(API, { data: { ...gueltig, polster: "x".repeat(33_000) } });
    expect(gross.status()).toBe(413);
    expect(gross.headers()["cache-control"]).toBe("no-store");
  });

  test("ungültige Inhalte → 422 ohne Versand", async ({ request }) => {
    const name = eindeutig("Test 422");
    const faelle = [
      payload(name, { einwilligungGesundheit: false }),
      payload(name, { kontakt: { name, email: "keine-mail", telefon: "0151 1234567" } }),
      payload(name, { antworten: { ...ANTWORTEN, problemzonen: "Bauch" } }),
      payload(name, { antworten: { ...ANTWORTEN, beruf: "Astronaut" } }),
      payload(name, { pfad: ["2", "3"] }),
      payload(name, { dauerMs: "schnell" }),
    ];
    for (const daten of faelle) {
      const res = await request.post(API, { data: daten });
      expect(res.status(), JSON.stringify(daten).slice(0, 80)).toBe(422);
      expect(await res.json()).toEqual({ ok: false, fehler: "validierung" });
    }
    expect(await holeTestMails(request, { betreff: name })).toHaveLength(0);
  });

  test("Rate-Limit je IP: nach FORM_RATE_LIMIT Anfragen 429 mit Retry-After, andere IP unberührt", async ({
    request,
  }) => {
    const grenze = Number(TEST_ENV.FORM_RATE_LIMIT);
    const ip = { "x-real-ip": "203.0.113.7" };
    for (let i = 0; i < grenze; i += 100) {
      const runde = await Promise.all(
        Array.from({ length: Math.min(100, grenze - i) }, () => request.post(API, { headers: ip, data: {} }))
      );
      expect(runde.map((r) => r.status()).filter((s) => s !== 422)).toEqual([]);
    }
    const gesperrt = await request.post(API, { headers: ip, data: payload("Test Rate") });
    expect(gesperrt.status()).toBe(429);
    expect(await gesperrt.json()).toEqual({ ok: false, fehler: "zu_viele_anfragen" });
    const warten = Number(gesperrt.headers()["retry-after"]);
    expect(warten).toBeGreaterThan(0);
    expect(warten).toBeLessThanOrEqual(600);

    const andere = await request.post(API, { headers: { "x-real-ip": "203.0.113.8" }, data: {} });
    expect(andere.status()).toBe(422);
  });
});

test.describe("Route-Handler direkt: Versandfehler", () => {
  test.skip(({ isMobile }) => isMobile, "Unit-Test, einmal genügt");
  test.describe.configure({ mode: "serial" });

  const freierPort = () =>
    new Promise<number>((fertig) => {
      const server = createServer().listen(0, "127.0.0.1", () => {
        const { port } = server.address() as { port: number };
        server.close(() => fertig(port));
      });
    });

  /** Ruft POST mit eigener Env auf und sammelt alles, was der Handler loggt. */
  async function aufruf(env: Record<string, string>, body: unknown) {
    const vorher = { ...process.env };
    const logs: string[] = [];
    const konsole = { error: console.error, warn: console.warn, info: console.info, log: console.log };
    for (const name of ["error", "warn", "info", "log"] as const) {
      console[name] = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    }
    Object.assign(process.env, {
      MAIL_TRANSPORT: "",
      FORM_RATE_LIMIT: "1000",
      KV_REST_API_URL: "",
      KV_REST_API_TOKEN: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      SMTP_HOST: "",
      SMTP_PORT: "",
      SMTP_USER: "",
      SMTP_PASS: "",
      SMTP_FROM: "",
      FORM_TO: "abnahme@example.invalid",
      ...env,
    });
    try {
      const res = await POST(
        new Request("http://localhost/api/checkup/", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-real-ip": "192.0.2.10" },
          body: typeof body === "string" ? body : JSON.stringify(body),
        })
      );
      return { status: res.status, json: await res.json(), cache: res.headers.get("cache-control"), logs };
    } finally {
      Object.assign(console, konsole);
      for (const k of Object.keys(process.env)) if (!(k in vorher)) delete process.env[k];
      Object.assign(process.env, vorher);
    }
  }

  const geheim = payload("Erika Geheim", { kontakt: { name: "Erika Geheim", email: "erika@example.com", telefon: "0151 999" } });
  const ohneInhalte = (logs: string[]) => {
    const alles = logs.join("\n");
    for (const verboten of ["Erika", "erika@example.com", "0151 999", "Bluthochdruck", "Stressabbau"]) {
      expect(alles, verboten).not.toContain(verboten);
    }
  };

  test("SMTP nicht konfiguriert oder FORM_TO leer → 503, nur Code im Log", async () => {
    for (const env of [{}, { FORM_TO: "" }] as Record<string, string>[]) {
      const r = await aufruf(env, geheim);
      expect(r.status).toBe(503);
      expect(r.json).toEqual({ ok: false, fehler: "nicht_konfiguriert" });
      expect(r.cache).toBe("no-store");
      expect(r.logs).toEqual(["[form:checkup] versand nicht_konfiguriert"]);
      ohneInhalte(r.logs);
    }
  });

  test("SMTP-Server nicht erreichbar → 502, nur Fehlercode im Log", async () => {
    const r = await aufruf(
      {
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: String(await freierPort()),
        SMTP_USER: "abnahme",
        SMTP_PASS: "abnahme",
        SMTP_FROM: "Functional Wiehl Website <abnahme@example.invalid>",
      },
      geheim
    );
    expect(r.status).toBe(502);
    expect(r.json).toEqual({ ok: false, fehler: "versand" });
    expect(r.logs).toHaveLength(1);
    expect(r.logs[0]).toMatch(/^\[form:checkup\] versand E[A-Z]+/);
    ohneInhalte(r.logs);
  });

  test("Body über 32 KB ohne Content-Length → 413 (gestreamt gezählt)", async () => {
    const r = await aufruf({}, { ...geheim, polster: "x".repeat(40_000) });
    expect(r.status).toBe(413);
    expect(r.logs).toEqual([]);
  });
});
