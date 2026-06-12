import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
  "/impressum/",
  "/datenschutz/",
];

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

test("mobile Navigation öffnet und verlinkt alle Hauptseiten", async ({ page, isMobile }) => {
  test.skip(!isMobile, "nur mobil relevant");
  await page.goto("/");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile Navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Mobile Navigation" }).getByText("Kursplan").click();
  await expect(page).toHaveURL(/\/kursplan\/$/);
});

test("Check-up-Quiz: kompletter Durchlauf bis zur Erfolgsmeldung", async ({ page }) => {
  await page.goto("/gesundheits-check/");
  // Consent-Banner schließen — überlagert auf Mobile sonst die Quiz-Buttons
  await page
    .getByRole("dialog", { name: "Cookie-Einstellungen" })
    .getByRole("button", { name: "Nur notwendige" })
    .click();
  await page.getByRole("button", { name: "🚀 Los geht's!" }).click();

  // Alle Fragen beantworten (erste Option bzw. Zahl), bis der Kontakt-Schritt kommt
  for (let i = 0; i < 30; i++) {
    if (await page.locator("#checkup-name").isVisible().catch(() => false)) break;
    const zahlenfeld = page.locator('input[type="number"]');
    if (await zahlenfeld.isVisible()) {
      await zahlenfeld.fill("80");
    } else {
      await page.locator('button[aria-pressed="false"]').first().click();
    }
    await page.getByRole("button", { name: "Weiter →" }).click();
  }

  await page.locator("#checkup-name").fill("Test Person");
  await page.locator("#checkup-email").fill("test@example.com");
  await page.locator("#checkup-telefon").fill("0151 12345678");
  for (const checkbox of await page.locator('input[type="checkbox"]').all()) {
    await checkbox.check();
  }
  await page.getByRole("button", { name: "🚀 Jetzt absenden" }).click();
  await expect(page.getByText("Dein Check-up wurde erfolgreich übermittelt")).toBeVisible();
});

test("Video lädt erst bei Sichtbarkeit (preload=none + IO-Autoplay)", async ({ page }) => {
  await page.goto("/");
  const video = page.locator("video");
  await expect(video).toHaveAttribute("preload", "none");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-inview", "true", { timeout: 10_000 });
});
