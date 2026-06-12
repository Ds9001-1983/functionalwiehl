/**
 * Fragen des Fitness- & Gesundheits-Check-ups — inhaltlich 1:1 von der
 * Live-Site übernommen (eingebettetes 27-Schritte-Formular, Stand 12.06.2026).
 *
 * ⚠️ Art. 9 DSGVO: Die Anamnese-Fragen erheben Gesundheitsdaten. Verarbeitung
 * nur mit ausdrücklicher, separater Einwilligung (eigene Checkbox im
 * Abschluss-Schritt). Antworten werden NIE ins Tracking gegeben —
 * checkup_submit trägt nur die Ziel-Kategorie. Siehe docs/TODO-recht.md.
 */
export type CheckupFrage =
  | { id: string; typ: "single"; frage: string; optionen: string[] }
  | { id: string; typ: "multi"; frage: string; optionen: string[]; hinweis?: string }
  | { id: string; typ: "zahl"; frage: string; einheit: string; min: number; max: number };

/** Fokusbereiche abhängig vom Trainingsziel (Frage „ziel"). */
export const FOKUS_NACH_ZIEL: Record<string, string[]> = {
  "Muskeln & Körperstruktur": ["Muskelaufbau", "Gewichtsreduktion", "Figurtraining"],
  "Cardio & Mobility": ["Beweglichkeit", "Ausdauer"],
  "Gesundheit und Lifestyle": [
    "Rückentraining",
    "Schmerzen reduzieren",
    "Gesünderer Lebensstil",
    "Stressabbau",
    "Wohlbefinden",
  ],
};

export const CHECKUP_FRAGEN: CheckupFrage[] = [
  {
    id: "beruf",
    typ: "single",
    frage: "Wie sieht dein Berufsalltag aus?",
    optionen: ["Sitzend", "Stehend", "Gemischt", "Körperlich anstrengend", "Schichtdienst"],
  },
  {
    id: "stress",
    typ: "single",
    frage: "Wie hoch ist dein Stresslevel?",
    optionen: ["Niedrig", "Mittel", "Groß"],
  },
  {
    id: "fitnesslevel",
    typ: "single",
    frage: "Wie schätzt du dein aktuelles Fitnesslevel ein?",
    optionen: ["Niedrig", "Mittel", "Hoch"],
  },
  {
    id: "ziel",
    typ: "single",
    frage: "Was ist dein wichtigstes Trainingsziel?",
    optionen: ["Muskeln & Körperstruktur", "Cardio & Mobility", "Gesundheit und Lifestyle"],
  },
  {
    id: "fokus",
    typ: "multi",
    frage: "Welche Bereiche möchtest du in den Fokus nehmen?",
    optionen: [], // wird abhängig von "ziel" befüllt (FOKUS_NACH_ZIEL)
  },
  {
    id: "problemzonen",
    typ: "multi",
    frage: "Hast du Problemzonen, an denen wir arbeiten sollen?",
    optionen: ["Bauch", "Beine", "Po", "Arme", "Rücken", "Schulter & Nacken", "Keine"],
  },
  { id: "gewicht", typ: "zahl", frage: "Was ist dein aktuelles Gewicht?", einheit: "kg", min: 35, max: 250 },
  { id: "wunschgewicht", typ: "zahl", frage: "Was ist dein Wunschgewicht?", einheit: "kg", min: 35, max: 250 },
  {
    id: "versuche",
    typ: "multi",
    frage: "Was hast du bisher schon versucht?",
    optionen: ["Sport", "Ernährungsumstellung", "Medizinische Unterstützung", "Noch nichts"],
  },
  {
    id: "erfahrung",
    typ: "multi",
    frage: "Welche Fitnessstudio-Erfahrung bringst du mit?",
    optionen: ["Gerätetraining", "Kurse", "Keine Erfahrung"],
  },
  {
    id: "frequenz",
    typ: "single",
    frage: "Wie oft möchtest du pro Woche trainieren?",
    optionen: ["1× pro Woche", "2× pro Woche", "3× pro Woche", "4× oder öfter"],
  },
  {
    id: "behandlung",
    typ: "single",
    frage: "Bist du aktuell in ärztlicher Behandlung?",
    optionen: ["Ja", "Nein"],
  },
  {
    id: "herz",
    typ: "multi",
    frage: "Gibt es Herz-Kreislauf-Erkrankungen?",
    hinweis: "Mehrfachauswahl möglich",
    optionen: [
      "Bluthochdruck",
      "Herzrhythmusstörung",
      "Koronare Herzkrankheit",
      "Herzinfarkt",
      "Herzschwäche",
      "Schlaganfall",
      "Keine",
    ],
  },
  {
    id: "venen",
    typ: "multi",
    frage: "Gibt es Venen-Erkrankungen?",
    optionen: ["Krampfadern", "Besenreiser", "Thrombose", "Keine"],
  },
  {
    id: "atemwege",
    typ: "multi",
    frage: "Gibt es Atemwegs-Erkrankungen?",
    optionen: ["Asthma", "COPD", "Chronische Bronchitis", "Keine"],
  },
  {
    id: "stoffwechsel",
    typ: "multi",
    frage: "Gibt es Stoffwechsel-Erkrankungen?",
    optionen: ["Diabetes Typ 1", "Diabetes Typ 2", "Schilddrüsen-Erkrankung", "Gicht", "Keine"],
  },
  {
    id: "wirbelsaeule",
    typ: "multi",
    frage: "Gibt es orthopädische Beschwerden an der Wirbelsäule?",
    optionen: ["Halswirbelsäule (HWS)", "Brustwirbelsäule (BWS)", "Lendenwirbelsäule (LWS)", "Keine"],
  },
  {
    id: "schulter-arm",
    typ: "multi",
    frage: "Gibt es Beschwerden an Schulter oder Arm?",
    optionen: ["Schulter", "Arm", "Keine"],
  },
  {
    id: "huefte-bein",
    typ: "multi",
    frage: "Gibt es Beschwerden an Hüfte, Knie oder Fuß?",
    optionen: ["Hüfte", "Knie", "Fuß", "Keine"],
  },
  {
    id: "psyche",
    typ: "single",
    frage: "Gibt es eine psychische Erkrankung, die wir beim Training berücksichtigen sollten?",
    optionen: ["Ja", "Nein", "Keine Angabe"],
  },
  {
    id: "sonstiges",
    typ: "multi",
    frage: "Gibt es sonstige Erkrankungen?",
    optionen: ["Krebserkrankung", "Autoimmunerkrankung", "Allergie", "Keine"],
  },
  {
    id: "medikamente",
    typ: "single",
    frage: "Nimmst du regelmäßig Medikamente?",
    optionen: ["Ja", "Nein"],
  },
  {
    id: "operation",
    typ: "single",
    frage: "Wurdest du in den letzten 12 Monaten operiert?",
    optionen: ["Ja", "Nein"],
  },
];
