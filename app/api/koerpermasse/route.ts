import { NextResponse } from "next/server";
import { koerpermasseMail, pruefeKoerpermasse } from "@/lib/forms/koerpermasse";
import { empfaenger, MailNichtKonfiguriertError, mailFehlerCode, sendeMail } from "@/lib/mailer";
import { clientIp, gleicherOrigin, ipSchluessel } from "@/lib/request";
import { UpstashFehler, upstashAusEnv } from "@/lib/upstash-rest";

/**
 * Empfängt „Körpermaße Digital“ (/koerpermasse/) und schickt die Werte per Mail an
 * FORM_TO (gym@, Alfahosting-SMTP). Die Website speichert nichts.
 *
 * Ablauf: Origin → Content-Type → Größe → JSON → Honeypot → Prüfung → Rate-Limit → Mail.
 * Antworten: 200 {ok:true} | 400 | 403 | 413 | 415 | 422 | 429 | 502 (SMTP-Fehler) |
 * 503 (Versand nicht konfiguriert). Erfolg meldet der Client nur bei 200.
 *
 * ⚠️ Körpermaße gelten vorsorglich als Gesundheitsdaten (Art. 9 DSGVO): NIE Body,
 * Namen oder Werte loggen – nur `[form:koerpermasse] <code>`. Kein Tracking.
 */

export const maxDuration = 20;

const BEREICH = "koerpermasse";
/** Die Anfrage ist < 1 KB, 8 KB lassen Luft für lange Namen */
const MAX_BYTES = 8_192;
/** Rate-Limit: FORM_RATE_LIMIT Anfragen (Standard 5) je IP und 10 Minuten */
const FENSTER_S = 600;
const STANDARD_GRENZE = 5;

function antwort(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

function log(code: string) {
  console.error(`[form:${BEREICH}]`, code);
}

// Ohne Upstash (lokal, Preview ohne KV) oder bei einer Störung zählt eine Map je
// Instanz – best effort, ein Ausfall des Zählers blockiert keine echte Anfrage.
const lokaleZaehler = new Map<string, { anzahl: number; bis: number }>();

function zaehleLokal(schluessel: string): number {
  const jetzt = Date.now();
  const zaehler = lokaleZaehler.get(schluessel);
  if (zaehler && zaehler.bis > jetzt) return ++zaehler.anzahl;
  if (lokaleZaehler.size > 10_000) {
    for (const [k, z] of lokaleZaehler) if (z.bis <= jetzt) lokaleZaehler.delete(k);
  }
  lokaleZaehler.set(schluessel, { anzahl: 1, bis: jetzt + FENSTER_S * 1000 });
  return 1;
}

async function zuVieleAnfragen(headers: Headers): Promise<boolean> {
  const grenze = Number(process.env.FORM_RATE_LIMIT) || STANDARD_GRENZE;
  // Nur ein HMAC der IP (lib/request.ts), nie die IP selbst
  const schluessel = `rl:${process.env.VERCEL_ENV || "lokal"}:${BEREICH}:${ipSchluessel(clientIp(headers) || "unbekannt")}`;
  const pipeline = upstashAusEnv(process.env, 1500);
  let anzahl: number;
  if (pipeline) {
    try {
      // SET … NX legt den Zähler mit Ablauf an, INCR behält den Ablauf bei
      const [, wert] = await pipeline([
        ["SET", schluessel, 0, "EX", FENSTER_S, "NX"],
        ["INCR", schluessel],
      ]);
      anzahl = Number(wert);
    } catch (err) {
      log(err instanceof UpstashFehler ? `rate_limit_${err.status ?? "netz"}` : "rate_limit");
      anzahl = zaehleLokal(schluessel);
    }
  } else {
    anzahl = zaehleLokal(schluessel);
  }
  return anzahl > grenze;
}

function honeypotGefuellt(json: unknown): boolean {
  const wert = (json as { fw_hp?: unknown } | null)?.fw_hp;
  if (wert === undefined || wert === null) return false;
  return typeof wert === "string" ? wert.trim() !== "" : true;
}

export async function POST(request: Request) {
  if (!gleicherOrigin(request.headers)) return antwort(403, { ok: false, fehler: "Ungültige Herkunft" });

  const typ = request.headers.get("content-type") ?? "";
  if (!/^application\/json\s*(?:;|$)/i.test(typ)) {
    return antwort(415, { ok: false, fehler: "JSON erwartet" });
  }

  if (Number(request.headers.get("content-length")) > MAX_BYTES) {
    return antwort(413, { ok: false, fehler: "Anfrage zu groß" });
  }
  const roh = await request.text();
  if (new TextEncoder().encode(roh).byteLength > MAX_BYTES) {
    return antwort(413, { ok: false, fehler: "Anfrage zu groß" });
  }

  let json: unknown;
  try {
    json = JSON.parse(roh);
  } catch {
    return antwort(400, { ok: false, fehler: "Ungültige Anfrage" });
  }

  // Bots füllen das unsichtbare Feld: still „Erfolg“ melden, nichts verschicken
  if (honeypotGefuellt(json)) {
    log("honeypot");
    return antwort(200, { ok: true });
  }

  const pruefung = pruefeKoerpermasse(json);
  if (!pruefung.ok) {
    // nur der Feldname, nie der Wert
    return antwort(422, { ok: false, fehler: "Pflichtfelder oder Einwilligungen fehlen", feld: pruefung.feld });
  }

  if (await zuVieleAnfragen(request.headers)) {
    return antwort(429, { ok: false, fehler: "Zu viele Anfragen" }, { "Retry-After": String(FENSTER_S) });
  }

  try {
    const { betreff, text, html } = koerpermasseMail(pruefung.daten, new Date());
    await sendeMail({ an: empfaenger("FORM_TO"), betreff, text, html });
  } catch (err) {
    log(mailFehlerCode(err));
    if (err instanceof MailNichtKonfiguriertError) {
      return antwort(503, { ok: false, fehler: "Versand derzeit nicht möglich" });
    }
    return antwort(502, { ok: false, fehler: "Versand fehlgeschlagen" });
  }

  return antwort(200, { ok: true });
}
