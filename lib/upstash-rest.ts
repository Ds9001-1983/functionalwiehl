/**
 * Upstash Redis über die REST-API: eine Pipeline per fetch, ohne SDK.
 *
 * ⚠️ Bewusst OHNE Imports und ohne "@/"-Pfade: Node lädt das Modul direkt per
 * Type-Stripping (scripts/bn-migrate-clicks.mjs importiert ../lib/upstash-rest.ts).
 * Deshalb auch keine TS-Syntax, die Node nicht entfernen kann (enum, namespace,
 * Parameter-Properties). tests/helfer.spec.ts prüft das Laden mit Node.
 *
 * Protokoll: POST {url}/pipeline mit [["CMD", …args], …], Antwort [{result}|{error}, …]
 * in derselben Reihenfolge (https://upstash.com/docs/redis/features/restapi).
 */

export type RedisBefehl = readonly (string | number)[];
/** Schickt alle Befehle in EINER Anfrage und liefert die `result`-Werte in Reihenfolge. */
export type RedisPipeline = (befehle: readonly RedisBefehl[]) => Promise<unknown[]>;

/** Fehler ohne Nutzdaten (keine Schlüssel, keine Werte) – darf geloggt werden. */
export class UpstashFehler extends Error {
  status: number | undefined;
  constructor(meldung: string, status?: number) {
    super(meldung);
    this.name = "UpstashFehler";
    this.status = status;
  }
}

export type UpstashOptionen = {
  url: string;
  token: string;
  /** Abbruch nach … ms, Standard 3000 */
  timeoutMs?: number;
  /** nur für Tests: eigener fetch */
  fetchImpl?: typeof fetch;
};

export function upstashPipeline(optionen: UpstashOptionen): RedisPipeline {
  const basis = optionen.url.replace(/\/+$/, "");
  const timeoutMs = optionen.timeoutMs ?? 3000;
  const holen = optionen.fetchImpl ?? fetch;

  return async (befehle) => {
    if (befehle.length === 0) return [];
    let res: Response;
    try {
      res = await holen(`${basis}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${optionen.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(befehle),
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw new UpstashFehler(`Upstash nicht erreichbar (${err instanceof Error ? err.name : "Fehler"})`);
    }
    if (!res.ok) throw new UpstashFehler(`Upstash antwortet mit HTTP ${res.status}`, res.status);

    const daten: unknown = await res.json().catch(() => null);
    if (!Array.isArray(daten) || daten.length !== befehle.length) {
      throw new UpstashFehler("Upstash: unerwartete Pipeline-Antwort", res.status);
    }
    return daten.map((eintrag: { result?: unknown; error?: unknown } | null, i) => {
      if (eintrag && typeof eintrag.error === "string") {
        // Redis-Fehlertexte enthalten keine Schlüssel oder Werte, nur den Befehl nennen
        throw new UpstashFehler(`Upstash-Befehl ${String(befehle[i][0])} fehlgeschlagen: ${eintrag.error}`);
      }
      return eintrag?.result;
    });
  };
}

/**
 * Pipeline aus KV_REST_API_URL/KV_REST_API_TOKEN (Vercel-Marketplace), sonst aus
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN; null, wenn nicht konfiguriert.
 * "||" statt "??": Die Abnahme setzt KV_REST_API_URL="" – leer heißt „nicht konfiguriert“.
 */
export function upstashAusEnv(
  env: Record<string, string | undefined> = process.env,
  timeoutMs?: number
): RedisPipeline | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return upstashPipeline({ url, token, timeoutMs });
}
