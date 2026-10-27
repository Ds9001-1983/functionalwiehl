import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppCta } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { EditorialSplit } from "@/components/sections/editorial-split";
import { GalleryGrid } from "@/components/sections/gallery-grid";
import { SectionHero } from "@/components/sections/section-hero";
import { Steps } from "@/components/sections/steps";
import { SectionHeading } from "@/components/ui/section-heading";
import { PAGES, pageMetadata } from "@/lib/seo";

import heroImg from "@/public/img/img_4865-2.jpg";
import studioImg from "@/public/img/apc_0275.jpg";
import g1 from "@/public/img/apc_0281.jpg";
import g2 from "@/public/img/apc_0282.jpg";
import g3 from "@/public/img/img_7325.jpg";

export const metadata: Metadata = pageMetadata(PAGES.ueberUns);

const WERTE = [
  {
    titel: "Persönlich statt anonym",
    text: "Wir kennen unsere Mitglieder beim Namen. Einweisung, Trainingsplan und Fortschrittsmessung gehören bei uns dazu – nicht gegen Aufpreis.",
  },
  {
    titel: "Gesundheit zuerst",
    text: "Vom RückenFit-Kurs bis zur Gesundheitsstudie „50 über 50“: Training ist für uns Gesundheitsvorsorge, nicht nur Optik.",
  },
  {
    titel: "Für alle Level",
    text: "Vom ersten Studio-Besuch bis zum ambitionierten Kraftsport – unsere Fläche, Kurse und Betreuung decken jedes Ziel ab.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      <SectionHero
        title="Über uns: Vom INJOY Wiehl zu Functional Wiehl"
        subtitle="Gleiches Team, gleicher Standort – neuer Name."
        image={heroImg}
        imageAlt="Das Studio von Functional Wiehl, ehemals INJOY Wiehl"
        eyebrow="Über uns"
        cta={<WhatsAppCta position="hero" size="lg" />}
      />
      <Breadcrumbs name="Über uns" path={PAGES.ueberUns.path} />

      {/* Rebrand-Story — Zielseite für die ~108 „injoy wiehl"-Sucher pro Quartal */}
      <EditorialSplit
        index="01"
        eyebrow="Unsere Geschichte"
        title="Warum aus INJOY Wiehl Functional Wiehl wurde"
        image={studioImg}
        imageAlt="Das Team von Functional Wiehl, ehemals INJOY Wiehl, auf der Trainingsfläche"
        reverse
      >
        <div className="space-y-4">
          <p>
            Viele kennen uns noch als <strong>INJOY Wiehl</strong> – und suchen uns auch heute
            noch unter diesem Namen. Die kurze Antwort: Wir sind es! Im Zuge der Loslösung von
            der Franchise-Kette haben wir uns einen eigenen Namen gegeben, der zu dem passt,
            was wir täglich tun: funktionelles, gesundheitsorientiertes Training für Wiehl und
            das Oberbergische.
          </p>
          <p>
            Für dich ändert sich nur der Name: <strong>gleiches Team</strong>, gleicher Standort
            am Wilhelm-Grümer-Weg 18, gleiche Kurse – bestehende Verträge laufen ganz normal
            weiter. Dazu gekommen sind seitdem der 24/7-Zugang, neue Geräte und unsere
            Studio-App.
          </p>
          <p>
            Du warst früher bei uns Mitglied und überlegst zurückzukommen? Komm einfach vorbei
            oder starte mit einem{" "}
            <Link href="/probetraining/" className="font-bold text-brand underline-offset-4 hover:underline">
              14-Tage-Probetraining
            </Link>
            .
          </p>
        </div>
      </EditorialSplit>

      <section className="bg-sand">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading index="02" eyebrow="Unsere Werte" title="Wofür wir stehen" />
          <div className="mt-10">
            <Steps items={WERTE} numbered={false} />
          </div>
          {/* TODO (offener Punkt 4 im Plan): Team-Grid mit Namen, Fotos und
              Qualifikationen, sobald Inhalte + Foto-Einwilligungen vorliegen. */}
          <p className="mt-8 text-sm text-muted-foreground">
            Unser Trainer-Team stellt sich hier in Kürze persönlich vor – komm bis dahin einfach
            vorbei und lern uns direkt im Studio kennen. Mehr über die Betreuung erfährst du beim{" "}
            <Link href="/personal-training/" className="font-bold text-brand underline-offset-4 hover:underline">
              Personal Training →
            </Link>
          </p>
        </div>
      </section>

      <GalleryGrid
        index="03"
        title="Einblicke ins Studio"
        eyebrow="Galerie"
        images={[
          { src: g1, alt: "Trainingsfläche bei Functional Wiehl" },
          { src: g2, alt: "Gerätebereich bei Functional Wiehl" },
          { src: g3, alt: "Kursraum bei Functional Wiehl" },
        ]}
      />

      <CtaBand headline="Lern uns kennen – 14 Tage kostenlos." />
    </>
  );
}
