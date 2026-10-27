import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ENTFALLENE_ROUTEN } from "../content/redirects";

// Alle Seiten der Website (P2a ergänzt die Landingpage /black-november/ in eigenen Tests)
const SEITEN = ["/", "/koerpermasse/", "/impressum/", "/datenschutz/", "/barrierefreiheit/"];

async function consentSchliessen(page: Page) {
  // Consent-Banner überlagert auf Mobile sonst Buttons und Menü
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  await banner.getByRole("button", { name: "Nur notwendige" }).click();
  await expect(banner).toBeHidden();
}

for (const seite of SEITEN) {
  test(`${seite}: rendert, genau eine H1, keine kritischen A11y-Fehler`, async ({ page }) => {
    const antwort = await page.goto(seite);
    expect(antwort?.status()).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);

    const axe = await new AxeBuilder({ page })
      .disableRules(["meta-viewport"]) // Next.js setzt viewport selbst
      .analyze();
    const kritisch = axe.violations.filter((v) => v.impact === "critical");
    expect(
      kritisch,
      kritisch.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`).join("\n")
    ).toHaveLength(0);
  });
}

test("entfallene Unterseiten leiten per 308 weiter (Ziele: tests/redirects.spec.ts)", async ({ request, isMobile }) => {
  test.skip(isMobile, "reine HTTP-Prüfung, einmal genügt");
  for (const route of ENTFALLENE_ROUTEN) {
    const res = await request.get(route, { maxRedirects: 0 });
    expect(res.status(), route).toBe(308);
    expect(res.headers()["location"], route).toMatch(/^\/(#|$)/);
  }
});

test("mobile Navigation: Anker-Link schließt das Menü und scrollt zur Section", async ({ page, isMobile }) => {
  test.skip(!isMobile, "nur mobil relevant");
  await page.goto("/");
  await consentSchliessen(page);
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const navi = page.getByRole("navigation", { name: "Mobile Navigation" });
  await expect(navi).toBeVisible();
  await navi.getByRole("link", { name: /^preise$/i }).click();
  await expect(navi).toBeHidden();
  await expect(page).toHaveURL(/\/#preise$/);
  await expect(page.locator("#preise")).toBeInViewport();
});

test("Check-up-Quiz auf der Startseite: Durchlauf bis zur Erfolgsmeldung (Versand gemockt)", async ({ page }) => {
  // Nie echte Mails: die API wird abgefangen, geprüft wird nur der Vertrag des Payloads
  let payload: Record<string, unknown> | null = null;
  await page.route("**/api/checkup**", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true } });
  });

  await page.goto("/");
  await consentSchliessen(page);
  const quiz = page.locator("#checkup");
  await quiz.getByRole("button", { name: /Los geht/ }).click();

  // Jede Frage beantworten (erste freie Option bzw. Zahlen), bis der Kontakt-Schritt kommt
  const email = quiz.locator('input[type="email"]');
  for (let runde = 0; runde < 40 && !(await email.isVisible()); runde++) {
    for (const zahl of await quiz.locator('input[type="number"]').all()) await zahl.fill("80");
    const option = quiz.locator('button[aria-pressed="false"]').first();
    if ((await quiz.locator('input[type="number"]').count()) === 0 && (await option.count()) > 0) {
      await option.click();
    }
    await quiz.getByRole("button", { name: /Weiter/ }).click();
  }

  await quiz.getByLabel(/Name/).fill("Test Person");
  await email.fill("test@example.com");
  await quiz.getByLabel(/Telefon/).fill("0151 12345678");
  for (const checkbox of await quiz.locator('input[type="checkbox"]').all()) await checkbox.check();
  await quiz.getByRole("button", { name: /absenden/ }).click();

  await expect(quiz.getByText(/erfolgreich übermittelt/)).toBeVisible();
  expect(payload).toMatchObject({
    kontakt: { name: "Test Person", email: "test@example.com", telefon: "0151 12345678" },
  });
});

test("Video lädt erst bei Sichtbarkeit (preload=none + IO-Autoplay)", async ({ page }) => {
  await page.goto("/");
  // Das lazy Studio-Video trägt als einziges data-inview (das Hero-Video ist ein separates,
  // performance-optimiertes Element ohne IntersectionObserver).
  const video = page.locator("video[data-inview]");
  await expect(video).toHaveAttribute("preload", "none");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-inview", "true", { timeout: 10_000 });
});
