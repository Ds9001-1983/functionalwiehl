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
  "/koerpermasse/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
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

// Check-up-Quiz (27 Schritte, Versand, Fehlerfälle): tests/checkup.spec.ts

test("Video lädt erst bei Sichtbarkeit (preload=none + IO-Autoplay)", async ({ page }) => {
  await page.goto("/");
  // Das lazy VideoSection-Video trägt als einziges data-inview (das Hero-Video
  // ist ein separates, performance-optimiertes Element ohne IntersectionObserver).
  const video = page.locator("video[data-inview]");
  await expect(video).toHaveAttribute("preload", "none");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-inview", "true", { timeout: 10_000 });
});
