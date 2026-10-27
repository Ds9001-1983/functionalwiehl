"use client";

import { useEffect } from "react";

const MERKER = "bn_runtime_reload";

/**
 * Wächter beim Betreten der LP: Fehlt window.__fwBn, kam der Besuch per Client-Navigation
 * und die Inline-Runtime lief nicht (Code, Pixel, CTAs tot). Dann genau einmal neu laden;
 * der Merker in sessionStorage verhindert eine Schleife, falls die Runtime auch danach fehlt.
 * Normal wird die LP per <a> betreten (Startseiten-Teaser, Anzeigen), dann tut er nichts.
 */
export function BnSoftNavGuard() {
  useEffect(() => {
    try {
      if (window.__fwBn) {
        sessionStorage.removeItem(MERKER);
        return;
      }
      if (sessionStorage.getItem(MERKER)) return;
      sessionStorage.setItem(MERKER, "1");
    } catch {
      return;
    }
    window.location.reload();
  }, []);
  return null;
}
