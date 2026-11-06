import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, setCharacterSpacing, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { CHECKUP_TEXTE, EINWILLIGUNG, EINWILLIGUNG_STAND, type CheckupDaten } from "@/content/checkup-fragen";
import { aufEinenBlick, bereiche, DATUM, gesundheitHinweise } from "@/lib/forms/checkup-bericht";
import { KONTAKT } from "@/lib/cta";
import { MAIL_FARBEN, type MailZeile } from "@/lib/mail-html";

/**
 * Check-up als PDF (A4) für den Anhang der Mail an FORM_TO. Gleicher Inhalt wie die HTML-Mail
 * (lib/forms/checkup-bericht.ts), damit das Team den Datensatz in einem anderen System ablegen kann.
 *
 * - pdf-lib, reines JavaScript ohne Dateizugriff zur Laufzeit außer den beiden Schriften.
 * - Schrift Open Sans (wie die Website, OFL in lib/forms/schrift/OFL.txt), eingebettet als
 *   Teilmenge. Sie deckt Latein samt Erweiterungen, Griechisch und Kyrillisch ab, also auch
 *   Namen wie „Łukasz“ oder „Şükrü“. Buchstaben ohne Glyphe werden zum Grundbuchstaben oder
 *   zu „?“, Emoji und andere Symbole entfallen. Das PDF entsteht immer.
 * - Pfeil und Häkchen fehlen in Open Sans, sie werden als Vektorform gezeichnet.
 * - next.config.ts nimmt die Schriften per outputFileTracingIncludes in die Function auf.
 *
 * ⚠️ Art. 9 DSGVO: Das PDF existiert nur im Speicher und geht direkt an den Mailer. Es wird nie
 * gespeichert oder geloggt.
 */

const SCHRIFT_REGULAR = "lib/forms/schrift/OpenSans-Regular.ttf";
const SCHRIFT_FETT = "lib/forms/schrift/OpenSans-Bold.ttf";

type Schriften = { regular: Uint8Array; fett: Uint8Array };

/** Je Arbeitsverzeichnis einmal laden; ein Fehlschlag bleibt nicht im Cache hängen */
const schriftCache = new Map<string, Promise<Schriften>>();

function ladeSchriften(): Promise<Schriften> {
  const basis = process.cwd();
  let laden = schriftCache.get(basis);
  if (!laden) {
    laden = Promise.all([readFile(join(basis, SCHRIFT_REGULAR)), readFile(join(basis, SCHRIFT_FETT))]).then(
      ([regular, fett]) => ({ regular, fett }),
    );
    laden.catch(() => schriftCache.delete(basis));
    schriftCache.set(basis, laden);
  }
  return laden;
}

// ---- Maße und Farben ----

const A4: [number, number] = [595.28, 841.89];
const RAND = 48;
const BREITE = A4[0] - 2 * RAND;
/** Unterhalb davon steht die Fußzeile */
const UNTEN = 66;
const KOPF_HOEHE = 104;

const farbe = (hex: string): RGB =>
  rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

const F = {
  brand: farbe(MAIL_FARBEN.brand),
  creme: farbe(MAIL_FARBEN.creme),
  gelb: farbe(MAIL_FARBEN.gelb),
  braun: farbe(MAIL_FARBEN.braun),
  text: farbe(MAIL_FARBEN.text),
  grau: farbe(MAIL_FARBEN.grau),
  linie: farbe(MAIL_FARBEN.linie),
  flaeche: farbe(MAIL_FARBEN.flaeche),
  achtung: farbe(MAIL_FARBEN.achtung),
  achtungRand: farbe("#efe08a"),
  gut: farbe(MAIL_FARBEN.gut),
  gutRand: farbe("#cfe6d4"),
  gutText: farbe(MAIL_FARBEN.gutText),
  weiss: rgb(1, 1, 1),
};

const KASTEN = {
  achtung: { grund: F.achtung, rand: F.achtungRand, text: F.braun },
  gut: { grund: F.gut, rand: F.gutRand, text: F.gutText },
  neutral: { grund: F.flaeche, rand: F.linie, text: F.grau },
} as const;

// ---- Text: Zeichenvorrat, Pfeil, Umbruch ----

const PFEIL = "→";
/** Breite des gezeichneten Pfeils in em */
const PFEIL_EM = 1;

/**
 * Ersetzt Zeichen ohne Glyphe: Buchstaben und Ziffern erst durch den Grundbuchstaben (NFD ohne
 * Akzente), sonst durch „?“; Emoji, Symbole und Steuerzeichen entfallen.
 */
function lesbar(text: string, vorrat: ReadonlySet<number>): string {
  let aus = "";
  for (const z of text.normalize("NFC")) {
    if (z === PFEIL || vorrat.has(z.codePointAt(0)!)) aus += z;
    else if (/\s/u.test(z)) aus += " ";
    else if (/[\p{L}\p{N}]/u.test(z)) {
      const basis = z.normalize("NFD").replace(/\p{M}/gu, "");
      aus += basis && [...basis].every((b) => vorrat.has(b.codePointAt(0)!)) ? basis : "?";
    }
  }
  return aus.replace(/ {2,}/g, " ").trim();
}

function textBreite(text: string, font: PDFFont, groesse: number): number {
  return text
    .split(PFEIL)
    .reduce((summe, teil, i) => summe + font.widthOfTextAtSize(teil, groesse) + (i ? groesse * PFEIL_EM : 0), 0);
}

/** Pfeil nach rechts als Linie mit Spitze, Grundlinie bei y */
function zeichnePfeil(seite: PDFPage, x: number, y: number, groesse: number, color: RGB) {
  const mitte = y + groesse * 0.32;
  const ende = x + groesse * 0.85;
  seite.drawLine({
    start: { x: x + groesse * 0.15, y: mitte },
    end: { x: ende - groesse * 0.1, y: mitte },
    thickness: groesse * 0.075,
    color,
  });
  const s = groesse * 0.26;
  seite.drawSvgPath(`M 0 0 L ${-s} ${-s * 0.7} L ${-s} ${s * 0.7} Z`, { x: ende, y: mitte, color });
}

function schreibe(seite: PDFPage, text: string, x: number, y: number, font: PDFFont, groesse: number, color: RGB) {
  let cx = x;
  text.split(PFEIL).forEach((teil, i) => {
    if (i) {
      zeichnePfeil(seite, cx, y, groesse, color);
      cx += groesse * PFEIL_EM;
    }
    if (teil) {
      seite.drawText(teil, { x: cx, y, font, size: groesse, color });
      cx += font.widthOfTextAtSize(teil, groesse);
    }
  });
}

/** Zeilenumbruch an Leerzeichen, überlange Wörter (z. B. E-Mail-Adressen) zeichenweise */
function umbrechen(text: string, font: PDFFont, groesse: number, max: number): string[] {
  const zeilen: string[] = [];
  let zeile = "";
  for (const wort of text.split(/ +/)) {
    const probe = zeile ? `${zeile} ${wort}` : wort;
    if (textBreite(probe, font, groesse) <= max) {
      zeile = probe;
      continue;
    }
    if (zeile) zeilen.push(zeile);
    let rest = wort;
    while (rest.length > 1 && textBreite(rest, font, groesse) > max) {
      let n = rest.length - 1;
      while (n > 1 && textBreite(rest.slice(0, n), font, groesse) > max) n--;
      zeilen.push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    zeile = rest;
  }
  zeilen.push(zeile);
  return zeilen;
}

/** Kürzt mit „…“ auf die Breite */
function kuerzen(text: string, font: PDFFont, groesse: number, max: number): string {
  if (textBreite(text, font, groesse) <= max) return text;
  let n = text.length;
  while (n > 1 && textBreite(`${text.slice(0, n)}…`, font, groesse) > max) n--;
  return `${text.slice(0, n).trimEnd()}…`;
}

/**
 * Text mit Zeichensperrung (Tc) in einem Stück – so liest ein anderes System beim Auslesen
 * „AUF EINEN BLICK“ statt einzelner Buchstaben. drawText übernimmt Tc aus dem äußeren Zustand.
 * 0,09 em: Ab etwa 0,1 em setzt pdf.js beim Auslesen Leerzeichen zwischen die Buchstaben.
 */
function gesperrt(seite: PDFPage, text: string, x: number, y: number, font: PDFFont, groesse: number, color: RGB) {
  seite.pushOperators(setCharacterSpacing(groesse * 0.09));
  seite.drawText(text, { x, y, font, size: groesse, color });
  seite.pushOperators(setCharacterSpacing(0));
}

/** Rechteck mit runden Ecken; (x, oben) = linke obere Ecke */
function rundesRechteck(
  seite: PDFPage,
  x: number,
  oben: number,
  b: number,
  h: number,
  r: number,
  grund: RGB,
  rand?: RGB,
) {
  const pfad = `M ${r} 0 H ${b - r} Q ${b} 0 ${b} ${r} V ${h - r} Q ${b} ${h} ${b - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
  seite.drawSvgPath(pfad, { x, y: oben, color: grund, borderColor: rand, borderWidth: rand ? 0.75 : 0 });
}

/** Angekreuztes Kästchen, Grundlinie bei y */
function zeichneHaken(seite: PDFPage, x: number, y: number) {
  const k = 8.5;
  seite.drawRectangle({ x, y: y - 1, width: k, height: k, borderColor: F.brand, borderWidth: 0.9, color: F.weiss });
  seite.drawLine({ start: { x: x + 1.8, y: y + 3.4 }, end: { x: x + 3.6, y: y + 1.4 }, thickness: 1.2, color: F.brand });
  seite.drawLine({ start: { x: x + 3.6, y: y + 1.4 }, end: { x: x + 6.9, y: y + 6 }, thickness: 1.2, color: F.brand });
}

// ---- Seitenaufbau ----

type Absatz = { text: string; fett?: boolean; art?: "punkt" | "haken" };

class Bericht {
  private seite: PDFPage;
  private y: number;

  constructor(
    private readonly doc: PDFDocument,
    private readonly regular: PDFFont,
    private readonly fett: PDFFont,
    private readonly vorrat: ReadonlySet<number>,
  ) {
    this.seite = doc.addPage(A4);
    this.y = A4[1] - RAND;
  }

  private lesbar(text: string) {
    return lesbar(text, this.vorrat);
  }

  private neueSeite() {
    this.seite = this.doc.addPage(A4);
    this.y = A4[1] - RAND;
  }

  /** Neue Seite, wenn `hoehe` nicht mehr über die Fußzeile passt */
  private platz(hoehe: number) {
    if (this.y - hoehe < UNTEN) this.neueSeite();
  }

  abstand(pt: number) {
    this.y -= pt;
  }

  kopf(zeit: string) {
    const s = this.seite;
    s.drawRectangle({ x: 0, y: A4[1] - KOPF_HOEHE, width: A4[0], height: KOPF_HOEHE, color: F.brand });
    gesperrt(s, "FUNCTIONAL WIEHL · WEBSITE", RAND, A4[1] - 36, this.fett, 8, F.gelb);
    s.drawText(CHECKUP_TEXTE.titel, { x: RAND, y: A4[1] - 64, font: this.fett, size: 21, color: F.weiss });
    s.drawText(`Eingang ${zeit} Uhr`, { x: RAND, y: A4[1] - 84, font: this.regular, size: 10, color: F.creme });
    this.y = A4[1] - KOPF_HOEHE - 24;
  }

  kontakt(name: string, angaben: readonly { label: string; wert: string }[]) {
    const innen = BREITE - 32;
    const labelBreite = 58;
    const nameZeilen = umbrechen(this.lesbar(name), this.fett, 16, innen);
    const zeilen = angaben.map((a) => ({
      label: a.label,
      wert: umbrechen(this.lesbar(a.wert), this.fett, 10, innen - labelBreite),
    }));
    const hoehe = 18 + nameZeilen.length * 20 + 4 + zeilen.reduce((h, z) => h + z.wert.length * 14 + 2, 0) + 12;
    this.platz(hoehe);
    const oben = this.y;
    rundesRechteck(this.seite, RAND, oben, BREITE, hoehe, 10, F.weiss, F.linie);
    let y = oben - 18 - 13;
    for (const z of nameZeilen) {
      this.seite.drawText(z, { x: RAND + 16, y, font: this.fett, size: 16, color: F.text });
      y -= 20;
    }
    y -= 2;
    for (const z of zeilen) {
      this.seite.drawText(z.label, { x: RAND + 16, y, font: this.regular, size: 9.5, color: F.grau });
      for (const w of z.wert) {
        this.seite.drawText(w, { x: RAND + 16 + labelBreite, y, font: this.fett, size: 10, color: F.brand });
        y -= 14;
      }
      y -= 2;
    }
    this.y = oben - hoehe;
  }

  /** Abschnittstitel; hält mindestens eine Tabellenzeile auf derselben Seite */
  titel(text: string) {
    this.platz(22 + 8 + 30);
    this.y -= 22;
    gesperrt(this.seite, text.toUpperCase(), RAND, this.y, this.fett, 8.5, F.brand);
    this.y -= 9;
  }

  /** Zweispaltige Tabelle Frage → Antwort wie in der Mail (58 % Frage) */
  tabelle(zeilen: readonly MailZeile[]) {
    const groesse = 9.5;
    const zeilenAbstand = 13;
    const padX = 10;
    const padY = 7;
    const trenner = BREITE * 0.58;
    const wertBreite = BREITE - trenner - 2 * padX;
    zeilen.forEach((z, i) => {
      const einzug = z.detail ? 14 : 0;
      const label = umbrechen(this.lesbar(z.label), this.regular, groesse, trenner - 2 * padX - einzug);
      const wert = umbrechen(this.lesbar(z.wert), this.fett, groesse, wertBreite);
      const hoehe = Math.max(label.length, wert.length) * zeilenAbstand + 2 * padY;
      const neueSeite = this.y - hoehe < UNTEN;
      this.platz(hoehe);
      const oben = this.y;
      const grund = z.markiert ? F.achtung : i % 2 ? F.weiss : F.flaeche;
      this.seite.drawRectangle({ x: RAND, y: oben - hoehe, width: BREITE, height: hoehe, color: grund });
      if (i === 0 || neueSeite) {
        this.seite.drawLine({ start: { x: RAND, y: oben }, end: { x: RAND + BREITE, y: oben }, thickness: 0.5, color: F.linie });
      }
      this.seite.drawLine({
        start: { x: RAND, y: oben - hoehe },
        end: { x: RAND + BREITE, y: oben - hoehe },
        thickness: 0.5,
        color: F.linie,
      });
      const ersteGrundlinie = oben - padY - groesse;
      if (z.detail) {
        // „↳“ als Winkel in Grau
        const x0 = RAND + padX + 3;
        const yMitte = ersteGrundlinie + groesse * 0.32;
        this.seite.drawLine({ start: { x: x0, y: yMitte + 5 }, end: { x: x0, y: yMitte }, thickness: 0.8, color: F.grau });
        this.seite.drawLine({ start: { x: x0, y: yMitte }, end: { x: x0 + 7, y: yMitte }, thickness: 0.8, color: F.grau });
      }
      label.forEach((l, k) =>
        schreibe(this.seite, l, RAND + padX + einzug, ersteGrundlinie - k * zeilenAbstand, this.regular, groesse, F.grau),
      );
      wert.forEach((w, k) =>
        schreibe(this.seite, w, RAND + trenner + padX, ersteGrundlinie - k * zeilenAbstand, this.fett, groesse, F.text),
      );
      this.y = oben - hoehe;
    });
  }

  /** Hinweiskasten mit Absätzen, optional als Aufzählung oder mit angekreuztem Kästchen */
  kasten(art: keyof typeof KASTEN, absaetze: readonly Absatz[]) {
    const groesse = 9.5;
    const zeilenAbstand = 13.5;
    const pad = 12;
    const stil = KASTEN[art];
    const satz = absaetze.map((a) => {
      const einzug = a.art === "haken" ? 15 : a.art === "punkt" ? 9 : 0;
      const font = a.fett ? this.fett : this.regular;
      return { ...a, einzug, font, zeilen: umbrechen(this.lesbar(a.text), font, groesse, BREITE - 2 * pad - einzug) };
    });
    const hoehe = 2 * pad + satz.reduce((h, a) => h + a.zeilen.length * zeilenAbstand, 0) + (satz.length - 1) * 4;
    this.platz(hoehe);
    const oben = this.y;
    rundesRechteck(this.seite, RAND, oben, BREITE, hoehe, 10, stil.grund, stil.rand);
    let y = oben - pad - groesse;
    for (const a of satz) {
      if (a.art === "haken") zeichneHaken(this.seite, RAND + pad, y);
      if (a.art === "punkt") this.seite.drawText("•", { x: RAND + pad, y, font: this.regular, size: groesse, color: stil.text });
      for (const z of a.zeilen) {
        schreibe(this.seite, z, RAND + pad + a.einzug, y, a.font, groesse, stil.text);
        y -= zeilenAbstand;
      }
      y -= 4;
    }
    this.y = oben - hoehe;
  }

  /** Fußzeile auf jeder Seite: wer, wann, Seitenzahl, Hinweis zu den Gesundheitsdaten */
  fusszeilen(name: string, zeit: string) {
    const seiten = this.doc.getPages();
    seiten.forEach((s, i) => {
      s.drawLine({ start: { x: RAND, y: 48 }, end: { x: A4[0] - RAND, y: 48 }, thickness: 0.5, color: F.linie });
      const zaehler = `Seite ${i + 1} von ${seiten.length}`;
      const zaehlerBreite = this.regular.widthOfTextAtSize(zaehler, 7.5);
      s.drawText(zaehler, { x: A4[0] - RAND - zaehlerBreite, y: 36, font: this.regular, size: 7.5, color: F.grau });
      const wer = kuerzen(this.lesbar(`Check-up von ${name} · Eingang ${zeit} Uhr`), this.fett, 7.5, BREITE - zaehlerBreite - 16);
      s.drawText(wer, { x: RAND, y: 36, font: this.fett, size: 7.5, color: F.text });
      s.drawText(
        "Enthält Gesundheitsdaten (Art. 9 DSGVO). Nur für die Trainingsberatung verwenden, nicht an Dritte weitergeben.",
        { x: RAND, y: 25, font: this.regular, size: 7, color: F.grau },
      );
    });
  }
}

/** PDF-Bytes des Check-ups; wirft nur, wenn die Schriften fehlen oder pdf-lib scheitert */
export async function checkupPdf(daten: CheckupDaten, eingang: Date): Promise<Uint8Array> {
  const { name, email, telefon } = daten.kontakt;
  const zeit = DATUM.format(eingang);
  const schriften = await ladeSchriften();

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(schriften.regular, { subset: true });
  const fett = await doc.embedFont(schriften.fett, { subset: true });
  const vorrat = new Set(regular.getCharacterSet());

  doc.setTitle(lesbar(`Check-up ${name} – ${zeit} Uhr`, vorrat), { showInWindowTitleBar: true });
  doc.setSubject(CHECKUP_TEXTE.titel);
  doc.setAuthor(`${KONTAKT.firma} (Website)`);
  doc.setKeywords(["Check-up", "Functional Wiehl", "Gesundheitsdaten"]);
  doc.setCreator("functional-wiehl.de");
  doc.setProducer("functional-wiehl.de");
  doc.setLanguage("de-DE");
  doc.setCreationDate(eingang);
  doc.setModificationDate(eingang);

  const bericht = new Bericht(doc, regular, fett, vorrat);
  bericht.kopf(zeit);
  bericht.kontakt(name, [
    { label: "E-Mail", wert: email },
    { label: "Telefon", wert: telefon },
  ]);

  bericht.titel("Auf einen Blick");
  bericht.tabelle(aufEinenBlick(daten));
  bericht.abstand(12);
  const hinweise = gesundheitHinweise(daten);
  if (hinweise.length) {
    bericht.kasten("achtung", [
      { text: "Gesundheit: bitte beachten", fett: true },
      ...hinweise.map((h): Absatz => ({ text: h, art: "punkt" })),
    ]);
  } else {
    bericht.kasten("gut", [{ text: "Gesundheit: keine Erkrankungen, Medikamente oder OPs angegeben.", fett: true }]);
  }

  for (const b of bereiche(daten)) {
    bericht.titel(b.titel);
    bericht.tabelle(b.zeilen);
  }

  bericht.titel("Einwilligung");
  bericht.kasten("neutral", [
    { text: `Beim Absenden angekreuzt (Text-Stand ${EINWILLIGUNG_STAND})`, fett: true },
    { text: EINWILLIGUNG.datenschutz, art: "haken" },
    { text: EINWILLIGUNG.gesundheit, art: "haken" },
  ]);

  bericht.fusszeilen(name, zeit);
  return doc.save();
}

/** Umlaute wie im Deutschen, dazu Buchstaben, die NFD nicht zerlegt */
const ERSATZ: Readonly<Record<string, string>> = {
  ä: "ae", ö: "oe", ü: "ue", Ä: "Ae", Ö: "Oe", Ü: "Ue", ß: "ss",
  Ł: "L", ł: "l", Ø: "O", ø: "o", Đ: "D", đ: "d", Æ: "AE", æ: "ae", Œ: "OE", œ: "oe", ı: "i",
};

/** „Check-up_Juergen-Mueller_2026-11-06_0930.pdf“ – nur ASCII, damit jedes System den Namen versteht */
export function checkupPdfDateiname(name: string, eingang: Date): string {
  const person =
    name
      .replace(/[äöüÄÖÜßŁłØøĐđÆæŒœı]/g, (z) => ERSATZ[z])
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "Person";
  const t = Object.fromEntries(
    new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(eingang)
      .map((p) => [p.type, p.value]),
  );
  return `Check-up_${person}_${t.year}-${t.month}-${t.day}_${t.hour}${t.minute}.pdf`;
}
