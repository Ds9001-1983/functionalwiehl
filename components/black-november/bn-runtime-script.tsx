import { readConsentCookie } from "@/lib/consent-cookie";
import { ensureMetaPixel } from "@/lib/meta-pixel";
import { bnRuntime } from "@/lib/black-november/runtime";
import { bnRuntimeKonfiguration } from "@/lib/black-november/runtime-config";

/**
 * Schreibt die BN-Runtime als Inline-Script ins statische HTML. Sie läuft beim Parsen, also
 * vor der Hydration (Muster aus der Next-Doku „Preventing Flash before hydration“), und
 * reagiert per Event-Delegation auf die CTAs weiter unten.
 *
 * Function.toString() auf Servercode ist keine Next-API (design-review E12). Abgesichert durch
 * die Playwright-Tests gegen den Prod-Build (pageerror, Pixel-Recorder, WhatsApp-URL). Bricht
 * das je, wird die Runtime eine String-Konstante in reinem ES2017.
 *
 * Bei Client-Navigation führt der Browser per DOM eingefügte Scripts nicht aus; dafür gibt es
 * BnSoftNavGuard.
 */
export function BnRuntimeScript() {
  const cfg = JSON.stringify(bnRuntimeKonfiguration()).replace(/</g, "\\u003c");
  const js = `(${bnRuntime.toString()})(${cfg},${readConsentCookie.toString()},${ensureMetaPixel.toString()});`;
  return <script id="bn-runtime" dangerouslySetInnerHTML={{ __html: js }} />;
}
