import { createHash, timingSafeEqual } from "node:crypto";
import { upstashAusEnv } from "../upstash-rest";
import {
  LOESCHDATUM_STANDARD,
  WP_FEHLER,
  loeschMs,
  memoryStore,
  ohneLeerzeichen,
  parseBasicAuth,
  restStore,
  type KlickAntwort,
  type KlickStore,
  type WpFehler,
} from "./klickspeicher";

/**
 * Server-Teil des Klickspeichers für die Route-Handler unter app/wp-json/sb-bn/v1/click
 * (Node-Runtime). Env wird bei jedem Aufruf gelesen, nicht beim Laden des Moduls.
 * Relative Importe statt "@/", damit tests/bn-unit.spec.ts das Modul direkt laden kann.
 */

type Env = Record<string, string | undefined>;

/**
 * Speicher aus der Env: BN_CLICK_STORE=memory nur außerhalb von Vercel, sonst Upstash
 * (KV_REST_API_* || UPSTASH_REDIS_REST_*). null → Route antwortet 503, nie still „memory“.
 */
export function storeAusEnv(env: Env = process.env): KlickStore | null {
  if (env.BN_CLICK_STORE === "memory") {
    if (env.VERCEL) {
      console.error("[bn-click] BN_CLICK_STORE=memory ist auf Vercel gesperrt");
      return null;
    }
    return memoryStore();
  }
  const pipeline = upstashAusEnv(env);
  return pipeline ? restStore(pipeline) : null;
}

/** Schlüsselraum je Umgebung: bn:production, bn:preview, lokal bn:local */
export function klickPrefix(env: Env = process.env): string {
  return `bn:${env.VERCEL_ENV || "local"}`;
}

/** Löschdatum aus BN_CLICK_DELETE_AT; unlesbar → Standard (10.12.2026) mit Fehler im Log */
export function loeschzeitpunkt(env: Env = process.env): number {
  const ms = loeschMs(env.BN_CLICK_DELETE_AT);
  if (ms !== null) return ms;
  console.error(`[bn-click] BN_CLICK_DELETE_AT ist unlesbar, es gilt ${LOESCHDATUM_STANDARD}`);
  return Date.parse(LOESCHDATUM_STANDARD);
}

const sha256 = (wert: string) => createHash("sha256").update(wert, "utf8").digest();

/**
 * Basic Auth von n8n gegen BN_CLICK_USER/BN_CLICK_PASS. Zeitkonstant: beide Werte werden
 * gehasht und immer beide verglichen, ohne vorzeitigen Abbruch. Benutzer ohne
 * Rand-Leerzeichen, Passwort ohne jedes Leerzeichen – auf BEIDEN Seiten, weil das
 * WP-App-Passwort im n8n-Credential mit Leerzeichen stehen kann (design-review.md E11).
 * Ohne konfigurierte Zugangsdaten ist der Endpoint immer zu.
 */
export function pruefeBasicAuth(header: string | null, env: Env = process.env): boolean {
  const sollBenutzer = env.BN_CLICK_USER?.trim() ?? "";
  const sollPasswort = ohneLeerzeichen(env.BN_CLICK_PASS ?? "");
  const zugang = parseBasicAuth(header);
  const benutzerOk = timingSafeEqual(sha256(zugang?.benutzer.trim() ?? ""), sha256(sollBenutzer));
  const passwortOk = timingSafeEqual(sha256(ohneLeerzeichen(zugang?.passwort ?? "")), sha256(sollPasswort));
  return Boolean(sollBenutzer && sollPasswort && zugang) && benutzerOk && passwortOk;
}

const HAUPTDOMAINS = ["functional-wiehl.de", "www.functional-wiehl.de"];

function hostVon(wert: string | undefined): string {
  if (!wert) return "";
  try {
    return new URL(wert.includes("://") ? wert : `https://${wert}`).host.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Hosts, deren Origin bzw. LP-URL der POST annimmt: Hauptdomain mit und ohne www (alte
 * WP-LP während der DNS-Umstellung), NEXT_PUBLIC_SITE_URL und die Vercel-URLs der Preview.
 * Der Host der Anfrage selbst prüft gleicherOrigin() aus lib/request.ts ohnehin.
 */
export function erlaubteHosts(env: Env = process.env): string[] {
  const hosts = new Set(HAUPTDOMAINS);
  for (const wert of [env.NEXT_PUBLIC_SITE_URL, env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL]) {
    const host = hostVon(wert);
    if (host) hosts.add(host);
  }
  return [...hosts];
}

/** Kopfzeilen wie WP (application/json; charset=UTF-8), nie cachen, nie indexieren */
const JSON_HEADER = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
};

/** WP-Fehlerantwort byte-genau (401 rest_forbidden, 404 rest_no_route) */
export function wpFehler(art: WpFehler): Response {
  const { status, body } = WP_FEHLER[art];
  return new Response(body, { status, headers: JSON_HEADER });
}

export function klickJson(antwort: KlickAntwort, status = 200): Response {
  return new Response(JSON.stringify(antwort), { status, headers: JSON_HEADER });
}

/** Fehlermeldung ohne Nutzdaten fürs Log (UpstashFehler enthalten weder Schlüssel noch Werte) */
export function fehlerText(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : "unbekannter Fehler";
}
