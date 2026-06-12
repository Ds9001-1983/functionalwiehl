/**
 * Zentrale Event-Instrumentierung (Angebot Stufe 1: WhatsApp-Klick,
 * Probetraining-Anfrage, Gesundheits-Check, Calendly-Buchung).
 *
 * Alle Klick-Events laufen über trackEvent() — nirgendwo verstreute
 * gtag/fbq-Aufrufe. gtag nutzt transport_type "beacon": auf iOS springt der
 * Tap sofort in die WhatsApp-App, ohne Beacon ginge das Kernsignal verloren
 * (51 % der Besucher klicken einen Outbound-Link, Quelle: Matomo-Audit).
 */

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
  | "pricecard"
  | "cta_band"
  | "footer"
  | "kontaktzeile"
  | "teaser"
  | "quiz";

export type EventParams = {
  position?: EventPosition;
  /** WhatsApp-Preset: probetraining → Meta "Lead", vertrag → "Contact" */
  preset?: "probetraining" | "vertrag";
  /** Nur für checkup_submit — NIE Antwortdaten, nur die Ergebnis-Kategorie */
  ergebnis_kategorie?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function metaEventFor(name: EventName, params: EventParams): string | null {
  switch (name) {
    case "whatsapp_click":
      return params.preset === "vertrag" ? "Contact" : "Lead";
    case "tel_click":
    case "mail_click":
      return "Contact";
    case "calendly_click":
      return "Schedule";
    case "checkup_submit":
      return "CompleteRegistration";
  }
}

export function trackEvent(name: EventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const page = window.location.pathname;

  // No-ops solange kein Consent erteilt wurde — die Skripte werden erst
  // nach Opt-in geladen (siehe components/consent/analytics-scripts.tsx).
  window.gtag?.("event", name, { ...params, page, transport_type: "beacon" });

  const metaEvent = metaEventFor(name, params);
  if (metaEvent) window.fbq?.("track", metaEvent, { page, ...params });
}

export function trackPageview(path: string): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", { page_path: path });
  window.fbq?.("track", "PageView");
}
