import type { Metadata } from "next";
import Link from "next/link";
import { CheckupQuiz } from "@/components/checkup-quiz";
import { WhatsAppCta } from "@/components/cta-buttons";
import { BlackNovemberTeaser } from "@/components/sections/black-november-teaser";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { StudioBild } from "@/components/sections/studio-bild";
import { InstagramTeaser } from "@/components/sections/instagram-teaser";
import { KontaktSection } from "@/components/sections/kontakt-section";
import { PriceSection } from "@/components/sections/price-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { CHECKUP_TEXTE } from "@/content/checkup-fragen";
import { INSTAGRAM_FALLBACK } from "@/content/instagram-fallback";
import { LEISTUNGEN_TITEL, LEISTUNGEN_UNTERTITEL } from "@/content/leistungen";
import { PAGES, pageMetadata } from "@/lib/seo";

import galerieCardio from "@/public/img/gross-img_6210.jpeg";
import galerieKraft from "@/public/img/gross-img_6212.jpeg";
import galerieFunctional from "@/public/img/ruecken-hero.jpg";
import koerpermasseTeaser from "@/public/img/koerpermasse-teaser.png";

export const metadata: Metadata = pageMetadata(PAGES.home);

const TRUST_ITEMS = [
  "24/7 Zugang – immer geöffnet",
  "Kostenlose Parkplätze direkt vor Ort",
  "Barrierefrei zugänglich",
];

/**
 * One-Pager in der Reihenfolge der Live-Startseite (Stand 27.10.2026):
 * Hero → Black November → #leistung → #aktuelles → #preise → #checkup →
 * Galerie mit Körpermaße-Teaser → #kontakt.
 * ⚠️ Die Anker sind Ziele von Menü, Redirects (content/redirects.ts) und externen Links –
 * nicht umbenennen. Genau eine H1, jede ID nur einmal (live waren #preise und #checkup doppelt).
 */
export default function HomePage() {
  return (
    <>
      {/* Hero — editorial, asymmetrisch. LCP = die große Display-H1. */}
      <section className="grain relative isolate overflow-hidden bg-brand-gradient">
        <div className="container-site grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
          <div>
            <span className="eyebrow text-cta">
              <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
              Gym is open 24/7
            </span>
            <h1 className="mt-5 text-display text-cream">
              Dein Fitnessstudio in Wiehl
              <span className="mt-4 block text-[clamp(1.5rem,3.2vw,2.5rem)] leading-tight tracking-tight text-cta">
                7 Tage lang 24 Stunden geöffnet
              </span>
            </h1>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row">
              <WhatsAppCta ziel="mitglied" position="hero" size="lg" />
              <Link
                href="/#preise"
                className="inline-flex min-h-13 items-center justify-center rounded-pill border-2 border-cream px-8 text-base font-bold text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                Zu den Preisen
              </Link>
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

          {/* Media-Kachel mit Studio-Luftbild + dezenter Akzent-Rahmen */}
          <div className="group relative">
            <span
              aria-hidden="true"
              className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-card border-2 border-cta/30"
            />
            <div className="aspect-video overflow-hidden rounded-card shadow-2xl lg:aspect-[4/5]">
              <StudioBild preload sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      {/* BN26 bis 09.11.2026 – Rückbau siehe Komponente */}
      <BlackNovemberTeaser />

      <section id="leistung" className="container-site scroll-mt-24 py-16 sm:py-20">
        <SectionHeading
          index="01"
          eyebrow="Leistungen"
          title={LEISTUNGEN_TITEL}
          description={LEISTUNGEN_UNTERTITEL}
        />
        <div className="mt-10">
          <FeatureGrid />
        </div>
      </section>

      {/* Zum Go-live der statische Fallback; das Instagram-Paket tauscht hier den API-Feed ein */}
      <InstagramTeaser id="aktuelles" index="02" posts={INSTAGRAM_FALLBACK} />

      <PriceSection index="03" />

      {/* Check-up direkt auf der Seite wie live (/gesundheits-check/ leitet hierher) */}
      <section id="checkup" className="grain scroll-mt-24 bg-brand-gradient">
        <div className="container-site max-w-3xl py-16 sm:py-20">
          {/* [&_h2]:text-headline: cn() (tailwind-merge) streicht bei tone="light" die Größe
              text-headline zugunsten von text-cream – hier über den Wrapper wieder gesetzt */}
          <SectionHeading
            index="04"
            eyebrow="Check up"
            title={CHECKUP_TEXTE.titel}
            tone="light"
            className="[&_h2]:text-headline"
          />
          <div className="mt-8">
            <CheckupQuiz />
          </div>
          <p className="mt-6 text-xs text-cream/80">
            {CHECKUP_TEXTE.hinweis}{" "}
            <Link href="/datenschutz/" className="font-semibold text-cream underline underline-offset-2">
              {CHECKUP_TEXTE.hinweisLink}
            </Link>
            .
          </p>
        </div>
      </section>

      <GalleryGrid
        index="05"
        teaser={{
          href: "/koerpermasse/",
          src: koerpermasseTeaser,
          titel: "Körpermaße Digital",
          text: "Jetzt Körpermaße erfassen",
        }}
        images={[
          { src: galerieCardio, alt: "Cardiobereich mit modernen Ausdauergeräten", caption: "Cardiobereich – Modernste Ausdauergeräte" },
          { src: galerieKraft, alt: "Krafttrainingsbereich mit freien Gewichten und Geräten", caption: "Krafttraining – Freie Gewichte & Geräte" },
          { src: galerieFunctional, alt: "Functional-Training-Bereich mit TRX-Bändern", caption: "Functional Training – TRX & Beweglichkeit" },
        ]}
      />

      <KontaktSection index="06" />
    </>
  );
}
