"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Hero-Media-Kachel mit dem Studio-Loop. Performance-bewusst:
 * - `preload="none"` → die 4,5-MB-Datei wird NICHT automatisch geladen; sichtbar
 *   ist zunächst nur das ~100 KB Poster (gut für die 79 % Mobile-Nutzer).
 * - Das Video wird nur auf großen Screens (≥1024px) und ohne Reduced-Motion
 *   abgespielt; auf Mobile bleibt es beim Poster (spart Daten).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (reduced || !isDesktop) {
      el.pause();
      return;
    }
    el.play().catch(() => {
      /* Autoplay kann scheitern (Energiesparmodus) — Poster bleibt sichtbar */
    });
  }, [reduced]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster="/video/studio-loop-poster.jpg"
      aria-label="Rundgang durch das Studio von Functional Wiehl"
      className="h-full w-full object-cover"
    >
      <source src="/video/studio-loop.mp4" type="video/mp4" />
    </video>
  );
}
