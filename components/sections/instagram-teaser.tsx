import Image from "next/image";
import { Play } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CTA } from "@/lib/cta";
import type { InstagramPost } from "@/lib/instagram/typen";

const datumFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

/**
 * #aktuelles: die neuesten Instagram-Beiträge als Kacheln, rein darstellend.
 * Bilder liegen lokal (Fallback) bzw. später im eigenen Blob – kein Embed, kein Request an
 * Meta beim Laden, also keine Einwilligung nötig. Jede Kachel verlinkt den Beitrag selbst,
 * Reels zeigen das Play-Symbol (wie der Datenschutzmodus von Smash Balloon live).
 */
export function InstagramTeaser({
  id,
  posts,
  index,
}: {
  id?: string;
  posts: InstagramPost[];
  index?: string;
}) {
  return (
    <section id={id} className="container-site scroll-mt-24 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading index={index} eyebrow="@functionalwiehl" title="Aktuelles" />
        <a
          href={CTA.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand"
        >
          <InstagramIcon className="size-4" />
          <span className="underline-offset-4 group-hover:underline">@functionalwiehl auf Instagram</span>
        </a>
      </div>
      <Reveal
        stagger
        className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
      >
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/5] w-[72%] shrink-0 snap-center overflow-hidden rounded-card bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
          >
            <Image
              src={post.bild}
              alt={post.alt}
              fill
              sizes="(max-width: 640px) 72vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              placeholder={typeof post.bild === "string" ? "empty" : "blur"}
            />
            <span className="sr-only">
              {post.typ === "VIDEO" ? "Reel" : "Beitrag"} auf Instagram ansehen (neues Fenster)
            </span>
            {post.typ === "VIDEO" && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-brand-deep/0 transition-colors duration-300 group-hover:bg-brand-deep/25"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                  <Play className="size-6 translate-x-0.5 fill-current" />
                </span>
              </span>
            )}
            <time
              dateTime={post.zeitpunkt}
              className="absolute bottom-3 left-3 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-bold text-brand"
            >
              {datumFormat.format(new Date(post.zeitpunkt))}
            </time>
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
