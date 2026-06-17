import Image, { type StaticImageData } from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export type GalleryImage = { src: StaticImageData; alt: string; caption?: string };

/** Studio-Galerie — scroll-snap auf Mobile, Grid ab md. Alles lazy. */
export function GalleryGrid({
  images,
  title = "Studio Galerie",
  eyebrow = "Einblicke",
  index,
}: {
  images: GalleryImage[];
  title?: string;
  eyebrow?: string;
  index?: string;
}) {
  return (
    <section className="container-site py-16 sm:py-20">
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
    </section>
  );
}
