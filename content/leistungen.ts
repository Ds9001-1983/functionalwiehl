/** Die 6 Leistungs-Karten der Live-Site — Texte 1:1 übernommen, je mit Ziel-Unterseite. */
export type Leistung = {
  id: string;
  titel: string;
  beschreibung: string;
  punkte: string[];
  href: string;
};

export const LEISTUNGEN: Leistung[] = [
  {
    id: "krafttraining",
    titel: "Krafttraining",
    beschreibung:
      "Grenzenlos trainieren – wann, wie und so oft du willst. Von der Freihantel-Zone bis zur Functional Area bietet dir unsere vielseitige Trainingsfläche alles, was du brauchst, um effizient jedes Fitness-Level zu meistern.",
    punkte: ["Smart-, Pin- & Plate-Loaded Kraftgeräte", "Freihantel-Area", "Functional-Area"],
    href: "/training-und-kurse/#krafttraining",
  },
  {
    id: "cardio",
    titel: "Cardio Training",
    beschreibung:
      "Trainiere auf innovativen Cardio-Geräten, die deine Ausdauer pushen und die Fettverbrennung auf Hochtouren bringen.",
    punkte: ["Laufbänder", "Crosstrainer & Spinning Bikes", "Ergometer & Ruderergometer"],
    href: "/training-und-kurse/#cardio",
  },
  {
    id: "personal-training",
    titel: "Personal Training",
    beschreibung:
      "Individuelle Betreuung durch zertifizierte Trainer:innen für maximale Ergebnisse.",
    punkte: ["1:1 Betreuung", "Individuelle Trainingspläne", "Individuelle Ernährungspläne"],
    href: "/personal-training/",
  },
  {
    id: "gruppenkurse",
    titel: "Gruppenkurse",
    beschreibung: "Motivierende Gruppenkurse für alle Fitness-Level und Interessen.",
    punkte: ["Rücken- & Mobility-Training", "Indoor Cycling", "Functional Fitness"],
    href: "/kursplan/",
  },
  {
    id: "koerperanalyse",
    titel: "Körperanalyse",
    beschreibung:
      "Professionelle Körperanalyse und Fortschrittsmessung für optimale Ergebnisse.",
    punkte: ["Infrarot-Body-Scan", "Körpermaße Check", "Fortschrittsmessung"],
    href: "/training-und-kurse/#koerperanalyse",
  },
  {
    id: "ernaehrung",
    titel: "Ernährungs Coaching",
    beschreibung: "Professionelle Begleitung bei Muskelaufbau oder Gewichtsreduktion.",
    punkte: ["BodyMed", "Supplements", "Individuelle Beratung"],
    href: "/training-und-kurse/#ernaehrung",
  },
];
