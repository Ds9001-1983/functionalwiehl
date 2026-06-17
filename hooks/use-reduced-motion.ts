"use client";

import { useEffect, useState } from "react";

/**
 * Liefert `true`, wenn Animationen unterdrückt werden sollen — aus ZWEI Quellen:
 *  1. das System-Setting `prefers-reduced-motion: reduce`
 *  2. die A11y-Leisten-Klasse `html.a11y-reduce-motion` (components/a11y/)
 *
 * Beides wird live beobachtet (MediaQuery-Listener + MutationObserver auf der
 * <html>-Klassenliste), damit ein Umschalten in der A11y-Leiste sofort greift.
 *
 * SSR-sicher: startet mit `false` (Server kennt die Präferenz nicht) und
 * korrigiert nach dem Mount. Reveals rendern dadurch nie versteckt aus.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    const compute = () => mql.matches || root.classList.contains("a11y-reduce-motion");

    const update = () => setReduced(compute());
    update();

    mql.addEventListener("change", update);
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mql.removeEventListener("change", update);
      mo.disconnect();
    };
  }, []);

  return reduced;
}
