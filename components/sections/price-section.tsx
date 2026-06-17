import { PlanWaehlenCta } from "@/components/cta-buttons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { STARTGEBUEHR_HINWEIS, TARIFE } from "@/content/preise";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function PriceSection({ id = "preise", index }: { id?: string; index?: string }) {
  return (
    <section id={id} className="scroll-mt-24 bg-sand">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading
          index={index}
          eyebrow="Mitgliedschaft"
          title="Transparente Preise"
          description="Finde das passende Abo für dich – ohne Kleingedrucktes, ohne Abo-Falle."
        />
        <Reveal stagger className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TARIFE.map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex flex-col rounded-card p-6 shadow-sm transition-transform duration-300",
                t.hervorgehoben
                  ? "bg-brand text-cream shadow-lg xl:-my-2 xl:scale-[1.03]"
                  : "border border-border bg-white hover:-translate-y-1 hover:shadow-md"
              )}
            >
              {t.hervorgehoben && (
                <span className="mb-3 self-start rounded-pill bg-cta px-3 py-1 text-xs font-bold uppercase tracking-wide text-cta-foreground">
                  Beliebt
                </span>
              )}
              <h3 className={cn("text-lg", t.hervorgehoben && "text-cream")}>{t.name}</h3>
              <p className={cn("mt-1 text-sm", t.hervorgehoben ? "text-cream/70" : "text-muted-foreground")}>
                {t.laufzeit}
              </p>
              <p className="mt-4">
                <span
                  className={cn(
                    "font-heading text-5xl font-black tabular-nums",
                    t.hervorgehoben ? "text-cta" : "text-brand"
                  )}
                >
                  {t.preisProWoche}
                </span>
                <span className={cn("text-sm", t.hervorgehoben ? "text-cream/70" : "text-muted-foreground")}>
                  {" "}
                  / Woche
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn("mt-0.5 size-4 shrink-0", t.hervorgehoben ? "text-cta" : "text-whatsapp")}
                      aria-hidden="true"
                    />
                    <span className={t.hervorgehoben ? "text-cream/90" : undefined}>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PlanWaehlenCta
                  label={t.ctaLabel}
                  className={t.hervorgehoben ? "bg-cta text-cta-foreground hover:brightness-95" : undefined}
                />
              </div>
              <p
                className={cn(
                  "mt-3 text-center text-xs",
                  t.hervorgehoben ? "text-cream/60" : "text-muted-foreground"
                )}
              >
                {STARTGEBUEHR_HINWEIS}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
