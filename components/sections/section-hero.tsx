import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

/**
 * Hero-Baustein jeder Unterseite (Mini-Landing-Page): H1 + Bild + CTA
 * above the fold. KEIN Slider — ein statisches, priorisiertes Bild = LCP.
 * Editorial: Eyebrow-Zeile, wuchtige Display-H1, gelber Akzentstrich.
 */
export function SectionHero({
  title,
  subtitle,
  image,
  imageAlt,
  badge,
  eyebrow,
  cta,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  image: StaticImageData;
  imageAlt: string;
  badge?: string;
  eyebrow?: string;
  cta?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand">
      <Image
        src={image}
        alt={imageAlt}
        priority
        fetchPriority="high"
        fill
        sizes="100vw"
        className="object-cover opacity-40"
        placeholder="blur"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-brand-deep/90 via-brand-deep/45 to-brand-deep/15"
        aria-hidden="true"
      />
      <div
        className={`container-site relative flex flex-col items-start justify-end gap-5 ${
          compact ? "min-h-[44svh] py-12" : "min-h-[66svh] py-14"
        }`}
      >
        {(eyebrow || badge) && (
          <div className="flex flex-wrap items-center gap-3">
            {eyebrow && (
              <span className="eyebrow text-cta">
                <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
                {eyebrow}
              </span>
            )}
            {badge && (
              <span className="rounded-pill bg-cta px-4 py-1.5 text-sm font-bold text-cta-foreground">
                {badge}
              </span>
            )}
          </div>
        )}
        <h1 className="max-w-4xl text-display text-cream">{title}</h1>
        {subtitle && <p className="max-w-xl text-base text-cream/90 sm:text-lg">{subtitle}</p>}
        {cta && <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row">{cta}</div>}
      </div>
    </section>
  );
}
