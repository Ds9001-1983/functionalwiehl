import { CONSENT_COOKIE } from "@/lib/consent-cookie";
import { BN_CODE_REGEX, BN_CODE_ZEICHEN, CTA, whatsappBlackNovember } from "@/lib/cta";
import { META_PIXEL_ID } from "@/lib/tracking";
import type { BnRuntimeConfig } from "./runtime";

/** Klickspeicher-Pfad wie bei WP – n8n und der Beacon hängen daran (Route Handler: P2b) */
export const BN_KLICK_ENDPOINT = "/wp-json/sb-bn/v1/click";

/**
 * Konfiguration der Inline-Runtime, zur Build-Zeit auf dem Server erzeugt.
 *
 * Die Runtime hängt den Code an CTA.whatsappBlackNovemberPrefix an (im Browser gibt es
 * lib/cta.ts nicht). Damit das byte-gleich zu whatsappBlackNovember(code) bleibt, prüft diese
 * Funktion jedes Zeichen des Alphabets; weicht etwas ab, bricht der Build ab.
 */
export function bnRuntimeKonfiguration(): BnRuntimeConfig {
  for (let i = 0; i < BN_CODE_ZEICHEN.length; i += 4) {
    const probe = `BN-${BN_CODE_ZEICHEN.slice(i, i + 4).padEnd(4, "A")}`;
    if (CTA.whatsappBlackNovemberPrefix + probe !== whatsappBlackNovember(probe)) {
      throw new Error(`BN-Runtime: Präfix + ${probe} weicht von whatsappBlackNovember() ab`);
    }
  }
  return {
    pixelId: META_PIXEL_ID,
    waPrefix: CTA.whatsappBlackNovemberPrefix,
    codeZeichen: BN_CODE_ZEICHEN,
    codeRegex: BN_CODE_REGEX.source,
    endpoint: BN_KLICK_ENDPOINT,
    consentCookie: CONSENT_COOKIE,
    pfad: "/black-november",
  };
}
