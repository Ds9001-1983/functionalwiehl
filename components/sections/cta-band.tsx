import { CalendlyCta, WhatsAppCta } from "@/components/cta-buttons";

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
    <section className="bg-brand">
      <div className="container-site flex flex-col items-start gap-4 py-12 sm:items-center sm:text-center">
        <h2 className="text-2xl text-cream sm:text-3xl">{headline}</h2>
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
      </div>
    </section>
  );
}
