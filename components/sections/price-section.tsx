import { PlanWaehlenCta } from "@/components/cta-buttons";
import { STARTGEBUEHR_HINWEIS, TARIFE } from "@/content/preise";
import { Check } from "lucide-react";

export function PriceSection({ id = "preise" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-20 bg-muted">
      <div className="container-site py-14">
        <h2 className="text-2xl sm:text-3xl">Transparente Preise</h2>
        <p className="mt-2 text-muted-foreground">Finde das passende Abo für dich.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TARIFE.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col rounded-card border bg-white p-6 shadow-sm ${
                t.hervorgehoben ? "border-brand ring-2 ring-brand" : "border-border"
              }`}
            >
              {t.hervorgehoben && (
                <span className="mb-3 self-start rounded-pill bg-cta px-3 py-1 text-xs font-bold text-cta-foreground">
                  Beliebt
                </span>
              )}
              <h3 className="text-lg">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.laufzeit}</p>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-brand">{t.preisProWoche}</span>
                <span className="text-sm text-muted-foreground"> / Woche</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-whatsapp" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <PlanWaehlenCta label={t.ctaLabel} />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {STARTGEBUEHR_HINWEIS}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
