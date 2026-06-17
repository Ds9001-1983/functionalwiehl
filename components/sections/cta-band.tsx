import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";
import { Reveal } from "@/components/motion/reveal";

/** Conversion-Spine: Abschluss-Band jeder Seite (Indigo, Creme-Text, gelber Pill). */
export function CtaBand({
  headline = "Bereit? Teste uns 14 Tage kostenlos.",
  text = "Schreib uns per WhatsApp – wir melden uns mit deinem Starttermin. Ohne Risiko, ohne Abo-Falle.",
  calendlyPrimary = false,
}: {
  headline?: string;
  text?: string;
  calendlyPrimary?: boolean;
}) {
  return (
    <section className="grain bg-brand-gradient">
      <Reveal className="container-site flex flex-col items-start gap-5 py-16 sm:items-center sm:py-20 sm:text-center">
        <span className="eyebrow text-cta">
          <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
          Jetzt starten
        </span>
        <h2 className="max-w-3xl text-display text-cream">{headline}</h2>
        <p className="max-w-xl text-cream/85">{text}</p>
        <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row">
          {calendlyPrimary ? (
            <>
              <CalendlyCta position="cta_band" size="lg" className="bg-cta text-cta-foreground hover:brightness-95" />
              <WhatsAppCta position="cta_band" size="lg" className="border-2 border-cream bg-transparent text-cream hover:bg-cream/10" />
            </>
          ) : (
            <>
              <WhatsAppCta position="cta_band" size="lg" />
              <CalendlyCta
                position="cta_band"
                size="lg"
                variant="ghost"
                className="border-cream text-cream hover:bg-cream/10"
              />
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}
