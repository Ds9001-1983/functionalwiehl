/** Tarife und Extras wörtlich von der Live-Startseite (#preise, Stand 27.10.2026). Preise pro Monat. */
export type Tarif = {
  id: string;
  name: string;
  preis: string;
  einheit: "pro Monat";
  laufzeit: string;
  zusatz: string[];
};

/** Fußzeile jeder Preiskarte, live in Großbuchstaben (per CSS, damit Screenreader nicht buchstabieren) */
export const STARTGEBUEHR_HINWEIS = "Startgebühr 79,00 Euro einmalig";

const GETRAENKEFLAT_ZUBUCHBAR = "Getränkeflat zubuchbar (8,70 € / Monat)";

export const TARIFE: Tarif[] = [
  {
    id: "monatlich",
    name: "Monatlich",
    preis: "59,00 €",
    einheit: "pro Monat",
    laufzeit: "monatlich kündbar",
    zusatz: [GETRAENKEFLAT_ZUBUCHBAR],
  },
  {
    id: "12-monate",
    name: "12 Monate",
    preis: "45,00 €",
    einheit: "pro Monat",
    laufzeit: "12 Monate Laufzeit",
    zusatz: [GETRAENKEFLAT_ZUBUCHBAR],
  },
  {
    id: "24-monate",
    name: "24 Monate",
    preis: "39,90 €",
    einheit: "pro Monat",
    laufzeit: "24 Monate Laufzeit",
    zusatz: [GETRAENKEFLAT_ZUBUCHBAR],
  },
  {
    id: "studenten",
    // weiches Trennzeichen wie live (&shy;), sonst bricht das Wort in schmalen Karten hart um
    name: "Studenten­abo",
    preis: "37,00 €",
    einheit: "pro Monat",
    laufzeit: "12 Monate Laufzeit",
    zusatz: ["inkl. Getränkeflatrate", "nur mit Nachweis"],
  },
];

export const EXTRAS_TITEL = "Einmalig & Extras";
export const EXTRAS_UNTERTITEL = "Ohne Vertrag trainieren oder dein Abo ergänzen";

export type Extra = { name: string; hinweis?: string; preis: string };

export const EXTRAS: Extra[] = [
  { name: "Startgebühr", hinweis: "einmalig, für alle Abos", preis: "79,00 €" },
  { name: "Chip-Kaution", preis: "20,00 €" },
  { name: "Getränkeflat", hinweis: "zu jedem Abo zubuchbar", preis: "8,70 € / Monat" },
  { name: "Tageskarte", hinweis: "zzgl. 20 € Chip-Kaution", preis: "8,00 €" },
  { name: "10er-Karte", hinweis: "zzgl. 20 € Chip-Kaution", preis: "80,00 €" },
];

/** Button unter den Extras → WhatsApp ohne vorausgefüllten Text */
export const FRAGEN_LABEL = "Hast du Fragen? Stelle sie per WhatsApp.";
