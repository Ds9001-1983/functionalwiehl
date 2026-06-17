import { expect, test } from "@playwright/test";
import { CTA } from "../lib/cta";

async function dismissConsent(page: import("@playwright/test").Page) {
  // Consent-Sheet (bottom) verdeckt sonst die Toolbar/FAB unten.
  // Deterministisch auf das (client-seitig gemountete) Banner warten, sonst
  // greift auf langsamen Mobile-Emulationen eine Race-Condition.
  const banner = page.getByRole("dialog", { name: "Cookie-Einstellungen" });
  try {
    await banner.waitFor({ state: "visible", timeout: 5_000 });
    await banner.getByRole("button", { name: "Nur notwendige" }).click();
    await banner.waitFor({ state: "hidden", timeout: 5_000 });
  } catch {
    /* Kein Banner (Consent bereits gesetzt) — nichts zu tun */
  }
}

test("WhatsApp-FAB: nur Desktop sichtbar, führt auf den Probetraining-Link", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await dismissConsent(page);

  const fab = page.getByRole("link", { name: /Per WhatsApp schreiben/ });
  if (isMobile) {
    await expect(fab).toBeHidden();
  } else {
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute("href", CTA.whatsappProbetraining);
  }
});

test("WhatsApp-FAB ist auf Rechts-/Erklärungsseiten ausgeblendet", async ({ page }) => {
  await page.goto("/barrierefreiheit/");
  await dismissConsent(page);
  await expect(page.getByRole("link", { name: /Per WhatsApp schreiben/ })).toHaveCount(0);
});

test("Barrierefreiheits-Leiste: Schrift, Kontrast & Persistenz", async ({ page }) => {
  await page.goto("/");
  await dismissConsent(page);

  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-fontscale", "0");

  // Leiste öffnen
  await page.getByRole("button", { name: "Barrierefreiheit", exact: true }).click();
  const panel = page.getByRole("dialog", { name: /Barrierefreiheit/ });
  await expect(panel).toBeVisible();

  // Schrift vergrößern → data-fontscale steigt
  await panel.getByRole("button", { name: "Schrift vergrößern" }).click();
  await expect(html).toHaveAttribute("data-fontscale", "1");

  // Kontrast & Links hervorheben → Klassen am <html>
  await panel.getByRole("button", { name: /Kontrast erhöhen/ }).click();
  await panel.getByRole("button", { name: /Links hervorheben/ }).click();
  await expect(html).toHaveClass(/a11y-contrast/);
  await expect(html).toHaveClass(/a11y-highlight-links/);

  // Persistenz: Reload behält Einstellungen (localStorage + Inline-Script)
  await page.reload();
  await expect(html).toHaveAttribute("data-fontscale", "1");
  await expect(html).toHaveClass(/a11y-contrast/);

  // Zurücksetzen
  await page.getByRole("button", { name: "Barrierefreiheit", exact: true }).click();
  await page.getByRole("button", { name: /Zurücksetzen/ }).click();
  await expect(html).toHaveAttribute("data-fontscale", "0");
  await expect(html).not.toHaveClass(/a11y-contrast/);
});

test("Skip-Link wird bei Tastaturfokus sichtbar und springt zum Inhalt", async ({ page }) => {
  await page.goto("/");
  await dismissConsent(page);
  const skip = page.getByRole("link", { name: "Zum Inhalt springen" });
  await skip.focus();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute("href", "#inhalt");
});
