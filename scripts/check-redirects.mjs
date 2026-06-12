#!/usr/bin/env node
/**
 * Prüft die 301-Redirect-Map gegen einen laufenden Server:
 *   node scripts/check-redirects.mjs [http://localhost:3000]
 * Beim Cutover gegen https://functional-wiehl.de ausführen (docs/TODO-cutover.md).
 */
import { REDIRECTS } from "../content/redirects.ts";

const base = process.argv[2] ?? "http://localhost:3000";
let fehler = 0;

for (const { source, destination } of REDIRECTS) {
  const res = await fetch(`${base}${source}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const erwartet = destination.split("#")[0]; // Fragment kommt beim Browser an, nicht im Location-Vergleich nötig
  const ok =
    [301, 308].includes(res.status) &&
    (location.includes(erwartet) || location.includes(destination));
  if (!ok) {
    fehler++;
    console.error(`✗ ${source} → ${res.status} ${location} (erwartet: ${destination})`);
  } else {
    console.log(`✓ ${source} → ${destination}`);
  }
}

if (fehler) {
  console.error(`\n${fehler} Redirect(s) fehlerhaft`);
  process.exit(1);
}
console.log("\nAlle Redirects korrekt.");
