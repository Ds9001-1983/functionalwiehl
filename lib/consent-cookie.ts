/**
 * Einwilligung aus dem Banner-Cookie lesen – eine Funktion für Banner, Tracking und die
 * BN-Runtime. Die BN-LP schreibt sie per Function.toString() als Inline-Script ins HTML
 * (components/black-november/bn-runtime-script.tsx). Deshalb in sich geschlossen:
 * keine Bezüge auf Modulebene, kein `?.`/`??`, nur Browser-Globale.
 */

export type Consent = {
  statistik: boolean;
  marketing: boolean;
  ts: string;
};

export const CONSENT_COOKIE = "fw_consent";

/** null = keine (gültige) Entscheidung → Banner zeigen, nichts laden */
export function readConsentCookie(name: string): Consent | null {
  if (typeof document === "undefined") return null;
  const teile = document.cookie ? document.cookie.split("; ") : [];
  for (let i = 0; i < teile.length; i++) {
    if (teile[i].indexOf(name + "=") !== 0) continue;
    try {
      const wert = JSON.parse(decodeURIComponent(teile[i].slice(name.length + 1)));
      if (wert && typeof wert.statistik === "boolean" && typeof wert.marketing === "boolean") {
        return {
          statistik: wert.statistik,
          marketing: wert.marketing,
          ts: typeof wert.ts === "string" ? wert.ts : "",
        };
      }
    } catch {
      // defektes Cookie → wie "keine Entscheidung" behandeln
    }
    return null;
  }
  return null;
}
