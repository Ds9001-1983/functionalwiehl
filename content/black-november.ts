/**
 * Black November 2026 (Kampagne BN26) — Texte für den Startseiten-Teaser und die
 * Landingpage /black-november/, wörtlich wie live (Stand 27.10.2026, bn.html und
 * bn.md §1.1 und §2). Typografie wie live: „…" mit geradem Schlusszeichen, ❤️ mit FE0F.
 */
import { KONTAKT } from "@/lib/cta";

// ── Gemeinsame Werte (Teaser und LP identisch) ────────────────────────────────

export const BN_PREIS = "22,50 €";
export const BN_STATT = "45,00 €";
export const BN_ERSPARNIS = "135,00 €";

/** Fußnote zum Sternchen am Preis („/ Monat*“), wörtlich mit führendem * */
export const BN_FUSSNOTE =
  "*Bei Abschluss einer 12-monatigen Mitgliedschaft: 50 % auf den monatlichen Beitrag, 6 Monate lang. Danach 45,00 € pro Monat. Zzgl. einmaliger Startgebühr von 79,00 € und 20,00 € Chip-Kaution.";

/** Kampagnenende laut Meta-API; ab dem 10.11. fällt der Teaser weg (Rückbau P1) */
export const BN_AKTION_ENDE = "2026-11-09T23:59:59+01:00";

// ── Texte der Landingpage ─────────────────────────────────────────────────────

export const BN_META = {
  title: "Black November: 50 % auf dein Abo | Functional Wiehl 24/7",
  description:
    "Black November bei Functional Wiehl: 6 Monate 50 % auf dein Abo – 22,50 € statt 45 € im Monat. 24/7 geöffnet. Jetzt per WhatsApp sichern.",
  ogTitle: "Black November: 50 % auf dein Abo – Functional Wiehl 24/7",
  ogDescription: "6 Monate trainieren zum halben Preis. Jetzt per WhatsApp sichern.",
  pfad: "/black-november/",
} as const;

/** Routenlink aus FAQ und Footer (live identisch, &#038; im HTML = &) */
export const BN_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Functional+Wiehl+Wilhelm-Gr%C3%BCmer-Weg+18+51674+Wiehl";

/** Footer-Links. Normale <a>: Die LP wird nur per Dokument-Navigation verlassen (Pixel-Grenze). */
export const BN_LINKS = {
  website: "/",
  impressum: "/impressum/",
  datenschutz: "/datenschutz/",
  superbrand: "https://superbrand.marketing",
} as const;

export const BN_STARTGEBUEHR = "79,00 €";

export const BN_HERO = {
  eyebrow: "Black November · nur für kurze Zeit",
  h1: "Black November",
  h1Akzent: "50 % auf dein Abo",
  preis: BN_PREIS,
  proMonat: "/ Monat*",
  statt: `statt ${BN_STATT}`,
  preisAria: "22,50 Euro statt 45 Euro pro Monat in den ersten 6 Monaten",
  cta: "Jetzt per WhatsApp sichern",
  micro: "Kein Formular, keine Online-Anmeldung: Nachricht ist vorbereitet, einfach absenden – wir melden uns.",
  chipsAria: "Das Wichtigste auf einen Blick",
  chips: ["24/7 geöffnet", "Betreuung Mo–Fr & So", "Kostenlose Parkplätze", "Barrierefrei zugänglich"],
} as const;

export const BN_RECHNUNG = {
  h2: "So viel sparst du",
  lead: "Ehrlich gerechnet, ohne Kleingedrucktes-Überraschung: 12 Monate Mitgliedschaft, davon die ersten 6 Monate zum halben Preis.",
  caption: "Dein Black-November-Abo",
  zeilen: [
    { label: "Monat 1–6", statt: BN_STATT, wert: `${BN_PREIS} / Monat` },
    { label: "Monat 7–12", wert: `${BN_STATT} / Monat` },
    { label: "Startgebühr (einmalig)", wert: BN_STARTGEBUEHR },
  ],
  sparen: { label: "Du sparst", wert: BN_ERSPARNIS },
  fussnote: BN_FUSSNOTE,
} as const;

export const BN_LEISTUNGEN = {
  h2: "Das bekommst du",
  lead: "Trainieren, wann es in deinen Tag passt – früh morgens, nach der Spätschicht oder sonntags.",
  karten: [
    { icon: "uhr", titel: "24/7 geöffnet", text: "Rund um die Uhr Zugang, an 7 Tagen die Woche – trainiere, wann du willst." },
    {
      icon: "hantel",
      titel: "Krafttraining",
      text: "Smart-, Pin- & Plate-Loaded Kraftgeräte, Freihantel-Area und Functional Area.",
    },
    { icon: "puls", titel: "Cardio", text: "Laufbänder, Crosstrainer & Spinning Bikes, Ergometer und Rudergeräte." },
    { icon: "person", titel: "Betreuung", text: "Trainer vor Ort Mo–Fr 08:00–21:00 Uhr und So 10:00–14:00 Uhr." },
  ],
  bilderAlt: {
    flaeche: "Trainingsfläche im Functional Wiehl mit Kraft- und Cardiogeräten",
    kurzhantel: "Kurzhantel-Bereich im Functional Wiehl",
    cardio: "Cardiobereich im Functional Wiehl",
  },
} as const;

export const BN_SCHRITTE = {
  h2: "So einfach geht's",
  lead: "Anmeldung läuft ausschließlich über WhatsApp – schneller geht's nicht.",
  schritte: [
    { titel: "WhatsApp antippen", text: "Die Nachricht ist schon vorbereitet. Einfach absenden." },
    { titel: "Wir melden uns", text: "Wir beantworten deine Fragen und klären alles Weitere direkt im Chat." },
    { titel: "Loslegen", text: "Trainieren, wann du willst – 24 Stunden am Tag, 7 Tage die Woche." },
  ],
  cta: "Angebot per WhatsApp sichern",
} as const;

export const BN_FAQ = {
  h2: "Häufige Fragen",
  kosten: {
    frage: "Was kostet das Abo nach den 6 Monaten?",
    antwort: "Ab Monat 7 zahlst du den regulären Beitrag von 45,00 € pro Monat. Die Mitgliedschaft läuft insgesamt 12 Monate.",
  },
  startgebuehr: {
    frage: "Gibt es eine Startgebühr?",
    antwort: "Ja, einmalig 79,00 € plus 20,00 € Kaution für deinen Zugangschip.",
  },
  anmeldung: {
    frage: "Wie melde ich mich an?",
    antwort:
      "Nur über WhatsApp: Tippe auf den grünen Button, sende die vorbereitete Nachricht ab und wir melden uns bei dir. Du erreichst uns auch unter",
    telefon: KONTAKT.telefonAnzeige,
  },
  dauer: {
    frage: "Wie lange gilt das Angebot?",
    antwort: "Nur während unserer Black-November-Aktion. Sichere dir den Preis am besten jetzt per WhatsApp.",
  },
  anfahrt: {
    frage: "Wo finde ich euch?",
    antwort:
      'Wilhelm-Grümer-Weg 18, 51674 Wiehl – kostenlose Parkplätze direkt vor der Tür, Bushaltestelle „Wiehl Zentrum" 2 Minuten zu Fuß.',
    link: "Route in Google Maps öffnen",
  },
} as const;

export const BN_ABSCHLUSS = {
  h2: "6 Monate zum halben Preis.",
  text: `${BN_PREIS} statt ${BN_STATT} im Monat – nur zur Black-November-Aktion.`,
  cta: "Jetzt per WhatsApp sichern",
  micro: "Antwort direkt vom Functional-Team.",
} as const;

export const BN_FOOTER = {
  firma: KONTAKT.firma,
  adresse: `${KONTAKT.strasse}, ${KONTAKT.plzOrt}`,
  telefon: KONTAKT.telefonAnzeige,
  mail: KONTAKT.mail,
  website: "Zur Website",
  impressum: "Impressum",
  datenschutz: "Datenschutz",
  creditVor: "Made with ❤️ by ",
  creditLink: "SUPERBRAND.marketing",
  creditNach: " – Dein Superheld für deine Werbung.",
} as const;

export const BN_STICKY_CTA = "Jetzt per WhatsApp sichern";
export const BN_SKIPLINK = "Zum Angebot springen";
