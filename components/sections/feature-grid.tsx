import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { LEISTUNGEN, type Leistung } from "@/content/leistungen";
import { cn } from "@/lib/utils";

/**
 * Leistungen als asymmetrisches Bento-Grid mit Foto-Kacheln (statt 6 gleicher
 * weißer Karten). Erste Kachel groß (2×2), Rest variierend. Jede Kachel
 * verlinkt auf ihre Unterseite (Hub & Spoke).
 */
export function FeatureGrid({ compact = false }: { compact?: boolean }) {
  return (
    <Reveal
      stagger
      className="grid auto-rows-[minmax(190px,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {LEISTUNGEN.map((l, i) => (
        <FeatureTile key={l.id} l={l} featured={i === 0} compact={compact} />
      ))}
    </Reveal>
  );
}

function FeatureTile({
  l,
  featured,
  compact,
}: {
  l: Leistung;
  featured: boolean;
  compact: boolean;
}) {
  return (
    <Link
      href={l.href}
      className={cn(
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-card p-6 text-cream shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        featured && "sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2"
      )}
    >
      <Image
        src={l.image}
        alt={l.imageAlt}
        fill
        sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
        className="-z-10 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        placeholder="blur"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-brand-deep/90 via-brand-deep/40 to-brand-deep/5"
      />

      <h3 className={cn("font-heading font-black text-cream", featured ? "text-3xl sm:text-4xl" : "text-xl")}>
        {l.titel}
      </h3>

      {featured && !compact && (
        <p className="mt-3 max-w-md text-sm text-cream/85">{l.beschreibung}</p>
      )}

      {featured && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {l.punkte.map((p) => (
            <li key={p} className="flex items-center gap-1.5 text-sm text-cream/90">
              <Check className="size-4 shrink-0 text-cta" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-cream">
        Mehr erfahren
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
