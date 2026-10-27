"use client";

import { usePathname } from "next/navigation";
import { CTA } from "@/lib/cta";
import { TrackedLink } from "./tracked-link";
import { WhatsAppIcon } from "./cta-buttons";

/** Seiten ohne FAB: Rechts- und Erklärungsseiten und das Mitglieder-Tool Körpermaße */
const OHNE_FAB = ["/impressum", "/datenschutz", "/barrierefreiheit", "/koerpermasse"];

/**
 * Mitschwebender WhatsApp-CTA — runder FAB unten rechts, NUR Desktop
 * (`hidden lg:flex`). Mobile ist durch die StickyCtaBar abgedeckt; ein
 * zusätzlicher runder Button würde dort nur überlagern.
 * Ziel: CTA.whatsappAllgemein („Kontakt über WhatsApp“ wie live), Position whatsapp_fab.
 */
export function WhatsAppFab() {
  const pathname = usePathname();
  if (OHNE_FAB.some((pfad) => pathname.startsWith(pfad))) return null;

  return (
    <TrackedLink
      href={CTA.whatsappAllgemein}
      event="whatsapp_click"
      params={{ position: "whatsapp_fab", preset: "allgemein" }}
      aria-label="Per WhatsApp schreiben"
      className="group fixed bottom-6 right-6 z-50 hidden items-center lg:flex"
    >
      {/* Dekoratives Hover-Label */}
      <span
        aria-hidden="true"
        className="pointer-events-none mr-3 max-w-0 overflow-hidden whitespace-nowrap rounded-pill bg-white px-0 py-2 text-sm font-bold text-brand opacity-0 shadow-md transition-all duration-300 group-hover:max-w-xs group-hover:px-4 group-hover:opacity-100 motion-reduce:transition-none"
      >
        Kontakt über WhatsApp
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
        {/* Pulse-Ring, respektiert reduced-motion + A11y-Leiste */}
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-30 motion-reduce:hidden"
        />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </TrackedLink>
  );
}
