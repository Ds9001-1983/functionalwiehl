import Image, { type StaticImageData } from "next/image";

export type GalleryImage = { src: StaticImageData; alt: string; caption?: string };

/** Studio-Galerie — scroll-snap auf Mobile, Grid ab md. Alles lazy. */
export function GalleryGrid({ images, title = "Studio Galerie" }: { images: GalleryImage[]; title?: string }) {
  return (
    <section className="container-site py-14">
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {images.map((img) => (
          <figure
            key={img.alt}
            className="relative w-[78%] shrink-0 snap-center overflow-hidden rounded-card md:w-auto"
          >
            <Image
              src={img.src}
              alt={img.alt}
              sizes="(max-width: 768px) 78vw, 33vw"
              className="aspect-[4/3] w-full object-cover"
              placeholder="blur"
            />
            {img.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-10 text-sm font-bold text-cream">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
