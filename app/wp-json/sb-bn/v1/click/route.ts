import {
  KLICK_MAX_BYTES,
  KLICK_RATE_LIMIT,
  UA_MAX,
  ablaufUnix,
  klickSchluessel,
  parseKlick,
  rateLimitSchluessel,
} from "@/lib/black-november/klickspeicher";
import {
  erlaubteHosts,
  fehlerText,
  klickPrefix,
  loeschzeitpunkt,
  storeAusEnv,
  wpFehler,
} from "@/lib/black-november/klickspeicher-server";
import { clientIp, gleicherOrigin, ipSchluessel } from "@/lib/request";

/**
 * POST /wp-json/sb-bn/v1/click – Beacon der LP beim WhatsApp-Klick (Nachbau von Snippet #6).
 * Pfad wie in WordPress, damit die alte LP während der DNS-Umstellung weiter speichert.
 * Kein 308: proxy.ts lässt /wp-json aus (tests/trailing-slash.spec.ts, tests/klickspeicher.spec.ts).
 *
 * Body: text/plain-JSON {code, fbp, fbc, url, cta, consent} (sendBeacon, kein Preflight).
 * Ablauf: fremder Origin 403 → zu groß 413 → mehr als 20/min je IP 429 → ungültig 400 →
 * nach dem Löschdatum 204 ohne Speichern → HSETNX mit IP und UA vom Server → 204.
 * Die Antwort wertet niemand aus; Speicherfehler 503 und ein Log ohne Nutzdaten.
 */

const ohneInhalt = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });

/** Body lesen, aber höchstens `max` Byte – content-length allein reicht bei chunked nicht */
async function leseText(request: Request, max: number): Promise<string | null> {
  if (!request.body) return "";
  const leser = request.body.getReader();
  const teile: Uint8Array[] = [];
  let groesse = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    groesse += value.byteLength;
    if (groesse > max) {
      await leser.cancel().catch(() => {});
      return null;
    }
    teile.push(value);
  }
  const bytes = new Uint8Array(groesse);
  let pos = 0;
  for (const teil of teile) {
    bytes.set(teil, pos);
    pos += teil.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: Request) {
  const hosts = erlaubteHosts();
  // Ohne Origin (curl, alte Clients) zulassen, "Origin: null" und fremde Hosts nicht
  if (!gleicherOrigin(request.headers, { ohneOriginErlaubt: true, weitereHosts: hosts })) return ohneInhalt(403);
  if (Number(request.headers.get("content-length") ?? 0) > KLICK_MAX_BYTES) return ohneInhalt(413);

  const store = storeAusEnv();
  if (!store) {
    console.error("[bn-click] Klickspeicher nicht konfiguriert (KV_REST_API_URL/KV_REST_API_TOKEN fehlen)");
    return ohneInhalt(503);
  }
  const prefix = klickPrefix();
  const ip = clientIp(request.headers);

  try {
    const minute = Math.floor(Date.now() / 60_000);
    const anfragen = await store.zaehle(rateLimitSchluessel(prefix, ipSchluessel(ip), minute), 120);
    if (anfragen > KLICK_RATE_LIMIT) return ohneInhalt(429);

    const text = await leseText(request, KLICK_MAX_BYTES);
    if (text === null) return ohneInhalt(413);
    const host = request.headers.get("host")?.toLowerCase();
    const klick = parseKlick(text, host ? [...hosts, host] : hosts);
    if (!klick) return ohneInhalt(400);

    const jetzt = Date.now();
    const ablauf = ablaufUnix(jetzt, loeschzeitpunkt());
    if (ablauf === null) return ohneInhalt(204); // nach dem Löschdatum: annehmen, nichts speichern

    const zeit = new Date(jetzt).toISOString();
    await store.ergaenze(
      klickSchluessel(prefix, klick.code),
      {
        fbc: klick.fbc,
        fbp: klick.fbp,
        ip,
        ua: (request.headers.get("user-agent") ?? "").slice(0, UA_MAX),
        url: klick.url,
        cta: klick.cta,
        consent: String(klick.consent),
        first_at: zeit,
        src: "next",
      },
      ablauf,
      zeit
    );
    return ohneInhalt(204);
  } catch (err) {
    console.error(`[bn-click] POST nicht gespeichert: ${fehlerText(err)}`);
    return ohneInhalt(503);
  }
}

/** GET auf die reine POST-Route beantwortet WordPress mit 404 rest_no_route – hier genauso. */
export function GET() {
  return wpFehler("rest_no_route");
}
