import { expect, test } from "@playwright/test";

/**
 * Hard-Gating-Nachweis: Vor dem Opt-in darf KEIN Request an Google/Meta
 * rausgehen; nach „Alle akzeptieren" müssen die Tags laden.
 */

const TRACKER = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;

test("vor Consent: keinerlei Tracking-Requests", async ({ page }) => {
  const trackerRequests: string[] = [];
  page.on("request", (req) => {
    if (TRACKER.test(req.url())) trackerRequests.push(req.url());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // etwas scrollen, um Lazy-Trigger auszuschließen (mouse.wheel gibt es in Mobile-WebKit nicht)
  await page.evaluate(() => window.scrollTo({ top: 1500 }));
  await page.waitForTimeout(800);

  expect(trackerRequests).toHaveLength(0);
});

test("nach 'Alle akzeptieren': GA4 + Pixel laden, Banner verschwindet", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await expect(banner).toBeVisible();

  const gtagLoaded = page.waitForRequest(/googletagmanager\.com/, { timeout: 10_000 });
  const fbqLoaded = page.waitForRequest(/connect\.facebook\.net/, { timeout: 10_000 });
  await banner.getByRole("button", { name: "Alle akzeptieren" }).click();

  await Promise.all([gtagLoaded, fbqLoaded]);
  await expect(banner).toBeHidden();
});

test("'Nur notwendige': Entscheidung gespeichert, weiterhin keine Tracker", async ({ page }) => {
  const trackerRequests: string[] = [];
  page.on("request", (req) => {
    if (TRACKER.test(req.url())) trackerRequests.push(req.url());
  });

  await page.goto("/");
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await banner.getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner).toBeHidden();

  // Reload: Banner bleibt zu, keine Tracker
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("dialog", { name: "Cookie-Einstellungen" })).toHaveCount(0);
  expect(trackerRequests).toHaveLength(0);

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "fw_consent")).toBeTruthy();
});
