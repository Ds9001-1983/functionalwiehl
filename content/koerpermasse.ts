import { KONTAKT } from "@/lib/cta";

/**
 * „Körpermaße Digital“ (/koerpermasse/) — Mitglieder-Tool, kein Rechner: 8 Umfänge plus
 * Kontaktdaten, Versand per Mail an FORM_TO (gym@). Texte 1:1 wie live in Sie-Form
 * (assets/raw/live-2026-10-27/koerpermasse.html, Stand 27.10.2026).
 * Gemeinsame Quelle für Formular (Client), Prüfung und Mailtext (Server).
 *
 * ⚠️ Körpermaße behandeln wir vorsorglich als Gesundheitsdaten (Art. 9 DSGVO):
 * nie loggen, nie ins Tracking, nur per Mail an das Studio.
 */

export type MassId =
  | "oberschenkel_links"
  | "oberschenkel_rechts"
  | "unterschenkel_links"
  | "unterschenkel_rechts"
  | "bizeps_links"
  | "bizeps_rechts"
  | "bauch"
  | "huefte";

/** `name` = Feldname wie live (erscheint so im Mailtext), `label` = sichtbare Beschriftung */
export type MassFeld = { id: MassId; name: string; label: string };

export const MASS_GRUPPEN: readonly { titel: string; felder: readonly [MassFeld, MassFeld] }[] = [
  {
    titel: "Oberschenkel (cm)",
    felder: [
      { id: "oberschenkel_links", name: "Oberschenkel Links", label: "Links" },
      { id: "oberschenkel_rechts", name: "Oberschenkel Rechts", label: "Rechts" },
    ],
  },
  {
    titel: "Unterschenkel (cm)",
    felder: [
      { id: "unterschenkel_links", name: "Unterschenkel Links", label: "Links" },
      { id: "unterschenkel_rechts", name: "Unterschenkel Rechts", label: "Rechts" },
    ],
  },
  {
    titel: "Bizeps (cm)",
    felder: [
      { id: "bizeps_links", name: "Bizeps Links", label: "Links" },
      { id: "bizeps_rechts", name: "Bizeps Rechts", label: "Rechts" },
    ],
  },
  {
    titel: "Rumpf (cm)",
    felder: [
      { id: "bauch", name: "Bauch", label: "Bauch" },
      { id: "huefte", name: "Hüfte", label: "Hüfte" },
    ],
  },
];

/** Alle 8 Maße in Formular-Reihenfolge */
export const MASSE: readonly MassFeld[] = MASS_GRUPPEN.flatMap((g) => g.felder);

/** Erlaubter Bereich in cm, Schrittweite wie live (step 0.1) */
export const MASS_GRENZEN = { min: 1, max: 300, schritt: 0.1 } as const;

/** Grenzen der Kontaktfelder (Client-Attribute und Server-Prüfung) */
export const KONTAKT_GRENZEN = { nameMax: 80, handyMin: 6, handyMax: 30 } as const;
export const HANDY_MUSTER = /^[+0-9 ()/-]+$/;

/** Wortlaut der Einwilligungen, landet mit Text-Stand in der Mail */
export const EINWILLIGUNG_TEXT_STAND = "2026-10";
export const EINWILLIGUNG_DATENSCHUTZ = {
  vor: "Ich willige in die Verarbeitung meiner Daten gemäß ",
  link: "Datenschutzerklärung",
  nach: " ein",
} as const;
/**
 * Neu gegenüber live (design-p3 §2.4): ausdrückliche Einwilligung nach Art. 9 Abs. 2 lit. a,
 * passend zur DSE. Wortlaut nur mit Freigabe von Conny ändern oder streichen (TODO-cutover C7).
 */
export const EINWILLIGUNG_KOERPERMASSE = `Ich willige ausdrücklich ein, dass die ${KONTAKT.firma} meine Körpermaße zur Planung und Anpassung meines Trainings verarbeitet. Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.`;

/**
 * Löschhinweis in der Mail an gym@. Frist = Vorschlag aus design-p3 (C6),
 * muss zur Datenschutzerklärung passen; Freigabe Conny.
 */
export const LOESCHHINWEIS =
  "Enthält Körpermaße (vorsorglich als Gesundheitsdaten nach Art. 9 DSGVO behandelt): nur für die Trainingsplanung verwenden, nicht weiterleiten und nach der Übernahme löschen, spätestens nach 6 Monaten.";

/** Sichtbare Texte, wörtlich wie live (Sie-Form) */
export const KOERPERMASSE_TEXTE = {
  titel: "Körpermaße Digital",
  untertitel: "Präzise Messungen für Ihr optimales Training",
  karten: [
    { titel: "Präzise Erfassung", text: "8 wichtige Körpermaße digital dokumentieren" },
    { titel: "Trainingsoptimierung", text: "Datenbasierte Anpassung Ihres Workouts" },
  ],
  start: "Jetzt Körpermaße erfassen",
  dauer: "Die Erfassung dauert nur 2-3 Minuten und hilft dabei, Ihr Training optimal anzupassen.",
  wizardTitel: "Körpermaße erfassen",
  wizardUntertitel: "Digitale Messwerterfassung für Ihr Training",
  zurUebersicht: "Zur Übersicht",
  schritt1: "Schritt 1: Körpermaße eingeben",
  weiter: "Weiter zu Kontaktdaten",
  schritt2: "Schritt 2: Kontaktdaten eingeben",
  vorname: "Vorname *",
  nachname: "Nachname *",
  handy: "Handynummer *",
  hinweisFett: "Hinweis:",
  hinweis: "Ihre Daten werden ausschließlich zur Trainingsplanung verwendet und nicht an Dritte weitergegeben.",
  zurueck: "← Zurück",
  senden: "Daten senden",
  sendet: "Wird gesendet…",
  erfolgTitel: "Erfolgreich gesendet!",
  erfolgText: "Ihre Körpermaße wurden übermittelt.",
  neueMessung: "Neue Messung",
  /** Fehlertexte: ehrlich, mit Ausweg ins Studio (Telefon aus KONTAKT) */
  fehler: `Die Übermittlung hat leider nicht geklappt. Bitte versuchen Sie es erneut oder sprechen Sie uns im Studio an: ${KONTAKT.telefonAnzeige}.`,
  fehlerZuViele: `Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut oder sprechen Sie uns im Studio an: ${KONTAKT.telefonAnzeige}.`,
} as const;

/** Vertrag POST /api/koerpermasse/ (JSON) */
export type KoerpermasseAnfrage = {
  masse: Record<MassId, number>;
  kontakt: { vorname: string; nachname: string; handy: string };
  einwilligungDatenschutz: boolean;
  einwilligungKoerpermasse: boolean;
  /** Honeypot: muss leer bleiben */
  fw_hp: string;
};
