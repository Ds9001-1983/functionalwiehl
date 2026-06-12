import Image, { type StaticImageData } from "next/image";
import { CTA } from "@/lib/cta";

/**
 * Statischer Instagram-Teaser: kuratierte, lokal gehostete Bilder + Profil-Link.
 * Bewusst KEIN Embed/Feed-Plugin — null Third-Party-JS vor Consent,
 * kein API-Token nötig (Plan §2).
 */
export function InstagramTeaser({
  images,
}: {
  images: { src: StaticImageData; alt: string }[];
}) {
  return (
    <section className="container-site py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl">Aktuelles aus dem Studio</h2>
        <a
          href={CTA.instagram}
          target="_blank"
          rel="noopener"
          className="text-sm font-bold text-brand underline-offset-4 hover:underline"
        >
          @functionalwiehl auf Instagram →
        </a>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <a key={img.alt} href={CTA.instagram} target="_blank" rel="noopener" className="group overflow-hidden rounded-card">
            <Image
              src={img.src}
              alt={img.alt}
              sizes="(max-width: 640px) 50vw, 25vw"
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
