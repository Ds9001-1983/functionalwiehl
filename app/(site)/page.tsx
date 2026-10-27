import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";
import { faqJsonLd, JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { EditorialSplit } from "@/components/sections/editorial-split";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { HeroVideo } from "@/components/sections/hero-video";
import { InstagramTeaser } from "@/components/sections/instagram-teaser";
import { PriceSection } from "@/components/sections/price-section";
import { StatsBand } from "@/components/sections/stats-band";
import { StudienBanner } from "@/components/sections/studien-banner";
import { VideoSection } from "@/components/sections/video-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { FAQ_START } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import galerieCardio from "@/public/img/gross-img_6210.jpeg";
import galerieKraft from "@/public/img/gross-img_6212.jpeg";
import galerieFunctional from "@/public/img/ruecken-hero.jpg";
import teamTeaser from "@/public/img/img_6964.jpg";
import insta1 from "@/public/img/img_4886.jpg";
import insta2 from "@/public/img/img_4897.jpg";
import insta3 from "@/public/img/img_4933.jpg";
import insta4 from "@/public/img/img_4965.jpg";

export const metadata: Metadata = pageMetadata(PAGES.home);

const TRUST_ITEMS = [
  "24/7-Zugang",
  "Kostenlose Parkplätze",
  "Barrierefrei",
  "Ehemals INJOY Wiehl",
];

export default function HomePage() {
  return (
    <>
      {/* Hero — editorial, asymmetrisch. LCP = die große Display-H1. */}
      <section className="grain relative isolate overflow-hidden bg-brand-gradient">
        <div className="container-site grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
          <div>
            <span className="eyebrow text-cta">
              <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
              24/7 Fitness · Wiehl
            </span>
            <h1 className="mt-5 text-display text-cream">
              Dein Fitnessstudio in Wiehl –{" "}
              <span className="text-cta">rund um die Uhr</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-cream/85 sm:text-lg">
              Krafttraining, Kurse & Personal Training mit 24/7-Zugang – und einem Team, das dich
              wirklich betreut.
            </p>
            <div className="mt-7 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row">
              <WhatsAppCta position="hero" size="lg" />
              <CalendlyCta
                position="hero"
                size="lg"
                variant="ghost"
                className="border-cream text-cream hover:bg-cream/10"
              />
            </div>
            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-cream/80">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-cta" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Media-Kachel mit Studio-Loop + dezenter Akzent-Rahmen */}
          <div className="group relative">
            <span
              aria-hidden="true"
              className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-card border-2 border-cta/30"
            />
            <div className="aspect-video overflow-hidden rounded-card shadow-2xl lg:aspect-[4/5]">
              <HeroVideo />
            </div>
          </div>
        </div>
      </section>

      {/* Leistungen — Bento */}
      <section id="leistungen" className="container-site scroll-mt-24 py-16 sm:py-20">
        <SectionHeading
          index="01"
          eyebrow="Leistungen"
          title="Alles für dein Training – unter einem Dach"
          description="Vielfältige Trainingsmöglichkeiten für alle Fitness-Level und Ziele."
        />
        <div className="mt-10">
          <FeatureGrid />
        </div>
      </section>

      <StatsBand />

      <StudienBanner />

      <PriceSection index="02" />

      {/* Check-up-Teaser — Conversion-Band auf Indigo */}
      <section className="grain bg-brand-gradient">
        <Reveal className="container-site flex flex-col items-start gap-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <div className="max-w-2xl">
            <span className="eyebrow text-cta">
              <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
              Persönliche Empfehlung
            </span>
            <h2 className="mt-3 text-headline text-cream">Dein Fitness- & Gesundheits-Check-up</h2>
            <p className="mt-3 text-cream/85">
              Beantworte ein paar Fragen zu deinen Zielen, deinem Alltag und deiner Gesundheit –
              wir melden uns mit deiner persönlichen Empfehlung.
            </p>
          </div>
          <Link
            href="/gesundheits-check/"
            className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-pill bg-cta px-6 font-bold text-cta-foreground transition-[filter] hover:brightness-95"
          >
            Check-up starten
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <GalleryGrid
        index="03"
        images={[
          { src: galerieCardio, alt: "Cardiobereich mit modernen Ausdauergeräten", caption: "Cardiobereich – modernste Ausdauergeräte" },
          { src: galerieKraft, alt: "Krafttrainingsbereich mit freien Gewichten und Geräten", caption: "Krafttraining – freie Gewichte & Geräte" },
          { src: galerieFunctional, alt: "Functional-Training-Bereich mit TRX-Bändern", caption: "Functional Training – TRX & Beweglichkeit" },
        ]}
      />

      {/* Team-Teaser */}
      <EditorialSplit
        index="04"
        eyebrow="Unser Team"
        title="Aus INJOY Wiehl wurde Functional Wiehl"
        image={teamTeaser}
        imageAlt="Das Team von Functional Wiehl, ehemals INJOY Wiehl, im Studio"
        muted
      >
        <p>
          Gleiches Team, gleicher Standort am Wilhelm-Grümer-Weg – nur der Name ist neu. Wir
          betreuen dich persönlich: von der Einweisung über deinen Trainingsplan bis zur
          regelmäßigen Körperanalyse.
        </p>
        <Link
          href="/ueber-uns/"
          className="mt-6 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand transition-colors hover:bg-brand/5"
        >
          Lerne uns kennen
        </Link>
      </EditorialSplit>

      <InstagramTeaser
        index="05"
        images={[
          { src: insta1, alt: "Training im Studio von Functional Wiehl" },
          { src: insta2, alt: "Kurse bei Functional Wiehl" },
          { src: insta3, alt: "Geräte-Training bei Functional Wiehl" },
          { src: insta4, alt: "Functional-Bereich bei Functional Wiehl" },
        ]}
      />

      <FaqAccordion index="06" items={FAQ_START} />

      <VideoSection index="07" />

      <CtaBand />

      <JsonLd data={faqJsonLd(FAQ_START)} />
    </>
  );
}
