#!/usr/bin/env node
/**
 * Migration der BN-Klickdaten aus WordPress nach Upstash (design-p2.md Abschnitt 4).
 *
 * Holt je Code die Klickdaten über die alte WP-Route GET /wp-json/sb-bn/v1/click/<CODE>
 * (Basic Auth = dasselbe Paar wie im n8n-Credential) und schreibt sie idempotent in den
 * Klickspeicher: nur fehlende Felder (HSETNX), src "wp", migrated_at,
 * EXPIREAT = min(Klick + 60 Tage, BN_CLICK_DELETE_AT), eine längere Restlaufzeit bleibt.
 * Beliebig oft lauffähig, bis WP gesperrt ist. Läufe: vor dem DNS-Wechsel, direkt danach
 * mit --wp-ip, nach 2 × TTL noch einmal (docs/TODO-meta-capi.md).
 *
 * Aufruf (Env-Datei z. B. per `vercel env pull`, danach löschen; .env* ist gitignored):
 *   npm run bn:migrate -- --env-file .env.migration --codes codes.csv [--wp-ip 109.237.132.28] [--dry-run]
 *   node --env-file=.env.migration scripts/bn-migrate-clicks.mjs --codes codes.csv …
 *
 * Env: BN_CLICK_USER, BN_CLICK_PASS, KV_REST_API_URL, KV_REST_API_TOKEN (oder UPSTASH_REDIS_REST_*),
 *      BN_CLICK_DELETE_AT (Standard 2026-12-10T00:00:00+01:00)
 *
 * Ausgabe nur Codes und Zähler – nie IP, User-Agent, fbc oder fbp.
 * Exit-Code: 0 ok, 1 einzelne Codes fehlerhaft, 2 Abbruch (Aufruf, Env, Auth, WP gesperrt).
 *
 * Lädt lib/upstash-rest.ts und lib/black-november/klickspeicher.ts direkt per Type-Stripping
 * (beide ohne Imports).
 */
import { readFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { isIPv6 } from "node:net";
import { parseArgs } from "node:util";
import {
  BN_CODE_PFAD_RE,
  ablaufUnix,
  klickSchluessel,
  loeschMs,
  restStore,
} from "../lib/black-november/klickspeicher.ts";
import { upstashAusEnv } from "../lib/upstash-rest.ts";

const HILFE = `bn:migrate – BN-Klickdaten von WordPress nach Upstash übernehmen

  --codes <datei>     Code-Liste: CSV mit Spalte "code" (optional Zeitspalte wie created_at)
                      oder beliebiger Text, in dem BN-Codes stehen
  --wp-ip <ip>        WP über eine feste IP abfragen (nach dem DNS-Wechsel: 109.237.132.28);
                      TLS wird weiter gegen den Hostnamen geprüft
  --base-url <url>    Quelle, Standard https://functional-wiehl.de
  --prefix <p>        Schlüsselraum im Ziel, Standard bn:production
  --dry-run           nur bei WP lesen, nichts schreiben (braucht kein Redis)
  --check             WP und Redis vergleichen, nichts schreiben
  --delete <CODE>     Code im Ziel löschen (mehrfach möglich, z. B. Testcodes), ohne WP
  --env-file <datei>  Env-Datei laden (Alternative zu node --env-file)
  --pause <ms>        Pause zwischen zwei WP-Abfragen, Standard 200
  --timeout <ms>      Timeout je WP-Abfrage, Standard 8000
  --help`;

const ZEIT_SPALTEN = ["klick_at", "clicked_at", "created_at", "createdat", "created", "first_at", "zeit", "time", "ts", "datum"];

class Abbruch extends Error {}

function argumente() {
  try {
    return parseArgs({
      options: {
        codes: { type: "string" },
        "wp-ip": { type: "string" },
        "base-url": { type: "string", default: "https://functional-wiehl.de" },
        prefix: { type: "string", default: "bn:production" },
        "dry-run": { type: "boolean", default: false },
        check: { type: "boolean", default: false },
        delete: { type: "string", multiple: true },
        "env-file": { type: "string" },
        pause: { type: "string", default: "200" },
        timeout: { type: "string", default: "8000" },
        help: { type: "boolean", default: false },
      },
      strict: true,
    }).values;
  } catch (err) {
    throw new Abbruch(`${err.message}\n\n${HILFE}`);
  }
}

/** Eine CSV-Zeile in Zellen, mit "…"-Feldern und "" als Anführungszeichen */
function csvZellen(zeile, trenner) {
  const zellen = [];
  let zelle = "";
  let inAnfuehrung = false;
  for (let i = 0; i < zeile.length; i++) {
    const z = zeile[i];
    if (inAnfuehrung) {
      if (z === '"' && zeile[i + 1] === '"') {
        zelle += '"';
        i++;
      } else if (z === '"') inAnfuehrung = false;
      else zelle += z;
    } else if (z === '"') inAnfuehrung = true;
    else if (z === trenner) {
      zellen.push(zelle.trim());
      zelle = "";
    } else zelle += z;
  }
  zellen.push(zelle.trim());
  return zellen;
}

function zeitMs(wert) {
  if (!wert) return null;
  if (/^\d{9,13}$/.test(wert)) {
    const zahl = Number(wert);
    return zahl < 1e11 ? zahl * 1000 : zahl; // Unix-Sekunden oder ms
  }
  const ms = Date.parse(wert);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Codes aus der Liste: mit Kopfzeile und Spalte "code" genau diese Spalte (dazu eine
 * Zeitspalte, falls vorhanden), sonst jedes BN-Muster im Text. Doppelte zusammengefasst,
 * die späteste Klickzeit zählt. Liefert { codes: [{code, klickMs}], ungueltig: [...] }.
 */
function leseCodes(text) {
  const zeilen = text.split(/\r?\n/).filter((z) => z.trim());
  const gefunden = new Map();
  const ungueltig = [];
  const merke = (roh, klickMs) => {
    if (!BN_CODE_PFAD_RE.test(roh)) return ungueltig.push(roh);
    const code = roh.toUpperCase();
    const alt = gefunden.get(code);
    if (!alt || (klickMs ?? -Infinity) > (alt.klickMs ?? -Infinity)) gefunden.set(code, { code, klickMs: klickMs ?? alt?.klickMs ?? null });
  };

  const trenner = [";", "\t", ","].find((t) => zeilen[0]?.includes(t));
  const kopf = zeilen.length ? csvZellen(zeilen[0], trenner).map((z) => z.toLowerCase()) : [];
  const codeSpalte = kopf.indexOf("code");
  if (codeSpalte >= 0) {
    const zeitSpalte = kopf.findIndex((z) => ZEIT_SPALTEN.includes(z));
    for (const zeile of zeilen.slice(1)) {
      const zellen = csvZellen(zeile, trenner);
      if (zellen[codeSpalte]) merke(zellen[codeSpalte], zeitSpalte >= 0 ? zeitMs(zellen[zeitSpalte]) : null);
    }
  } else {
    for (const zeile of zeilen) {
      for (const treffer of zeile.matchAll(/\bBN-[A-Za-z0-9]{4}\b/gi)) merke(treffer[0], null);
    }
  }
  return { codes: [...gefunden.values()], ungueltig };
}

/** GET bei WP über node:http(s); mit wpIp löst `lookup` den Host fest auf diese IP auf */
function holeVonWp(code, { basisUrl, wpIp, auth, timeoutMs }) {
  const url = new URL(`/wp-json/sb-bn/v1/click/${code}`, basisUrl);
  const modul = url.protocol === "https:" ? https : http;
  const family = wpIp && isIPv6(wpIp) ? 6 : 4;
  // Node fragt je nach Happy Eyeballs mit oder ohne {all:true} – beide Formen bedienen
  const lookup = wpIp
    ? (_host, optionen, fertig) =>
        optionen?.all ? fertig(null, [{ address: wpIp, family }]) : fertig(null, wpIp, family)
    : undefined;

  return new Promise((resolve, reject) => {
    const anfrage = modul.request(
      url,
      {
        method: "GET",
        headers: { Authorization: auth, Accept: "application/json", "User-Agent": "functional-wiehl-bn-migrate/1.0" },
        lookup,
        servername: url.protocol === "https:" ? url.hostname : undefined,
        timeout: timeoutMs,
      },
      (antwort) => {
        const teile = [];
        antwort.on("data", (teil) => teile.push(teil));
        antwort.on("end", () => resolve({ status: antwort.statusCode ?? 0, text: Buffer.concat(teile).toString("utf8") }));
        antwort.on("error", reject);
      }
    );
    anfrage.on("timeout", () => anfrage.destroy(new Error(`Zeitüberschreitung nach ${timeoutMs} ms`)));
    anfrage.on("error", reject);
    anfrage.end();
  });
}

/** WP-Antwort deuten: {gefunden, daten} oder Fehlerart */
function deute({ status, text }) {
  if (status === 401 || status === 403) throw new Abbruch(`WP antwortet ${status} – Zugangsdaten falsch oder WP schon gesperrt. Abbruch.`);
  if (status !== 200) return { fehler: `HTTP ${status}` };
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { fehler: "keine JSON-Antwort" };
  }
  if (json?.found !== true) return { gefunden: false };
  const daten = {};
  for (const feld of ["fbc", "fbp", "ip", "ua"]) {
    if (typeof json[feld] === "string" && json[feld]) daten[feld] = json[feld];
  }
  return { gefunden: true, daten };
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const a = argumente();
  if (a.help) {
    console.log(HILFE);
    return 0;
  }
  if (a["env-file"]) process.loadEnvFile(a["env-file"]);

  const pauseMs = Number(a.pause);
  const timeoutMs = Number(a.timeout);
  if (!Number.isFinite(pauseMs) || pauseMs < 0 || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Abbruch("--pause und --timeout erwarten Millisekunden");
  }
  if (!/^[a-z0-9:_-]+$/i.test(a.prefix)) throw new Abbruch(`--prefix ungültig: ${a.prefix}`);
  if (a["dry-run"] && (a.check || a.delete?.length)) throw new Abbruch("--dry-run geht nicht mit --check oder --delete");

  const brauchtRedis = !a["dry-run"];
  const pipeline = brauchtRedis ? upstashAusEnv(process.env, 8000) : null;
  if (brauchtRedis && !pipeline) throw new Abbruch("KV_REST_API_URL/KV_REST_API_TOKEN (oder UPSTASH_REDIS_REST_*) fehlen.");

  // ── Testcodes löschen (ohne WP) ──────────────────────────────────────
  if (a.delete?.length) {
    const ergebnis = { "gelöscht": [], "nicht vorhanden": [], "ungültig": [] };
    for (const roh of a.delete) {
      if (!BN_CODE_PFAD_RE.test(roh)) {
        ergebnis["ungültig"].push(roh);
        continue;
      }
      const code = roh.toUpperCase();
      const [anzahl] = await pipeline([["DEL", klickSchluessel(a.prefix, code)]]);
      ergebnis[Number(anzahl) === 1 ? "gelöscht" : "nicht vorhanden"].push(code);
    }
    console.log(`bn:migrate --delete im Ziel ${a.prefix}`);
    zusammenfassung(ergebnis);
    return ergebnis["ungültig"].length ? 1 : 0;
  }

  // ── Migration, Probelauf oder Vergleich ──────────────────────────────
  if (!a.codes) throw new Abbruch(`--codes <datei> fehlt.\n\n${HILFE}`);
  const benutzer = process.env.BN_CLICK_USER?.trim();
  const passwort = process.env.BN_CLICK_PASS;
  if (!benutzer || !passwort) throw new Abbruch("BN_CLICK_USER/BN_CLICK_PASS fehlen (Paar aus dem n8n-Credential).");
  const loesch = loeschMs(process.env.BN_CLICK_DELETE_AT);
  if (loesch === null) throw new Abbruch("BN_CLICK_DELETE_AT ist unlesbar.");

  let basisUrl;
  try {
    basisUrl = new URL(a["base-url"]);
  } catch {
    throw new Abbruch(`--base-url ungültig: ${a["base-url"]}`);
  }
  const { codes, ungueltig } = leseCodes(readFileSync(a.codes, "utf8"));
  const modus = a.check ? "Vergleich (--check)" : a["dry-run"] ? "Probelauf (--dry-run)" : "schreiben";
  console.log(
    `bn:migrate ${modus}: Quelle ${basisUrl.origin}${a["wp-ip"] ? ` über IP ${a["wp-ip"]}` : ""}, ` +
      `Ziel ${brauchtRedis ? a.prefix : "–"}, ${codes.length} Codes, Löschdatum ${new Date(loesch).toISOString()}`
  );

  const wp = {
    basisUrl,
    wpIp: a["wp-ip"],
    auth: `Basic ${Buffer.from(`${benutzer}:${passwort}`, "utf8").toString("base64")}`,
    timeoutMs,
  };
  const store = pipeline ? restStore(pipeline) : null;
  const ergebnis = a.check
    ? { gleich: [], abweichend: [], "fehlt im Ziel": [], "nicht in WP": [], Fehler: [] }
    : { gefunden: [], "neu geschrieben": [], "ergänzt": [], "schon vorhanden": [], "nicht gefunden": [], abgelaufen: [], Fehler: [] };
  if (ungueltig.length) ergebnis["ungültig (übersprungen)"] = ungueltig;

  for (const [i, { code, klickMs }] of codes.entries()) {
    if (i > 0 && pauseMs) await pause(pauseMs);
    let antwort;
    try {
      antwort = deute(await holeVonWp(code, wp));
    } catch (err) {
      if (err instanceof Abbruch) throw err;
      antwort = { fehler: err?.message ?? "Netzwerkfehler" };
    }
    if (antwort.fehler) {
      ergebnis.Fehler.push(`${code} (${antwort.fehler})`);
      continue;
    }
    const key = klickSchluessel(a.prefix, code);

    if (a.check) {
      if (!antwort.gefunden) {
        ergebnis["nicht in WP"].push(code);
        continue;
      }
      try {
        const ziel = await store.lies(key);
        if (!ziel) ergebnis["fehlt im Ziel"].push(code);
        else {
          const gleich = ["fbc", "fbp", "ip", "ua"].every((f) => (antwort.daten[f] ?? "") === (ziel[f] ?? ""));
          ergebnis[gleich ? "gleich" : "abweichend"].push(code);
        }
      } catch (err) {
        ergebnis.Fehler.push(`${code} (Redis: ${err?.message ?? "Fehler"})`);
      }
      continue;
    }

    if (!antwort.gefunden) {
      ergebnis["nicht gefunden"].push(code);
      continue;
    }
    ergebnis.gefunden.push(code);
    if (!store) continue; // Probelauf

    const jetzt = Date.now();
    let ablauf = ablaufUnix(klickMs ?? jetzt, loesch, 60, jetzt);
    if (ablauf === null) {
      ergebnis.abgelaufen.push(code);
      continue;
    }
    try {
      // Eine schon längere Restlaufzeit (z. B. neuer Klick über die Next-LP) nie verkürzen
      const [ttl] = await pipeline([["TTL", key]]);
      const existierte = Number(ttl) !== -2;
      if (Number(ttl) > 0) ablauf = Math.max(ablauf, Math.floor(jetzt / 1000) + Number(ttl));
      const neu = await store.ergaenze(
        key,
        {
          ...antwort.daten,
          ...(klickMs ? { first_at: new Date(klickMs).toISOString() } : {}),
          src: "wp",
          migrated_at: new Date(jetzt).toISOString(),
        },
        ablauf
      );
      ergebnis[!existierte ? "neu geschrieben" : neu > 0 ? "ergänzt" : "schon vorhanden"].push(code);
    } catch (err) {
      ergebnis.Fehler.push(`${code} (Redis: ${err?.message ?? "Fehler"})`);
    }
  }

  zusammenfassung(ergebnis);
  return ergebnis.Fehler.length ? 1 : 0;
}

function zusammenfassung(ergebnis) {
  console.log("Zusammenfassung:");
  for (const [art, liste] of Object.entries(ergebnis)) {
    console.log(`  ${art}: ${liste.length}${liste.length ? ` (${liste.join(", ")})` : ""}`);
  }
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Abbruch ? err.message : `Unerwarteter Fehler: ${err?.message ?? err}`);
    process.exit(2);
  }
);
