import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

/**
 * Wiederverwendbarer, alternierender Bild-Text-Split — ersetzt das mehrfach
 * duplizierte Inline-Split-Markup (Team-Teaser, Trainingsbereiche, Personal
 * Training, 24/7 …). Editorial: großer Index, Eyebrow, Bild mit dezentem
 * Akzent-Rahmen + Hover-Zoom, sanftes Einblenden.
 */
export function EditorialSplit({
  id,
  index,
  eyebrow,
  title,
  image,
  imageAlt,
  reverse = false,
  muted = false,
  priority = false,
  children,
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  image: StaticImageData;
  imageAlt: string;
  /** Bild rechts statt links. */
  reverse?: boolean;
  /** warmer Sand-Hintergrund statt weiß. */
  muted?: boolean;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", muted && "bg-sand")}>
      <div className="container-site grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <Reveal className={cn("group relative", reverse && "lg:order-2")}>
          {/* dezenter, versetzter Akzent-Rahmen hinter dem Bild */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -inset-3 -z-10 rounded-card border-2 border-brand/15",
              reverse ? "translate-x-3 translate-y-3" : "-translate-x-3 translate-y-3"
            )}
          />
          <div className="overflow-hidden rounded-card shadow-sm">
            <Image
              src={image}
              alt={imageAlt}
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              placeholder="blur"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <SectionHeading index={index} eyebrow={eyebrow} title={title} />
          <div className="mt-5 text-muted-foreground">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
