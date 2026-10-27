#!/usr/bin/env node
/**
 * Extrahiert den Fitness- & Gesundheits-Check-up der LIVE-Startseite (WordPress, Code-Modul
 * #checkup) als Fixture für tests/checkup-logik.spec.ts. Die Fixture belegt, dass
 * content/checkup-fragen.ts Titel, Zähler, Feldnamen, Werte, Icons und Sprünge wörtlich
 * wie live führt.
 *
 * Aufruf (Stand 27.10.2026 aus dem Archiv, gitignored):
 *   node scripts/extract-live-checkup.mjs --html-home assets/raw/live-2026-10-27/home.html
 *
 * Bricht ab, sobald das HTML "/_next/" enthält (dann läuft live schon das Redesign).
 * Nach dem Umschalten die Fixture also NIE neu ziehen.
 */
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ZIEL = "tests/fixtures/live-checkup.json";

function abbruch(meldung) {
  console.error(`✗ ${meldung}`);
  process.exit(1);
}

const i = process.argv.indexOf("--html-home");
const datei = i === -1 ? null : process.argv[i + 1];
if (!datei || datei.startsWith("--")) abbruch("--html-home <datei> fehlt");

const html = await readFile(datei, "utf8");
if (html.includes("/_next/")) abbruch('HTML enthält "/_next/" – live läuft schon das Redesign, Fixture bleibt eingefroren.');

const decode = (s) =>
  s
    .replaceAll("&#038;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("&#8217;", "’")
    .replaceAll("<br />", "\n")
    .trim();

const erster = (re, text) => {
  const m = text.match(re);
  return m ? decode(m[1]) : undefined;
};

/** Argumente eines onclick-Aufrufs: 'text' → String, 7 → Zahl als String, this → entfällt */
const argumente = (roh) =>
  [...roh.matchAll(/'((?:[^'\\]|\\.)*)'|(\d+)/g)].map((m) => decode(m[1] ?? m[2]));

// Nur das eingebettete Quiz-Dokument (zwischen <div id="checkup" … und dem Ende seines Scripts)
const start = html.indexOf('id="question-1"');
const ende = html.indexOf("})();</script>", start);
if (start === -1 || ende === -1) abbruch("Quiz (#question-1 … Script) nicht gefunden");
const quiz = html.slice(html.lastIndexOf("<div", start), ende);

const bloecke = quiz.split(/(?=<div class="question-container[^"]*" id=")/).filter((b) => b.startsWith("<div class=\"question-container"));

const schritte = [];
let startSchritt, kontakt, erfolg;

for (const block of bloecke) {
  const id = block.match(/id="(?:question-)?([^"]+)"/)[1];
  const zaehler = block.match(/progress-text">Frage (\d+) von (\d+)</);
  const titel = erster(/question-title">([\s\S]*?)<\/div>/, block);
  const untertitel = erster(/question-subtitle">([\s\S]*?)<\/div>/, block);

  if (id === "1") {
    startSchritt = { nummer: Number(zaehler[1]), gesamt: Number(zaehler[2]), titel, untertitel, button: erster(/<button class="btn"[^>]*>([\s\S]*?)<\/button>/, block) };
    continue;
  }
  if (id === "27") {
    kontakt = {
      nummer: Number(zaehler[1]),
      titel,
      felder: [...block.matchAll(/<label for="([^"]+)">([\s\S]*?)<\/label><input id="\1" type="(\w+)"/g)].map((m) => ({
        id: m[1],
        label: decode(m[2]),
        typ: m[3],
      })),
      einwilligung: erster(/<label for="privacy-consent">([\s\S]*?)<\/label>/, block),
      sendet: erster(/<p>(Check-up wird versendet[^<]*)<\/p>/, block),
      buttons: [...block.matchAll(/<button class="btn[^"]*"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => decode(m[1])),
    };
    continue;
  }
  if (id === "fwq-success") {
    erfolg = { titel: erster(/<h2>([\s\S]*?)<\/h2>/, block), text: erster(/<p>([\s\S]*?)<\/p>/, block) };
    continue;
  }

  const optionen = [...block.matchAll(/<div class="answer-option( multiple-choice)?" onclick="(selectAnswer|toggleMultipleChoice)\((.*?)\)">\s*<span class="icon">([\s\S]*?)<\/span>\s*<span>([\s\S]*?)<\/span>/g)].map(
    (m) => {
      const args = argumente(m[3]);
      return m[2] === "selectAnswer"
        ? { key: args[0], wert: args[1], weiter: args[2], icon: decode(m[4]), label: decode(m[5]) }
        : { key: args[0], wert: args[1], icon: decode(m[4]), label: decode(m[5]) };
    }
  );
  const schritt = { id, nummer: Number(zaehler[1]), titel, ...(untertitel ? { untertitel } : {}) };

  if (block.includes('id="current-weight"')) {
    const naechster = quiz.match(/formData\.wunschgewicht=tw;\s*nextQuestion\((\w+)\)/)[1];
    schritte.push({
      ...schritt,
      typ: "gewicht",
      felder: [...block.matchAll(/<label for="([^"]+)">([\s\S]*?)<\/label>\s*<input type="number" id="\1" placeholder="([^"]*)"/g)].map((m) => ({
        id: m[1],
        label: decode(m[2]),
        platzhalter: decode(m[3]),
      })),
      weiter: naechster,
    });
  } else if (block.includes("multiple-choice")) {
    const weiter = block.match(/saveMultipleAndContinue\('(\w+)', (\w+)\)/);
    schritte.push({ ...schritt, typ: "multi", key: optionen[0].key, optionen: optionen.map(({ wert, icon, label }) => ({ wert, icon, label })), weiter: weiter[2], weiterKey: weiter[1] });
  } else {
    schritte.push({ ...schritt, typ: "single", key: optionen[0].key, optionen: optionen.map(({ wert, icon, label, weiter }) => ({ wert, icon, label, weiter })) });
  }
  if (new Set(optionen.map((o) => o.key)).size > 1) abbruch(`Schritt ${id}: mehrere Feldnamen`);
}

const skript = {
  gesamt: Number(quiz.match(/const total=(\d+);/)[1]),
  keineAngabe: quiz.match(/formData\[k\]=\['([^']+)'\]/)[1],
  hinweisGewicht: quiz.match(/alert\('(Bitte beide Gewichtsfelder[^']*)'\)/)[1],
  hinweisPflicht: quiz.match(/alert\('(Bitte alle Pflichtfelder[^']*)'\)/)[1],
  fehlerNetz: quiz.match(/alert\('(Übertragung fehlgeschlagen[^']*)'\)/)[1],
};

const fixture = {
  stand: (await stat(datei)).mtime.toISOString(),
  quelle: path.basename(datei),
  start: startSchritt,
  schritte,
  kontakt,
  erfolg,
  skript,
};

await writeFile(ZIEL, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`✓ ${ZIEL}: ${schritte.length} Frage-Schritte, Zähler „von ${skript.gesamt}“, Kontakt mit ${kontakt.felder.length} Feldern`);
