import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AnalyticsScripts } from "@/components/consent/analytics-scripts";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { ConsentProvider } from "@/components/consent/consent-context";
import { JsonLd, ORGANIZATION_JSONLD } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCtaBar } from "@/components/sticky-cta-bar";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={openSans.variable}>
      {/* pb reserviert mobil den Platz der StickyCtaBar → kein CLS, nichts verdeckt */}
      <body className="flex min-h-svh flex-col pb-16 antialiased lg:pb-0">
        <ConsentProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <StickyCtaBar />
          <ConsentBanner />
          <AnalyticsScripts />
        </ConsentProvider>
        <JsonLd data={ORGANIZATION_JSONLD} />
      </body>
    </html>
  );
}
