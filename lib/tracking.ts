/**
 * Zentrale Event-Instrumentierung der Website (WhatsApp, Telefon, Mail, Calendly, Check-up).
 *
 * Alle Klick-Events laufen über trackEvent() — nirgendwo verstreute
 * gtag/fbq-Aufrufe. gtag nutzt transport_type "beacon": auf iOS springt der
 * Tap sofort in die WhatsApp-App, ohne Beacon ginge das Kernsignal verloren
 * (51 % der Besucher klicken einen Outbound-Link, Quelle: Matomo-Audit).
 *
 * Event-Zuordnung seit 27.10.2026 (design-p2.md 0.5):
 * - Meta-Standard-Event `Contact` gibt es nur auf der BN-LP (Runtime, eventID bnc-<Code>),
 *   `Lead` nur serverseitig aus n8n per CAPI. Website-Klicks werden Custom Events `FW_*`,
 *   damit das Kampagnenziel Contact von BN26 nicht verwässert.
 * - Check-up geht nie an Meta (Nähe zu Art. 9 DSGVO), an GA4 nur ohne Antwortdaten.
 * - GA4 nur mit Statistik-, Meta nur mit Marketing-Einwilligung. Geprüft wird hier direkt
 *   am Cookie, zusätzlich zum Hard-Gating der Skripte (components/consent/analytics-scripts.tsx).
 */

import { CONSENT_COOKIE, readConsentCookie } from "./consent-cookie";

export const GA4_ID = "G-H41716E7JE";
export const META_PIXEL_ID = "965083147995308";

export type EventName =
  | "whatsapp_click"
  | "tel_click"
  | "calendly_click"
  | "mail_click"
  | "checkup_submit";

export type EventPosition =
  | "header"
  | "hero"
  | "sticky_bar"
  | "whatsapp_fab"
  | "pricecard"
  | "cta_band"
  | "footer"
  | "kontaktzeile"
  | "teaser"
  | "quiz"
  | "preise_extras"
  | "kontakt"
  | "not_found";

/** WhatsApp-Ziel = Konstante in lib/cta.ts (probetraining, mitglied, allgemein) */
export type WhatsAppPreset = "probetraining" | "mitglied" | "allgemein";

export type EventParams = {
  position?: EventPosition;
  /** WhatsApp-Preset; geht an Meta als `ziel` im Custom Event FW_WhatsApp_Klick */
  preset?: WhatsAppPreset;
  // checkup_submit trägt bewusst KEINE Antwort- oder Ergebnisdaten (Nähe zu Art. 9 DSGVO).
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Custom Events für Meta; null = geht nicht an Meta */
const META_CUSTOM_EVENT: Record<EventName, string | null> = {
  whatsapp_click: "FW_WhatsApp_Klick",
  tel_click: "FW_Anruf_Klick",
  mail_click: "FW_Mail_Klick",
  calendly_click: "FW_Telefontermin_Klick",
  checkup_submit: null,
};

export function trackEvent(name: EventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const consent = readConsentCookie(CONSENT_COOKIE);
  if (!consent) return;
  const page = window.location.pathname;

  if (consent.statistik) {
    window.gtag?.("event", name, { ...params, page, transport_type: "beacon" });
  }

  const metaEvent = META_CUSTOM_EVENT[name];
  if (consent.marketing && metaEvent) {
    const daten: Record<string, string> = { page };
    if (params.position) daten.position = params.position;
    if (params.preset) daten.ziel = params.preset;
    window.fbq?.("trackCustom", metaEvent, daten);
  }
}

/** Seitenwechsel per Client-Navigation (den ersten Aufruf melden gtag-config bzw. ensureMetaPixel). */
export function trackPageview(path: string): void {
  if (typeof window === "undefined") return;
  const consent = readConsentCookie(CONSENT_COOKIE);
  if (!consent) return;
  if (consent.statistik) window.gtag?.("event", "page_view", { page_path: path });
  if (consent.marketing) window.fbq?.("track", "PageView");
}
