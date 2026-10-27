#!/usr/bin/env node
/**
 * Prüft die SMTP-Verbindung (Login + TLS) OHNE eine Mail zu senden:
 *   npm run check:smtp   (liest .env.local, falls vorhanden)
 * Ohne vollständige SMTP_*-Env bricht es mit Hinweis ab. Passwörter werden nie ausgegeben.
 */
import nodemailer from "nodemailer";

const PFLICHT = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const fehlend = PFLICHT.filter((name) => !process.env[name]);
if (fehlend.length) {
  console.error(`SMTP nicht konfiguriert, es fehlt: ${fehlend.join(", ")}`);
  console.error("Werte in .env.local eintragen (Vorlage: .env.example) und erneut starten.");
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  requireTLS: port !== 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { minVersion: "TLSv1.2" },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

try {
  await transporter.verify();
  console.log(`SMTP OK: ${process.env.SMTP_HOST}:${port} als ${process.env.SMTP_USER}`);
} catch (err) {
  console.error(`SMTP-Fehler: ${err?.code ?? "unbekannt"}${err?.responseCode ? ` (${err.responseCode})` : ""}`);
  process.exit(1);
}
