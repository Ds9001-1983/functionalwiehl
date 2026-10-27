#!/usr/bin/env node
/**
 * Prüft die SMTP-Verbindung (TLS + Login) OHNE eine Mail zu senden:
 *   npm run check:smtp   (liest .env.local, falls vorhanden)
 * Nutzt dieselben Transport-Optionen wie der Versand (lib/mailer.ts → smtpOptionen).
 * Ohne vollständige SMTP_*-Env bricht es mit Hinweis ab. Passwörter werden nie ausgegeben.
 */
import nodemailer from "nodemailer";
import { MailNichtKonfiguriertError, mailFehlerCode, smtpOptionen } from "../lib/mailer.ts";

let optionen;
try {
  optionen = smtpOptionen();
} catch (err) {
  if (!(err instanceof MailNichtKonfiguriertError)) throw err;
  console.error(err.message);
  console.error("Werte in .env.local eintragen (Vorlage: .env.example) und erneut starten.");
  process.exit(1);
}

try {
  await nodemailer.createTransport(optionen).verify();
  console.log(`SMTP OK: ${optionen.host}:${optionen.port} als ${optionen.auth.user}`);
} catch (err) {
  console.error(`SMTP-Fehler: ${mailFehlerCode(err)}`);
  process.exit(1);
}
