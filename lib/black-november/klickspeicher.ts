/**
 * Black November: Klickspeicher für die n8n-CAPI-Strecke, Nachbau von Snippet #6 (WordPress).
 *
 * ⚠️ Bewusst OHNE Imports und ohne "@/"-Pfade: scripts/bn-migrate-clicks.mjs lädt das Modul
 * direkt per Node-Type-Stripping (wie lib/upstash-rest.ts). Deshalb auch keine TS-Syntax, die
 * Node nicht entfernen kann (enum, namespace, Parameter-Properties). tests/bn-unit.spec.ts prüft das.
 *
 * Vertrag (design-p2.md Abschnitt 3, n8n.md Abschnitt 5):
 * - POST /wp-json/sb-bn/v1/click: text/plain-JSON {code,fbp,fbc,url,cta,consent} der LP, IP und
 *   User-Agent ergänzt der Server. Hash `bn:<VERCEL_ENV>:click:<CODE>`, Felder werden nur
 *   ergänzt (HSETNX), nie überschrieben. Ablauf min(Klick + 60 Tage, Löschdatum).
 * - GET /wp-json/sb-bn/v1/click/{code} (n8n, Basic Auth): {found:false} oder
 *   {found:true,fbc,fbp,ip,ua} mit nur den vorhandenen Feldern.
 * Speicher: restStore(pipeline) für Upstash (Pipeline aus lib/upstash-rest.ts), memoryStore()
 * nur für lokale Tests – auf Vercel technisch gesperrt.
 */

/**
 * Aktionscode im POST: genau das Generator-Alphabet (ohne I, O, 0, 1).
 * Kopie von BN_CODE_REGEX aus lib/cta.ts (Import geht hier nicht, s. o.) –
 * tests/bn-unit.spec.ts prüft die Gleichheit.
 */
export const BN_CODE_RE = /^BN-[A-HJ-NP-Z2-9]{4}$/;

/**
 * Code im GET-Pfad wie die WP-Route `BN-[A-Za-z2-9]{4}`. WordPress vergleicht Routen ohne
 * Groß-/Kleinschreibung (`@^…$@i`), daher Flag i; gesucht wird dann in Großbuchstaben.
 */
export const BN_CODE_PFAD_RE = /^BN-[A-Za-z2-9]{4}$/i;

/** data-bn-cta der Buttons auf der LP (bn.html) */
export const BN_CTA_POSITIONEN = ["hero", "steps", "final", "sticky"] as const;
export type BnCtaPosition = (typeof BN_CTA_POSITIONEN)[number];

/** Höchstgröße des Beacon-Bodys in Byte */
export const KLICK_MAX_BYTES = 4096;
/** Speicherdauer je Klick, zusätzlich gedeckelt durch das Löschdatum */
export const KLICK_MAX_TAGE = 60;
/** POST-Anfragen je IP und Minute */
export const KLICK_RATE_LIMIT = 20;
export const UA_MAX = 512;
export const URL_MAX = 2048;
/** Entscheidung Dennis 27.10.2026 (PLAN.md); Env BN_CLICK_DELETE_AT hat Vorrang */
export const LOESCHDATUM_STANDARD = "2026-12-10T00:00:00+01:00";

/**
 * WP-Fehlerantworten wörtlich (assets/raw/wp-errors.txt, curl gegen functional-wiehl.de am
 * 27.10.2026). PHPs json_encode schreibt Umlaute als \u-Escapes – deshalb Rohtext statt
 * JSON.stringify. tests/fixtures/wp-rest-fehler.json hält dieselben Bytes fest.
 */
export const WP_FEHLER = {
  rest_forbidden: {
    status: 401,
    body: '{"code":"rest_forbidden","message":"Du bist leider nicht berechtigt, diese Aktion durchzuf\\u00fchren.","data":{"status":401}}',
  },
  rest_no_route: {
    status: 404,
    body: '{"code":"rest_no_route","message":"Es wurde keine Route gefunden, die mit der URL und der Anfragemethode \\u00fcbereinstimmt.","data":{"status":404}}',
  },
} as const;
export type WpFehler = keyof typeof WP_FEHLER;

/** Geprüfter Klick aus dem Beacon; ungültige Nebenfelder sind "" statt eines Fehlers */
export type Klick = {
  code: string;
  fbc: string;
  fbp: string;
  url: string;
  cta: BnCtaPosition | "";
  consent: 0 | 1;
};

// fbc = fb.<Subdomain-Index>.<Zeit in ms>.<fbclid>, nur druckbares ASCII ohne Leerzeichen
const FBC_RE = /^fb\.\d\.\d{10,16}\.[\x21-\x7e]{1,400}$/;
const FBP_RE = /^fb\.\d\.\d{10,16}\.\d{1,25}$/;
const DRUCKBAR_RE = /^[\x21-\x7e]+$/;

function nurWenn(wert: unknown, muster: RegExp): string {
  return typeof wert === "string" && muster.test(wert) ? wert : "";
}

function pruefeUrl(wert: unknown, erlaubteHosts: readonly string[]): string {
  if (typeof wert !== "string" || !wert || wert.length > URL_MAX || !DRUCKBAR_RE.test(wert)) return "";
  try {
    const url = new URL(wert);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return erlaubteHosts.includes(url.host.toLowerCase()) ? wert : "";
  } catch {
    return "";
  }
}

/**
 * Beacon-Body prüfen. null (→ 400) nur bei kaputtem JSON oder ungültigem Code; fehlerhafte
 * Nebenfelder werden zu "" bzw. 0, damit ein Klick nicht an einem Detail verloren geht.
 * `url` zählt nur mit erlaubtem Host (eigene Domain, Preview).
 */
export function parseKlick(text: string, erlaubteHosts: readonly string[]): Klick | null {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    return null;
  }
  if (!daten || typeof daten !== "object" || Array.isArray(daten)) return null;
  const d = daten as Record<string, unknown>;
  if (typeof d.code !== "string" || !BN_CODE_RE.test(d.code)) return null;

  const cta = BN_CTA_POSITIONEN.find((p) => p === d.cta) ?? "";
  return {
    code: d.code,
    fbc: nurWenn(d.fbc, FBC_RE),
    fbp: nurWenn(d.fbp, FBP_RE),
    url: pruefeUrl(d.url, erlaubteHosts),
    cta,
    consent: d.consent === 1 || d.consent === true || d.consent === "1" ? 1 : 0,
  };
}

/**
 * Ablauf als Unix-Sekunden für EXPIREAT: min(basis + maxTage, Löschdatum).
 * null, wenn dieser Zeitpunkt nicht nach `jetztMs` liegt (dann nichts mehr speichern).
 */
export function ablaufUnix(
  basisMs: number,
  loeschMs: number,
  maxTage: number = KLICK_MAX_TAGE,
  jetztMs: number = basisMs
): number | null {
  const ende = Math.min(basisMs + maxTage * 86_400_000, loeschMs);
  return ende > jetztMs ? Math.floor(ende / 1000) : null;
}

/** Löschdatum in ms: leer → LOESCHDATUM_STANDARD, unlesbar → null (Aufrufer entscheidet) */
export function loeschMs(wert: string | undefined): number | null {
  const ms = Date.parse(wert?.trim() || LOESCHDATUM_STANDARD);
  return Number.isFinite(ms) ? ms : null;
}

export function klickSchluessel(prefix: string, code: string): string {
  return `${prefix}:click:${code.toUpperCase()}`;
}

/** Zähler fürs Rate-Limit, `ipKey` ist schon pseudonym (HMAC aus lib/request.ts) */
export function rateLimitSchluessel(prefix: string, ipKey: string, minute: number): string {
  return `${prefix}:rl:${ipKey}:${minute}`;
}

/** Die einzigen Felder, die der GET-Endpoint herausgibt (liest n8n „Lead-Event bauen“) */
export const KLICK_ANTWORT_FELDER = ["fbc", "fbp", "ip", "ua"] as const;
export type KlickDaten = Partial<Record<(typeof KLICK_ANTWORT_FELDER)[number], string>>;
export type KlickAntwort = { found: false } | ({ found: true } & KlickDaten);

/** Antwort wie WP: {found:false} oder {found:true,…} mit nur den nicht leeren Feldern */
export function klickAntwort(daten: KlickDaten | null): KlickAntwort {
  if (!daten) return { found: false };
  const antwort: { found: true } & KlickDaten = { found: true };
  for (const feld of KLICK_ANTWORT_FELDER) {
    const wert = daten[feld];
    if (wert) antwort[feld] = wert;
  }
  return antwort;
}

/** Basic-Auth-Header zerlegen (UTF-8, Trenner ist der erste Doppelpunkt); null bei allem anderen */
export function parseBasicAuth(header: string | null | undefined): { benutzer: string; passwort: string } | null {
  const treffer = /^Basic +([A-Za-z0-9+/]+={0,2})\s*$/i.exec(header ?? "");
  if (!treffer) return null;
  let klartext: string;
  try {
    const bytes = Uint8Array.from(atob(treffer[1]), (zeichen) => zeichen.charCodeAt(0));
    klartext = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  const trenner = klartext.indexOf(":");
  if (trenner < 0) return null;
  return { benutzer: klartext.slice(0, trenner), passwort: klartext.slice(trenner + 1) };
}

/** WP-App-Passwörter werden mit Leerzeichen angezeigt („abcd efgh …“) und ohne verglichen */
export function ohneLeerzeichen(wert: string): string {
  return wert.replace(/\s+/g, "");
}

export interface KlickStore {
  /**
   * Setzt nur fehlende Felder (HSETNX, leere Werte werden übersprungen) und den Ablauf.
   * Mit `klickZeit` zusätzlich last_at und hits (nur echte Klicks, nicht die Migration).
   * Liefert die Zahl der neu gesetzten Felder.
   */
  ergaenze(key: string, felder: Readonly<Record<string, string>>, ablaufUnix: number, klickZeit?: string): Promise<number>;
  /** fbc, fbp, ip, ua eines Klicks; null, wenn es den Schlüssel nicht (mehr) gibt */
  lies(key: string): Promise<KlickDaten | null>;
  /** Rate-Limit-Zähler: INCR plus Ablauf, liefert den neuen Stand */
  zaehle(key: string, ttlSek: number): Promise<number>;
}

/** Strukturgleich mit RedisPipeline aus lib/upstash-rest.ts (Import geht hier nicht, s. o.) */
export type KlickPipeline = (befehle: readonly (readonly (string | number)[])[]) => Promise<unknown[]>;

/** Upstash-Speicher: je Methode genau eine Pipeline-Anfrage */
export function restStore(pipeline: KlickPipeline): KlickStore {
  return {
    async ergaenze(key, felder, ablauf, klickZeit) {
      const befehle: (string | number)[][] = [];
      for (const [feld, wert] of Object.entries(felder)) {
        if (wert) befehle.push(["HSETNX", key, feld, wert]);
      }
      if (klickZeit) befehle.push(["HSET", key, "last_at", klickZeit], ["HINCRBY", key, "hits", 1]);
      befehle.push(["EXPIREAT", key, ablauf]);
      const ergebnis = await pipeline(befehle);
      return befehle.reduce((neu, befehl, i) => neu + (befehl[0] === "HSETNX" && Number(ergebnis[i]) === 1 ? 1 : 0), 0);
    },
    async lies(key) {
      const [existiert, werte] = await pipeline([["EXISTS", key], ["HMGET", key, ...KLICK_ANTWORT_FELDER]]);
      if (Number(existiert) !== 1) return null;
      const liste: unknown[] = Array.isArray(werte) ? werte : [];
      const daten: KlickDaten = {};
      KLICK_ANTWORT_FELDER.forEach((feld, i) => {
        const wert = liste[i];
        if (typeof wert === "string" && wert) daten[feld] = wert;
      });
      return daten;
    },
    async zaehle(key, ttlSek) {
      const [stand] = await pipeline([["INCR", key], ["EXPIRE", key, ttlSek]]);
      return Number(stand);
    },
  };
}

type MemoryHash = { felder: Map<string, string>; ablaufMs: number | null };
type MemorySpeicher = { hashes: Map<string, MemoryHash>; zaehler: Map<string, { wert: number; ablaufMs: number }> };

/**
 * In-Memory-Speicher NUR für lokale Läufe und die Playwright-Abnahme (BN_CLICK_STORE=memory).
 * Auf Vercel wirft er: Dort gäbe es je Instanz einen eigenen, flüchtigen Speicher, und n8n
 * bekäme still {found:false}. Liegt auf globalThis, weil POST- und GET-Route getrennte
 * Modulkopien haben können.
 */
export function memoryStore(): KlickStore {
  if (typeof process !== "undefined" && process.env.VERCEL) {
    throw new Error("memoryStore ist auf Vercel gesperrt (BN_CLICK_STORE=memory nur lokal und in Tests)");
  }
  const g = globalThis as typeof globalThis & { __fwBnKlicks?: MemorySpeicher };
  g.__fwBnKlicks ??= { hashes: new Map(), zaehler: new Map() };
  const speicher = g.__fwBnKlicks;

  const lebend = (key: string): MemoryHash | undefined => {
    const eintrag = speicher.hashes.get(key);
    if (eintrag && eintrag.ablaufMs !== null && eintrag.ablaufMs <= Date.now()) {
      speicher.hashes.delete(key);
      return undefined;
    }
    return eintrag;
  };

  return {
    async ergaenze(key, felder, ablauf, klickZeit) {
      let eintrag = lebend(key);
      if (!eintrag) {
        eintrag = { felder: new Map(), ablaufMs: null };
        speicher.hashes.set(key, eintrag);
      }
      let neu = 0;
      for (const [feld, wert] of Object.entries(felder)) {
        if (wert && !eintrag.felder.has(feld)) {
          eintrag.felder.set(feld, wert);
          neu++;
        }
      }
      if (klickZeit) {
        eintrag.felder.set("last_at", klickZeit);
        eintrag.felder.set("hits", String(Number(eintrag.felder.get("hits") ?? 0) + 1));
      }
      eintrag.ablaufMs = ablauf * 1000;
      return neu;
    },
    async lies(key) {
      const eintrag = lebend(key);
      if (!eintrag) return null;
      const daten: KlickDaten = {};
      for (const feld of KLICK_ANTWORT_FELDER) {
        const wert = eintrag.felder.get(feld);
        if (wert) daten[feld] = wert;
      }
      return daten;
    },
    async zaehle(key, ttlSek) {
      const jetzt = Date.now();
      const alt = speicher.zaehler.get(key);
      const wert = alt && alt.ablaufMs > jetzt ? alt.wert + 1 : 1;
      speicher.zaehler.set(key, { wert, ablaufMs: jetzt + ttlSek * 1000 });
      return wert;
    },
  };
}
