import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { faqJsonLd, JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { PriceSection } from "@/components/sections/price-section";
import { SectionHero } from "@/components/sections/section-hero";
import { FAQ_PROBETRAINING } from "@/content/faq";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/img_4880.jpg";

export const metadata: Metadata = pageMetadata(PAGES.probetraining);

const ABLAUF = [
  {
    titel: "Schreib uns per WhatsApp",
    text: "Ein Klick auf den gelben Button genügt – die Nachricht ist schon vorbereitet.",
  },
  {
    titel: "Termin für deine Einweisung",
    text: "Wir melden uns kurzfristig und vereinbaren deinen Starttermin mit persönlicher Geräte-Einweisung.",
  },
  {
    titel: "14 Tage alles testen",
    text: "Alle Geräte, alle Kurse, 24/7-Zugang – komplett kostenlos und unverbindlich.",
  },
];

/** DIE Landing-Page für Meta-Kampagnen — bewusst wenige Exit-Links, CTA-Dichte hoch. */
export default function ProbetrainingPage() {
  return (
    <>
      <SectionHero
        title="14 Tage kostenloses Probetraining in Wiehl"
        subtitle="Alle Geräte, alle Kurse, persönliche Einweisung – ohne Risiko, ohne Abo-Falle."
        image={heroImg}
        imageAlt="Training bei Functional Wiehl"
        badge="100 % kostenlos & unverbindlich"
        cta={<WhatsAppCta position="hero" size="lg" label="Jetzt 14 Tage kostenlos starten" />}
      />
      <Breadcrumbs name="Probetraining" path={PAGES.probetraining.path} />

      <section className="container-site py-12">
        <h2 className="text-2xl sm:text-3xl">So einfach geht&apos;s</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {ABLAUF.map((a, i) => (
            <li key={a.titel} className="rounded-card border border-border bg-white p-6 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-cta text-lg font-extrabold text-cta-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg">{a.titel}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex justify-center">
          <WhatsAppCta position="cta_band" size="lg" label="Jetzt 14 Tage kostenlos starten" />
        </div>
      </section>

      <section className="bg-muted">
        <div className="container-site py-12">
          <h2 className="text-2xl sm:text-3xl">Das alles ist in deinen 14 Tagen drin</h2>
          <div className="mt-8">
            <FeatureGrid compact />
          </div>
        </div>
      </section>

      <PriceSection id="preise" />

      <FaqAccordion items={FAQ_PROBETRAINING} title="Häufige Fragen zum Probetraining" />
      <CtaBand
        headline="Worauf wartest du? Deine 14 Tage starten mit einer Nachricht."
        text="Schreib uns jetzt per WhatsApp – wir antworten meist innerhalb weniger Stunden."
      />
      <JsonLd data={faqJsonLd(FAQ_PROBETRAINING)} />
    </>
  );
}
