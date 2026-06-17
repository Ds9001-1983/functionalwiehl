"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Header-Höhe (sticky) als Scroll-Offset für Anker — deckt sich mit scroll-mt-20. */
const ANCHOR_OFFSET = -80;

/**
 * Aktiviert dezentes Smooth-Scrolling (Lenis) und verkoppelt es mit dem
 * GSAP-Ticker, damit ScrollTrigger-Reveals synchron laufen.
 *
 * - Bei Reduced-Motion (System ODER A11y-Leiste) wird Lenis NICHT gestartet →
 *   natives Scrollen, alle Reveals sind ohnehin statisch sichtbar.
 * - In-Page-Anker (#preise, #cardio …) werden sanft mit Header-Offset
 *   angesteuert; seitenübergreifende Hashes (/#preise) überlässt es Next.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Beim Laden direkt zum Anker (Lenis übernimmt die Sync)
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) lenis.scrollTo(target as HTMLElement, { offset: ANCHOR_OFFSET, immediate: true });
    }

    // Sanftes Scrollen für gleichseitige Anker
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: ANCHOR_OFFSET });
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
