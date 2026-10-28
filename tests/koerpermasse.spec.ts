import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { POST } from "../app/api/koerpermasse/route";
import { KOERPERMASSE_TEXTE as T, MASSE, type MassId } from "../content/koerpermasse";
import { erwarteTestMail, holeTestMails } from "./helpers/mails";
import { TEST_ENV } from "./helpers/test-env";

/**
 * „Körpermaße Digital“ (/koerpermasse/): Seite wie live (Sie-Form, 8 Maße, Kontakt,
 * Einwilligungen), Versand per JSON-Mailtransport in die Testsenke an FORM_TO,
 * ehrliche Fehler und der Vertrag von POST /api/koerpermasse/.
 */

/** Eingaben in Formular-Reihenfolge und die erwarteten Mailzeilen (de-DE, cm) */
const EINGABEN = ["55.5", "56", "38.2", "38.4", "33.1", "33.3", "88.8", "99.9"];
const MAILZEILEN = [
  "Oberschenkel Links: 55,5 cm",
  "Oberschenkel Rechts: 56 cm",
  "Unterschenkel Links: 38,2 cm",
  "Unterschenkel Rechts: 38,4 cm",
  "Bizeps Links: 33,1 cm",
  "Bizeps Rechts: 33,3 cm",
  "Bauch: 88,8 cm",
  "Hüfte: 99,9 cm",
];

/** Eindeutiger Nachname je Test: Die Testsenke ist für alle Worker gemeinsam */
const eindeutig = (praefix: string) => `${praefix}${crypto.randomUUID().replace(/[^a-z]/g, "").slice(0, 8)}`;

async function oeffneFormular(page: Page) {
  await page.goto("/koerpermasse/");
  // Consent-Banner schließen, überlagert mobil sonst die Buttons
  await page
    .getByRole("dialog", { name: "Cookie-Einstellungen" })
    .getByRole("button", { name: "Nur notwendige" })
    .click();
  await page.getByRole("button", { name: T.start }).click();
  await expect(page.getByRole("heading", { name: T.schritt1 })).toBeVisible();
}

async function fuelleMasse(page: Page) {
  for (const [i, mass] of MASSE.entries()) {
    await page.locator(`input[name="${mass.name}"]`).fill(EINGABEN[i]);
  }
}

async function fuelleKontakt(page: Page, nachname: string) {
  await page.getByLabel(T.vorname).fill("Testine");
  await page.getByLabel(T.nachname).fill(nachname);
  await page.getByLabel(T.handy).fill("0151 1234567");
  for (const checkbox of await page.locator('input[type="checkbox"]').all()) {
    await checkbox.check();
  }
}

test.describe("Seite /koerpermasse/", () => {
  test("Startansicht wie live: eine H1, Texte in Sie-Form, Live-Title", async ({ page }) => {
    await page.goto("/koerpermasse/");
    await expect(page).toHaveTitle("Körpermaße | Functional - Dein Fitnessstudio in Wiehl");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Körpermaße Digital");
    const inhalt = page.locator("main");
    for (const text of [
      T.untertitel,
      "Präzise Erfassung",
      "8 wichtige Körpermaße digital dokumentieren",
      "Trainingsoptimierung",
      "Datenbasierte Anpassung Ihres Workouts",
      T.dauer,
    ]) {
      await expect(inhalt.getByText(text, { exact: true })).toBeVisible();
    }
    await expect(inhalt.getByRole("button", { name: T.start })).toBeVisible();
    await expect(inhalt.getByRole("link", { name: "Functional Wiehl" })).toHaveAttribute("href", "/");
  });

  test("Schritt 1: 8 Pflichtfelder in cm mit Schrittweite 0,1 – leeres Feld hält auf", async ({ page }) => {
    await oeffneFormular(page);
    await expect(page.getByRole("heading", { name: T.wizardTitel })).toBeVisible();
    for (const gruppe of ["Oberschenkel (cm)", "Unterschenkel (cm)", "Bizeps (cm)", "Rumpf (cm)"]) {
      await expect(page.getByRole("group", { name: gruppe })).toBeVisible();
    }
    for (const mass of MASSE) {
      const feld = page.locator(`input[name="${mass.name}"]`);
      await expect(feld, mass.name).toHaveAttribute("type", "number");
      await expect(feld, mass.name).toHaveAttribute("step", "0.1");
      await expect(feld, mass.name).toHaveAttribute("required", "");
    }

    // Alle leer → kein Weiter
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(page.getByRole("heading", { name: T.schritt2 })).toBeHidden();
    await expect(page.getByRole("heading", { name: T.schritt1 })).toBeVisible();

    // 7 von 8 → immer noch kein Weiter, das leere Feld meldet valueMissing
    await fuelleMasse(page);
    const huefte = page.locator('input[name="Hüfte"]');
    await huefte.fill("");
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(page.getByRole("heading", { name: T.schritt2 })).toBeHidden();
    expect(await huefte.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);

    // Wert außerhalb des 0,1-Rasters → Browser blockt (stepMismatch)
    await huefte.fill("99.95");
    expect(await huefte.evaluate((el: HTMLInputElement) => el.validity.stepMismatch)).toBe(true);
  });

  test("kompletter Durchlauf: Mail an FORM_TO mit allen Werten, „Neue Messung“ setzt zurück", async ({ page, request }) => {
    const nachname = eindeutig("Durchlauf");
    await oeffneFormular(page);
    await fuelleMasse(page);
    await page.getByRole("button", { name: T.weiter }).click();
    await expect(page.getByRole("heading", { name: T.schritt2 })).toBeFocused();

    // Zurück behält die Werte
    await page.getByRole("button", { name: T.zurueck }).click();
    await expect(page.locator('input[name="Oberschenkel Links"]')).toHaveValue("55.5");
    await page.getByRole("button", { name: T.weiter }).click();

    await expect(page.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute("href", "/datenschutz/");
    await expect(page.getByText(`${T.hinweisFett} ${T.hinweis}`)).toBeVisible();
    // Honeypot ist nicht sichtbar und nicht per Tab erreichbar
    await expect(page.locator('input[name="fw_hp"]')).toHaveAttribute("tabindex", "-1");
    await fuelleKontakt(page, nachname);
    await page.getByRole("button", { name: T.senden }).click();

    await expect(page.getByRole("heading", { name: T.erfolgTitel })).toBeVisible();
    await expect(page.getByText(T.erfolgText)).toBeVisible();

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: nachname });
    expect(mail.an).toEqual([TEST_ENV.FORM_TO]);
    expect(mail.betreff).toMatch(new RegExp(`^Körpermaße: Testine ${nachname} \\(\\d{2}\\.\\d{2}\\.\\d{4}\\)$`));
    expect(mail.antwortAn).toBeNull();
    const zeilen = mail.text.split("\n");
    for (const zeile of [...MAILZEILEN, "Vorname: Testine", `Nachname: ${nachname}`, "Handynummer: 0151 1234567"]) {
      expect(zeilen, zeile).toContain(zeile);
    }
    expect(mail.text).toContain("Einwilligungen erteilt am");
    expect(mail.text).toContain("Art. 9 DSGVO");
    // HTML-Fassung: alle Werte in der Tabelle, Handy als tel:-Link
    for (const wert of ["55,5", "56", "38,2", "38,4", "33,1", "33,3", "88,8", "99,9"]) {
      expect(mail.html, wert).toContain(`>${wert}</strong>`);
    }
    expect(mail.html).toContain('href="tel:01511234567"');
    expect(mail.html).toContain(`Testine ${nachname}`);
    expect(mail.html).not.toMatch(/undefined|\[object|NaN/);

    // Neue Messung: zurück zu Schritt 1, alles leer, ohne Neuladen
    await page.getByRole("button", { name: T.neueMessung }).click();
    await expect(page.getByRole("heading", { name: T.schritt1 })).toBeFocused();
    for (const mass of MASSE) {
      await expect(page.locator(`input[name="${mass.name}"]`), mass.name).toHaveValue("");
    }
  });

  test("Fehlerpfad: Server-Fehler und Rate-Limit zeigen ehrliche Hinweise, keine Erfolgsmeldung", async ({ page }) => {
    let status = 502;
    await page.route("**/api/koerpermasse/", (route) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ ok: false }) })
    );
    await oeffneFormular(page);
    await fuelleMasse(page);
    await page.getByRole("button", { name: T.weiter }).click();
    await fuelleKontakt(page, eindeutig("Fehler"));
    // nur im Inhalt suchen: Next hat einen eigenen role=alert (Route-Announcer)
    const hinweis = page.locator("main").getByRole("alert");

    await page.getByRole("button", { name: T.senden }).click();
    await expect(hinweis).toHaveText(T.fehler);
    await expect(page.getByRole("heading", { name: T.erfolgTitel })).toBeHidden();
    // Eingaben bleiben, erneutes Senden ist möglich
    await expect(page.getByLabel(T.vorname)).toHaveValue("Testine");
    await expect(page.getByRole("button", { name: T.senden })).toBeEnabled();

    status = 429;
    await page.getByRole("button", { name: T.senden }).click();
    await expect(hinweis).toHaveText(T.fehlerZuViele);

    // 200 ohne ok:true zählt nicht als Erfolg
    status = 200;
    await page.getByRole("button", { name: T.senden }).click();
    await expect(hinweis).toHaveText(T.fehler);
    await expect(page.getByRole("heading", { name: T.erfolgTitel })).toBeHidden();
  });
});

const ZAHLEN = [55.5, 56, 38.2, 38.4, 33.1, 33.3, 88.8, 99.9];

function gueltigeAnfrage(nachname: string) {
  return {
    masse: Object.fromEntries(MASSE.map((m, i) => [m.id, ZAHLEN[i]])) as Record<MassId, number>,
    kontakt: { vorname: "Api", nachname, handy: "+49 (151) 123-4567" },
    einwilligungDatenschutz: true,
    einwilligungKoerpermasse: true,
    fw_hp: "",
  };
}

type Anfrage = ReturnType<typeof gueltigeAnfrage>;

test.describe("API POST /api/koerpermasse/", () => {
  test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

  const senden = (request: APIRequestContext, origin: string, data: unknown, headers: Record<string, string> = {}) =>
    request.post("/api/koerpermasse/", { headers: { origin, ...headers }, data, maxRedirects: 0 });

  test("gültig → 200 {ok:true}, no-store, Mail an FORM_TO", async ({ request, baseURL }) => {
    const nachname = eindeutig("Api");
    const res = await senden(request, baseURL!, gueltigeAnfrage(nachname));
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers()["cache-control"]).toContain("no-store");

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: nachname });
    expect(mail.text.split("\n")).toEqual(expect.arrayContaining([...MAILZEILEN, "Handynummer: +49 (151) 123-4567"]));
  });

  test("ungültige Inhalte → 422 mit Feldname, ohne Mail", async ({ request, baseURL }) => {
    const nachname = eindeutig("Ungueltig");
    const faelle: [string, (a: Anfrage) => void][] = [
      ["masse fehlt", (a) => delete (a as Partial<Anfrage>).masse],
      ["Maß fehlt", (a) => delete (a.masse as Partial<Record<MassId, number>>).bauch],
      ["Maß 0", (a) => (a.masse.bauch = 0)],
      ["Maß 301", (a) => (a.masse.huefte = 301)],
      ["Maß als Text", (a) => ((a.masse as Record<string, unknown>).bizeps_links = "33,1")],
      ["Maß mit 2 Nachkommastellen", (a) => (a.masse.bizeps_rechts = 33.25)],
      ["Vorname leer", (a) => (a.kontakt.vorname = "   ")],
      ["Nachname zu lang", (a) => (a.kontakt.nachname = "x".repeat(81))],
      ["Handy mit Buchstaben", (a) => (a.kontakt.handy = "0151 abc 4567")],
      ["Handy zu kurz", (a) => (a.kontakt.handy = "12345")],
      ["Datenschutz nicht erteilt", (a) => (a.einwilligungDatenschutz = false)],
      ["Art.-9-Einwilligung fehlt", (a) => delete (a as Partial<Anfrage>).einwilligungKoerpermasse],
    ];
    for (const [name, aendern] of faelle) {
      const anfrage = gueltigeAnfrage(nachname);
      aendern(anfrage);
      const res = await senden(request, baseURL!, anfrage);
      expect(res.status(), name).toBe(422);
      const body = (await res.json()) as { ok: boolean; feld: string };
      expect(body.ok, name).toBe(false);
      expect(typeof body.feld, name).toBe("string");
    }
    expect(await holeTestMails(request, { betreff: nachname })).toHaveLength(0);
  });

  test("Schutz: Origin 403, Content-Type 415, Größe 413, kaputtes JSON 400", async ({ request, baseURL }) => {
    const nachname = eindeutig("Schutz");
    const body = JSON.stringify(gueltigeAnfrage(nachname));

    expect((await senden(request, "https://angreifer.example", gueltigeAnfrage(nachname))).status()).toBe(403);
    expect((await senden(request, "null", gueltigeAnfrage(nachname))).status()).toBe(403);
    const ohneOrigin = await request.post("/api/koerpermasse/", { data: gueltigeAnfrage(nachname) });
    expect(ohneOrigin.status()).toBe(403);

    // Buffer: Playwright schickt Strings mit JSON-Content-Type sonst JSON-kodiert
    const json = { "content-type": "application/json" };
    expect((await senden(request, baseURL!, Buffer.from(body), { "content-type": "text/plain" })).status()).toBe(415);
    expect((await senden(request, baseURL!, Buffer.from(body), { "content-type": "application/x-www-form-urlencoded" })).status()).toBe(415);
    expect((await senden(request, baseURL!, Buffer.from(body.padEnd(9_000, " ")), json)).status()).toBe(413);
    expect((await senden(request, baseURL!, Buffer.from("{kaputt"), json)).status()).toBe(400);
    expect(await holeTestMails(request, { betreff: nachname })).toHaveLength(0);

    // JSON mit charset-Zusatz ist in Ordnung
    const mitCharset = eindeutig("Charset");
    const res = await senden(request, baseURL!, Buffer.from(JSON.stringify(gueltigeAnfrage(mitCharset))), {
      "content-type": "application/json; charset=utf-8",
    });
    expect(res.status()).toBe(200);
    await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: mitCharset });
  });

  test("Honeypot gefüllt → 200 {ok:true}, aber keine Mail", async ({ request, baseURL }) => {
    const nachname = eindeutig("Honig");
    const res = await senden(request, baseURL!, { ...gueltigeAnfrage(nachname), fw_hp: "https://spam.example" });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    // sendeMail wird vor der Antwort abgewartet – läge eine Mail vor, wäre sie jetzt in der Senke
    expect(await holeTestMails(request, { betreff: nachname })).toHaveLength(0);
  });

  test("ohne Slash kein Redirect (Proxy lässt /api aus), GET → 405", async ({ request, baseURL }) => {
    const ohneSlash = await request.post("/api/koerpermasse", { headers: { origin: baseURL! }, data: {}, maxRedirects: 0 });
    expect(ohneSlash.status()).toBe(422);
    expect((await request.get("/api/koerpermasse/", { maxRedirects: 0 })).status()).toBe(405);
  });
});

/**
 * Route direkt im Test-Prozess: Rate-Limit, nicht konfigurierter Versand (503) und
 * SMTP-Fehler (502) lassen sich gegen den Abnahme-Server (FORM_RATE_LIMIT=1000,
 * JSON-Transport) nicht auslösen. Env wird je Test gesetzt und wiederhergestellt.
 */
test.describe("Route im Prozess: Rate-Limit, Versandfehler, Logs ohne Inhalte", () => {
  test.skip(({ isMobile }) => isMobile, "Unit-Test, einmal genügt");

  const BASIS_ENV: Record<string, string> = {
    MAIL_TRANSPORT: "json",
    FORM_TO: TEST_ENV.FORM_TO,
    RATE_LIMIT_SECRET: TEST_ENV.RATE_LIMIT_SECRET,
    FORM_RATE_LIMIT: "2",
    KV_REST_API_URL: "",
    KV_REST_API_TOKEN: "",
    UPSTASH_REDIS_REST_URL: "",
    UPSTASH_REDIS_REST_TOKEN: "",
  };

  async function mitEnv<T>(werte: Record<string, string>, fn: () => Promise<T>): Promise<T> {
    const vorher = Object.fromEntries(Object.keys(werte).map((k) => [k, process.env[k]]));
    Object.assign(process.env, werte);
    try {
      return await fn();
    } finally {
      for (const [k, v] of Object.entries(vorher)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    }
  }

  function anfrage(body: unknown, ip: string) {
    return new Request("http://localhost/api/koerpermasse/", {
      method: "POST",
      headers: { host: "localhost", origin: "http://localhost", "content-type": "application/json", "x-real-ip": ip },
      body: JSON.stringify(body),
    });
  }

  const zufallsIp = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}-${crypto.randomUUID()}`;

  test("429 ab der (FORM_RATE_LIMIT + 1)-ten gültigen Anfrage je IP, andere IP unberührt", async () => {
    await mitEnv(BASIS_ENV, async () => {
      const ip = zufallsIp();
      const daten = gueltigeAnfrage(eindeutig("Limit"));
      expect((await POST(anfrage(daten, ip))).status).toBe(200);
      expect((await POST(anfrage(daten, ip))).status).toBe(200);
      const dritte = await POST(anfrage(daten, ip));
      expect(dritte.status).toBe(429);
      expect(dritte.headers.get("retry-after")).toBe("600");
      expect((await POST(anfrage(daten, zufallsIp()))).status).toBe(200);
    });
  });

  test("503 ohne Empfänger, 502 bei SMTP-Fehler – Log nur mit Code, nie mit Namen oder Maßen", async () => {
    const nachname = eindeutig("Geheim");
    const logs: string[] = [];
    const original = { error: console.error, warn: console.warn, log: console.log, info: console.info };
    for (const art of ["error", "warn", "log", "info"] as const) {
      console[art] = (...teile: unknown[]) => logs.push(teile.map(String).join(" "));
    }
    try {
      await mitEnv({ ...BASIS_ENV, FORM_TO: "" }, async () => {
        const res = await POST(anfrage(gueltigeAnfrage(nachname), zufallsIp()));
        expect(res.status).toBe(503);
        expect(await res.json()).toEqual({ ok: false, fehler: "Versand derzeit nicht möglich" });
      });
      // Port 9 (discard) ist lokal zu → sofortiger Verbindungsfehler
      const smtp = {
        MAIL_TRANSPORT: "",
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: "9",
        SMTP_USER: "test@example.invalid",
        SMTP_PASS: "kein-echtes-passwort",
        SMTP_FROM: "test@example.invalid",
      };
      await mitEnv({ ...BASIS_ENV, ...smtp }, async () => {
        const res = await POST(anfrage(gueltigeAnfrage(nachname), zufallsIp()));
        expect(res.status).toBe(502);
      });
    } finally {
      Object.assign(console, original);
    }
    expect(logs.length).toBeGreaterThanOrEqual(2);
    for (const zeile of logs) {
      expect(zeile).toMatch(/^\[form:koerpermasse\] /);
      for (const geheim of [nachname, "Api", "123-4567", "55,5", "55.5", "kein-echtes-passwort"]) {
        expect(zeile, `Log enthält „${geheim}“`).not.toContain(geheim);
      }
    }
  });
});
