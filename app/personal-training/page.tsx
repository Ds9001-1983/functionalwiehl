import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHero } from "@/components/sections/section-hero";
import { Steps } from "@/components/sections/steps";
import { SectionHeading } from "@/components/ui/section-heading";
import { FAQ_PERSONAL_TRAINING } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/krafttraining-hero-1.jpg";

export const metadata: Metadata = pageMetadata(PAGES.personalTraining);

const ZIELE = [
  {
    titel: "Abnehmen & Figur",
    text: "Training und Ernährung greifen ineinander: Mit Plan, Körperanalyse und BodyMed-Coaching nimmst du nachhaltig ab – ohne Crash-Diät.",
  },
  {
    titel: "Muskelaufbau",
    text: "Saubere Technik, progressive Steigerung, messbare Erfolge: Dein Personal Trainer holt aus jeder Einheit das Maximum heraus.",
  },
  {
    titel: "Rücken & Gesundheit",
    text: "Bei Rückenschmerzen oder nach Verletzungen bauen wir dein Training gezielt um deine Beschwerden herum auf – Schritt für Schritt zurück zur Stärke.",
  },
];

const ABLAUF = [
  {
    schritt: "1",
    titel: "Anamnese & Körperanalyse",
    text: "Kostenloses Erstgespräch: Wir besprechen dein Ziel, deine Vorgeschichte und messen deinen Ausgangspunkt per Infrarot-Body-Scan.",
  },
  {
    schritt: "2",
    titel: "Dein individueller Plan",
    text: "Trainings- und auf Wunsch Ernährungsplan – zugeschnitten auf dein Ziel, deinen Alltag und deine Zeit.",
  },
  {
    schritt: "3",
    titel: "1:1-Betreuung",
    text: "Gemeinsame Einheiten mit deinem Trainer oder deiner Trainerin, regelmäßige Fortschrittsmessung, Anpassung des Plans.",
  },
];

export default function PersonalTrainingPage() {
  return (
    <>
      <SectionHero
        title="Personal Training in Wiehl: 1:1-Betreuung für dein Ziel"
        subtitle="Zertifizierte Trainer:innen, individueller Plan, messbare Ergebnisse."
        image={heroImg}
        imageAlt="Personal Training bei Functional Wiehl"
        eyebrow="Personal Training"
        cta={
          <>
            <CalendlyCta position="hero" size="lg" label="Kostenloses Erstgespräch" className="bg-cta text-cta-foreground hover:brightness-95" />
            <WhatsAppCta position="hero" size="lg" className="border-2 border-cream bg-transparent text-cream hover:bg-cream/10" />
          </>
        }
      />
      <Breadcrumbs name="Personal Training" path={PAGES.personalTraining.path} />

      <section className="container-site py-16 sm:py-20">
        <SectionHeading index="01" eyebrow="Deine Ziele" title="Für wen ist Personal Training?" />
        <div className="mt-10">
          <Steps items={ZIELE} numbered={false} />
        </div>
      </section>

      <section className="bg-sand">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading index="02" eyebrow="Ablauf" title="So läuft's ab" />
          <div className="mt-10">
            <Steps items={ABLAUF} />
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Die Körperanalyse kannst du auch vorab online vorbereiten:{" "}
            <Link href="/gesundheits-check/" className="font-bold text-brand underline-offset-4 hover:underline">
              Gesundheits-Check starten →
            </Link>
          </p>
        </div>
      </section>

      <FaqAccordion items={FAQ_PERSONAL_TRAINING} />
      <CtaBand
        headline="Sichere dir dein kostenloses Erstgespräch."
        text="Telefontermin buchen oder per WhatsApp schreiben – wir melden uns noch diese Woche."
        calendlyPrimary
      />
    </>
  );
}
