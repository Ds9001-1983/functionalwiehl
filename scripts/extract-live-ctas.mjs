#!/usr/bin/env node
/**
 * Extrahiert die WhatsApp-/Calendly-/Tel-Links der LIVE-Site als Fixture für
 * den CTA-Regressionstest. Wichtig: Das Live-HTML enthält die URLs
 * entity-kodiert (&#038; / &amp;) — hier wird dekodiert, damit das Fixture die
 * tatsächlichen Klick-Ziele enthält (Superchat-Automation!).
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const html = await (await fetch("https://functional-wiehl.de")).text();

const decode = (s) =>
  s
    .replaceAll("&#038;", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("&#8217;", "’");

const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]));

const fixture = {
  stand: new Date().toISOString(),
  whatsapp: [...new Set(hrefs.filter((h) => h.includes("whatsapp.com") || h.includes("wa.me")))],
  calendly: [...new Set(hrefs.filter((h) => h.includes("calendly.com")))],
  tel: [...new Set(hrefs.filter((h) => h.startsWith("tel:")))],
};

const dest = path.resolve(import.meta.dirname, "../tests/fixtures/live-ctas.json");
await writeFile(dest, JSON.stringify(fixture, null, 2));
console.log(JSON.stringify(fixture, null, 2));
