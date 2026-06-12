"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Consent = {
  statistik: boolean;
  marketing: boolean;
  ts: string;
};

const COOKIE_NAME = "fw_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 Monate

function readConsentCookie(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed.statistik === "boolean" && typeof parsed.marketing === "boolean") {
      return parsed;
    }
  } catch {
    // defektes Cookie → wie "keine Entscheidung" behandeln
  }
  return null;
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
    const stored = readConsentCookie();
    setConsent(stored);
    setBannerOpen(stored === null);
    setLoading(false);
  }, []);

  const save = useCallback((choice: Pick<Consent, "statistik" | "marketing">) => {
    const value: Consent = { ...choice, ts: new Date().toISOString() };
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(value)
    )}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    setConsent(value);
    setBannerOpen(false);
  }, []);

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
