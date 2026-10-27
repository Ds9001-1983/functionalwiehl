"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Das Studio-Video der Live-Site („So findest du uns“ in #kontakt) — vom Kunden
 * explizit gewünscht. Re-encodiert von 61 MB auf 4,5 MB (scripts/encode-video.sh).
 * preload="none" + Poster; abgespielt wird erst, wenn das Video sichtbar ist.
 * prefers-reduced-motion → nur Poster, kein Autoplay.
 */
export function StudioVideo() {
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
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      poster="/video/studio-loop-poster.jpg"
      aria-label="Drohnenflug über Wiehl bis zum Studio von Functional Wiehl"
      className="aspect-video w-full rounded-card object-cover shadow-md"
      data-inview={inView}
    >
      <source src="/video/studio-loop.mp4" type="video/mp4" />
    </video>
  );
}
