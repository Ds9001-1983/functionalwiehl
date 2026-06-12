import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CheckupQuiz } from "@/components/checkup-quiz";
import { CtaBand } from "@/components/sections/cta-band";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.gesundheitsCheck);

export default function GesundheitsCheckPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-12">
          <h1 className="text-3xl text-cream sm:text-4xl">Fitness- & Gesundheits-Check-up</h1>
          <p className="mt-3 max-w-xl text-cream/90">
            Ziele, Alltag, Gesundheit – beantworte ein paar Fragen und wir melden uns mit deiner
            persönlichen Trainingsempfehlung.
          </p>
        </div>
      </section>
      <Breadcrumbs name="Gesundheits-Check" path={PAGES.gesundheitsCheck.path} />

      <section className="container-site max-w-3xl py-12">
        <CheckupQuiz />
        <p className="mt-6 text-xs text-muted-foreground">
          Deine Angaben werden ausschließlich zur Erstellung deiner Trainingsempfehlung und zur
          Kontaktaufnahme verwendet und nicht an Dritte weitergegeben. Gesundheitsangaben
          verarbeiten wir nur mit deiner ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a
          DSGVO) – Details in der Datenschutzerklärung.
        </p>
      </section>

      <CtaBand
        headline="Lieber direkt loslegen?"
        text="Überspring den Check-up und starte gleich mit deinen 14 kostenlosen Tagen."
      />
    </>
  );
}
