import { cn } from "@/lib/utils";
import { CTA } from "@/lib/cta";
import type { EventPosition, WhatsAppPreset } from "@/lib/tracking";
import type { Tarif } from "@/content/preise";
import { TrackedLink } from "./tracked-link";

type Size = "default" | "lg" | "sm";

const pillBase =
  "inline-flex items-center justify-center gap-2 rounded-pill font-bold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  default: "min-h-12 px-6 text-[15px]",
  lg: "min-h-13 px-8 text-base",
};

/** WhatsApp-Ziel → Konstante in lib/cta.ts (byte-genau wie live, Superchat-Automation) */
export type WhatsAppZiel = WhatsAppPreset;

const WHATSAPP: Record<WhatsAppZiel, { href: string; label: string }> = {
  probetraining: { href: CTA.whatsappProbetraining, label: "Buche ein Probetraining" },
  mitglied: { href: CTA.whatsappMitglied, label: "Mitglied werden" },
  allgemein: { href: CTA.whatsappAllgemein, label: "Kontakt über WhatsApp" },
};

/**
 * WhatsApp-CTA im Look der Live-Site: Hellgelb #fff3a4, Text Braun #503c2a, Pill-Radius 65px.
 * Texte wie live: Header „Buche ein Probetraining“, sonst „Mitglied werden“ bzw.
 * „Kontakt über WhatsApp“. Das Preset fürs Tracking folgt aus dem Ziel.
 */
export function WhatsAppCta({
  ziel,
  position,
  size = "default",
  label,
  className,
}: {
  ziel: WhatsAppZiel;
  position: EventPosition;
  size?: Size;
  label?: string;
  className?: string;
}) {
  const { href, label: standard } = WHATSAPP[ziel];
  return (
    <TrackedLink
      href={href}
      event="whatsapp_click"
      params={{ position, preset: ziel }}
      className={cn(
        pillBase,
        sizes[size],
        "bg-cta text-cta-foreground shadow-sm hover:brightness-95",
        className
      )}
    >
      <WhatsAppIcon className="size-4.5 shrink-0" />
      {label ?? standard}
    </TrackedLink>
  );
}

/** Sekundär-CTA (Calendly-Telefontermin) als Indigo- oder Ghost-Pill. */
export function CalendlyCta({
  position,
  size = "default",
  label = "Jetzt Telefontermin vereinbaren",
  variant = "solid",
  className,
}: {
  position: EventPosition;
  size?: Size;
  label?: string;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  return (
    <TrackedLink
      href={CTA.calendly}
      target="_blank"
      rel="noopener"
      event="calendly_click"
      params={{ position }}
      className={cn(
        pillBase,
        sizes[size],
        variant === "solid"
          ? "bg-brand text-cream hover:bg-brand/90"
          : "border-2 border-brand bg-transparent text-brand hover:bg-brand/5",
        className
      )}
    >
      {label}
    </TrackedLink>
  );
}

/** Preiskarten-Button „Buchen“ wie live → „Mitglied werden“ (Superchat). */
export function BuchenCta({ tarif, className }: { tarif: Tarif; className?: string }) {
  return (
    <TrackedLink
      href={CTA.whatsappMitglied}
      event="whatsapp_click"
      params={{ position: "pricecard", preset: "mitglied" }}
      // sichtbarer Text steht vorn im Namen (WCAG 2.5.3), der Tarif unterscheidet die 4 Buttons
      aria-label={`Buchen – Tarif ${tarif.name.replace(/\u00AD/g, "")}`}
      className={cn(
        pillBase,
        "min-h-12 w-full bg-brand px-6 text-[15px] text-cream hover:bg-brand/90",
        className
      )}
    >
      Buchen
    </TrackedLink>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.58-.35M12.05 21.79h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.38a9.8 9.8 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.84 9.84 0 0 1 9.88 9.89c0 5.45-4.43 9.88-9.89 9.88m8.41-18.29A11.82 11.82 0 0 0 12.04 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
