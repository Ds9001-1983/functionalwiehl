"use client";

import { useEffect, useRef, useState } from "react";
import { KONTAKT, CTA } from "@/lib/cta";

/**
 * Das Studio-Video der Live-Site („So findest du uns"-Bereich) — vom Kunden
 * explizit gewünscht. Re-encodiert von 61 MB auf 4,5 MB (scripts/encode-video.sh).
 * preload="none" + Poster; abgespielt wird erst, wenn die Sektion sichtbar ist.
 * prefers-reduced-motion → nur Poster, kein Autoplay.
 */
export function VideoSection() {
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
    <section className="container-site grid items-center gap-8 py-14 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl sm:text-3xl">So findest du uns</h2>
        <address className="mt-4 text-base not-italic leading-relaxed">
          <strong>{KONTAKT.firma}</strong>
          <br />
          {KONTAKT.strasse}
          <br />
          {KONTAKT.plzOrt}
        </address>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <li>✓ Kostenlose Parkplätze direkt vor Ort</li>
          <li>✓ Bushaltestelle „Wiehl Zentrum“ – 2 Min. Fußweg</li>
          <li>✓ Barrierefrei zugänglich</li>
        </ul>
        <a
          href={CTA.mapsRoute}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand hover:bg-brand/5"
        >
          Route in Google Maps öffnen
        </a>
      </div>
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
    </section>
  );
}
