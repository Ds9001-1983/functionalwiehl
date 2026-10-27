#!/usr/bin/env node
/**
 * Extrahiert die CTA-Ziele der LIVE-Site (WordPress) als Fixture für den
 * CTA-Regressionstest (tests/cta.spec.ts). Die Superchat-Automation hängt an
 * byte-genau diesen Links – die Fixture ist die Quelle der Wahrheit für lib/cta.ts.
 *
 * Aufruf (Stand 27.10.2026 aus dem Archiv, gitignored):
 *   node scripts/extract-live-ctas.mjs \
 *     --html-home assets/raw/live-2026-10-27/home.html \
 *     --html-bn assets/raw/live-2026-10-27/bn.html \
 *     --html-impressum assets/raw/live-2026-10-27/impressum.html
 * Ohne Optionen werden die drei Seiten live geholt (mit Browser-User-Agent).
 *
 * Bricht ab, sobald ein HTML "/_next/" enthält: Dann läuft live schon das Redesign,
 * und die Fixture würde den Nachbau gegen sich selbst prüfen. Nach dem Umschalten
 * die Fixture also NIE neu ziehen.
 *
 * Wichtig: Das Live-HTML enthält URLs teils entity-kodiert (&#038; / &amp;) — hier
 * wird dekodiert, damit die Fixture die tatsächlichen Klick-Ziele enthält.
 */
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const LIVE = "https://functional-wiehl.de";
const SEITEN = {
  home: { option: "--html-home", url: `${LIVE}/` },
  bn: { option: "--html-bn", url: `${LIVE}/black-november/` },
  impressum: { option: "--html-impressum", url: `${LIVE}/impressum/` },
};
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 FW-CTA-Fixture/2.0";

function abbruch(meldung) {
  console.error(`✗ ${meldung}`);
  process.exit(1);
}

function argument(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return null;
  const wert = process.argv[i + 1];
  if (!wert || wert.startsWith("--")) abbruch(`${name} braucht einen Dateipfad`);
  return wert;
}

/** Lädt eine Seite aus Datei (Option) oder live; liefert HTML, Quelle und Zeitpunkt. */
async function ladeSeite(name, { option, url }) {
  const datei = argument(option);
  let html, quelle, zeit;
  if (datei) {
    html = await readFile(datei, "utf8");
    quelle = path.basename(datei);
    zeit = (await stat(datei)).mtime;
  } else {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) abbruch(`${url} antwortet mit ${res.status}`);
    html = await res.text();
    quelle = url;
    zeit = new Date();
  }
  if (html.includes("/_next/")) {
    abbruch(`${name}: HTML enthält "/_next/" – live läuft schon das Redesign, Fixture bleibt eingefroren.`);
  }
  return { html, quelle, zeit };
}

const decode = (s) =>
  s
    .replaceAll("&#038;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("&#8217;", "’");

const hrefsAus = (html) => [...html.matchAll(/href=(["'])(.*?)\1/g)].map((m) => decode(m[2]));

function host(href) {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

const istWhatsApp = (h) => host(h) === "wa.me" || h.startsWith("https://api.whatsapp.com/send");
const eindeutig = (liste) => [...new Set(liste)].sort();

/** Fasst ein Alphabet zu einer Zeichenklasse zusammen (Buchstaben vor Ziffern), z. B. A-HJ-NP-Z2-9. */
function zeichenklasse(alphabet) {
  const gruppe = (zeichen) => {
    const codes = [...new Set(zeichen)].map((c) => c.charCodeAt(0)).sort((a, b) => a - b);
    let aus = "";
    for (let i = 0; i < codes.length; ) {
      let j = i;
      while (j + 1 < codes.length && codes[j + 1] === codes[j] + 1) j++;
      const von = String.fromCharCode(codes[i]);
      const bis = String.fromCharCode(codes[j]);
      aus += j - i >= 2 ? `${von}-${bis}` : codes.slice(i, j + 1).map((c) => String.fromCharCode(c)).join("");
      i = j + 1;
    }
    return aus;
  };
  const zeichen = [...alphabet];
  return gruppe(zeichen.filter((c) => /[A-Z]/.test(c))) + gruppe(zeichen.filter((c) => /[0-9]/.test(c)));
}

/** Liest den Black-November-Block aus Snippet #6 (Inline-Script der LP). */
function bnBlock(html, homeHrefs) {
  const treffer = (re, was) => html.match(re)?.[1] ?? abbruch(`BN: ${was} nicht gefunden`);
  const nummer = treffer(/var WA = '(\d+)';/, "WhatsApp-Nummer (var WA)");
  const text = treffer(/var msg = '((?:[^'\\]|\\.)*)' \+ code;/, "Nachricht (var msg)").replace(/\\(.)/g, "$1");
  if (!html.includes("'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg)")) {
    abbruch("BN: URL-Aufbau 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) nicht gefunden");
  }
  const zeichen = treffer(/var c = '([A-Z0-9]+)'/, "Code-Alphabet (var c)");
  const laenge = Number(treffer(/for \(var i = 0; i < (\d+); i\+\+\) \{ s \+= c\.charAt/, "Code-Länge"));
  const praefix = treffer(/return '([A-Z]+-)' \+ s;/, "Code-Präfix");

  const noscriptLinks = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)]
    .flatMap((m) => hrefsAus(m[1]))
    .filter(istWhatsApp);
  if (noscriptLinks.length !== 1) abbruch(`BN: erwartet genau 1 WhatsApp-Link im <noscript>, gefunden ${noscriptLinks.length}`);

  const teaser = eindeutig(homeHrefs.filter((h) => h.includes("/black-november/")));
  if (teaser.length !== 1) abbruch(`Startseite: erwartet genau 1 Link auf /black-november/, gefunden ${teaser.length}`);

  return {
    text,
    prefix: `https://wa.me/${nummer}?text=${encodeURIComponent(text)}`,
    noscript: noscriptLinks[0],
    zeichen,
    codeRegex: `^${praefix}[${zeichenklasse(zeichen)}]{${laenge}}$`,
    teaser: teaser[0],
  };
}

const seiten = {};
for (const [name, def] of Object.entries(SEITEN)) seiten[name] = await ladeSeite(name, def);

const hrefs = Object.fromEntries(Object.entries(seiten).map(([name, s]) => [name, hrefsAus(s.html)]));
const alle = Object.values(hrefs).flat();
const bn = bnBlock(seiten.bn.html, hrefs.home);

const fixture = {
  stand: new Date(Math.max(...Object.values(seiten).map((s) => s.zeit.getTime()))).toISOString(),
  quelle: Object.fromEntries(Object.entries(seiten).map(([name, s]) => [name, s.quelle])),
  // der noscript-Link der LP ist eine eigene Variante (bn.noscript), keine Superchat-CTA der Website
  whatsapp: eindeutig(alle.filter((h) => istWhatsApp(h) && h !== bn.noscript)),
  calendly: eindeutig(alle.filter((h) => host(h) === "calendly.com")),
  tel: eindeutig(alle.filter((h) => h.startsWith("tel:"))),
  mailto: eindeutig(alle.filter((h) => h.startsWith("mailto:"))),
  bn,
};

const dest = path.resolve(import.meta.dirname, "../tests/fixtures/live-ctas.json");
await writeFile(dest, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(JSON.stringify(fixture, null, 2));
