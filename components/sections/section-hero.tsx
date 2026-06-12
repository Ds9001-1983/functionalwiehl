import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

/**
 * Hero-Baustein jeder Unterseite (Mini-Landing-Page): H1 + Bild + CTA
 * above the fold. KEIN Slider — ein statisches, priorisiertes Bild = LCP.
 */
export function SectionHero({
  title,
  subtitle,
  image,
  imageAlt,
  badge,
  cta,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  image: StaticImageData;
  imageAlt: string;
  badge?: string;
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
        className="object-cover opacity-45"
        placeholder="blur"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10"
        aria-hidden="true"
      />
      <div
        className={`container-site relative flex flex-col items-start justify-end gap-4 ${
          compact ? "min-h-[40svh] py-10" : "min-h-[62svh] py-12"
        }`}
      >
        {badge && (
          <span className="rounded-pill bg-cta px-4 py-1.5 text-sm font-bold text-cta-foreground">
            {badge}
          </span>
        )}
        <h1 className="max-w-2xl text-3xl text-cream sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="max-w-xl text-base text-cream/90 sm:text-lg">{subtitle}</p>}
        {cta && <div className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row">{cta}</div>}
      </div>
    </section>
  );
}
