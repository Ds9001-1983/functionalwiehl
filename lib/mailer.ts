import nodemailer from "nodemailer";
import type { Mail as Transporter } from "nodemailer";

/**
 * Mailversand für Formulare (Check-up, Körpermaße) und Alarme über Alfahosting-SMTP.
 *
 * - Env erst beim Aufruf: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM;
 *   Empfänger über empfaenger("FORM_TO" | "ALERT_TO").
 * - Nur Text-Mails, nodemailer ohne Datei- und URL-Zugriff, TLS ≥ 1.2,
 *   Port 465 = implizites TLS, sonst STARTTLS Pflicht. Die TLS-Prüfung nie abschalten.
 * - Fehlt etwas → MailNichtKonfiguriertError. KEIN „nur loggen“-Fallback: Die Formulare
 *   enthalten Gesundheitsdaten (Art. 9 DSGVO) – nie Inhalte loggen, nur mailFehlerCode().
 * - MAIL_TRANSPORT=json (nur Tests): nodemailer-jsonTransport, die Mail landet in der
 *   Testsenke (globalThis, je Server-Prozess) und ist über GET /api/test/mails/ abrufbar.
 *   Auf Vercel (Preview und Production) gesperrt, dort wirft sendeMail.
 *
 * Ohne "@/"-Importe, damit auch scripts/smtp-check.mjs das Modul direkt laden kann.
 */

export type MailAuftrag = {
  an: string;
  betreff: string;
  text: string;
  /** Reply-To, z. B. die E-Mail der Person aus dem Formular */
  antwortAn?: string;
};

/** Eintrag der Testsenke (nur MAIL_TRANSPORT=json) */
export type TestMail = {
  zeit: string;
  von: string;
  an: string[];
  antwortAn: string | null;
  betreff: string;
  text: string;
};

export class MailNichtKonfiguriertError extends Error {
  constructor(grund: string) {
    super(`Mailversand nicht konfiguriert: ${grund}`);
    this.name = "MailNichtKonfiguriertError";
  }
}

/** Nur code/responseCode eines Fehlers (z. B. "EAUTH/535") – nie Inhalte oder Zugangsdaten. */
export function mailFehlerCode(err: unknown): string {
  if (err instanceof MailNichtKonfiguriertError) return "nicht_konfiguriert";
  const e = err as { code?: unknown; responseCode?: unknown } | null;
  const teile = [e?.code, e?.responseCode].filter((t) => typeof t === "string" || typeof t === "number");
  return teile.length ? teile.join("/") : "unbekannt";
}

/** Empfänger aus der Env (FORM_TO = gym@, ALERT_TO = Dennis), sonst MailNichtKonfiguriertError. */
export function empfaenger(name: "FORM_TO" | "ALERT_TO"): string {
  const wert = process.env[name]?.trim();
  if (!wert) throw new MailNichtKonfiguriertError(name);
  return wert;
}

const SMTP_PFLICHT = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;

/** Transport-Optionen aus der Env – gemeinsam für den Versand und scripts/smtp-check.mjs. */
export function smtpOptionen(env: Record<string, string | undefined> = process.env) {
  const fehlt = SMTP_PFLICHT.filter((name) => !env[name]);
  if (fehlt.length) throw new MailNichtKonfiguriertError(fehlt.join(", "));
  const port = Number(env.SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) throw new MailNichtKonfiguriertError("SMTP_PORT ungültig");
  return {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    tls: { minVersion: "TLSv1.2" as const },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

/** true nur bei MAIL_TRANSPORT=json außerhalb von Vercel – dann ist die Testsenke aktiv. */
export function testTransportAktiv(): boolean {
  return process.env.MAIL_TRANSPORT === "json" && !process.env.VERCEL;
}

const SENKE_MAX = 200;

function testSenke(): TestMail[] {
  // globalThis statt Modulvariable: Route-Bundles können eigene Modulkopien haben
  const g = globalThis as typeof globalThis & { __fwTestMails?: TestMail[] };
  g.__fwTestMails ??= [];
  return g.__fwTestMails;
}

/** Inhalt der Testsenke, älteste zuerst (leer, wenn der Testtransport nicht aktiv ist). */
export function testMails(): readonly TestMail[] {
  return testTransportAktiv() ? testSenke() : [];
}

const neuerJsonTransport = () =>
  nodemailer.createTransport({ jsonTransport: true, disableFileAccess: true, disableUrlAccess: true });

let smtpTransport: Transporter | undefined;
let jsonTransport: ReturnType<typeof neuerJsonTransport> | undefined;

/**
 * Verschickt eine Text-Mail. Wirft MailNichtKonfiguriertError (Route: 503) oder den
 * SMTP-Fehler (Route: 502, geloggt nur per mailFehlerCode).
 */
export async function sendeMail(mail: MailAuftrag): Promise<void> {
  if (!mail.an.trim()) throw new MailNichtKonfiguriertError("Empfänger fehlt");
  // Header-Injection: Zeilenumbrüche im Betreff entfernen
  const betreff = mail.betreff.replace(/[\r\n]+/g, " ").trim();

  if (process.env.MAIL_TRANSPORT === "json") {
    if (!testTransportAktiv()) throw new MailNichtKonfiguriertError("MAIL_TRANSPORT=json ist auf Vercel gesperrt");
    jsonTransport ??= neuerJsonTransport();
    const von = process.env.SMTP_FROM || "Functional Wiehl Website <abnahme@example.invalid>";
    const info = await jsonTransport.sendMail({ from: von, to: mail.an, replyTo: mail.antwortAn, subject: betreff, text: mail.text });
    const nachricht = JSON.parse(info.message) as { subject?: string; text?: string };
    const senke = testSenke();
    senke.push({
      zeit: new Date().toISOString(),
      von,
      an: info.envelope.to,
      antwortAn: mail.antwortAn ?? null,
      betreff: nachricht.subject ?? "",
      text: nachricht.text ?? "",
    });
    if (senke.length > SENKE_MAX) senke.splice(0, senke.length - SENKE_MAX);
    return;
  }

  const optionen = smtpOptionen();
  smtpTransport ??= nodemailer.createTransport(optionen);
  await smtpTransport.sendMail({
    from: process.env.SMTP_FROM,
    to: mail.an,
    replyTo: mail.antwortAn,
    subject: betreff,
    text: mail.text,
  });
}
