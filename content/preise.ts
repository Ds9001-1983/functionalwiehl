/** Tarife 1:1 von der Live-Site (Stand 12.06.2026). Preise pro Woche. */
export type Tarif = {
  id: string;
  name: string;
  preisProWoche: string;
  laufzeit: string;
  features: string[];
  hervorgehoben?: boolean;
  ctaLabel: string;
};

export const STARTGEBUEHR_HINWEIS = "Startgebühr 79,00 € einmalig";

export const TARIFE: Tarif[] = [
  {
    id: "monatlich",
    name: "Monatlich",
    preisProWoche: "12,80 €",
    laufzeit: "monatlich kündbar",
    features: ["Alle Geräte & Trainingsflächen", "Alle Gruppenkurse", "Getränkeflatrate zubuchbar"],
    ctaLabel: "Plan wählen",
  },
  {
    id: "12-monate",
    name: "12 Monate",
    preisProWoche: "8,85 €",
    laufzeit: "12 Monate Laufzeit",
    features: ["Alle Geräte & Trainingsflächen", "Alle Gruppenkurse", "Getränkeflatrate zubuchbar"],
    hervorgehoben: true,
    ctaLabel: "Plan wählen",
  },
  {
    id: "24-monate",
    name: "24 Monate",
    preisProWoche: "8,45 €",
    laufzeit: "24 Monate Laufzeit",
    features: ["Alle Geräte & Trainingsflächen", "Alle Gruppenkurse", "Getränkeflatrate zubuchbar"],
    ctaLabel: "Plan wählen",
  },
  {
    id: "studenten",
    name: "Studententarif",
    preisProWoche: "8,00 €",
    laufzeit: "12 Monate Laufzeit",
    features: [
      "Alle Geräte & Trainingsflächen",
      "Alle Gruppenkurse",
      "Getränkeflatrate inklusive",
    ],
    ctaLabel: "Studententarif",
  },
];
