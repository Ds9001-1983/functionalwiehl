import type { Metadata } from "next";
import { type StaticImageData } from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { EditorialSplit } from "@/components/sections/editorial-split";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHero } from "@/components/sections/section-hero";
import { FAQ_TRAINING } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/hero-gym-main.jpg";
import kraftImg from "@/public/img/krafttraining-hero.jpg";
import cardioImg from "@/public/img/cardio-hero.jpg";
import functionalImg from "@/public/img/functional-hero.jpg";
import kurseImg from "@/public/img/group-fitness-hero.jpg";
import koerperImg from "@/public/img/img_7325.jpg";
import ernaehrungImg from "@/public/img/abnehmen-hero.jpg";

export const metadata: Metadata = pageMetadata(PAGES.trainingUndKurse);

/**
 * Anchor-IDs sind FIX — die 301-Redirect-Map der Alt-URLs zeigt darauf
 * (z. B. /cardiotraining → /training-und-kurse/#cardio). Nicht umbenennen!
 */
const BEREICHE: {
  id: string;
  titel: string;
  text: string;
  punkte: string[];
  image: StaticImageData;
  imageAlt: string;
  link?: { href: string; label: string };
}[] = [
  {
    id: "krafttraining",
    titel: "Krafttraining",
    text: "Von der Freihantel-Zone bis zu Smart-, Pin- und Plate-Loaded-Geräten: Unsere Trainingsfläche deckt jedes Level ab – ob Muskelaufbau, Figurtraining oder gezieltes Rückentraining. Dein Trainingsplan wird persönlich auf dein Ziel zugeschnitten.",
    punkte: ["Smart-, Pin- & Plate-Loaded Kraftgeräte", "Freihantel-Area", "Persönliche Einweisung & Trainingsplan"],
    image: kraftImg,
    imageAlt: "Krafttraining an Geräten bei Functional Wiehl",
  },
  {
    id: "cardio",
    titel: "Cardio Training",
    text: "Laufbänder, Crosstrainer, Spinning Bikes, Ergometer und Ruderergometer: Hier pushst du deine Ausdauer und bringst die Fettverbrennung auf Hochtouren – im eigenen Tempo, mit Blick auf deine Werte.",
    punkte: ["Laufbänder & Crosstrainer", "Spinning Bikes", "Ergometer & Ruderergometer"],
    image: cardioImg,
    imageAlt: "Cardiogeräte bei Functional Wiehl",
  },
  {
    id: "functional",
    titel: "Functional Training",
    text: "In der Functional-Area trainierst du Kraft, Beweglichkeit und Stabilität in freien Bewegungen – mit TRX, Kettlebells und eigenem Körpergewicht. Die ideale Ergänzung zu Geräte- und Kurstraining.",
    punkte: ["TRX & Schlingentraining", "Kettlebells & freie Übungen", "Mobility & Stabilität"],
    image: functionalImg,
    imageAlt: "Functional Training mit TRX bei Functional Wiehl",
  },
  {
    id: "kurse",
    titel: "Gruppenkurse",
    text: "Von RückenFit über Indoor Cycling bis Yoga: Unsere Kurse motivieren, weil du nie allein trainierst. Alle Kurse sind in jeder Mitgliedschaft enthalten – und in deinen 14 Probetagen sowieso.",
    punkte: ["Rücken- & Mobility-Kurse", "Indoor Cycling", "Functional Fitness & Power-Kurse"],
    image: kurseImg,
    imageAlt: "Gruppenkurs bei Functional Wiehl",
    link: { href: "/kursplan/", label: "Zum aktuellen Kursplan" },
  },
  {
    id: "koerperanalyse",
    titel: "Körperanalyse",
    text: "Mit dem Infrarot-Body-Scan und regelmäßigem Körpermaße-Check machst du Fortschritte sichtbar, die die Waage nicht zeigt. So wissen wir beide, dass dein Training wirkt – und steuern nach, wenn nicht.",
    punkte: ["Infrarot-Body-Scan", "Körpermaße Check", "Regelmäßige Fortschrittsmessung"],
    image: koerperImg,
    imageAlt: "Körperanalyse bei Functional Wiehl",
    link: { href: "/gesundheits-check/", label: "Erst-Check online starten" },
  },
  {
    id: "ernaehrung",
    titel: "Ernährungs-Coaching",
    text: "Abnehmen oder Muskeln aufbauen – ohne passende Ernährung bleibt beides Zufall. Mit BodyMed-Konzept, individueller Beratung und passenden Supplements begleiten wir dich auch außerhalb der Trainingsfläche.",
    punkte: ["BodyMed-Konzept", "Individuelle Ernährungsberatung", "Gewichtsmanagement"],
    image: ernaehrungImg,
    imageAlt: "Ernährungsberatung bei Functional Wiehl",
  },
];

export default function TrainingUndKursePage() {
  return (
    <>
      <SectionHero
        title="Training & Kurse in Wiehl: Kraft, Cardio & Group Fitness"
        subtitle="Sechs Trainingswelten unter einem Dach – für jedes Level und jedes Ziel."
        image={heroImg}
        imageAlt="Trainingsfläche von Functional Wiehl"
        eyebrow="Training & Kurse"
        cta={<WhatsAppCta position="hero" size="lg" />}
      />
      <Breadcrumbs name="Training & Kurse" path={PAGES.trainingUndKurse.path} />

      {BEREICHE.map((b, i) => (
        <EditorialSplit
          key={b.id}
          id={b.id}
          index={String(i + 1).padStart(2, "0")}
          eyebrow="Trainingswelt"
          title={b.titel}
          image={b.image}
          imageAlt={b.imageAlt}
          reverse={i % 2 === 1}
          muted={i % 2 === 1}
        >
          <p>{b.text}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {b.punkte.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-whatsapp" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          {b.link && (
            <Link
              href={b.link.href}
              className="mt-5 inline-block font-bold text-brand underline-offset-4 hover:underline"
            >
              {b.link.label} →
            </Link>
          )}
        </EditorialSplit>
      ))}

      <FaqAccordion items={FAQ_TRAINING} />
      <CtaBand headline="Probier alles aus – 14 Tage kostenlos." />
    </>
  );
}
