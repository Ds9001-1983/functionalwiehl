import type { StaticImageData } from "next/image";

import krafttrainingImg from "@/public/img/krafttraining-hero.jpg";
import cardioImg from "@/public/img/cardio-hero.jpg";
import personalImg from "@/public/img/muskelaufbau-hero.jpg";
import kurseImg from "@/public/img/group-fitness-hero.jpg";
import koerperImg from "@/public/img/img_7325.jpg";
import ernaehrungImg from "@/public/img/abnehmen-hero.jpg";

/** Die 6 Leistungs-Karten der Live-Site — Texte 1:1 übernommen, je mit Ziel-Unterseite. */
export type Leistung = {
  id: string;
  titel: string;
  beschreibung: string;
  punkte: string[];
  href: string;
  image: StaticImageData;
  imageAlt: string;
};

export const LEISTUNGEN: Leistung[] = [
  {
    id: "krafttraining",
    titel: "Krafttraining",
    beschreibung:
      "Grenzenlos trainieren – wann, wie und so oft du willst. Von der Freihantel-Zone bis zur Functional Area bietet dir unsere vielseitige Trainingsfläche alles, was du brauchst, um effizient jedes Fitness-Level zu meistern.",
    punkte: ["Smart-, Pin- & Plate-Loaded Kraftgeräte", "Freihantel-Area", "Functional-Area"],
    href: "/training-und-kurse/#krafttraining",
    image: krafttrainingImg,
    imageAlt: "Krafttraining an Geräten bei Functional Wiehl",
  },
  {
    id: "cardio",
    titel: "Cardio Training",
    beschreibung:
      "Trainiere auf innovativen Cardio-Geräten, die deine Ausdauer pushen und die Fettverbrennung auf Hochtouren bringen.",
    punkte: ["Laufbänder", "Crosstrainer & Spinning Bikes", "Ergometer & Ruderergometer"],
    href: "/training-und-kurse/#cardio",
    image: cardioImg,
    imageAlt: "Cardiogeräte bei Functional Wiehl",
  },
  {
    id: "personal-training",
    titel: "Personal Training",
    beschreibung:
      "Individuelle Betreuung durch zertifizierte Trainer:innen für maximale Ergebnisse.",
    punkte: ["1:1 Betreuung", "Individuelle Trainingspläne", "Individuelle Ernährungspläne"],
    href: "/personal-training/",
    image: personalImg,
    imageAlt: "Personal Training bei Functional Wiehl",
  },
  {
    id: "gruppenkurse",
    titel: "Gruppenkurse",
    beschreibung: "Motivierende Gruppenkurse für alle Fitness-Level und Interessen.",
    punkte: ["Rücken- & Mobility-Training", "Indoor Cycling", "Functional Fitness"],
    href: "/kursplan/",
    image: kurseImg,
    imageAlt: "Gruppenkurs bei Functional Wiehl",
  },
  {
    id: "koerperanalyse",
    titel: "Körperanalyse",
    beschreibung:
      "Professionelle Körperanalyse und Fortschrittsmessung für optimale Ergebnisse.",
    punkte: ["Infrarot-Body-Scan", "Körpermaße Check", "Fortschrittsmessung"],
    href: "/training-und-kurse/#koerperanalyse",
    image: koerperImg,
    imageAlt: "Körperanalyse bei Functional Wiehl",
  },
  {
    id: "ernaehrung",
    titel: "Ernährungs Coaching",
    beschreibung: "Professionelle Begleitung bei Muskelaufbau oder Gewichtsreduktion.",
    punkte: ["BodyMed", "Supplements", "Individuelle Beratung"],
    href: "/training-und-kurse/#ernaehrung",
    image: ernaehrungImg,
    imageAlt: "Ernährungsberatung bei Functional Wiehl",
  },
];
