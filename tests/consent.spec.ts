import { expect, test, type Page } from "@playwright/test";
import { readConsentCookie } from "../lib/consent-cookie";
import { einwilligungSetzen, trackerAbfangen, TRACKER_URL, warteAufPixel } from "./helpers/meta-recorder";

/**
 * Hard-Gating-Nachweis: Vor dem Opt-in darf auf der Website KEIN Request an Google/Meta
 * rausgehen; nach „Alle akzeptieren" müssen die Tags laden. Ausnahme ist die BN-LP
 * (Pixel ohne Einwilligung, Entscheidung Dennis 27.10.2026).
 * Alle Tracker-Requests werden abgefangen (tests/helpers/meta-recorder.ts) – die Abnahme
 * sendet nie echte Events. Gezählt wird trotzdem jeder Versuch.
 */

function trackerZaehlen(page: Page) {
  const urls: string[] = [];
  page.on("request", (req) => {
    if (TRACKER_URL.test(req.url())) urls.push(req.url());
  });
  return urls;
}

const banner = (page: Page) => page.getByRole("dialog", { name: "Cookie-Einstellungen" });

test.beforeEach(async ({ context }) => {
  await trackerAbfangen(context);
});

test("vor Consent: keinerlei Tracking-Requests", async ({ page }) => {
  const trackerRequests = trackerZaehlen(page);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // etwas scrollen, um Lazy-Trigger auszuschließen (mouse.wheel gibt es in Mobile-WebKit nicht)
  await page.evaluate(() => window.scrollTo({ top: 1500 }));
  await page.waitForTimeout(800);

  expect(trackerRequests).toHaveLength(0);
  expect(await page.evaluate(() => [typeof window.fbq, typeof window.gtag])).toEqual(["undefined", "undefined"]);
});

test("Einstellungen: Statistik und Marketing sind nicht vorangekreuzt", async ({ page }) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Einstellungen" }).click();
  await expect(page.locator("#consent-statistik")).not.toBeChecked();
  await expect(page.locator("#consent-marketing")).not.toBeChecked();
  await expect(page.locator("#consent-notwendig")).toBeChecked();
  await expect(page.locator("#consent-notwendig")).toBeDisabled();
});

test("nach 'Alle akzeptieren': GA4 + Pixel laden, Banner verschwindet", async ({ page }) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();

  const gtagLoaded = page.waitForRequest(/googletagmanager\.com/, { timeout: 10_000 });
  const fbqLoaded = page.waitForRequest(/connect\.facebook\.net/, { timeout: 10_000 });
  await banner(page).getByRole("button", { name: "Alle akzeptieren" }).click();

  await Promise.all([gtagLoaded, fbqLoaded]);
  await expect(banner(page)).toBeHidden();
});

test("'Nur notwendige': Entscheidung gespeichert, weiterhin keine Tracker", async ({ page }) => {
  const trackerRequests = trackerZaehlen(page);

  await page.goto("/");
  await banner(page).getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner(page)).toBeHidden();

  // Reload: Banner bleibt zu, keine Tracker
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(banner(page)).toHaveCount(0);
  expect(trackerRequests).toHaveLength(0);

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "fw_consent")).toBeTruthy();
});

test("nur Statistik gewählt: GA4 lädt, der Pixel nicht", async ({ page }) => {
  const trackerRequests = trackerZaehlen(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Einstellungen" }).click();
  await page.locator("#consent-statistik").check();
  const gtagLoaded = page.waitForRequest(/googletagmanager\.com/, { timeout: 10_000 });
  await banner(page).getByRole("button", { name: "Auswahl speichern" }).click();
  await gtagLoaded;
  await page.waitForTimeout(500);
  expect(trackerRequests.filter((u) => /facebook/.test(u))).toHaveLength(0);
  expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
});

test("Widerruf: Häkchen zeigen die Entscheidung, Entzug lädt neu und der Pixel ist weg", async ({
  page,
  context,
  baseURL,
}) => {
  await einwilligungSetzen(context, baseURL!, { statistik: true, marketing: true });
  await page.goto("/");
  await warteAufPixel(page, 1);
  await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe("function");

  await page.locator("footer").getByRole("button", { name: "Cookie-Einstellungen" }).click();
  await banner(page).getByRole("button", { name: "Einstellungen" }).click();
  await expect(page.locator("#consent-statistik")).toBeChecked();
  await expect(page.locator("#consent-marketing")).toBeChecked();
  await page.locator("#consent-marketing").uncheck();

  await page.evaluate(() => ((window as unknown as { __vorWiderruf: boolean }).__vorWiderruf = true));
  await banner(page).getByRole("button", { name: "Auswahl speichern" }).click();
  await expect
    .poll(async () => {
      try {
        return await page.evaluate(() => ["__vorWiderruf" in window, typeof window.fbq, typeof window.gtag]);
      } catch {
        return ["navigiert"];
      }
    })
    .toEqual([false, "undefined", "function"]);

  const gespeichert = (await context.cookies()).find((c) => c.name === "fw_consent");
  expect(JSON.parse(decodeURIComponent(gespeichert!.value))).toMatchObject({ statistik: true, marketing: false });
});

test("BN-LP lädt den Pixel ohne Einwilligung (Entscheidung Dennis), die Startseite nicht", async ({ page }) => {
  const trackerRequests = trackerZaehlen(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(trackerRequests).toHaveLength(0);

  await page.goto("/black-november/");
  await warteAufPixel(page, 3);
  expect(trackerRequests.filter((u) => /connect\.facebook\.net/.test(u))).toHaveLength(1);
  expect(trackerRequests.filter((u) => /google/.test(u))).toHaveLength(0);
});

test("Banner-Hinweis auf den Pixel ohne Einwilligung nur auf der BN-LP", async ({ page }) => {
  const hinweis = "Auf dieser Aktionsseite messen wir den Erfolg unserer Anzeige mit dem Meta-Pixel auch ohne deine Einwilligung.";
  await page.goto("/black-november/");
  await expect(banner(page).getByText(hinweis)).toBeVisible();
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await expect(banner(page).getByText(hinweis)).toHaveCount(0);
});

test.describe("readConsentCookie (ohne Browser)", () => {
  test.skip(({ isMobile }) => isMobile, "Unit-Test, einmal genügt");
  const g = globalThis as unknown as { document?: { cookie: string } };
  test.afterEach(() => {
    delete g.document;
  });
  const mit = (cookie: string) => {
    g.document = { cookie };
    return readConsentCookie("fw_consent");
  };

  test("liest gültige Entscheidungen, alles andere ist „keine Entscheidung“", () => {
    const wert = encodeURIComponent(JSON.stringify({ statistik: true, marketing: false, ts: "x" }));
    expect(mit(`a=1; fw_consent=${wert}; b=2`)).toEqual({ statistik: true, marketing: false, ts: "x" });
    expect(mit(`fw_consent=${encodeURIComponent('{"statistik":"ja","marketing":true}')}`)).toBeNull();
    expect(mit("fw_consent=%E0%A4%A")).toBeNull();
    expect(mit("fw_consent=kein-json")).toBeNull();
    expect(mit("x_fw_consent=1; andere=2")).toBeNull();
    expect(mit("")).toBeNull();
  });
});
