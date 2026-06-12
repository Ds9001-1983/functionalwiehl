"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CTA } from "@/lib/cta";
import { TrackedLink } from "./tracked-link";
import { PhoneIcon, WhatsAppIcon } from "./cta-buttons";

/**
 * Mobile Sticky-Bottom-Bar (~79 % der Besucher kommen mobil).
 * Erscheint nach 600 px Scroll, damit sie den Hero-CTA nicht doppelt.
 * Der Platz wird global über pb auf <body> (layout.tsx) reserviert → kein CLS,
 * Footer-Inhalte inkl. Cookie-Widerruf-Link werden nie verdeckt.
 * Varianten: /frauen-ab-50/ → Calendly statt WhatsApp (Zielgruppe ruft lieber an),
 * Rechtsseiten → keine Bar.
 */
export function StickyCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/impressum") || pathname.startsWith("/datenschutz")) return null;

  const calendlyPrimary = pathname.startsWith("/frauen-ab-50");

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-xl items-center gap-2 px-3">
        <TrackedLink
          href={CTA.tel}
          event="tel_click"
          params={{ position: "sticky_bar" }}
          aria-label="Anrufen: 02262 752717"
          tabIndex={visible ? 0 : -1}
          className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-brand text-brand"
        >
          <PhoneIcon className="size-5" />
        </TrackedLink>

        {calendlyPrimary ? (
          <TrackedLink
            href={CTA.calendly}
            target="_blank"
            rel="noopener"
            event="calendly_click"
            params={{ position: "sticky_bar" }}
            tabIndex={visible ? 0 : -1}
            className="flex h-12 flex-1 items-center justify-center rounded-pill bg-brand text-[15px] font-bold text-cream"
          >
            Telefontermin vereinbaren
          </TrackedLink>
        ) : (
          <TrackedLink
            href={CTA.whatsappProbetraining}
            event="whatsapp_click"
            params={{ position: "sticky_bar", preset: "probetraining" }}
            tabIndex={visible ? 0 : -1}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-cta text-[15px] font-bold text-cta-foreground"
          >
            <WhatsAppIcon className="size-4.5" />
            14 TAGE kostenlos
          </TrackedLink>
        )}
      </div>
    </div>
  );
}
