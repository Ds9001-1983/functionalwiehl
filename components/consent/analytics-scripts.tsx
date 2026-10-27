"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_COOKIE, readConsentCookie } from "@/lib/consent-cookie";
import { ensureMetaPixel } from "@/lib/meta-pixel";
import { GA4_ID, META_PIXEL_ID, trackPageview } from "@/lib/tracking";
import { useConsent } from "./consent-context";

/**
 * Hard-Gating (strikte TTDSG-Linie): Vor dem Opt-in wird KEIN Byte an
 * Google oder Meta gesendet — die Skripte existieren bis dahin nicht im DOM.
 * Wird per Playwright-Request-Interception abgesichert (tests/consent.spec.ts, tests/tracking.spec.ts).
 *
 * Nur im Website-Rahmen (app/(site)/layout.tsx) und auf der 404 (app/not-found.tsx), nicht auf
 * der BN-LP: Dort startet die Inline-Runtime den Pixel ohne Einwilligung, GA4 lädt dort wie live
 * nie (design-review (a)-1).
 */

// Google Consent Mode v2, Basic Mode: gtag existiert erst nach der Statistik-Einwilligung.
// Werbe-Signale bleiben auch dann aus (kein Google Ads, keine Signals), anonymize_ip wirkt in GA4 nicht.
const GA4_INIT = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA4_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });`;

export function AnalyticsScripts() {
  const { consent } = useConsent();
  const pathname = usePathname();

  // Wächter: Kam der Besuch per Client-Navigation von der BN-LP, läuft deren Pixel (ohne
  // Einwilligung gestartet) im Speicher weiter. Ohne Marketing-Einwilligung einmal neu laden,
  // damit er auf der Website nicht weiter misst. Normal verlässt man die LP per <a>.
  useEffect(() => {
    if (window.__fwPixel?.quelle === "lp" && !readConsentCookie(CONSENT_COOKIE)?.marketing) {
      window.location.reload();
    }
  }, []);

  // Pixel erst nach Marketing-Einwilligung, höchstens einmal je Dokument (init + PageView)
  useEffect(() => {
    if (consent?.marketing) {
      ensureMetaPixel({ pixelId: META_PIXEL_ID, quelle: "consent", autoConfig: false });
    }
  }, [consent?.marketing]);

  // Pageviews bei Client-Navigation nachfeuern (den ersten Aufruf melden gtag("config")
  // bzw. ensureMetaPixel). trackPageview prüft die Einwilligung selbst.
  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  if (!consent?.statistik) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {GA4_INIT}
      </Script>
    </>
  );
}
