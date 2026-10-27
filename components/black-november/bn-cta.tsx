import { cn } from "@/lib/utils";
import { BnWhatsAppIcon } from "./bn-icons";

/** Gemeinsame Bausteine der LP, Werte 1:1 aus dem LP-Stylesheet in bn.html */
export const BN_WRAP = "mx-auto max-w-[1080px] px-5";
export const BN_SEKTION = "bg-white py-[52px]";
export const BN_SEKTION_ALT = "bg-bn-alt py-[52px]";
export const BN_H2 = "mt-0 mb-2.5 text-[clamp(28px,6vw,40px)] leading-[1.1] font-black tracking-[-.01em] text-bn-ink";
export const BN_LEAD = "mt-0 mb-7 max-w-[680px] text-[18px] text-[#333]";

/** .bn-cta – auch für den noscript-Link im Hero */
export const BN_CTA_KLASSEN =
  "inline-flex w-full max-w-[440px] min-h-[60px] cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-0 " +
  "bg-bn-gruen px-[22px] py-4 text-[19px] leading-[normal] font-extrabold text-bn-gruen-ink no-underline " +
  "shadow-[0_10px_30px_rgba(37,211,102,.28)] transition-[translate,box-shadow] duration-150 ease-[ease] " +
  "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(37,211,102,.38)] motion-reduce:transition-none";

export type BnCtaPosition = "hero" | "steps" | "final" | "sticky";

/**
 * WhatsApp-CTA der LP: ein <button> wie live, kein Link. Den Klick verarbeitet die
 * Inline-Runtime per Event-Delegation (data-bn-cta) – Code erzeugen, Contact-Event,
 * Klickspeicher, dann wa.me mit CTA.whatsappBlackNovemberPrefix + Code.
 */
export function BnCta({
  position,
  label,
  icon,
  className,
  tabIndex,
}: {
  position: BnCtaPosition;
  label: string;
  /** voll = WhatsApp mit Hörer (Hero), blase = nur Sprechblase (Schritte, Abschluss) */
  icon?: "voll" | "blase";
  className?: string;
  tabIndex?: number;
}) {
  return (
    <button
      type="button"
      data-bn-cta={position}
      tabIndex={tabIndex}
      suppressHydrationWarning={position === "sticky"}
      className={cn(BN_CTA_KLASSEN, className)}
    >
      {icon && <BnWhatsAppIcon voll={icon === "voll"} className="size-[26px] flex-[0_0_26px]" />}
      {label}
    </button>
  );
}
