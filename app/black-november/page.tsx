import type { Metadata, Viewport } from "next";
import Image from "next/image";
import logo from "@/public/img/black-november/logo-functional-freigestellt.png";
import { BnAbschluss } from "@/components/black-november/bn-abschluss";
import { BnFaq } from "@/components/black-november/bn-faq";
import { BnFooter } from "@/components/black-november/bn-footer";
import { BnHero } from "@/components/black-november/bn-hero";
import { BnLeistungen } from "@/components/black-november/bn-leistungen";
import { BnRechnung } from "@/components/black-november/bn-rechnung";
import { BnRuntimeScript } from "@/components/black-november/bn-runtime-script";
import { BnSchritte } from "@/components/black-november/bn-schritte";
import { BnSoftNavGuard } from "@/components/black-november/bn-soft-nav-guard";
import { BnSticky } from "@/components/black-november/bn-sticky";
import { BN_META, BN_SKIPLINK } from "@/content/black-november";
import { META_PIXEL_ID } from "@/lib/tracking";
import "./bn.css";

/**
 * Black-November-Landingpage (BN26, Kampagne bis 09.11.2026 23:59) – 1:1 nach der WP-Seite
 * 231226 (assets/raw/live-2026-10-27/bn.html). Liegt bewusst außerhalb von app/(site): kein
 * Header, Footer, Sticky-Leiste, FAB, keine A11y-Leiste, kein GA4, kein JSON-LD, wie das
 * Live-Template. Der Consent-Banner kommt aus dem Root-Layout.
 *
 * Statisch, noindex,follow (auch nach NEXT_PUBLIC_ALLOW_INDEXING), nicht in PAGES und damit
 * nicht in der Sitemap. OG-Bild über opengraph-image.jpg in diesem Ordner (1076×1350).
 * Betreten und verlassen nur per normalem <a> (Pixel ohne Einwilligung, design-p2.md 0.2).
 */
export const metadata: Metadata = {
  title: BN_META.title,
  description: BN_META.description,
  robots: { index: false, follow: true },
  alternates: { canonical: BN_META.pfad },
  // ersetzt das openGraph des Root-Layouts komplett: live ohne site_name und locale
  openGraph: {
    type: "website",
    title: BN_META.ogTitle,
    description: BN_META.ogDescription,
    url: BN_META.pfad,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default function BlackNovemberPage() {
  return (
    <div className="bn-lp bg-bn-ink font-bn text-[14px] leading-normal font-medium text-[#111] antialiased">
      <BnRuntimeScript />
      <a
        href="#angebot"
        className="absolute top-0 -left-[9999px] z-[100] bg-bn-gelb px-[14px] py-[10px] font-bold text-black focus:top-3 focus:left-3"
      >
        {BN_SKIPLINK}
      </a>

      <header className="bg-bn-ink py-[14px] text-center">
        <Image
          src={logo}
          alt="Functional 24/7 Wiehl"
          sizes="150px"
          loading="eager"
          className="mx-auto h-auto w-[150px]"
        />
      </header>

      <main id="inhalt">
        <BnHero />
        <BnRechnung />
        <BnLeistungen />
        <BnSchritte />
        <BnFaq />
        <BnAbschluss />
      </main>

      <BnFooter />
      <BnSticky />

      <noscript>
        {/* Pixel-Fallback ohne JavaScript, wie live im <head> */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <BnSoftNavGuard />
    </div>
  );
}
