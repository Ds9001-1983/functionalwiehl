"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CONSENT_COOKIE, readConsentCookie, type Consent } from "@/lib/consent-cookie";

export type { Consent } from "@/lib/consent-cookie";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 Monate

/** Cookies von Pixel (_fbp, _fbc) und GA4 (_ga, _ga_*) für Host und Hauptdomain löschen */
function trackerCookiesLoeschen() {
  const namen = document.cookie
    .split("; ")
    .map((c) => c.split("=")[0])
    .filter((n) => n === "_fbp" || n === "_fbc" || n === "_ga" || n.startsWith("_ga_"));
  const host = window.location.hostname;
  const domains = ["", host, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of namen) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

type ConsentContextValue = {
  /** null = noch keine Entscheidung → Banner zeigen */
  consent: Consent | null;
  /** true solange der Cookie noch nicht gelesen wurde (SSR-Hydration) */
  loading: boolean;
  bannerOpen: boolean;
  save: (choice: Pick<Consent, "statistik" | "marketing">) => void;
  openBanner: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readConsentCookie(CONSENT_COOKIE);
    // Bewusst erst nach der Hydration: Server und erster Client-Render zeigen denselben Stand (loading).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored);
    setBannerOpen(stored === null);
    setLoading(false);
  }, []);

  const save = useCallback(
    (choice: Pick<Consent, "statistik" | "marketing">) => {
      const value: Consent = { ...choice, ts: new Date().toISOString() };
      document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
        JSON.stringify(value)
      )}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;

      // Widerruf: geladene Tracker lassen sich nicht entladen → Cookies löschen und neu laden,
      // dann startet nur noch, was erlaubt ist.
      const entzogen = (consent?.statistik && !choice.statistik) || (consent?.marketing && !choice.marketing);
      if (entzogen) {
        trackerCookiesLoeschen();
        window.location.reload();
        return;
      }
      setConsent(value);
      setBannerOpen(false);
    },
    [consent]
  );

  const openBanner = useCallback(() => setBannerOpen(true), []);

  return (
    <ConsentContext.Provider value={{ consent, loading, bannerOpen, save, openBanner }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent außerhalb von <ConsentProvider>");
  return ctx;
}
