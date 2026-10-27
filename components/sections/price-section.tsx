import { BuchenCta, WhatsAppCta } from "@/components/cta-buttons";
import { Reveal } from "@/components/motion/reveal";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  EXTRAS,
  EXTRAS_TITEL,
  EXTRAS_UNTERTITEL,
  FRAGEN_LABEL,
  STARTGEBUEHR_HINWEIS,
  TARIFE,
} from "@/content/preise";
import { CTA, KONTAKT } from "@/lib/cta";

/** #preise wie live: 4 Monatstarife mit „Buchen“ (→ Mitglied werden) und der Block „Einmalig & Extras“. */
export function PriceSection({ id = "preise", index }: { id?: string; index?: string }) {
  return (
    <section id={id} className="scroll-mt-24 bg-sand">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading
          index={index}
          eyebrow="Preise"
          title="Transparente Preise"
          description="Finde das passende Abo für dich"
        />
        <Reveal stagger className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TARIFE.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-card border border-border bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <h3 className="text-lg">{t.name}</h3>
              <p className="mt-4">
                <span className="font-heading text-5xl font-black tabular-nums text-brand">{t.preis}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{t.einheit}</p>
              <p className="text-sm text-muted-foreground">{t.laufzeit}</p>
              <ul className="mt-4 flex-1 space-y-1 text-sm">
                {t.zusatz.map((z) => (
                  <li key={z}>{z}</li>
                ))}
              </ul>
              <div className="mt-6">
                <BuchenCta tarif={t} />
              </div>
              <p className="mt-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {STARTGEBUEHR_HINWEIS}
              </p>
            </div>
          ))}
        </Reveal>

        {/* Einmalig & Extras — Wortlaut wie live */}
        <div className="mt-12 rounded-card border border-border bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-2xl sm:text-[28px]">{EXTRAS_TITEL}</h3>
          <p className="mt-1 text-muted-foreground">{EXTRAS_UNTERTITEL}</p>
          <dl className="mt-6 divide-y divide-border">
            {EXTRAS.map((e) => (
              <div key={e.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
                <dt>
                  <span className="font-bold text-foreground">{e.name}</span>
                  {e.hinweis && <span className="ml-2 text-sm text-muted-foreground italic">{e.hinweis}</span>}
                </dt>
                <dd className="font-heading font-black tabular-nums text-brand">{e.preis}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <WhatsAppCta ziel="allgemein" position="preise_extras" label={FRAGEN_LABEL} className="text-left" />
            <p className="text-sm text-muted-foreground">
              <TrackedLink
                href={CTA.tel}
                event="tel_click"
                params={{ position: "preise_extras" }}
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                {KONTAKT.telefonAnzeige}
              </TrackedLink>{" "}
              (auch per WhatsApp) ·{" "}
              <TrackedLink
                href={CTA.mail}
                event="mail_click"
                params={{ position: "preise_extras" }}
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                {KONTAKT.mail}
              </TrackedLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
