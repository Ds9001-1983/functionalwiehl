import { A11yToolbar } from "@/components/a11y/a11y-toolbar";
import { AnalyticsScripts } from "@/components/consent/analytics-scripts";
import { JsonLd, ORGANIZATION_JSONLD } from "@/components/json-ld";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCtaBar } from "@/components/sticky-cta-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";

/**
 * Rahmen aller Website-Seiten (Startseite, Körpermaße, Rechtsseiten).
 * AnalyticsScripts (GA4 + Pixel nach Einwilligung) gehört hierher, nicht ins
 * Root-Layout: Die BN-Landingpage lädt live kein GA4, ihren Pixel startet die
 * BN-Runtime selbst (design-review (a)-1).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // pb reserviert mobil den Platz der StickyCtaBar → kein CLS, nichts verdeckt
    <div className="flex min-h-svh flex-col pb-16 lg:pb-0">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-pill focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-cream"
      >
        Zum Inhalt springen
      </a>
      <SiteHeader />
      <SmoothScroll>
        <main id="inhalt" className="flex-1">
          {children}
        </main>
      </SmoothScroll>
      <SiteFooter />
      <StickyCtaBar />
      <WhatsAppFab />
      <A11yToolbar />
      <AnalyticsScripts />
      <JsonLd data={ORGANIZATION_JSONLD} />
    </div>
  );
}
