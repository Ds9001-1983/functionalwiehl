import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { A11yProvider } from "@/components/a11y/a11y-context";
import { A11yToolbar } from "@/components/a11y/a11y-toolbar";
import { AnalyticsScripts } from "@/components/consent/analytics-scripts";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { ConsentProvider } from "@/components/consent/consent-context";
import { JsonLd, ORGANIZATION_JSONLD } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCtaBar } from "@/components/sticky-cta-bar";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { PAGES, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Die Live-Site deklariert "Open Sans", lädt aber keinen Webfont —
// hier wird er via next/font self-gehostet (DSGVO-sauber, kein Google-Request).
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGES.home.title,
  description: PAGES.home.description,
  openGraph: {
    siteName: "Functional Wiehl",
    locale: "de_DE",
    type: "website",
  },
};

// FOUC-Schutz: setzt die Barrierefreiheits-Einstellungen aus localStorage,
// bevor der erste Paint passiert. Logik gespiegelt aus a11y-context.tsx → applyA11y.
const A11Y_INIT = `try{var s=JSON.parse(localStorage.getItem("fw_a11y")||"{}");var e=document.documentElement;e.dataset.fontscale=String([0,1,2].includes(s.fontScale)?s.fontScale:0);e.classList.toggle("a11y-contrast",!!s.contrast);e.classList.toggle("a11y-reduce-motion",!!s.reduceMotion);e.classList.toggle("a11y-highlight-links",!!s.highlightLinks);}catch(_){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={openSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT }} />
      </head>
      {/* pb reserviert mobil den Platz der StickyCtaBar → kein CLS, nichts verdeckt */}
      <body className="flex min-h-svh flex-col pb-16 antialiased lg:pb-0">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-pill focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-cream"
        >
          Zum Inhalt springen
        </a>
        <A11yProvider>
          <ConsentProvider>
            <SiteHeader />
            <main id="inhalt" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <StickyCtaBar />
            <WhatsAppFab />
            <A11yToolbar />
            <ConsentBanner />
            <AnalyticsScripts />
          </ConsentProvider>
        </A11yProvider>
        <JsonLd data={ORGANIZATION_JSONLD} />
      </body>
    </html>
  );
}
