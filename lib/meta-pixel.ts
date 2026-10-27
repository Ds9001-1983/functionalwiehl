/**
 * Ein Loader für den Meta-Pixel 965083147995308, der nie doppelt startet.
 *
 * - BN-LP: startet ohne Einwilligung mit autoConfig wie live (Entscheidung Dennis, 27.10.2026),
 *   aufgerufen von der Inline-Runtime (lib/black-november/runtime.ts).
 * - Website: startet erst nach Marketing-Einwilligung mit autoConfig:false
 *   (components/consent/analytics-scripts.tsx).
 *
 * Merker `window.__fwPixel`: Willigt jemand auf der LP nachträglich ein, laufen `init` und
 * `PageView` nicht ein zweites Mal (das alte Snippet schützte mit `if(f.fbq)return` nur das
 * Laden von fbevents.js). `disablePushState` schaltet die automatischen PageViews von Meta bei
 * History-Wechseln ab; Seitenwechsel meldet allein trackPageview().
 *
 * Wird wie readConsentCookie per Function.toString() in die LP geschrieben: in sich
 * geschlossen, keine Bezüge auf Modulebene, kein `?.`/`??`.
 */

export type MetaPixelStart = {
  pixelId: string;
  /** lp = BN-Landingpage ohne Einwilligung, consent = Website nach Einwilligung */
  quelle: "lp" | "consent";
  autoConfig: boolean;
};

export type MetaPixelMerker = { quelle: MetaPixelStart["quelle"]; autoConfig: boolean };

type FbqStub = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    __fwPixel?: MetaPixelMerker;
  }
}

/** true = jetzt gestartet, false = lief schon (egal aus welcher Quelle) */
export function ensureMetaPixel(o: MetaPixelStart): boolean {
  const w = window as unknown as Window & { fbq?: FbqStub; _fbq?: FbqStub };
  if (w.__fwPixel) return false;
  w.__fwPixel = { quelle: o.quelle, autoConfig: o.autoConfig };

  if (!w.fbq) {
    // Meta-Standard-Snippet (Stub + async fbevents.js), nur lesbarer formatiert.
    // Die Warteschlange erwartet arguments-Objekte, deshalb keine Rest-Parameter.
    const n = function () {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      if (n.callMethod) n.callMethod.apply(n, arguments as unknown as unknown[]);
      // eslint-disable-next-line prefer-rest-params
      else n.queue.push(arguments);
    } as FbqStub;
    w.fbq = n;
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    if (s && s.parentNode) s.parentNode.insertBefore(t, s);
    else document.head.appendChild(t);
  }

  const fbq = w.fbq;
  fbq.disablePushState = true;
  if (!o.autoConfig) fbq("set", "autoConfig", false, o.pixelId);
  fbq("init", o.pixelId);
  fbq("track", "PageView");
  return true;
}
