"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/img/logo-functional-neu.png";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { WhatsAppCta } from "./cta-buttons";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const pathname = usePathname();
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
          <Image
            src={logo}
            alt="Logo Functional Wiehl GmbH"
            priority
            className="h-9 w-auto"
            sizes="160px"
          />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-6 xl:flex">
          {NAV_ITEMS.map((item) => {
            const clean = item.href.split("#")[0].replace(/\/$/, "") || "/";
            const active = clean !== "/" && pathname.startsWith(clean);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative text-sm font-semibold text-brand"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-0.5 w-full origin-left bg-brand transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppCta position="header" size="sm" className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
