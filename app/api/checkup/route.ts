import {
  CHECKUP_TEXTE,
  EINWILLIGUNG,
  EINWILLIGUNG_STAND,
  SCHRITT,
  pruefeCheckup,
  type CheckupDaten,
} from "@/content/checkup-fragen";
import { MailNichtKonfiguriertError, empfaenger, mailFehlerCode, sendeMail } from "@/lib/mailer";
import { clientIp, gleicherOrigin, ipSchluessel } from "@/lib/request";
import { upstashAusEnv } from "@/lib/upstash-rest";

/**
 * Empfängt den Fitness- & Gesundheits-Check-up und schickt ihn als lesbare Text-Mail an
 * FORM_TO (gym@, Alfahosting-SMTP über lib/mailer.ts).
 *
 * Vertrag (design-review (a)-16): POST /api/checkup/ mit CheckupPayload
 *   { antworten, pfad, kontakt:{name,email,telefon}, einwilligungDatenschutz, einwilligungGesundheit, fw_hp, dauerMs }
 * Antworten (immer Cache-Control: no-store):
 *   200 {ok:true}                       versendet – oder still verworfen (Honeypot, zu schnell)
 *   400 {ok:false,fehler:"json"}        kein JSON-Objekt
 *   403 {ok:false,fehler:"herkunft"}    fremder Origin (CSRF)
 *   413 {ok:false,fehler:"zu_gross"}    mehr als 32 KB
 *   415 {ok:false,fehler:"content_type"} kein application/json
 *   422 {ok:false,fehler:"validierung"} Pflichtfelder, Einwilligungen, Werte oder Pfad falsch
 *   429 {ok:false,fehler:"zu_viele_anfragen"} + Retry-After (FORM_RATE_LIMIT je IP und 10 min)
 *   502 {ok:false,fehler:"versand"}     SMTP-Fehler
 *   503 {ok:false,fehler:"nicht_konfiguriert"} SMTP/FORM_TO fehlt
 *
 * ⚠️ Art. 9 DSGVO: Body, Namen und Antworten werden NIE geloggt oder gespeichert – nur
 * feste Codes (`[form:checkup] …`). Kein Fallback „nur loggen“, wenn der Versand fehlt.
 */

export const maxDuration = 20;

const MAX_BYTES = 32_768;
/** Schneller füllt kein Mensch 20+ Schritte aus – dann Bot, still verwerfen */
const MIN_DAUER_MS = 1_500;
const RATE_FENSTER_S = 600;

type Fehler =
  | "json"
  | "herkunft"
  | "zu_gross"
  | "content_type"
  | "validierung"
  | "zu_viele_anfragen"
  | "versand"
  | "nicht_konfiguriert";

function antwort(status: number, fehler?: Fehler, headers: Record<string, string> = {}) {
  return Response.json(fehler ? { ok: false, fehler } : { ok: true }, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/** Body als Text mit Obergrenze; null, wenn größer als `max` Bytes */
async function leseText(request: Request, max: number): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > max) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const teile: Uint8Array[] = [];
  let laenge = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    laenge += value.byteLength;
    if (laenge > max) {
      await reader.cancel();
      return null;
    }
    teile.push(value);
  }
  return Buffer.concat(teile).toString("utf8");
}

// ---- Rate-Limit: Upstash (INCR im festen 10-min-Fenster), sonst best effort je Instanz ----

const speicher = new Map<string, { anzahl: number; bis: number }>();

function zaehleImSpeicher(schluessel: string): { anzahl: number; restS: number } {
  const jetzt = Date.now();
  if (speicher.size > 5_000) for (const [k, v] of speicher) if (v.bis <= jetzt) speicher.delete(k);
  const eintrag = speicher.get(schluessel);
  if (!eintrag || eintrag.bis <= jetzt) {
    speicher.set(schluessel, { anzahl: 1, bis: jetzt + RATE_FENSTER_S * 1000 });
    return { anzahl: 1, restS: RATE_FENSTER_S };
  }
  eintrag.anzahl += 1;
  return { anzahl: eintrag.anzahl, restS: Math.ceil((eintrag.bis - jetzt) / 1000) };
}

async function begrenzeRate(headers: Headers): Promise<{ erlaubt: boolean; restS: number }> {
  const grenze = Number(process.env.FORM_RATE_LIMIT);
  const maximum = Number.isInteger(grenze) && grenze > 0 ? grenze : 5;
  // Schlüssel ist ein HMAC der IP (RATE_LIMIT_SECRET), nie die IP selbst
  const schluessel = `rl:checkup:${ipSchluessel(clientIp(headers))}`;

  let stand: { anzahl: number; restS: number } | undefined;
  const pipeline = upstashAusEnv(process.env, 1_500);
  if (pipeline) {
    try {
      const [, anzahl, ttl] = await pipeline([
        ["SET", schluessel, 0, "EX", RATE_FENSTER_S, "NX"],
        ["INCR", schluessel],
        ["TTL", schluessel],
      ]);
      stand = { anzahl: Number(anzahl), restS: Number(ttl) > 0 ? Number(ttl) : RATE_FENSTER_S };
    } catch (err) {
      console.error("[form:checkup] rate_limit", err instanceof Error ? err.name : "fehler");
    }
  }
  stand ??= zaehleImSpeicher(schluessel);
  return { erlaubt: stand.anzahl <= maximum, restS: stand.restS };
}

// ---- Mail ----

const DATUM = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  dateStyle: "medium",
  timeStyle: "short",
});
const ZAHL = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

const zeile = (frage: string, antwort: string) =>
  /[?:]$/.test(frage) ? `${frage} ${antwort}` : `${frage}: ${antwort}`;

function antwortZeilen({ antworten, pfad }: CheckupDaten): string[] {
  return pfad.flatMap((id) => {
    const schritt = SCHRITT[id];
    if (schritt.typ === "gewicht") {
      return schritt.felder.map((f) => zeile(f.label, ZAHL.format(antworten[f.key] as number)));
    }
    const wert = antworten[schritt.key];
    const text = typeof wert === "string" ? wert : (wert as readonly string[]).join(", ");
    return [`${schritt.detail ? "  → " : ""}${zeile(schritt.mailTitel ?? schritt.titel, text)}`];
  });
}

function checkupMail(daten: CheckupDaten, eingang: Date): { betreff: string; text: string } {
  const { name, email, telefon } = daten.kontakt;
  const text = [
    `Neuer ${CHECKUP_TEXTE.titel} über die Website`,
    `Eingang: ${DATUM.format(eingang)} Uhr`,
    "",
    "KONTAKT",
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Telefon: ${telefon}`,
    "",
    `EINWILLIGUNGEN (beim Absenden erteilt, Text-Stand ${EINWILLIGUNG_STAND})`,
    `[x] ${EINWILLIGUNG.datenschutz}`,
    `[x] ${EINWILLIGUNG.gesundheit}`,
    "",
    "ANTWORTEN",
    ...antwortZeilen(daten),
    "",
    "--",
    "Diese Mail enthält Gesundheitsdaten (Art. 9 DSGVO). Nur für die Trainingsberatung verwenden,",
    "nicht weiterleiten und nach der Bearbeitung löschen. „Antworten“ schreibt direkt an die Person.",
  ].join("\n");
  // Betreff ohne Gesundheitsdaten
  return { betreff: `Neuer Check-up über die Website – ${name}`, text };
}

// ---- Route ----

export async function POST(request: Request) {
  // Browser senden Origin bei jedem POST; ohne Origin (curl, Server) ist CSRF ohnehin kein Thema
  if (!gleicherOrigin(request.headers, { ohneOriginErlaubt: true })) return antwort(403, "herkunft");
  if (!/^application\/json\s*(;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return antwort(415, "content_type");
  }
  const roh = await leseText(request, MAX_BYTES);
  if (roh === null) return antwort(413, "zu_gross");

  let json: unknown;
  try {
    json = JSON.parse(roh);
  } catch {
    return antwort(400, "json");
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) return antwort(400, "json");
  const body = json as Record<string, unknown>;

  const rate = await begrenzeRate(request.headers);
  if (!rate.erlaubt) return antwort(429, "zu_viele_anfragen", { "Retry-After": String(rate.restS) });

  // Bots bekommen ein normales 200, damit sie nicht nachjustieren
  if (typeof body.fw_hp === "string" && body.fw_hp.trim() !== "") {
    console.info("[form:checkup] verworfen honeypot");
    return antwort(200);
  }
  if (typeof body.dauerMs === "number" && body.dauerMs < MIN_DAUER_MS) {
    console.info("[form:checkup] verworfen zu_schnell");
    return antwort(200);
  }

  const pruefung = pruefeCheckup(body);
  if (!pruefung.ok) {
    console.info("[form:checkup] 422", pruefung.grund);
    return antwort(422, "validierung");
  }

  try {
    const mail = checkupMail(pruefung.daten, new Date());
    await sendeMail({ an: empfaenger("FORM_TO"), ...mail, antwortAn: pruefung.daten.kontakt.email });
  } catch (err) {
    console.error("[form:checkup] versand", mailFehlerCode(err));
    return err instanceof MailNichtKonfiguriertError
      ? antwort(503, "nicht_konfiguriert")
      : antwort(502, "versand");
  }
  return antwort(200);
}
