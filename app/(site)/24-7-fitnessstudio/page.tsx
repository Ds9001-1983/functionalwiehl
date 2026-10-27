import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { SectionHero } from "@/components/sections/section-hero";
import { Steps } from "@/components/sections/steps";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { FAQ_247 } from "@/content/faq";
import { OEFFNUNGSZEITEN } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/img_4949.jpg";
import g1 from "@/public/img/gym_31.jpg";
import g2 from "@/public/img/gym_35.jpg";
import g3 from "@/public/img/gym_37.jpg";

export const metadata: Metadata = pageMetadata(PAGES.fitnessstudio247);

const SCHRITTE = [
  {
    titel: "Dein persönlicher Zugang",
    text: "Als Mitglied bekommst du deinen eigenen Zugang – damit öffnest du das Studio jederzeit selbst.",
  },
  {
    titel: "Trainieren, wann du willst",
    text: "Vor der Frühschicht um 5, nach Feierabend um 23 Uhr oder sonntags früh: Das Studio gehört dir – 365 Tage im Jahr.",
  },
  {
    titel: "Sicher zu jeder Uhrzeit",
    text: "Videoüberwachung, gute Beleuchtung und Notrufsystem – damit du dich auch nachts aufs Training konzentrieren kannst.",
  },
];

export default function Studio247Page() {
  return (
    <>
      <SectionHero
        title="24 Stunden Fitnessstudio in Wiehl – trainiere, wann du willst"
        subtitle="Schichtdienst, Familie, voller Kalender? Dein Training richtet sich nach dir – nicht umgekehrt."
        image={heroImg}
        imageAlt="Functional Wiehl bei Abendbeleuchtung – 24/7 geöffnet"
        badge="24/7 geöffnet"
        eyebrow="24/7-Studio"
        cta={<WhatsAppCta position="hero" size="lg" />}
      />
      <Breadcrumbs name="24/7-Studio" path={PAGES.fitnessstudio247.path} />

      <section className="container-site py-16 sm:py-20">
        <SectionHeading index="01" eyebrow="So funktioniert's" title="So funktioniert der 24/7-Zugang" />
        <div className="mt-10">
          <Steps items={SCHRITTE} />
        </div>
      </section>

      <section className="bg-sand">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading
            index="02"
            eyebrow="Zugang & Betreuung"
            title="Zugang vs. Betreuung"
            description="Trainieren kannst du immer – und zu den Betreuungszeiten ist unser Team persönlich für dich da: für Einweisungen, Trainingspläne und alle Fragen."
          />
          <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="grain rounded-card bg-brand-gradient p-8 text-cream">
              <h3 className="text-lg text-cream">Trainingszeiten</h3>
              <p className="mt-3 font-heading text-6xl font-black text-cta">24/7</p>
              <p className="mt-2 text-cream/85">Immer geöffnet – auch an Sonn- und Feiertagen.</p>
            </div>
            <div className="rounded-card border border-border bg-white p-8">
              <h3 className="text-lg">Betreuungszeiten</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {OEFFNUNGSZEITEN.betreuung.map((z) => (
                  <li key={z.tage} className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
                    <span>{z.tage}</span>
                    <span className="font-semibold">{z.zeit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <GalleryGrid
        index="03"
        title="Dein Studio bei Nacht und Tag"
        eyebrow="Einblicke"
        images={[
          { src: g1, alt: "Trainingsbereich von Functional Wiehl" },
          { src: g2, alt: "Geräte bei Functional Wiehl" },
          { src: g3, alt: "Freihantelbereich von Functional Wiehl" },
        ]}
      />

      <section className="container-site py-16 sm:py-20">
        <SectionHeading index="04" eyebrow="Anfahrt" title="Schnell erreichbar aus dem ganzen Oberbergischen" />
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Aus Oberwiehl, Bielstein, Marienhagen oder Nümbrecht bist du in wenigen Minuten bei uns.
          Kostenlose Parkplätze direkt vor der Tür, die Bushaltestelle „Wiehl Zentrum“ liegt 2
          Minuten Fußweg entfernt – und das Studio ist barrierefrei zugänglich.{" "}
          <Link href="/kontakt/" className="font-bold text-brand underline-offset-4 hover:underline">
            Anfahrt & Kontakt →
          </Link>
        </p>
      </section>

      <FaqAccordion items={FAQ_247} />
      <CtaBand headline="Überzeug dich selbst – 14 Tage kostenlos, rund um die Uhr." />
    </>
  );
}
