import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CalendlyCta, TelCta, WhatsAppCta } from "@/components/cta-buttons";
import { faqJsonLd, JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHero } from "@/components/sections/section-hero";
import { FAQ_FRAUEN_50 } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/frauen-ab-50-hero.png";

export const metadata: Metadata = pageMetadata(PAGES.frauenAb50);

const LEISTUNGEN_STUDIE = [
  "Ausführliche Einweisung & Körperstrukturanalyse",
  "Wöchentlich betreute Trainingseinheiten",
  "Zusammenarbeit & Dokumentation mit unseren Trainer:innen",
  "Kostenfreie Zusatzleistung für Mitglieder",
  "Neukundinnen: zusätzlich 4 Wochen gratis Studio-Zugang",
];

const ABLAUF = [
  {
    titel: "Check-in",
    text: "Persönliches Kennenlernen, Körperstrukturanalyse und Einweisung – wir holen dich genau da ab, wo du stehst.",
  },
  {
    titel: "4 Wochen begleitetes Training",
    text: "Wöchentliche, betreute Einheiten in der Gruppe Gleichgesinnter – angepasst an dein Level und deine Gesundheit.",
  },
  {
    titel: "Abschlussmessung",
    text: "Zweite Körperanalyse und Auswertung: Schwarz auf weiß, was sich in 4 Wochen verändert hat.",
  },
];

export default function FrauenAb50Page() {
  return (
    <>
      <SectionHero
        title="Fit ab 50: Die Gesundheitsstudie „50 über 50“ in Wiehl"
        subtitle="Wie viel kann sich in 4 Wochen verändern? Finde es heraus – begleitet von unserem Team."
        image={heroImg}
        imageAlt="Frau über 50 beim Rückentraining im Fitnessstudio"
        badge="Auf 50 Teilnehmerinnen begrenzt"
        cta={
          <>
            <CalendlyCta
              position="hero"
              size="lg"
              label="Jetzt Platz anfragen"
              className="bg-cta text-cta-foreground hover:brightness-95"
            />
            <TelCta position="hero" size="lg" label="02262 / 752717" className="border-cream bg-transparent text-cream hover:bg-cream/10" />
          </>
        }
      />
      <Breadcrumbs name="Frauen ab 50" path={PAGES.frauenAb50.path} />

      <section className="container-site py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl">Was ist „50 über 50“?</h2>
            <p className="mt-3 text-muted-foreground">
              Unsere Gesundheitsstudie für 50 Frauen ab 50 Jahren aus Wiehl und Umgebung: Vier
              Wochen lang trainierst du betreut und dokumentiert – und erlebst, welchen Einfluss
              regelmäßiges Training auf Gesundheit, Fitness und Wohlbefinden hat. Die Studie ist
              gestartet; freie und nachrückende Plätze fragst du am besten direkt an.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {LEISTUNGEN_STUDIE.map((l) => (
                <li key={l} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-whatsapp" aria-hidden="true" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card bg-muted p-6">
            <h3 className="text-lg">Für wen?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Für Frauen ab 50 – ob Wiedereinsteigerin oder komplette Anfängerin. Du brauchst
              keine Vorerfahrung, kein Equipment und keine „Grundfitness“. Vor dem Start
              besprechen wir deine Gesundheit persönlich; das Training wird an dich angepasst,
              nicht umgekehrt.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Unsicher wegen Rücken, Knie oder Blutdruck? Genau dafür ist die Studie da –
              vereinbare einen kostenlosen Telefontermin und wir klären alles vorab.
            </p>
            <div className="mt-5">
              <CalendlyCta position="teaser" label="Kostenlosen Telefontermin buchen" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="container-site py-12">
          <h2 className="text-2xl sm:text-3xl">So läuft die Studie ab</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {ABLAUF.map((a, i) => (
              <li key={a.titel} className="rounded-card bg-white p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-cream">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg">{a.titel}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-site py-12">
        <h2 className="text-2xl sm:text-3xl">Warum Krafttraining ab 50 so wirksam ist</h2>
        <div className="prose-sm mt-4 max-w-3xl space-y-4 text-muted-foreground">
          <p>
            Ab Mitte 40 verliert der Körper ohne Training jedes Jahr spürbar Muskelmasse – und mit
            ihr Kraft, Stabilität und Stoffwechselleistung. Die gute Nachricht: Dieser Prozess ist
            umkehrbar, und zwar in jedem Alter. Schon zwei angeleitete Einheiten pro Woche
            verbessern nachweislich Knochendichte, Gelenkstabilität und Gleichgewicht – der beste
            Schutz vor Stürzen und Osteoporose.
          </p>
          <p>
            Gerade Frauen profitieren in und nach den Wechseljahren doppelt: Krafttraining wirkt
            dem hormonell bedingten Muskel- und Knochenabbau entgegen, stabilisiert den
            Blutzucker und hebt nachweislich Stimmung und Schlafqualität. Dabei geht es nicht um
            schwere Gewichte oder Leistungsdruck – sondern um sauber angeleitetes, regelmäßiges
            Training, das zu deinem Körper passt.
          </p>
          <p>
            Genau so trainierst du bei uns: mit persönlicher Einweisung, regelmäßiger{" "}
            <Link href="/training-und-kurse/#koerperanalyse" className="font-bold text-brand underline-offset-4 hover:underline">
              Körperanalyse
            </Link>{" "}
            und Kursen wie RückenFit, InBalance oder Faszien-Yoga, die Beweglichkeit und Kraft
            gleichermaßen aufbauen. Ob im Rahmen der Studie oder einfach mit einem{" "}
            <Link href="/probetraining/" className="font-bold text-brand underline-offset-4 hover:underline">
              14-Tage-Probetraining
            </Link>{" "}
            – der erste Schritt ist der wichtigste.
          </p>
        </div>
      </section>

      <FaqAccordion items={FAQ_FRAUEN_50} />
      <CtaBand
        headline="Sichere dir deinen Platz – oder frag einfach unverbindlich nach."
        text="Ruf an, buch einen Telefontermin oder schreib per WhatsApp – wir beraten dich persönlich."
        calendlyPrimary
      />
      <JsonLd data={faqJsonLd(FAQ_FRAUEN_50)} />
    </>
  );
}
