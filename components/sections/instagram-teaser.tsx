import Image, { type StaticImageData } from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CTA } from "@/lib/cta";

/**
 * Statischer Instagram-Teaser: kuratierte, lokal gehostete Bilder + Profil-Link.
 * Bewusst KEIN Embed/Feed-Plugin — null Third-Party-JS vor Consent,
 * kein API-Token nötig (Plan §2).
 */
export function InstagramTeaser({
  images,
  index,
}: {
  images: { src: StaticImageData; alt: string }[];
  index?: string;
}) {
  return (
    <section className="container-site py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading index={index} eyebrow="@functionalwiehl" title="Aktuelles aus dem Studio" />
        <a
          href={CTA.instagram}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-2 text-sm font-bold text-brand"
        >
          <InstagramIcon className="size-4" />
          <span className="underline-offset-4 group-hover:underline">Auf Instagram folgen</span>
        </a>
      </div>
      <Reveal stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <a
            key={img.alt}
            href={CTA.instagram}
            target="_blank"
            rel="noopener"
            className="group relative overflow-hidden rounded-card"
          >
            <Image
              src={img.src}
              alt={img.alt}
              sizes="(max-width: 640px) 50vw, 25vw"
              className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              placeholder="blur"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-brand/0 text-cream opacity-0 transition-all duration-300 group-hover:bg-brand/40 group-hover:opacity-100"
            >
              <InstagramIcon className="size-7" />
            </span>
          </a>
        ))}
      </Reveal>
    </section>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
