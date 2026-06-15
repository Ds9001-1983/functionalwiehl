"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type A11ySettings = {
  fontScale: 0 | 1 | 2;
  contrast: boolean;
  reduceMotion: boolean;
  highlightLinks: boolean;
};

export const A11Y_STORAGE_KEY = "fw_a11y";

export const A11Y_DEFAULT: A11ySettings = {
  fontScale: 0,
  contrast: false,
  reduceMotion: false,
  highlightLinks: false,
};

/**
 * Wendet die Einstellungen auf <html> an. Dieselbe Logik läuft auch im
 * Inline-Script in app/layout.tsx (FOUC-Schutz) — bei Änderungen beide anpassen.
 */
export function applyA11y(s: A11ySettings) {
  const el = document.documentElement;
  el.dataset.fontscale = String(s.fontScale);
  el.classList.toggle("a11y-contrast", s.contrast);
  el.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  el.classList.toggle("a11y-highlight-links", s.highlightLinks);
}

function read(): A11ySettings {
  if (typeof window === "undefined") return A11Y_DEFAULT;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return A11Y_DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      fontScale: [0, 1, 2].includes(parsed.fontScale) ? parsed.fontScale : 0,
      contrast: Boolean(parsed.contrast),
      reduceMotion: Boolean(parsed.reduceMotion),
      highlightLinks: Boolean(parsed.highlightLinks),
    };
  } catch {
    return A11Y_DEFAULT;
  }
}

type A11yContextValue = {
  settings: A11ySettings;
  update: (patch: Partial<A11ySettings>) => void;
  reset: () => void;
};

const A11yContext = createContext<A11yContextValue | null>(null);

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(A11Y_DEFAULT);

  // Beim Mount aus localStorage übernehmen (Inline-Script hat die Klassen
  // schon vor dem Paint gesetzt; hier wird nur der React-State synchronisiert).
  useEffect(() => {
    setSettings(read());
  }, []);

  const persist = useCallback((next: A11ySettings) => {
    setSettings(next);
    applyA11y(next);
    try {
      window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage kann blockiert sein — Einstellung gilt dann nur für die Sitzung */
    }
  }, []);

  const update = useCallback(
    (patch: Partial<A11ySettings>) => persist({ ...read(), ...settings, ...patch }),
    [persist, settings]
  );

  const reset = useCallback(() => persist(A11Y_DEFAULT), [persist]);

  return (
    <A11yContext.Provider value={{ settings, update, reset }}>{children}</A11yContext.Provider>
  );
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y außerhalb von <A11yProvider>");
  return ctx;
}
