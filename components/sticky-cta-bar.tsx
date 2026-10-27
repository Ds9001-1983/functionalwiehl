"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CTA } from "@/lib/cta";
import { TrackedLink } from "./tracked-link";
import { PhoneIcon, WhatsAppIcon } from "./cta-buttons";

/** Seiten ohne Leiste: Rechtsseiten und das Mitglieder-Tool Körpermaße */
const OHNE_LEISTE = ["/impressum", "/datenschutz", "/koerpermasse"];

/**
 * Mobile Sticky-Bottom-Bar (~79 % der Besucher kommen mobil): Telefon und
 * „Mitglied werden“ (CTA.whatsappMitglied, wie die Preiskarten).
 * Erscheint nach 600 px Scroll, damit sie den Hero-CTA nicht doppelt.
 * Der Platz wird über pb am Seitenrahmen (app/(site)/layout.tsx) reserviert → kein CLS,
 * Footer-Inhalte inkl. Cookie-Widerruf-Link werden nie verdeckt.
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

  if (OHNE_LEISTE.some((pfad) => pathname.startsWith(pfad))) return null;

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

        <TrackedLink
          href={CTA.whatsappMitglied}
          event="whatsapp_click"
          params={{ position: "sticky_bar", preset: "mitglied" }}
          tabIndex={visible ? 0 : -1}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-cta text-[15px] font-bold text-cta-foreground"
        >
          <WhatsAppIcon className="size-4.5" />
          Mitglied werden
        </TrackedLink>
      </div>
    </div>
  );
}
