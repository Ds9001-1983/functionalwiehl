import type { Consent } from "../consent-cookie";
import type { MetaPixelStart } from "../meta-pixel";

/**
 * Verhalten der Black-November-LP – Port von Code-Snippet #6 der WP-Seite (bn.md §3.2).
 *
 * Läuft als Inline-Script vor der Hydration (components/black-november/bn-runtime-script.tsx
 * schreibt `(${bnRuntime})(cfg, readConsentCookie, ensureMetaPixel)` ins HTML), damit die
 * CTAs wie live sofort reagieren. Deshalb ist die Funktion in sich geschlossen: keine Bezüge
 * auf Modulebene, kein async, kein `?.`/`??`. Alles von außen kommt über die Parameter.
 *
 * Abweichungen vom Live-Snippet (bewusst):
 * - Pixel startet hier (ensurePixel), live stand er ungesperrt im <head>.
 * - Einwilligung nur aus dem Cookie fw_consent (marketing), kein Rückfall auf „fbq vorhanden“
 *   (der wäre auf der LP immer wahr).
 * - bn_fbc nur mit Einwilligung (live wegen `defer` von Complianz immer geschrieben).
 * - decodeURIComponent der fbclid mit try/catch (live blockierte ein Fehler den WhatsApp-Klick).
 * - Gespeicherter Code wird gegen das Format geprüft, sonst neu erzeugt.
 * - Klickspeicher relativ (/wp-json/…), damit auch Preview-Domains an sich selbst senden.
 * - Desktop: window.open ohne 'noopener' und danach opener = null. Mit 'noopener' liefert
 *   window.open immer null, live sprang deshalb zusätzlich der eigene Tab zu wa.me.
 * - Scroll-, Timer- und Klick-Handler wirken nur auf der LP (Schutz bei Client-Navigation).
 */

export type BnRuntimeConfig = {
  pixelId: string;
  /** CTA.whatsappBlackNovemberPrefix – Code anhängen ergibt whatsappBlackNovember(code) */
  waPrefix: string;
  /** BN_CODE_ZEICHEN */
  codeZeichen: string;
  /** BN_CODE_REGEX.source */
  codeRegex: string;
  /** Klickspeicher (POST, text/plain-JSON) */
  endpoint: string;
  consentCookie: string;
  /** Pfad der LP, z. B. "/black-november" */
  pfad: string;
};

/** Zustand der Runtime je Dokument; der Wächter der LP erkennt daran, dass sie lief */
export type BnZustand = { code: string };

declare global {
  interface Window {
    __fwBn?: BnZustand;
  }
}

type FbqAufruf = { a: string; n: string; p: Record<string, unknown>; o: { eventID: string } };

export function bnRuntime(
  cfg: BnRuntimeConfig,
  readConsent: (name: string) => Consent | null,
  ensurePixel: (o: MetaPixelStart) => boolean
): void {
  const w = window;
  const d = document;
  if (w.__fwBn) return;

  /* Code für die Zuordnung in Superchat – einmal pro Besuch (Tab) */
  const re = new RegExp(cfg.codeRegex);
  function makeCode() {
    let s = "";
    for (let i = 0; i < 4; i++) s += cfg.codeZeichen.charAt(Math.floor(Math.random() * cfg.codeZeichen.length));
    return "BN-" + s;
  }
  let code: string | null = null;
  try {
    code = sessionStorage.getItem("bn_code");
  } catch {}
  if (!code || !re.test(code)) {
    code = makeCode();
    try {
      sessionStorage.setItem("bn_code", code);
    } catch {}
  }
  const aktionscode = code;
  w.__fwBn = { code: aktionscode };

  function aufLp() {
    return w.location.pathname.indexOf(cfg.pfad) === 0;
  }
  function hatEinwilligung() {
    const c = readConsent(cfg.consentCookie);
    return !!(c && c.marketing);
  }

  /* Pixel wie live ohne Einwilligung (Entscheidung Dennis, 27.10.2026): init + PageView */
  ensurePixel({ pixelId: cfg.pixelId, quelle: "lp", autoConfig: true });

  /* Pixel-Events: Warteschlange, falls fbq (noch) fehlt – 1:1 aus dem Snippet */
  const queue: FbqAufruf[] = [];
  function flush() {
    if (typeof w.fbq !== "function") return false;
    while (queue.length) {
      const e = queue.shift() as FbqAufruf;
      w.fbq(e.a, e.n, e.p, e.o);
    }
    return true;
  }
  let polling = false;
  function waitForPixel() {
    if (polling) return;
    polling = true;
    let tries = 0;
    const iv = setInterval(function () {
      tries++;
      if (flush() || tries > 600) {
        clearInterval(iv);
        polling = false;
      }
    }, 500);
  }
  function track(action: string, name: string, params: Record<string, unknown>, eventId: string) {
    queue.push({ a: action, n: name, p: params, o: { eventID: eventId } });
    if (!flush()) waitForPixel();
  }
  function uid(prefix: string) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  track("track", "ViewContent", { content_name: "Black November", content_category: "black_november" }, uid("bnvc"));

  /* Engagierte Besucher (für Retargeting): 15 Sek. auf der Seite UND halbe Seite gescrollt */
  let engaged = false;
  let timeOk = false;
  let scrollOk = false;
  function checkEngaged() {
    if (!engaged && timeOk && scrollOk && aufLp()) {
      engaged = true;
      track("trackCustom", "BN_Engaged", { content_name: "Black November" }, uid("bnen"));
    }
  }
  setTimeout(function () {
    timeOk = true;
    checkEngaged();
  }, 15000);

  /* Sticky-Button erst nach dem Hero zeigen (Elemente erst beim Ereignis suchen: das Script steht vor ihnen) */
  function onScroll() {
    if (!aufLp()) return;
    const y = w.scrollY || w.pageYOffset;
    const docH = d.documentElement.scrollHeight - w.innerHeight;
    if (!scrollOk && docH > 0 && y / docH >= 0.5) {
      scrollOk = true;
      checkEngaged();
    }
    const sticky = d.querySelector("[data-bn-sticky]");
    const hero = d.querySelector<HTMLElement>("[data-bn-hero]");
    if (sticky && hero) {
      const show = y > hero.offsetTop + hero.offsetHeight - 80;
      sticky.setAttribute("data-show", show ? "true" : "false");
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      const knopf = sticky.querySelector("button");
      if (knopf) knopf.tabIndex = show ? 0 : -1;
    }
  }
  w.addEventListener("scroll", onScroll, { passive: true });

  /* fbclid aus der Anzeige → fbc wie live: fb.1.<ms>.<fbclid> */
  function fbcAusUrl() {
    const m = w.location.search.match(/[?&]fbclid=([^&]+)/);
    if (!m) return "";
    let fbclid = m[1];
    try {
      fbclid = decodeURIComponent(fbclid);
    } catch {}
    return "fb.1." + Date.now() + "." + fbclid;
  }
  /* fbclid merken (falls Einwilligung erst später kommt) – nur mit Einwilligung */
  try {
    const gemerkt = fbcAusUrl();
    if (gemerkt && hatEinwilligung()) sessionStorage.setItem("bn_fbc", gemerkt);
  } catch {}
  function cookie(name: string) {
    const parts = d.cookie.split("; ");
    for (let i = 0; i < parts.length; i++) {
      const kv = parts[i].split("=");
      if (kv[0] === name) {
        try {
          return decodeURIComponent(kv.slice(1).join("="));
        } catch {
          return "";
        }
      }
    }
    return "";
  }
  function saveClick(source: string) {
    /* Aktionszeitraum BN26: Zuordnung auch ohne Cookie-Einwilligung (Entscheidung Dennis, 20.10.2026).
       Ohne Einwilligung werden KEINE Cookies gelesen – nur Code, fbclid aus der aktuellen URL
       sowie IP/User-Agent (serverseitig). */
    const consent = hatEinwilligung();
    let fbc = fbcAusUrl();
    if (consent) {
      fbc = cookie("_fbc") || fbc;
      if (!fbc) {
        try {
          fbc = sessionStorage.getItem("bn_fbc") || "";
        } catch {}
      }
    }
    const body = JSON.stringify({
      code: aktionscode,
      fbp: consent ? cookie("_fbp") : "",
      fbc: fbc,
      url: w.location.href.split("#")[0],
      cta: source,
      consent: consent ? 1 : 0,
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(cfg.endpoint, new Blob([body], { type: "text/plain" }))) return;
    } catch {}
    try {
      fetch(cfg.endpoint, {
        method: "POST",
        body: body,
        keepalive: true,
        credentials: "omit",
        headers: { "Content-Type": "text/plain" },
      }).catch(function () {});
    } catch {}
  }

  /* WhatsApp-Klick = einzige Anmeldung → Contact-Event mit eindeutiger ID */
  let sent = false;
  function openWhatsApp(source: string) {
    const url = cfg.waPrefix + aktionscode;
    if (!sent) {
      sent = true;
      track(
        "track",
        "Contact",
        { content_name: "Black November WhatsApp", content_category: "black_november", cta_position: source },
        "bnc-" + aktionscode
      );
      saveClick(source);
    }
    const isDesktop = w.matchMedia("(min-width: 900px)").matches && !("ontouchstart" in w);
    if (isDesktop) {
      let neu: Window | null = null;
      try {
        neu = w.open(url, "_blank");
      } catch {}
      if (neu) {
        try {
          neu.opener = null;
        } catch {}
      } else {
        w.location.href = url;
      }
    } else {
      setTimeout(function () {
        w.location.href = url;
      }, 300);
    }
  }
  d.addEventListener("click", function (ev) {
    if (!aufLp()) return;
    const ziel = ev.target as Element | null;
    const knopf = ziel && ziel.closest ? ziel.closest("[data-bn-cta]") : null;
    if (!knopf) return;
    ev.preventDefault();
    openWhatsApp(knopf.getAttribute("data-bn-cta") || "");
  });
}
