"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { GA4_ID, META_PIXEL_ID, trackPageview } from "@/lib/tracking";
import { useConsent } from "./consent-context";

/**
 * Hard-Gating (strikte TTDSG-Linie): Vor dem Opt-in wird KEIN Byte an
 * Google oder Meta gesendet — die Skripte existieren bis dahin nicht im DOM.
 * Wird per Playwright-Request-Interception abgesichert (tests/consent.spec.ts).
 */
export function AnalyticsScripts() {
  const { consent } = useConsent();
  const pathname = usePathname();

  // Pageviews bei Client-Navigation nachfeuern (initialer Load kommt aus
  // gtag("config") bzw. fbq("init")+PageView in den Inline-Snippets).
  useEffect(() => {
    if (consent?.statistik || consent?.marketing) trackPageview(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {consent?.statistik && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      )}
      {consent?.marketing && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}
