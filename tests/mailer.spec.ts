import { expect, test } from "@playwright/test";
import { erwarteTestMail, holeTestMails } from "./helpers/mails";
import { TEST_ENV } from "./helpers/test-env";

/**
 * lib/mailer.ts im Prod-Build mit MAIL_TRANSPORT=json: Mails gehen nie per SMTP raus,
 * sondern landen in der Testsenke, die P1b/P3a für die Formular-Tests abfragen.
 */
test.describe("Mailer mit JSON-Transport", () => {
  test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

  test("Testmail landet mit Empfänger, Betreff und Text in der Senke", async ({ request }) => {
    const kennung = `Abnahme ${crypto.randomUUID()}`;
    const res = await request.post("/api/test/mails/", {
      data: { an: TEST_ENV.FORM_TO, betreff: `${kennung}\r\nBcc: angreifer@example.invalid`, text: "Hallo\nZeile 2" },
    });
    expect(res.status()).toBe(200);

    const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: kennung });
    expect(mail.an).toEqual([TEST_ENV.FORM_TO]);
    // Header-Injection: Zeilenumbrüche im Betreff werden entfernt, kein zweiter Empfänger
    expect(mail.betreff).toBe(`${kennung} Bcc: angreifer@example.invalid`);
    expect(mail.text).toBe("Hallo\nZeile 2");
  });

  test("Filter greifen: fremder Empfänger findet nichts", async ({ request }) => {
    const kennung = `Abnahme ${crypto.randomUUID()}`;
    await request.post("/api/test/mails/", { data: { an: TEST_ENV.ALERT_TO, betreff: kennung, text: "x" } });
    expect(await holeTestMails(request, { an: "niemand@example.invalid", betreff: kennung })).toHaveLength(0);
    expect(await holeTestMails(request, { an: TEST_ENV.ALERT_TO, betreff: kennung })).toHaveLength(1);
  });

  test("ungültige Testmail-Anfrage → 400", async ({ request }) => {
    const res = await request.post("/api/test/mails/", { data: { an: TEST_ENV.FORM_TO } });
    expect(res.status()).toBe(400);
  });
});
