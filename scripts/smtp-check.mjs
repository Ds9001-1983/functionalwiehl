#!/usr/bin/env node
/**
 * Prüft den Mailversand über Alfahosting-SMTP mit denselben Transport-Optionen wie der
 * Versand (lib/mailer.ts → smtpOptionen):
 *
 *   npm run check:smtp                       TLS + Login prüfen, sendet NICHTS
 *   npm run check:smtp -- --an <adresse>     zusätzlich genau EINE Testmail (ohne Formulardaten),
 *                                            danach im Postfach SPF, DKIM (Selector cloudpit) und
 *                                            DMARC im Header prüfen (docs/TODO-cutover.md)
 *   npm run check:smtp -- --nur-env          nur die Env-Werte prüfen, keine Verbindung
 *
 * Liest .env.local, falls vorhanden (Vorlage: .env.example). Passwörter werden nie ausgegeben.
 * Exit-Code: 0 = OK, 1 = Konfiguration oder SMTP fehlerhaft, 2 = Aufruf falsch.
 */
import { parseArgs } from "node:util";
import nodemailer from "nodemailer";
import { MailNichtKonfiguriertError, mailFehlerCode, smtpOptionen } from "../lib/mailer.ts";

const HILFE = "Aufruf: npm run check:smtp [-- --an <adresse>] [-- --nur-env]";

let argumente;
try {
  argumente = parseArgs({
    options: {
      an: { type: "string" },
      "nur-env": { type: "boolean" },
      hilfe: { type: "boolean", short: "h" },
    },
    strict: true,
  }).values;
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  console.error(HILFE);
  process.exit(2);
}
if (argumente.hilfe) {
  console.log(HILFE);
  process.exit(0);
}
if (argumente.an !== undefined && !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(argumente.an)) {
  console.error(`--an erwartet genau eine E-Mail-Adresse, erhalten: „${argumente.an}“`);
  process.exit(2);
}

const env = process.env;

// ── Env-Prüfung (Hinweise, brechen nicht ab) ─────────────────────────────────────
const warnungen = [];
const host = (env.SMTP_HOST ?? "").trim().toLowerCase();
if (/(^|\.)functional-wiehl\.de$/.test(host)) {
  // Zertifikat dort: CN=*.alfahosting-server.de → TLS-Prüfung scheitert (design-p3, Kurzfazit)
  warnungen.push(`SMTP_HOST=${host}: Das Zertifikat lautet auf *.alfahosting-server.de. Richtig ist alfa3102.alfahosting-server.de.`);
}
if (env.SMTP_PORT && !["465", "587"].includes(env.SMTP_PORT.trim())) {
  warnungen.push(`SMTP_PORT=${env.SMTP_PORT}: erwartet 465 (TLS) oder 587 (STARTTLS).`);
}
const absender = /<([^<>]+)>\s*$/.exec(env.SMTP_FROM ?? "")?.[1] ?? env.SMTP_FROM ?? "";
if (absender && env.SMTP_USER && absender.trim().toLowerCase() !== env.SMTP_USER.trim().toLowerCase()) {
  warnungen.push(`SMTP_FROM (${absender.trim()}) weicht vom Login SMTP_USER ab: Der Server kann fremde Absender ablehnen, SPF/DMARC passen dann nicht.`);
}
for (const name of ["FORM_TO", "ALERT_TO"]) {
  if (!env[name]?.trim()) warnungen.push(`${name} fehlt: ${name === "FORM_TO" ? "Formulare antworten mit 503." : "Alarm-Mails gehen nicht raus."}`);
}
if (env.MAIL_TRANSPORT) {
  warnungen.push(`MAIL_TRANSPORT=${env.MAIL_TRANSPORT} ist nur für Tests gedacht und darf in Vercel nie gesetzt sein.`);
}

let optionen;
try {
  optionen = smtpOptionen(env);
} catch (err) {
  if (!(err instanceof MailNichtKonfiguriertError)) throw err;
  for (const w of warnungen) console.warn(`WARNUNG: ${w}`);
  console.error(err.message);
  console.error("Werte in .env.local eintragen (Vorlage: .env.example) und erneut starten.");
  process.exit(1);
}

for (const w of warnungen) console.warn(`WARNUNG: ${w}`);
const ziel = `${optionen.host}:${optionen.port} (${optionen.secure ? "TLS" : "STARTTLS"}) als ${optionen.auth.user}`;

if (argumente["nur-env"]) {
  console.log(`Env vollständig: ${ziel}. Keine Verbindung aufgebaut (--nur-env).`);
  process.exit(0);
}

// ── Verbindung, Login und optional eine Testmail ─────────────────────────────────
const transport = nodemailer.createTransport(optionen);
try {
  await transport.verify();
  console.log(`SMTP OK: ${ziel}`);

  if (argumente.an) {
    const zeit = new Date().toISOString();
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to: argumente.an,
      subject: "Testmail functional-wiehl.de (check:smtp)",
      text: [
        "Diese Testmail kommt von scripts/smtp-check.mjs (npm run check:smtp).",
        `Server: ${optionen.host}:${optionen.port}, Zeit: ${zeit}`,
        "Sie enthält keine Formulardaten.",
        "",
        "Bitte im Header prüfen: spf=pass, dkim=pass (Selector cloudpit), dmarc=pass.",
      ].join("\n"),
    });
    const code = String(info.response ?? "").split(" ")[0];
    console.log(`Testmail an ${argumente.an} angenommen (SMTP ${code || "?"}, ${info.messageId}).`);
    console.log("Jetzt im Postfach die Header prüfen: spf=pass, dkim=pass (Selector cloudpit), dmarc=pass.");
  }
} catch (err) {
  console.error(`SMTP-Fehler: ${mailFehlerCode(err)}`);
  process.exitCode = 1;
} finally {
  transport.close();
}
