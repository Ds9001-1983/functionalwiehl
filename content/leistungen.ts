import type { StaticImageData } from "next/image";

// Live gibt es keine Kachelbilder: eigene Studiofotos statt Stock- oder KI-Bildern (design-review E19)
import krafttrainingImg from "@/public/img/img_4865-2.jpg";
import cardioImg from "@/public/img/img_4942.jpg";
import personalImg from "@/public/img/img_7325.jpg";
import kurseImg from "@/public/img/img_4949.jpg";
import koerperImg from "@/public/img/leistung-koerperanalyse.jpg";
import ernaehrungImg from "@/public/img/leistung-ernaehrung.jpg";

export const LEISTUNGEN_TITEL = "Unsere Leistungen";
export const LEISTUNGEN_UNTERTITEL = "Vielfältige Trainingsmöglichkeiten für alle Fitness-Level und Ziele";

/** Die 6 Leistungs-Blurbs der Live-Startseite (#leistung) — Texte 1:1, live ohne Links. */
export type Leistung = {
  id: string;
  titel: string;
  beschreibung: string;
  punkte: string[];
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
    image: krafttrainingImg,
    imageAlt: "Freihantel-Bereich und Plate-Loaded-Geräte bei Functional Wiehl",
  },
  {
    id: "cardio",
    titel: "Cardio Training",
    beschreibung:
      "Trainiere auf innovativen Cardio-Geräten, die deine Ausdauer pushen und die Fettverbrennung auf Hochtouren bringen.",
    punkte: ["Laufbänder", "Crosstrainer & Spinning Bikes", "Ergometer & Ruderergometer"],
    image: cardioImg,
    imageAlt: "Spinning Bikes und Crosstrainer im Cardiobereich",
  },
  {
    id: "personal-training",
    titel: "Personal Training",
    beschreibung:
      "Individuelle Betreuung durch zertifizierte Trainer:innen für maximale Ergebnisse.",
    punkte: ["1:1 Betreuung", "Individuelle Trainingspläne", "Individuelle Ernährungspläne"],
    image: personalImg,
    imageAlt: "Trainerin betreut ein Mitglied beim Personal Training",
  },
  {
    id: "gruppenkurse",
    titel: "Gruppenkurse",
    beschreibung: "Motivierende Gruppenkurse für alle Fitness-Level und Interessen.",
    punkte: ["Rücken- & Mobility-Training", "Indoor Cycling", "Functional Fitness"],
    image: kurseImg,
    imageAlt: "Kursraum für Gruppenkurse bei Functional Wiehl",
  },
  {
    id: "koerperanalyse",
    titel: "Körperanalyse",
    beschreibung:
      "Professionelle Körperanalyse und Fortschrittsmessung für optimale Ergebnisse.",
    punkte: ["Infrarot-Body-Scan", "Körpermaße Check", "Fortschrittsmessung"],
    image: koerperImg,
    imageAlt: "Tablet mit Polar-Herzfrequenzanzeige zur Fortschrittsmessung",
  },
  {
    id: "ernaehrung",
    titel: "Ernährungs Coaching",
    beschreibung: "Professionelle Begleitung bei Muskelaufbau oder Gewichtsreduktion.",
    punkte: ["BodyMed", "Supplements", "Individuelle Beratung"],
    image: ernaehrungImg,
    imageAlt: "Supplements für die Ernährungsberatung im Studio",
  },
];
