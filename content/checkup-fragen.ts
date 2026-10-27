import { KONTAKT } from "@/lib/cta";

/**
 * Fitness- & Gesundheits-Check-up – Schritte, Feldnamen, Werte, Icons und Sprünge WÖRTLICH
 * wie live (Code-Modul #checkup der Startseite, Stand 27.10.2026). Beleg:
 * tests/fixtures/live-checkup.json (scripts/extract-live-checkup.mjs aus dem Archiv
 * assets/raw/live-2026-10-27/home.html), geprüft in tests/checkup-logik.spec.ts.
 *
 * Schritt-Modell statt linearer Liste: `nummer` ist der Live-Zähler („Frage n von 27“, live
 * teils doppelt vergeben), `key` der Live-Feldname, `weiter` der Live-Sprung. Icons stehen
 * in einem eigenen Feld (im UI aria-hidden), damit die Werte in der Mail sauber bleiben.
 * Abweichungen vom Live-Text nur bei der Anrede (Du statt gemischt Sie/Du, design-review (f)-8)
 * und in der Redesign-UX (Weiter-Button, Zurück über den Verlauf, Art.-9-Einwilligung).
 *
 * Client (components/checkup-quiz.tsx) und Server (app/api/checkup/route.ts) nutzen dieselben
 * reinen Funktionen naechsterSchritt(), pfadFuer() und pruefeCheckup().
 *
 * ⚠️ Art. 9 DSGVO: Ab Schritt 11 Gesundheitsdaten. Verarbeitung nur mit ausdrücklicher,
 * separater Einwilligung (eigene Checkbox im Kontakt-Schritt). Antworten gehen NIE ins
 * Tracking und nie in Logs – checkup_submit trägt nur die Position.
 */

export type SchrittId =
  | "2" | "3" | "4" | "5" | "F6A" | "F6B" | "F6C" | "F6D" | "7" | "F7E" | "8" | "9" | "10"
  | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23"
  | "24" | "25" | "26";

/** Ziel eines Sprungs: nächster Frage-Schritt oder der Kontakt-Schritt (live „question-27“) */
export type Ziel = SchrittId | "kontakt";

export type Option = {
  wert: string;
  icon: string;
  /** nur Einfachauswahl: Sprung je Antwort (live selectAnswer(key, wert, weiter)) */
  weiter?: Ziel;
  /** Mehrfachauswahl: schließt die übrigen Optionen aus (z. B. „Nein“ bei sonstigen Erkrankungen) */
  exklusiv?: boolean;
};

type SchrittBasis = {
  id: SchrittId;
  /** Live-Zähler „Frage {nummer} von 27“ */
  nummer: number;
  titel: string;
  untertitel?: string;
  /** Zeilenbeschriftung in der Mail, falls der Titel allein nichts sagt */
  mailTitel?: string;
  /** Detailfrage nach einem „Ja“ – in der Mail eingerückt */
  detail?: boolean;
};

export type EinzelSchritt = SchrittBasis & { typ: "single"; key: string; optionen: readonly Option[] };
export type MehrfachSchritt = SchrittBasis & { typ: "multi"; key: string; optionen: readonly Option[]; weiter: Ziel };
export type GewichtFeld = {
  key: "aktuelles_gewicht" | "wunschgewicht";
  icon: string;
  label: string;
  platzhalter: string;
};
export type GewichtSchritt = SchrittBasis & { typ: "gewicht"; felder: readonly GewichtFeld[]; weiter: Ziel };
export type Schritt = EinzelSchritt | MehrfachSchritt | GewichtSchritt;

/** Antwortwerte: Einfachauswahl String, Mehrfachauswahl String-Liste, Gewicht Zahl (kg) */
export type CheckupAntwort = string | readonly string[] | number;
export type CheckupAntworten = Readonly<Record<string, CheckupAntwort>>;

/** Zähler „von 27“ wie live (Start = 1, Kontakt = 27) */
export const CHECKUP_GESAMT = 27;
export const ERSTER_SCHRITT: SchrittId = "2";
/** Mehrfachauswahl ohne Auswahl speichert live ["Keine Angabe"] */
export const KEINE_ANGABE = "Keine Angabe";
export const GEWICHT = { min: 35, max: 250, schritt: 0.1 } as const;

const JA = { wert: "Ja", icon: "✅" } as const;
const NEIN = { wert: "Nein", icon: "❌" } as const;
const FOKUS = { titel: "SUPER DA KÖNNEN WIR DIR BEI HELFEN", untertitel: "Wähle deinen Fokusbereich aus:", mailTitel: "Fokusbereich" } as const;
const MEHRFACH = "Mehrfachauswahl möglich";

/** Alle Frage-Schritte in Live-Reihenfolge (ohne Start und Kontakt) */
export const CHECKUP_SCHRITTE: readonly Schritt[] = [
  {
    id: "2", nummer: 2, typ: "single", key: "beruf",
    titel: "Dein Beruf", untertitel: "Wie ist deine berufliche Tätigkeit hauptsächlich?",
    optionen: [
      { wert: "sitzend", icon: "💺", weiter: "3" },
      { wert: "stehend", icon: "🧍", weiter: "3" },
      { wert: "gemischt", icon: "🔄", weiter: "3" },
      { wert: "körperlich anstrengend", icon: "💪", weiter: "3" },
      { wert: "Schichtdienst", icon: "🌙", weiter: "3" },
    ],
  },
  {
    id: "3", nummer: 3, typ: "single", key: "stresslevel",
    titel: "Dein Stresslevel", untertitel: "Wie schätzt du dein aktuelles Stresslevel ein?",
    optionen: [
      { wert: "niedrig", icon: "😌", weiter: "4" },
      { wert: "mittel", icon: "⚖️", weiter: "4" },
      { wert: "groß", icon: "😰", weiter: "4" },
    ],
  },
  {
    id: "4", nummer: 4, typ: "single", key: "fitnesslevel",
    titel: "Dein Fitnesslevel", untertitel: "Wie schätzt du dein aktuelles Fitnesslevel ein?",
    optionen: [
      { wert: "niedrig", icon: "🐌", weiter: "5" },
      { wert: "mittel", icon: "🚶", weiter: "5" },
      { wert: "hoch", icon: "🏃", weiter: "5" },
    ],
  },
  {
    id: "5", nummer: 5, typ: "single", key: "trainingsziele",
    titel: "Deine Trainingsziele", untertitel: "Was ist dein Hauptfokus beim Training?",
    optionen: [
      { wert: "Muskeln & Körperstruktur", icon: "💪", weiter: "F6A" },
      { wert: "Cardio & Mobility", icon: "❤️", weiter: "F6B" },
      { wert: "Gesundheit und Lifestyle", icon: "🌱", weiter: "F6C" },
    ],
  },
  {
    id: "F6A", nummer: 6, typ: "single", key: "muskeln_fokus", ...FOKUS,
    optionen: [
      { wert: "Muskelaufbau", icon: "💪", weiter: "7" },
      { wert: "Gewichtsreduktion", icon: "⚖️", weiter: "7" },
      { wert: "Figurtraining", icon: "✨", weiter: "7" },
    ],
  },
  {
    id: "F6B", nummer: 6, typ: "single", key: "cardio_fokus", ...FOKUS,
    optionen: [
      { wert: "Mehr Beweglichkeitstraining", icon: "🤸", weiter: "F6D" },
      { wert: "Mehr Ausdauer", icon: "🏃", weiter: "F6D" },
    ],
  },
  {
    id: "F6C", nummer: 6, typ: "single", key: "gesundheit_fokus", ...FOKUS,
    optionen: [
      { wert: "Rückentraining", icon: "🦴", weiter: "F6D" },
      { wert: "Schmerzen reduzieren", icon: "🩹", weiter: "F6D" },
      { wert: "Gesünderer Lebensstil", icon: "🌱", weiter: "F7E" },
      { wert: "Stressabbau", icon: "😌", weiter: "F7E" },
      { wert: "Wohlbefinden steigern", icon: "✨", weiter: "F7E" },
    ],
  },
  {
    id: "F6D", nummer: 7, typ: "single", key: "problemzonen",
    titel: "Deine Problemzonen", untertitel: "Welche Körperregionen bereiten dir Probleme?",
    optionen: [
      { wert: "Bauch", icon: "🍎", weiter: "F7E" },
      { wert: "Beine", icon: "🦵", weiter: "F7E" },
      { wert: "Po", icon: "🍑", weiter: "F7E" },
      { wert: "Arme", icon: "💪", weiter: "F7E" },
      { wert: "Rücken", icon: "🦴", weiter: "F7E" },
      { wert: "Schulter / Nacken", icon: "💆", weiter: "F7E" },
    ],
  },
  {
    // nur im Pfad „Muskeln & Körperstruktur“ (F6A), danach direkt 8 – F7E entfällt (wie live)
    id: "7", nummer: 7, typ: "gewicht",
    titel: "Deine Gewichts-Angaben", untertitel: "Damit wir dich optimal beraten können",
    felder: [
      { key: "aktuelles_gewicht", icon: "⚖️", label: "Aktuelles Gewicht (kg)", platzhalter: "z.B. 75" },
      { key: "wunschgewicht", icon: "🎯", label: "Wunschgewicht (kg)", platzhalter: "z.B. 70" },
    ],
    weiter: "8",
  },
  {
    id: "F7E", nummer: 8, typ: "multi", key: "bisherige_versuche",
    titel: "Bisherige Versuche deine Ziele zu erreichen",
    untertitel: "Was hast du bereits probiert? (Mehrfachauswahl möglich)",
    mailTitel: "Bisherige Versuche",
    optionen: [
      { wert: "Sport", icon: "🏃" },
      { wert: "Ernährung", icon: "🥗" },
      { wert: "Medizinisch (z.B. Physio)", icon: "🏥" },
    ],
    weiter: "8",
  },
  {
    // live geht es auch bei „Nein“ weiter zu 9 (design-review (f): „Check-up Schritt 8 wie live“)
    id: "8", nummer: 8, typ: "single", key: "fitnessstudio_erfahrung",
    titel: "Hast du bereits im Fitnessstudio trainiert?",
    optionen: [{ ...JA, weiter: "9" }, { ...NEIN, weiter: "9" }],
  },
  {
    id: "9", nummer: 9, typ: "multi", key: "training_art",
    titel: "Was für ein Training hast du gemacht?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Geräte", icon: "🏋️" },
      { wert: "Kurse", icon: "🧘" },
    ],
    weiter: "10",
  },
  {
    id: "10", nummer: 10, typ: "single", key: "trainingsfrequenz",
    titel: "Wie häufig möchtest du in Zukunft trainieren?",
    optionen: [
      { wert: "1x pro Woche", icon: "😴", weiter: "11" },
      { wert: "2x pro Woche", icon: "🚶", weiter: "11" },
      { wert: "3x pro Woche", icon: "💪", weiter: "11" },
      { wert: "4x+ pro Woche", icon: "🔥", weiter: "11" },
    ],
  },
  // ---- ab hier Gesundheitsdaten (Art. 9 DSGVO) ----
  {
    id: "11", nummer: 11, typ: "single", key: "aerztliche_behandlung",
    titel: "Bist du in ärztlicher Behandlung?",
    optionen: [{ ...JA, weiter: "12" }, { ...NEIN, weiter: "12" }],
  },
  {
    id: "12", nummer: 12, typ: "single", key: "herz_kreislauf",
    titel: "Hast du eine Herz-Kreislauf Erkrankung?",
    optionen: [{ ...JA, weiter: "13" }, { ...NEIN, weiter: "14" }],
  },
  {
    id: "13", nummer: 13, typ: "multi", key: "herz_kreislauf_details", detail: true,
    titel: "Welche Erkrankung hast du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Bluthochdruck", icon: "🩸" },
      { wert: "Herzrhythmusstörung", icon: "💓" },
      { wert: "KHK", icon: "❤️" },
      { wert: "Herzinfarkt", icon: "💔" },
      { wert: "Herzschwäche", icon: "🫀" },
      { wert: "Schlaganfall", icon: "🧠" },
    ],
    weiter: "14",
  },
  {
    id: "14", nummer: 14, typ: "single", key: "venenerkrankung",
    titel: "Hast du eine Venenerkrankung?",
    optionen: [{ ...JA, weiter: "15" }, { ...NEIN, weiter: "16" }],
  },
  {
    id: "15", nummer: 15, typ: "multi", key: "venenerkrankung_details", detail: true,
    titel: "Welche Erkrankungen hast du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Krampfadern", icon: "🦵" },
      { wert: "Besenreiser", icon: "🩸" },
      { wert: "Thrombose", icon: "🩹" },
    ],
    weiter: "16",
  },
  {
    id: "16", nummer: 16, typ: "single", key: "atemwegs_erkrankung",
    titel: "Hast du eine Atemwegs-Erkrankung?",
    optionen: [{ ...JA, weiter: "17" }, { ...NEIN, weiter: "18" }],
  },
  {
    id: "17", nummer: 17, typ: "multi", key: "atemwegs_details", detail: true,
    titel: "Welche hast du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Asthma", icon: "🫁" },
      { wert: "COPD", icon: "😷" },
      { wert: "Chronische Bronchitis", icon: "🤧" },
    ],
    weiter: "18",
  },
  {
    id: "18", nummer: 18, typ: "single", key: "stoffwechsel_erkrankung",
    titel: "Hast du eine Stoffwechsel-Erkrankung?",
    optionen: [{ ...JA, weiter: "19" }, { ...NEIN, weiter: "20" }],
  },
  {
    id: "19", nummer: 19, typ: "multi", key: "stoffwechsel_details", detail: true,
    titel: "Welche Erkrankung hast du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Diabetes TYP 1", icon: "🩸" },
      { wert: "Diabetes TYP 2", icon: "🩸" },
      { wert: "Schilddrüsen Erkrankung", icon: "🦋" },
      { wert: "Gicht", icon: "🦴" },
    ],
    weiter: "20",
  },
  {
    id: "20", nummer: 20, typ: "single", key: "orthopaedische_beschwerden",
    titel: "Hast du orthopädische Beschwerden?",
    optionen: [{ ...JA, weiter: "21" }, { ...NEIN, weiter: "22" }],
  },
  {
    id: "21", nummer: 21, typ: "multi", key: "orthopaedische_details", detail: true,
    titel: "Welche orthopädischen Beschwerden hast du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "HWS (Halswirbelsäule)", icon: "🦴" },
      { wert: "BWS (Brustwirbelsäule)", icon: "🦴" },
      { wert: "LWS (Lendenwirbelsäule)", icon: "🦴" },
      { wert: "Schulter", icon: "💪" },
      { wert: "Arm", icon: "🦾" },
      { wert: "Hüfte", icon: "🦵" },
      { wert: "Knie", icon: "🦵" },
      { wert: "Fuß", icon: "🦶" },
    ],
    weiter: "22",
  },
  {
    id: "22", nummer: 22, typ: "single", key: "psychische_erkrankung",
    titel: "Hast du eine psychische Erkrankung?",
    optionen: [{ ...JA, weiter: "23" }, { ...NEIN, weiter: "23" }],
  },
  {
    id: "23", nummer: 23, typ: "multi", key: "sonstige_erkrankungen",
    titel: "Hast du sonstige Erkrankungen?", untertitel: MEHRFACH,
    optionen: [
      { ...NEIN, exklusiv: true },
      { wert: "Krebs", icon: "🎗️" },
      { wert: "Autoimmun Erkrankung", icon: "🛡️" },
      { wert: "Allergie", icon: "🤧" },
    ],
    weiter: "24",
  },
  {
    id: "24", nummer: 24, typ: "single", key: "regelmaessige_medikamente",
    titel: "Nimmst du regelmäßig Medikamente?",
    optionen: [{ ...JA, weiter: "25" }, { ...NEIN, weiter: "26" }],
  },
  {
    id: "25", nummer: 25, typ: "multi", key: "medikamente_details", detail: true,
    titel: "Welche nimmst du?", untertitel: MEHRFACH,
    optionen: [
      { wert: "Herz-Kreislauf Medikamente", icon: "❤️" },
      { wert: "Diabetes Medikamente", icon: "🩸" },
      { wert: "Schmerzmittel", icon: "💊" },
      { wert: "Psychopharmaka", icon: "🧠" },
      { wert: "Andere Medikamente", icon: "🦴" },
    ],
    weiter: "26",
  },
  {
    id: "26", nummer: 26, typ: "single", key: "op_letzte_12_monate",
    titel: "Hattest du eine OP in den letzten 12 Monaten?",
    optionen: [{ ...JA, weiter: "kontakt" }, { ...NEIN, weiter: "kontakt" }],
  },
];

export const SCHRITT = Object.fromEntries(CHECKUP_SCHRITTE.map((s) => [s.id, s])) as Readonly<Record<SchrittId, Schritt>>;

/** Texte rund um die Fragen (Start, Kontakt, Senden, Erfolg, Fehler) – Live-Wortlaut in Du-Form */
export const CHECKUP_TEXTE = {
  /** H2 der Section #checkup auf der Startseite */
  titel: "Fitness- & Gesundheits-Check-up",
  startUntertitel: "Willkommen zu deinem persönlichen Gesundheits-Assessment",
  startButton: "🚀 Los geht’s!",
  weiter: "Weiter →",
  zurueck: "← Zurück",
  gewichtFehlt: "Bitte beide Gewichtsfelder ausfüllen!",
  gewichtBereich: `Bitte gib ein Gewicht zwischen ${GEWICHT.min} und ${GEWICHT.max} kg an.`,
  kontaktTitel: "Geschafft! – Kontaktangaben",
  kontaktFelder: {
    name: { icon: "👤", label: "Dein Name *" },
    email: { icon: "📧", label: "E-Mail *" },
    telefon: { icon: "📞", label: "Telefon *" },
  },
  absenden: "🚀 Jetzt absenden",
  sendet: "Check-up wird versendet …",
  erfolgTitel: "✅ Vielen Dank!",
  erfolgText: "Dein Check-up wurde erfolgreich übermittelt. Wir melden uns schnellstmöglich bei dir.",
  fehler: "Übertragung fehlgeschlagen – bitte später versuchen.",
  fehlerZuVieleAnfragen: "Zu viele Anfragen – bitte versuche es in ein paar Minuten noch einmal.",
  fehlerWhatsApp: "Oder schreib uns direkt per WhatsApp.",
  /**
   * Hinweis unter dem Quiz (Section #checkup, P1a). „nicht an Dritte“ prüft Recht:
   * Die Mail läuft über Alfahosting (Auftragsverarbeiter) an gym@.
   */
  hinweis:
    "Deine Angaben werden ausschließlich zur Erstellung deiner Trainingsempfehlung und zur Kontaktaufnahme verwendet und nicht an Dritte weitergegeben. Gesundheitsangaben verarbeiten wir nur mit deiner ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO) – Details in der Datenschutzerklärung.",
} as const;

/** Stand der Einwilligungstexte – steht in jeder Check-up-Mail (Nachweis nach Art. 7 Abs. 1 DSGVO) */
export const EINWILLIGUNG_STAND = "2026-10";
export const EINWILLIGUNG = {
  /** Checkbox 1, „Datenschutzerklärung“ ist im UI ein Link auf /datenschutz/ */
  datenschutz: "Ich habe die Datenschutzerklärung zur Kenntnis genommen.",
  /** Checkbox 2 (Art. 9 DSGVO), ausdrücklich und separat, nie vorausgewählt */
  gesundheit: `Ich willige ausdrücklich ein, dass die ${KONTAKT.firma} meine im Check-up angegebenen Gesundheitsdaten (Art. 9 DSGVO) zur Erstellung meiner Trainingsempfehlung und zur Kontaktaufnahme verarbeitet. Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.`,
} as const;

/** Telefon: Ziffern, Leerzeichen, + ( ) / . - (6–30 Zeichen). Auch als HTML-pattern (v-Flag-tauglich escaped). */
export const TELEFON_MUSTER = "[+0-9 \\(\\)\\/.\\-]{6,30}";
const TELEFON_RE = new RegExp(`^${TELEFON_MUSTER}$`);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEUERZEICHEN_RE = /[\u0000-\u001f\u007f]/;

/** Vertrag POST /api/checkup/ (design-review (a)-16) */
export type CheckupPayload = {
  /** nur die Antworten der Schritte auf `pfad` (Live-Feldnamen) */
  antworten: CheckupAntworten;
  /** besuchte Frage-Schritte ab "2" in Reihenfolge, = pfadFuer(antworten) */
  pfad: SchrittId[];
  kontakt: { name: string; email: string; telefon: string };
  einwilligungDatenschutz: boolean;
  einwilligungGesundheit: boolean;
  /** Honeypot, muss leer sein */
  fw_hp: string;
  /** Millisekunden zwischen „Los geht’s“ und Absenden */
  dauerMs: number;
};

export type CheckupDaten = {
  antworten: CheckupAntworten;
  pfad: SchrittId[];
  kontakt: { name: string; email: string; telefon: string };
  dauerMs: number;
};

/** Fester Fehlergrund ohne Nutzdaten – darf geloggt werden */
export type CheckupFehlergrund = "format" | "kontakt" | "einwilligung" | "dauer" | "antworten" | "pfad";

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** Feldnamen, die ein Schritt in `antworten` belegt */
export function antwortKeys(schritt: Schritt): string[] {
  return schritt.typ === "gewicht" ? schritt.felder.map((f) => f.key) : [schritt.key];
}

export function gewichtGueltig(wert: unknown): wert is number {
  return (
    typeof wert === "number" &&
    Number.isFinite(wert) &&
    wert >= GEWICHT.min &&
    wert <= GEWICHT.max &&
    Math.abs(wert * 10 - Math.round(wert * 10)) < 1e-6
  );
}

/** true, wenn der Schritt eine gültige Antwort hat (nur Werte aus CHECKUP_SCHRITTE) */
export function antwortGueltig(schritt: Schritt, antworten: CheckupAntworten): boolean {
  if (schritt.typ === "gewicht") return schritt.felder.every((f) => gewichtGueltig(antworten[f.key]));
  const antwort = antworten[schritt.key];
  if (schritt.typ === "single") return typeof antwort === "string" && schritt.optionen.some((o) => o.wert === antwort);

  if (!Array.isArray(antwort) || antwort.length === 0) return false;
  if (antwort.length === 1 && antwort[0] === KEINE_ANGABE) return true;
  const werte = schritt.optionen.map((o) => o.wert);
  const exklusiv = schritt.optionen.filter((o) => o.exklusiv).map((o) => o.wert);
  return (
    antwort.every((w) => typeof w === "string" && werte.includes(w)) &&
    new Set(antwort).size === antwort.length &&
    (antwort.length === 1 || !antwort.some((w) => exklusiv.includes(w)))
  );
}

/** Nächster Schritt nach `schritt`, null solange die Antwort fehlt oder ungültig ist */
export function naechsterSchritt(schritt: Schritt, antworten: CheckupAntworten): Ziel | null {
  if (!antwortGueltig(schritt, antworten)) return null;
  if (schritt.typ !== "single") return schritt.weiter;
  return schritt.optionen.find((o) => o.wert === antworten[schritt.key])?.weiter ?? null;
}

/**
 * Pfad ab "2" entlang der Antworten bis vor den Kontakt-Schritt; null, wenn unterwegs eine
 * Antwort fehlt oder ungültig ist. Antworten abseits des Pfads (verlassene Zweige) spielen
 * keine Rolle.
 */
export function pfadFuer(antworten: CheckupAntworten): SchrittId[] | null {
  const pfad: SchrittId[] = [];
  let id: SchrittId = ERSTER_SCHRITT;
  while (pfad.length < CHECKUP_SCHRITTE.length) {
    pfad.push(id);
    const ziel = naechsterSchritt(SCHRITT[id], antworten);
    if (ziel === null) return null;
    if (ziel === "kontakt") return pfad;
    id = ziel;
  }
  return null; // Zyklus – bei korrekten Daten unmöglich
}

/** Nur die Antworten der Schritte auf `pfad` (Datensparsamkeit: verlassene Zweige fliegen raus) */
export function antwortenFuerPfad(antworten: CheckupAntworten, pfad: readonly SchrittId[]): CheckupAntworten {
  const ergebnis: Record<string, CheckupAntwort> = {};
  for (const key of pfad.flatMap((id) => antwortKeys(SCHRITT[id]))) {
    if (key in antworten) ergebnis[key] = antworten[key];
  }
  return ergebnis;
}

function pruefeKontakt(kontakt: unknown): CheckupDaten["kontakt"] | null {
  if (!istObjekt(kontakt)) return null;
  const { name, email, telefon } = kontakt;
  if (typeof name !== "string" || typeof email !== "string" || typeof telefon !== "string") return null;
  const k = { name: name.trim(), email: email.trim(), telefon: telefon.trim() };
  if (!k.name || k.name.length > 100 || STEUERZEICHEN_RE.test(k.name)) return null;
  if (k.email.length > 254 || !EMAIL_RE.test(k.email)) return null;
  if (!TELEFON_RE.test(k.telefon)) return null;
  return k;
}

/**
 * Serverseitige Prüfung des Payloads gegen CHECKUP_SCHRITTE und pfadFuer(): nur erlaubte
 * Werte, `pfad` muss dem Pfad der Antworten entsprechen, keine Antworten abseits davon.
 * Honeypot und Mindestdauer prüft die Route vorher.
 */
export function pruefeCheckup(
  json: unknown
): { ok: true; daten: CheckupDaten } | { ok: false; grund: CheckupFehlergrund } {
  if (!istObjekt(json)) return { ok: false, grund: "format" };

  const kontakt = pruefeKontakt(json.kontakt);
  if (!kontakt) return { ok: false, grund: "kontakt" };
  if (json.einwilligungDatenschutz !== true || json.einwilligungGesundheit !== true) {
    return { ok: false, grund: "einwilligung" };
  }
  const { dauerMs } = json;
  if (typeof dauerMs !== "number" || !Number.isFinite(dauerMs) || dauerMs < 0) return { ok: false, grund: "dauer" };

  if (!istObjekt(json.antworten)) return { ok: false, grund: "antworten" };
  const antworten = json.antworten as CheckupAntworten;
  const pfad = pfadFuer(antworten);
  if (!pfad) return { ok: false, grund: "antworten" };

  const gesendet = json.pfad;
  if (!Array.isArray(gesendet) || gesendet.length !== pfad.length || pfad.some((id, i) => gesendet[i] !== id)) {
    return { ok: false, grund: "pfad" };
  }
  const erwartet = new Set(pfad.flatMap((id) => antwortKeys(SCHRITT[id])));
  const keys = Object.keys(antworten);
  if (keys.length !== erwartet.size || keys.some((k) => !erwartet.has(k))) return { ok: false, grund: "antworten" };

  return { ok: true, daten: { antworten: antwortenFuerPfad(antworten, pfad), pfad, kontakt, dauerMs } };
}
