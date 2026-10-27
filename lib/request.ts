import { createHmac, randomBytes } from "node:crypto";

/**
 * Gemeinsame Request-Helfer der Route-Handler (Klickspeicher, Formulare, Cron).
 * Nur Node-Runtime (node:crypto), nicht im Proxy verwenden.
 */

/** IP des Aufrufers: zuerst x-real-ip (Vercel), sonst erster Eintrag von x-forwarded-for; "" wenn unbekannt. */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

let ersatzSecret: string | undefined;

function rateLimitSecret(): string {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (secret) return secret;
  // Ohne Secret ein Zufallsschlüssel je Prozess – nie ein ungesalzener Hash
  // (der ließe sich für IPv4 vollständig zurückrechnen).
  if (!ersatzSecret) {
    ersatzSecret = randomBytes(32).toString("hex");
    if (process.env.VERCEL) console.warn("[request] RATE_LIMIT_SECRET fehlt – Rate-Limit gilt nur je Instanz");
  }
  return ersatzSecret;
}

/**
 * Pseudonymer Schlüssel einer IP für Rate-Limits (z. B. `rl:checkup:<schlüssel>`):
 * HMAC-SHA256 mit RATE_LIMIT_SECRET, 32 Hex-Zeichen. Die IP selbst wird nie gespeichert.
 */
export function ipSchluessel(ip: string): string {
  return createHmac("sha256", rateLimitSecret()).update(ip).digest("hex").slice(0, 32);
}

/**
 * CSRF-Schutz für POST-Routen: Host des Origin-Headers = Host der Anfrage
 * (oder einer der `weitereHosts`, z. B. www während der Umstellung).
 * Fehlender Origin zählt nur mit `ohneOriginErlaubt` als gleich; "Origin: null" nie.
 */
export function gleicherOrigin(
  headers: Headers,
  optionen: { ohneOriginErlaubt?: boolean; weitereHosts?: readonly string[] } = {}
): boolean {
  const origin = headers.get("origin");
  if (!origin) return optionen.ohneOriginErlaubt === true;

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false; // "null" und Unsinn
  }
  if (!originHost) return false;

  const host = (headers.get("host") ?? headers.get("x-forwarded-host") ?? "").toLowerCase();
  if (host && originHost === host) return true;
  return (optionen.weitereHosts ?? []).some((h) => h.toLowerCase() === originHost);
}
