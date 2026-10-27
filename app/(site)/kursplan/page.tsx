import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { KursplanTable } from "@/components/sections/kursplan-table";
import { SectionHero } from "@/components/sections/section-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { getKursplan } from "@/lib/kursplan-source";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/group-fitness-hero.jpg";

export const metadata: Metadata = pageMetadata(PAGES.kursplan);

export default async function KursplanPage() {
  const plan = await getKursplan();

  return (
    <>
      <SectionHero
        compact
        title="Kursplan: Alle Kurse bei Functional Wiehl"
        subtitle="Von RückenFit bis Indoor Cycling – alle Gruppenkurse sind in jeder Mitgliedschaft enthalten."
        image={heroImg}
        imageAlt="Gruppenkurs bei Functional Wiehl"
        eyebrow="Kursplan"
        cta={<WhatsAppCta position="hero" />}
      />
      <Breadcrumbs name="Kursplan" path={PAGES.kursplan.path} />

      <section className="container-site py-16 sm:py-20">
        <KursplanTable plan={plan} />
      </section>

      <section className="bg-sand">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading as="h2" eyebrow="Anmeldung" title="Kurs-Anmeldung über die Studio-App" />
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
            In unserer App <strong>FUNCTIONAL 24/7</strong> meldest du dich zu Kursen an, siehst
            freie Plätze und bekommst Änderungen sofort mit. Bald zeigen wir die freien Plätze
            auch direkt hier im Kursplan an. Fragen zu den Kursen?{" "}
            <Link href="/kontakt/" className="font-bold text-brand underline-offset-4 hover:underline">
              Schreib uns einfach →
            </Link>
          </p>
        </div>
      </section>

      <CtaBand headline="Jeden Kurs testen – 14 Tage kostenlos." />
    </>
  );
}
