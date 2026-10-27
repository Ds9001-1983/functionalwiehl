#!/usr/bin/env node
/**
 * Prüft die 308-Redirect-Map gegen einen laufenden Server:
 *   node scripts/check-redirects.mjs [http://localhost:3000]
 * Nach dem Umschalten gegen https://functional-wiehl.de ausführen (Runbook docs/TODO-cutover.md).
 * Die lokale Abnahme prüft dasselbe in tests/redirects.spec.ts.
 *
 * Vergleich EXAKT (Pfad + Query + Fragment), nicht per includes(): Bei Zielen wie "/" oder
 * "/#preise" wäre ein Teilstring-Vergleich immer wahr und würde nichts prüfen.
 */
import { KEINE_WEITERLEITUNG, REDIRECTS } from "../content/redirects.ts";

const base = process.argv[2] ?? "http://localhost:3000";
let fehler = 0;

function melde(ok, text) {
  if (ok) console.log(`✓ ${text}`);
  else {
    fehler++;
    console.error(`✗ ${text}`);
  }
}

/** Location-Header → Pfad + Query + Fragment; null bei fremdem Host. */
function ziel(location) {
  if (!location) return null;
  const url = new URL(location, base);
  if (url.origin !== new URL(base).origin) return null;
  return url.pathname + url.search + url.hash;
}

for (const { source, destination } of REDIRECTS) {
  // WordPress-Form mit Slash und die Form ohne Slash: je genau ein Sprung aufs Ziel
  const formen = source.endsWith(".xml") || source.endsWith(".jpg") ? [source] : [source, `${source}/`];
  for (const pfad of formen) {
    const res = await fetch(`${base}${pfad}`, { redirect: "manual" });
    const ist = ziel(res.headers.get("location"));
    melde(res.status === 308 && ist === destination, `${pfad} → ${res.status} ${ist} (erwartet 308 ${destination})`);
  }
}

// Query (UTM, fbclid) bleibt erhalten und steht vor dem Fragment
{
  const res = await fetch(`${base}/preise/?utm_source=x&fbclid=abc`, { redirect: "manual" });
  const ist = ziel(res.headers.get("location"));
  melde(res.status === 308 && ist === "/?utm_source=x&fbclid=abc#preise", `/preise/?utm_source=x&fbclid=abc → ${res.status} ${ist}`);
}

// Bleibende Seiten und die Ad-URL der Landingpage: 200 ohne Weiterleitung
for (const pfad of [...KEINE_WEITERLEITUNG, "/black-november/?utm_source=facebook&utm_campaign=bn26&fbclid=x"]) {
  const res = await fetch(`${base}${pfad}`, { redirect: "manual" });
  melde(res.status === 200, `${pfad} → ${res.status} (erwartet 200)`);
}

if (fehler) {
  console.error(`\n${fehler} Prüfung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("\nAlle Redirects korrekt.");
