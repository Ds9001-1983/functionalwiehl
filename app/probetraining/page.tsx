import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { faqJsonLd, JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { PriceSection } from "@/components/sections/price-section";
import { SectionHero } from "@/components/sections/section-hero";
import { Steps } from "@/components/sections/steps";
import { SectionHeading } from "@/components/ui/section-heading";
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
        eyebrow="14 Tage Probetraining"
        cta={<WhatsAppCta position="hero" size="lg" label="Jetzt 14 Tage kostenlos starten" />}
      />
      <Breadcrumbs name="Probetraining" path={PAGES.probetraining.path} />

      <section className="container-site py-16 sm:py-20">
        <SectionHeading index="01" eyebrow="In 3 Schritten" title="So einfach geht's" />
        <div className="mt-10">
          <Steps items={ABLAUF} />
        </div>
        <div className="mt-8 flex justify-center">
          <WhatsAppCta position="cta_band" size="lg" label="Jetzt 14 Tage kostenlos starten" />
        </div>
      </section>

      <section className="bg-sand">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading index="02" eyebrow="Inklusive" title="Das alles ist in deinen 14 Tagen drin" />
          <div className="mt-10">
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
