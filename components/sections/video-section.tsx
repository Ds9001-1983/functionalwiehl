"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { KONTAKT, CTA } from "@/lib/cta";

/**
 * Das Studio-Video der Live-Site („So findest du uns"-Bereich) — vom Kunden
 * explizit gewünscht. Re-encodiert von 61 MB auf 4,5 MB (scripts/encode-video.sh).
 * preload="none" + Poster; abgespielt wird erst, wenn die Sektion sichtbar ist.
 * prefers-reduced-motion → nur Poster, kein Autoplay.
 */
export function VideoSection({ index }: { index?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          el.play().catch(() => {
            /* Autoplay kann z. B. im Energiesparmodus scheitern — Poster bleibt */
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="container-site grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14">
      <div>
        <SectionHeading index={index} eyebrow="Standort" title="So findest du uns" />
        <address className="mt-5 text-base not-italic leading-relaxed">
          <strong>{KONTAKT.firma}</strong>
          <br />
          {KONTAKT.strasse}
          <br />
          {KONTAKT.plzOrt}
        </address>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {[
            "Kostenlose Parkplätze direkt vor Ort",
            "Bushaltestelle „Wiehl Zentrum“ – 2 Min. Fußweg",
            "Barrierefrei zugänglich",
          ].map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-whatsapp" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <a
          href={CTA.mapsRoute}
          target="_blank"
          rel="noopener"
          className="mt-6 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand transition-colors hover:bg-brand/5"
        >
          Route in Google Maps öffnen
        </a>
      </div>
      <div className="group relative">
        <span
          aria-hidden="true"
          className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-card border-2 border-brand/15"
        />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster="/video/studio-loop-poster.jpg"
          aria-label="Rundgang durch das Studio von Functional Wiehl"
          className="aspect-video w-full rounded-card object-cover shadow-md"
          data-inview={inView}
        >
          <source src="/video/studio-loop.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
