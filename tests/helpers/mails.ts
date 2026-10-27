import { expect, type APIRequestContext } from "@playwright/test";
import type { TestMail } from "../../lib/mailer";

/**
 * Zugriff auf die Testsenke des JSON-Mailtransports (GET /api/test/mails/).
 * Die Senke ist für alle Worker gemeinsam (ein Server-Prozess) – deshalb immer nach
 * einem eindeutigen Betreff-Teil filtern, z. B. einem Namen mit Zufallsanteil.
 *
 * Beispiel (Formular-Test):
 *   const mail = await erwarteTestMail(request, { an: TEST_ENV.FORM_TO, betreff: "Test Person 4711" });
 *   expect(mail.text).toContain("…");
 */
export type MailFilter = { an?: string; betreff?: string };

export async function holeTestMails(request: APIRequestContext, filter: MailFilter = {}): Promise<TestMail[]> {
  const params = new URLSearchParams();
  if (filter.an) params.set("an", filter.an);
  if (filter.betreff) params.set("betreff", filter.betreff);
  const res = await request.get(`/api/test/mails/?${params}`);
  expect(res.status(), "Testsenke nicht aktiv – läuft der Server mit MAIL_TRANSPORT=json?").toBe(200);
  return ((await res.json()) as { mails: TestMail[] }).mails;
}

/** Wartet, bis genau eine passende Mail in der Senke liegt, und liefert sie. */
export async function erwarteTestMail(request: APIRequestContext, filter: MailFilter): Promise<TestMail> {
  let treffer: TestMail[] = [];
  await expect
    .poll(async () => (treffer = await holeTestMails(request, filter)).length, {
      message: `Mail an ${filter.an ?? "?"} mit Betreff „${filter.betreff ?? ""}“`,
      timeout: 5_000,
    })
    .toBe(1);
  return treffer[0];
}
