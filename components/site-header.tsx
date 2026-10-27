"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/img/logo-functional-neu.png";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { WhatsAppCta } from "./cta-buttons";
import { MobileNav } from "./mobile-nav";

/** Kopfzeile wie live: Logo, Menü mit den 6 Startseiten-Ankern, CTA „Buche ein Probetraining“. */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/85 backdrop-blur transition-[box-shadow,background-color,border-color] supports-backdrop-filter:bg-white/75",
        // Nur Paint-Eigenschaften ändern (kein Höhenwechsel) → kein Layout-Shift
        scrolled ? "border-border/60 shadow-sm" : "border-transparent"
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Functional Wiehl – Startseite" className="shrink-0">
          {/* eager statt preload: das Logo ist nicht das LCP-Element (design-review (c)-8) */}
          <Image
            src={logo}
            alt="Logo Functional Wiehl GmbH"
            loading="eager"
            className="h-9 w-auto"
            sizes="160px"
          />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-5 lg:flex xl:gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm font-semibold tracking-wide text-brand uppercase"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppCta ziel="probetraining" position="header" size="sm" className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
