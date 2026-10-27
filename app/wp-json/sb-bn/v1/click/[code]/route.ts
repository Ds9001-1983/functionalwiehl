import { BN_CODE_PFAD_RE, klickAntwort, klickSchluessel } from "@/lib/black-november/klickspeicher";
import {
  fehlerText,
  klickJson,
  klickPrefix,
  loeschzeitpunkt,
  pruefeBasicAuth,
  storeAusEnv,
  wpFehler,
} from "@/lib/black-november/klickspeicher-server";

/**
 * GET /wp-json/sb-bn/v1/click/{code} – Abruf durch n8n (Workflow eHhcCrI24Jae2BQG, Knoten
 * „Klickdaten von Landingpage holen“: Basic Auth, Timeout 8 s, neverError). Vertrag wie WP:
 * - Code passt nicht auf die WP-Route → 404 rest_no_route (vor der Auth, wie WP)
 * - ohne oder mit falscher Auth → 401 rest_forbidden, Body byte-genau wie WP
 * - Fehltreffer → 200 {found:false} und Log „[bn-click] miss <CODE>“ (einzige Sicht auf
 *   Migrationslücken, n8n speichert keine Läufe)
 * - Treffer → 200 {found:true,fbc,fbp,ip,ua}, nur vorhandene Felder
 * - nach dem Löschdatum {found:false}, Speicherfehler 503 {found:false}
 * Kein 308, auch nicht mit Slash am Ende (proxy.ts lässt /wp-json aus).
 */
export async function GET(request: Request, ctx: RouteContext<"/wp-json/sb-bn/v1/click/[code]">) {
  const { code } = await ctx.params;
  if (!BN_CODE_PFAD_RE.test(code)) return wpFehler("rest_no_route");
  const auth = request.headers.get("authorization");
  if (!pruefeBasicAuth(auth)) {
    // Sichtbar machen, falls das n8n-Credential nicht zu BN_CLICK_USER/PASS passt (n8n meldet nichts)
    console.warn(`[bn-click] 401 ${auth ? "mit falscher" : "ohne"} Basic Auth`);
    return wpFehler("rest_forbidden");
  }

  const gesucht = code.toUpperCase();
  if (Date.now() >= loeschzeitpunkt()) return klickJson({ found: false });

  const store = storeAusEnv();
  if (!store) {
    console.error("[bn-click] Klickspeicher nicht konfiguriert (KV_REST_API_URL/KV_REST_API_TOKEN fehlen)");
    return klickJson({ found: false }, 503);
  }
  try {
    const daten = await store.lies(klickSchluessel(klickPrefix(), gesucht));
    if (!daten) console.warn(`[bn-click] miss ${gesucht}`);
    return klickJson(klickAntwort(daten));
  } catch (err) {
    console.error(`[bn-click] GET ${gesucht} fehlgeschlagen: ${fehlerText(err)}`);
    return klickJson({ found: false }, 503);
  }
}
