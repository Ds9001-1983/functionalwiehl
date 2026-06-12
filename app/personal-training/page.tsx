import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHero } from "@/components/sections/section-hero";
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
        cta={
          <>
            <CalendlyCta position="hero" size="lg" label="Kostenloses Erstgespräch" className="bg-cta text-cta-foreground hover:brightness-95" />
            <WhatsAppCta position="hero" size="lg" className="border-2 border-cream bg-transparent text-cream hover:bg-cream/10" />
          </>
        }
      />
      <Breadcrumbs name="Personal Training" path={PAGES.personalTraining.path} />

      <section className="container-site py-12">
        <h2 className="text-2xl sm:text-3xl">Für wen ist Personal Training?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ZIELE.map((z) => (
            <div key={z.titel} className="rounded-card border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg">{z.titel}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{z.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted">
        <div className="container-site py-12">
          <h2 className="text-2xl sm:text-3xl">So läuft&apos;s ab</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {ABLAUF.map((a) => (
              <li key={a.schritt} className="rounded-card bg-white p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-cream">
                  {a.schritt}
                </span>
                <h3 className="mt-3 text-lg">{a.titel}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
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
