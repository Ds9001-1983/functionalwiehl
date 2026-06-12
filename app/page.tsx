import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";
import { faqJsonLd, JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { InstagramTeaser } from "@/components/sections/instagram-teaser";
import { PriceSection } from "@/components/sections/price-section";
import { StudienBanner } from "@/components/sections/studien-banner";
import { VideoSection } from "@/components/sections/video-section";
import { FAQ_START } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/img_4942.jpg";
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
      {/* Hero — das LCP-Element der Site */}
      <section className="relative isolate overflow-hidden bg-brand">
        <Image
          src={heroImg}
          alt="Trainingsfläche von Functional Wiehl mit Kraft- und Cardiogeräten"
          priority
          fetchPriority="high"
          fill
          sizes="100vw"
          className="object-cover opacity-45"
          placeholder="blur"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10"
          aria-hidden="true"
        />
        <div className="container-site relative flex min-h-[72svh] flex-col items-start justify-end gap-4 py-14">
          <h1 className="max-w-2xl text-3xl text-cream sm:text-4xl lg:text-5xl">
            Dein Fitnessstudio in Wiehl – rund um die Uhr
          </h1>
          <p className="max-w-xl text-base text-cream/90 sm:text-lg">
            Krafttraining, Kurse & Personal Training mit 24/7-Zugang – und einem Team, das dich
            wirklich betreut.
          </p>
          <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row">
            <WhatsAppCta position="hero" size="lg" />
            <CalendlyCta
              position="hero"
              size="lg"
              variant="ghost"
              className="border-cream text-cream hover:bg-cream/10"
            />
          </div>
        </div>
      </section>

      {/* Trust-Bar */}
      <section className="border-b border-border bg-white">
        <ul className="container-site flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-sm font-semibold text-brand">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-whatsapp" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="container-site scroll-mt-20 py-14">
        <h2 className="text-2xl sm:text-3xl">Unsere Leistungen</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Vielfältige Trainingsmöglichkeiten für alle Fitness-Level und Ziele.
        </p>
        <div className="mt-8">
          <FeatureGrid />
        </div>
      </section>

      <StudienBanner />

      <PriceSection />

      {/* Check-up-Teaser */}
      <section className="container-site py-14">
        <div className="flex flex-col items-start gap-4 rounded-card border border-border bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl">Dein Fitness- & Gesundheits-Check-up</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Beantworte ein paar Fragen zu deinen Zielen, deinem Alltag und deiner Gesundheit –
              wir melden uns mit deiner persönlichen Empfehlung.
            </p>
          </div>
          <Link
            href="/gesundheits-check/"
            className="inline-flex min-h-12 shrink-0 items-center rounded-pill bg-brand px-6 font-bold text-cream hover:bg-brand/90"
          >
            Check-up starten
          </Link>
        </div>
      </section>

      <GalleryGrid
        images={[
          { src: galerieCardio, alt: "Cardiobereich mit modernen Ausdauergeräten", caption: "Cardiobereich – modernste Ausdauergeräte" },
          { src: galerieKraft, alt: "Krafttrainingsbereich mit freien Gewichten und Geräten", caption: "Krafttraining – freie Gewichte & Geräte" },
          { src: galerieFunctional, alt: "Functional-Training-Bereich mit TRX-Bändern", caption: "Functional Training – TRX & Beweglichkeit" },
        ]}
      />

      {/* Team-Teaser */}
      <section className="bg-muted">
        <div className="container-site grid items-center gap-8 py-14 lg:grid-cols-2">
          <Image
            src={teamTeaser}
            alt="Das Team von Functional Wiehl, ehemals INJOY Wiehl, im Studio"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] w-full rounded-card object-cover"
            placeholder="blur"
          />
          <div>
            <h2 className="text-2xl sm:text-3xl">Aus INJOY Wiehl wurde Functional Wiehl</h2>
            <p className="mt-3 text-muted-foreground">
              Gleiches Team, gleicher Standort am Wilhelm-Grümer-Weg – nur der Name ist neu. Wir
              betreuen dich persönlich: von der Einweisung über deinen Trainingsplan bis zur
              regelmäßigen Körperanalyse.
            </p>
            <Link
              href="/ueber-uns/"
              className="mt-5 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand hover:bg-brand/5"
            >
              Lerne uns kennen
            </Link>
          </div>
        </div>
      </section>

      <InstagramTeaser
        images={[
          { src: insta1, alt: "Training im Studio von Functional Wiehl" },
          { src: insta2, alt: "Kurse bei Functional Wiehl" },
          { src: insta3, alt: "Geräte-Training bei Functional Wiehl" },
          { src: insta4, alt: "Functional-Bereich bei Functional Wiehl" },
        ]}
      />

      <FaqAccordion items={FAQ_START} />

      <VideoSection />

      <CtaBand />

      <JsonLd data={faqJsonLd(FAQ_START)} />
    </>
  );
}
