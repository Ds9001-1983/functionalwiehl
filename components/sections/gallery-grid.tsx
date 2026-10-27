import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: StaticImageData; alt: string; caption?: string };

/** Verlinkte Kachel vor der Überschrift (live: Körpermaße-Screenshot über „Studio Galerie“). */
export type GalleryTeaser = { href: string; src: StaticImageData; titel: string; text: string };

/** Studio-Galerie — scroll-snap auf Mobile, Grid ab md. Alles lazy. */
export function GalleryGrid({
  images,
  teaser,
  title = "Studio Galerie",
  eyebrow = "Einblicke",
  index,
  id,
}: {
  images: GalleryImage[];
  teaser?: GalleryTeaser;
  title?: string;
  eyebrow?: string;
  index?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "container-site scroll-mt-24 py-16 sm:py-20",
        teaser && "grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-center lg:gap-12"
      )}
    >
      {teaser && (
        // Bild und Text bilden EINEN Link; der sichtbare Text benennt das Ziel, das Bild ist dekorativ
        <Link
          href={teaser.href}
          className="group flex max-w-[300px] flex-col overflow-hidden rounded-card border border-border bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Image
            src={teaser.src}
            alt=""
            sizes="300px"
            // oberer Teil des Screenshots (Icon, Titel, Untertitel) genügt als Vorschau
            className="aspect-[4/3] w-full object-cover object-top"
            placeholder="blur"
          />
          <span className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <span>
              <span className="block font-extrabold text-brand">{teaser.titel}</span>
              <span className="block text-sm text-muted-foreground">{teaser.text}</span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-5 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </Link>
      )}
      <div>
        <SectionHeading index={index} eyebrow={eyebrow} title={title} />
        <Reveal
          stagger
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0"
        >
          {images.map((img) => (
            <figure
              key={img.alt}
              className="group relative w-[78%] shrink-0 snap-center overflow-hidden rounded-card md:w-auto"
            >
              <Image
                src={img.src}
                alt={img.alt}
                sizes="(max-width: 768px) 78vw, 33vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                placeholder="blur"
              />
              {img.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-brand-deep/80 to-transparent p-4 pt-10 text-sm font-bold text-cream">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
