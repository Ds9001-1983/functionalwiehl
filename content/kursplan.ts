/**
 * Kursplan — abgetippt aus „Kursplan_Neu-Dokument-A4.png" (Stand 06/2025).
 * ⚠️ Korrekturschleife mit dem Studio offen (Instagram erwähnt einen
 * „Übergangs Kursplan 04/26"). Kursdauern sind nicht auf dem Plan angegeben
 * und mit 45 min angenommen.
 *
 * freiePlaetze ist bewusst `null`: Die Studio-App pflegt Kurse, Anmeldungen
 * und freie Plätze — sobald deren API angebunden ist (docs/TODO-kursplan-api.md),
 * liefert getKursplan() echte Werte und die UI zeigt Belegungs-Badges.
 */
export type Kurs = {
  id: string;
  name: string;
  beschreibung: string;
  kategorie: "kraft" | "cardio" | "functional" | "gesundheit";
  dauerMin: number;
};

export type Kurstermin = {
  kursId: string;
  /** 1 = Montag … 7 = Sonntag */
  wochentag: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start: string; // "HH:MM"
  trainer?: string;
  kapazitaet?: number;
  freiePlaetze?: number | null;
};

export type Kursplan = {
  stand: string;
  kurse: Kurs[];
  termine: Kurstermin[];
};

const kurse: Kurs[] = [
  { id: "rueckenfit", name: "RückenFit", beschreibung: "Gezieltes Training für einen starken, schmerzfreien Rücken.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "faszien-yoga", name: "Faszien-Yoga", beschreibung: "Sanfte Mobilisation von Faszien und Gelenken, mehr Beweglichkeit.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "faszien-fitness", name: "Faszien-Fitness", beschreibung: "Faszientraining für geschmeidige Muskulatur und bessere Regeneration.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "yoga", name: "Yoga", beschreibung: "Kraft, Balance und Entspannung – für alle Level.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "ruecken-yoga", name: "RückenYoga", beschreibung: "Yoga mit Fokus auf Rücken und Haltung.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "inbalance", name: "InBalance", beschreibung: "Stabilität, Koordination und Körpergefühl.", kategorie: "gesundheit", dauerMin: 45 },
  { id: "indoor-cycling", name: "Indoor Cycling", beschreibung: "Ausdauer-Power auf dem Bike – motivierende Musik, ordentlich Puls.", kategorie: "cardio", dauerMin: 45 },
  { id: "nordic-walking", name: "Nordic Walking", beschreibung: "Ausdauertraining an der frischen Luft, gelenkschonend.", kategorie: "cardio", dauerMin: 60 },
  { id: "langhantel-workout", name: "Langhantel Workout", beschreibung: "Ganzkörper-Krafttraining mit der Langhantel.", kategorie: "kraft", dauerMin: 45 },
  { id: "functional-rueckenfit", name: "Functional RückenFit", beschreibung: "Funktionelles Rückentraining mit freien Bewegungen.", kategorie: "functional", dauerMin: 45 },
  { id: "power-bauch", name: "Power Bauch", beschreibung: "Kompaktes Core-Training für eine starke Mitte.", kategorie: "kraft", dauerMin: 30 },
  { id: "power-arme-schulter", name: "Power Arme/Schulter", beschreibung: "Gezieltes Oberkörper-Training für Arme und Schultern.", kategorie: "kraft", dauerMin: 30 },
  { id: "power-schultern", name: "Power Schultern", beschreibung: "Fokus-Training für stabile, starke Schultern.", kategorie: "kraft", dauerMin: 30 },
  { id: "power-arme", name: "Power Arme", beschreibung: "Kompaktes Armtraining.", kategorie: "kraft", dauerMin: 30 },
  { id: "booty-kurs", name: "Booty Kurs", beschreibung: "Po- und Beintraining mit Fokus auf Form und Kraft.", kategorie: "kraft", dauerMin: 45 },
];

const termine: Kurstermin[] = [
  // Montag
  { kursId: "rueckenfit", wochentag: 1, start: "09:15", freiePlaetze: null },
  { kursId: "faszien-yoga", wochentag: 1, start: "10:15", freiePlaetze: null },
  { kursId: "langhantel-workout", wochentag: 1, start: "16:30", freiePlaetze: null },
  { kursId: "power-bauch", wochentag: 1, start: "17:15", freiePlaetze: null },
  { kursId: "rueckenfit", wochentag: 1, start: "17:30", freiePlaetze: null },
  { kursId: "nordic-walking", wochentag: 1, start: "18:45", freiePlaetze: null },
  // Dienstag
  { kursId: "indoor-cycling", wochentag: 2, start: "09:00", freiePlaetze: null },
  { kursId: "functional-rueckenfit", wochentag: 2, start: "10:00", freiePlaetze: null },
  { kursId: "power-arme-schulter", wochentag: 2, start: "18:00", freiePlaetze: null },
  { kursId: "indoor-cycling", wochentag: 2, start: "19:15", freiePlaetze: null },
  // Mittwoch
  { kursId: "faszien-fitness", wochentag: 3, start: "09:30", freiePlaetze: null },
  { kursId: "yoga", wochentag: 3, start: "10:00", freiePlaetze: null },
  { kursId: "booty-kurs", wochentag: 3, start: "18:00", freiePlaetze: null },
  // Donnerstag
  { kursId: "rueckenfit", wochentag: 4, start: "08:00", freiePlaetze: null },
  { kursId: "inbalance", wochentag: 4, start: "09:15", freiePlaetze: null },
  { kursId: "indoor-cycling", wochentag: 4, start: "10:00", freiePlaetze: null },
  { kursId: "ruecken-yoga", wochentag: 4, start: "17:00", freiePlaetze: null },
  { kursId: "langhantel-workout", wochentag: 4, start: "18:15", freiePlaetze: null },
  { kursId: "indoor-cycling", wochentag: 4, start: "19:15", freiePlaetze: null },
  // Sonntag
  { kursId: "power-schultern", wochentag: 7, start: "10:30", freiePlaetze: null },
  { kursId: "power-bauch", wochentag: 7, start: "11:00", freiePlaetze: null },
  { kursId: "power-arme", wochentag: 7, start: "11:30", freiePlaetze: null },
];

export const KURSPLAN_STATISCH: Kursplan = {
  stand: "Kursplan Stand 06/2025 — Übergangsplan 04/26 in Klärung",
  kurse,
  termine,
};

export const WOCHENTAGE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;
