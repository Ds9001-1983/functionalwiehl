"use client";

import { usePathname } from "next/navigation";
import { CTA } from "@/lib/cta";
import { TrackedLink } from "./tracked-link";
import { WhatsAppIcon } from "./cta-buttons";

/**
 * Mitschwebender WhatsApp-CTA — runder FAB unten rechts, NUR Desktop
 * (`hidden lg:flex`). Mobile ist durch die StickyCtaBar abgedeckt; ein
 * zusätzlicher runder Button würde dort nur überlagern.
 * Ziel: CTA.whatsappProbetraining (Superchat-Automation), Position whatsapp_fab.
 */
export function WhatsAppFab() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/impressum") ||
    pathname.startsWith("/datenschutz") ||
    pathname.startsWith("/barrierefreiheit")
  ) {
    return null;
  }

  return (
    <TrackedLink
      href={CTA.whatsappProbetraining}
      event="whatsapp_click"
      params={{ position: "whatsapp_fab", preset: "probetraining" }}
      aria-label="Per WhatsApp schreiben – 14 Tage kostenlos testen"
      className="group fixed bottom-6 right-6 z-50 hidden items-center lg:flex"
    >
      {/* Dekoratives Hover-Label */}
      <span
        aria-hidden="true"
        className="pointer-events-none mr-3 max-w-0 overflow-hidden whitespace-nowrap rounded-pill bg-white px-0 py-2 text-sm font-bold text-brand opacity-0 shadow-md transition-all duration-300 group-hover:max-w-xs group-hover:px-4 group-hover:opacity-100 motion-reduce:transition-none"
      >
        14 Tage kostenlos testen
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
