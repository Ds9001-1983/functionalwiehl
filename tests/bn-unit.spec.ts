import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { GET as klickGet } from "../app/wp-json/sb-bn/v1/click/[code]/route";
import { BN_CODE_REGEX, BN_CODE_ZEICHEN } from "../lib/cta";
import {
  BN_CODE_PFAD_RE,
  BN_CODE_RE,
  LOESCHDATUM_STANDARD,
  WP_FEHLER,
  ablaufUnix,
  klickAntwort,
  klickSchluessel,
  loeschMs,
  memoryStore,
  parseBasicAuth,
  parseKlick,
  rateLimitSchluessel,
  restStore,
  type KlickDaten,
  type KlickPipeline,
} from "../lib/black-november/klickspeicher";
import { erlaubteHosts, klickPrefix, pruefeBasicAuth, storeAusEnv } from "../lib/black-november/klickspeicher-server";
import wpFehler from "./fixtures/wp-rest-fehler.json";

/**
 * Unit-Tests des Klickspeichers (ohne Browser und ohne Server):
 * lib/black-november/klickspeicher.ts (Regex, Parser, Ablauf, Speicher) und
 * lib/black-november/klickspeicher-server.ts (Env, Basic Auth), dazu der GET-Handler direkt
 * für das Log der Fehltreffer. HTTP-Vertrag: tests/klickspeicher.spec.ts.
 */
test.skip(({ isMobile }) => isMobile, "Unit-Tests, einmal genügt");

const LOESCH = Date.parse("2026-12-10T00:00:00+01:00");
const TAG = 86_400_000;
const HOSTS = ["functional-wiehl.de", "localhost:3100"];

/** process.env für einen Block setzen und danach wiederherstellen */
async function mitEnv<T>(werte: Record<string, string | undefined>, block: () => Promise<T> | T): Promise<T> {
  const vorher = Object.fromEntries(Object.keys(werte).map((k) => [k, process.env[k]]));
  const setze = (w: Record<string, string | undefined>) => {
    for (const [k, v] of Object.entries(w)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
  setze(werte);
  try {
    return await block();
  } finally {
    setze(vorher);
  }
}

test.describe("Aktionscode", () => {
  test("BN_CODE_RE ist eine exakte Kopie von BN_CODE_REGEX aus lib/cta.ts", () => {
    expect(BN_CODE_RE.source).toBe(BN_CODE_REGEX.source);
    expect(BN_CODE_RE.flags).toBe(BN_CODE_REGEX.flags);
  });

  test("POST nimmt genau das Generator-Alphabet an, an jeder Stelle", () => {
    for (const zeichen of BN_CODE_ZEICHEN) {
      for (let stelle = 0; stelle < 4; stelle++) {
        const code = `BN-${"A".repeat(stelle)}${zeichen}${"A".repeat(3 - stelle)}`;
        expect(BN_CODE_RE.test(code), code).toBe(true);
      }
    }
    for (const falsch of ["BN-AAAI", "BN-AAAO", "BN-AAA0", "BN-AAA1", "BN-aaaa", "bn-AAAA", "BN-AAA", "BN-AAAAA", " BN-AAAA"]) {
      expect(BN_CODE_RE.test(falsch), falsch).toBe(false);
    }
  });

  test("GET-Pfad wie die WP-Route BN-[A-Za-z2-9]{4} mit Flag i", () => {
    for (const ok of ["BN-ZZZZ", "BN-abcd", "bn-AB2C", "BN-IOIO"]) expect(BN_CODE_PFAD_RE.test(ok), ok).toBe(true);
    for (const falsch of ["BN-0000", "BN-AB1C", "BN-ABC", "BN-ABCDE", "XX-ABCD", "BN-AB-C"]) {
      expect(BN_CODE_PFAD_RE.test(falsch), falsch).toBe(false);
    }
  });

  test("Schlüssel: Code in Großbuchstaben, Rate-Limit unter demselben Präfix", () => {
    expect(klickSchluessel("bn:production", "bn-ab2c")).toBe("bn:production:click:BN-AB2C");
    expect(rateLimitSchluessel("bn:preview", "a1b2", 29_000_000)).toBe("bn:preview:rl:a1b2:29000000");
    expect(klickPrefix({ VERCEL_ENV: "production" })).toBe("bn:production");
    expect(klickPrefix({})).toBe("bn:local");
  });
});

test("WP-Fehlerantworten byte-gleich zur Fixture aus dem Live-Mitschnitt", () => {
  expect(WP_FEHLER.rest_forbidden.body).toBe(wpFehler.rest_forbidden.body);
  expect(WP_FEHLER.rest_forbidden.status).toBe(401);
  expect(WP_FEHLER.rest_no_route.body).toBe(wpFehler.rest_no_route.body);
  expect(WP_FEHLER.rest_no_route.status).toBe(404);
  // \u-Escapes wie PHPs json_encode, nicht als UTF-8-Umlaut
  expect(WP_FEHLER.rest_forbidden.body).toContain("durchzuf\\u00fchren");
  expect(JSON.parse(WP_FEHLER.rest_forbidden.body).message).toBe("Du bist leider nicht berechtigt, diese Aktion durchzuführen.");
});

test.describe("parseKlick", () => {
  const gueltig = {
    code: "BN-AB2C",
    fbp: "fb.1.1761555555555.1234567890",
    fbc: "fb.1.1761555555555.IwAR0_Ab-c",
    url: "https://functional-wiehl.de/black-november/?utm_source=facebook&fbclid=IwAR0_Ab-c",
    cta: "hero",
    consent: 1,
  };

  test("gültiger Beacon wie von der Live-LP", () => {
    expect(parseKlick(JSON.stringify(gueltig), HOSTS)).toEqual(gueltig);
  });

  test("null nur bei kaputtem JSON oder ungültigem Code", () => {
    for (const text of ["", "kein json", "[]", "null", '"BN-AB2C"', "42"]) expect(parseKlick(text, HOSTS), text).toBeNull();
    for (const code of [undefined, 42, "BN-AB1C", "bn-ab2c", "BN-AB2C "]) {
      expect(parseKlick(JSON.stringify({ ...gueltig, code }), HOSTS), String(code)).toBeNull();
    }
  });

  test("ungültige Nebenfelder werden leer statt den Klick zu verwerfen", () => {
    const klick = parseKlick(
      JSON.stringify({
        code: "BN-AB2C",
        fbp: "fb.1.123.abc",
        fbc: "fb.1.1761555555555.mit leerzeichen",
        url: "https://boese.example/black-november/",
        cta: "header",
        consent: "ja",
      }),
      HOSTS
    );
    expect(klick).toEqual({ code: "BN-AB2C", fbp: "", fbc: "", url: "", cta: "", consent: 0 });
  });

  test("fehlende Felder (z. B. ohne Einwilligung) sind erlaubt", () => {
    expect(parseKlick('{"code":"BN-ZZZZ"}', HOSTS)).toEqual({ code: "BN-ZZZZ", fbp: "", fbc: "", url: "", cta: "", consent: 0 });
  });

  test("URL: nur http(s), erlaubter Host, höchstens 2048 Zeichen, druckbares ASCII", () => {
    const url = (u: unknown) => parseKlick(JSON.stringify({ ...gueltig, url: u }), HOSTS)?.url;
    expect(url("http://localhost:3100/black-november/?x=1")).toBe("http://localhost:3100/black-november/?x=1");
    expect(url("javascript:alert(1)")).toBe("");
    expect(url("https://functional-wiehl.de.boese.example/")).toBe("");
    expect(url(`https://functional-wiehl.de/?q=${"a".repeat(2048)}`)).toBe("");
    expect(url("https://functional-wiehl.de/\nX")).toBe("");
    expect(url(42)).toBe("");
  });

  test("fbc darf bis 400 Zeichen fbclid tragen, fbp nur Ziffern", () => {
    const lang = `fb.1.1761555555555.${"x".repeat(400)}`;
    expect(parseKlick(JSON.stringify({ ...gueltig, fbc: lang }), HOSTS)?.fbc).toBe(lang);
    expect(parseKlick(JSON.stringify({ ...gueltig, fbc: lang + "x" }), HOSTS)?.fbc).toBe("");
    expect(parseKlick(JSON.stringify({ ...gueltig, fbp: "fb.1.1761555555555.12a" }), HOSTS)?.fbp).toBe("");
  });

  test("consent: 1, true und \"1\" gelten als Einwilligung, alles andere als 0", () => {
    for (const [wert, erwartet] of [[1, 1], [true, 1], ["1", 1], [0, 0], [false, 0], [2, 0], [null, 0]] as const) {
      expect(parseKlick(JSON.stringify({ ...gueltig, consent: wert }), HOSTS)?.consent, String(wert)).toBe(erwartet);
    }
  });
});

test.describe("Ablauf und Löschdatum", () => {
  test("min(Klick + 60 Tage, Löschdatum), null danach", () => {
    const oktober27 = Date.parse("2026-10-27T12:00:00+01:00");
    expect(ablaufUnix(oktober27, LOESCH)).toBe(LOESCH / 1000);
    const oktober1 = Date.parse("2026-10-01T00:00:00+02:00");
    expect(ablaufUnix(oktober1, LOESCH)).toBe((oktober1 + 60 * TAG) / 1000);
    expect(ablaufUnix(LOESCH, LOESCH)).toBeNull();
    expect(ablaufUnix(LOESCH + 1, LOESCH)).toBeNull();
  });

  test("Migration: alter Klick, dessen 60 Tage schon um sind, wird nicht mehr geschrieben", () => {
    const jetzt = Date.parse("2026-11-20T00:00:00+01:00");
    expect(ablaufUnix(jetzt - 61 * TAG, LOESCH, 60, jetzt)).toBeNull();
    expect(ablaufUnix(jetzt - 50 * TAG, LOESCH, 60, jetzt)).toBe(Math.floor((jetzt + 10 * TAG) / 1000));
  });

  test("BN_CLICK_DELETE_AT: leer → 10.12.2026, unlesbar → null", () => {
    expect(loeschMs(undefined)).toBe(Date.parse(LOESCHDATUM_STANDARD));
    expect(loeschMs(" ")).toBe(LOESCH);
    expect(loeschMs("2026-11-30T00:00:00+01:00")).toBe(Date.parse("2026-11-30T00:00:00+01:00"));
    expect(loeschMs("zehnter Dezember")).toBeNull();
  });
});

test.describe("Antwort und Basic Auth", () => {
  test("klickAntwort: nur found und die vier n8n-Felder, leere weggelassen", () => {
    expect(klickAntwort(null)).toEqual({ found: false });
    expect(klickAntwort({})).toEqual({ found: true });
    const mitMehr = { fbc: "fb.1.1.x", fbp: "", ip: "203.0.113.7", ua: "UA", url: "https://…", cta: "hero" } as KlickDaten;
    expect(klickAntwort(mitMehr)).toEqual({ found: true, fbc: "fb.1.1.x", ip: "203.0.113.7", ua: "UA" });
  });

  const basic = (klartext: string, schema = "Basic") => `${schema} ${Buffer.from(klartext, "utf8").toString("base64")}`;

  test("parseBasicAuth: erster Doppelpunkt trennt, UTF-8, sonst null", () => {
    expect(parseBasicAuth(basic("test:abcd efgh ijkl"))).toEqual({ benutzer: "test", passwort: "abcd efgh ijkl" });
    expect(parseBasicAuth(basic("test:a:b", "basic"))).toEqual({ benutzer: "test", passwort: "a:b" });
    expect(parseBasicAuth(basic("jürgen:pässwort"))).toEqual({ benutzer: "jürgen", passwort: "pässwort" });
    for (const kaputt of [null, "", "Basic", "Basic !!!", "Bearer dGVzdDp4", basic("ohne-doppelpunkt"), "Basic /w=="]) {
      expect(parseBasicAuth(kaputt), String(kaputt)).toBeNull();
    }
  });

  test("pruefeBasicAuth: Leerzeichen im Passwort auf beiden Seiten egal, sonst exakt", () => {
    const env = { BN_CLICK_USER: "test", BN_CLICK_PASS: "abcd efgh ijkl" };
    for (const ok of ["test:abcd efgh ijkl", "test:abcdefghijkl", "test: abcd  efgh\tijkl ", " test :abcdefghijkl"]) {
      expect(pruefeBasicAuth(basic(ok), env), ok).toBe(true);
    }
    expect(pruefeBasicAuth(basic("test:abcdefghijkl"), { BN_CLICK_USER: "test", BN_CLICK_PASS: "abcdefghijkl" })).toBe(true);
    for (const falsch of ["test:abcd efgh ijk", "Test:abcdefghijkl", "test:ABCDEFGHIJKL", "test:", ":abcdefghijkl"]) {
      expect(pruefeBasicAuth(basic(falsch), env), falsch).toBe(false);
    }
    expect(pruefeBasicAuth(null, env)).toBe(false);
  });

  test("pruefeBasicAuth: ohne konfigurierte Zugangsdaten immer zu, auch mit leerem Paar", () => {
    expect(pruefeBasicAuth(basic(":"), {})).toBe(false);
    expect(pruefeBasicAuth(basic(":"), { BN_CLICK_USER: "", BN_CLICK_PASS: "" })).toBe(false);
    expect(pruefeBasicAuth(basic("test: "), { BN_CLICK_USER: "test", BN_CLICK_PASS: "   " })).toBe(false);
  });

  test("erlaubteHosts: Hauptdomain mit www, Site-URL und Vercel-URLs", () => {
    expect(
      erlaubteHosts({
        NEXT_PUBLIC_SITE_URL: "https://functional-wiehl.de",
        VERCEL_URL: "functionalwiehl-abc123.vercel.app",
        VERCEL_BRANCH_URL: "functionalwiehl-git-main.vercel.app",
      }).sort()
    ).toEqual(
      ["functional-wiehl.de", "functionalwiehl-abc123.vercel.app", "functionalwiehl-git-main.vercel.app", "www.functional-wiehl.de"].sort()
    );
  });
});

test.describe("Speicher", () => {
  test("storeAusEnv: memory nur außerhalb von Vercel, leere KV-Werte = nicht konfiguriert", () => {
    expect(storeAusEnv({ BN_CLICK_STORE: "memory" })).not.toBeNull();
    expect(storeAusEnv({ BN_CLICK_STORE: "memory", VERCEL: "1", KV_REST_API_URL: "https://x", KV_REST_API_TOKEN: "t" })).toBeNull();
    expect(storeAusEnv({ KV_REST_API_URL: "", KV_REST_API_TOKEN: "" })).toBeNull();
    expect(storeAusEnv({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" })).not.toBeNull();
  });

  test("memoryStore ist auf Vercel technisch gesperrt", async () => {
    await mitEnv({ VERCEL: "1" }, () => {
      expect(() => memoryStore()).toThrow(/gesperrt/);
    });
  });

  test("memoryStore: nur ergänzen, Ablauf wirkt, Zähler zählt", async () => {
    await mitEnv({ VERCEL: undefined }, async () => {
      const store = memoryStore();
      const key = `bn:unit:click:BN-${crypto.randomUUID().slice(0, 4)}`;
      const ablauf = Math.floor(Date.now() / 1000) + 60;
      expect(await store.ergaenze(key, { fbc: "fb.1.1.alt", fbp: "", ip: "203.0.113.1" }, ablauf, "t1")).toBe(2);
      expect(await store.ergaenze(key, { fbc: "fb.1.1.neu", fbp: "fb.1.1.2" }, ablauf, "t2")).toBe(1);
      expect(await store.lies(key)).toEqual({ fbc: "fb.1.1.alt", fbp: "fb.1.1.2", ip: "203.0.113.1" });

      await store.ergaenze(key, {}, Math.floor(Date.now() / 1000) - 1);
      expect(await store.lies(key)).toBeNull();

      const rl = `${key}:rl`;
      expect(await store.zaehle(rl, 60)).toBe(1);
      expect(await store.zaehle(rl, 60)).toBe(2);
    });
  });

  test("restStore: genau eine Pipeline je Aufruf mit HSETNX, last_at, hits und EXPIREAT", async () => {
    const aufrufe: (readonly (readonly (string | number)[])[])[] = [];
    let antworten: unknown[] = [];
    const pipeline: KlickPipeline = async (befehle) => {
      aufrufe.push(befehle);
      return antworten;
    };
    const store = restStore(pipeline);

    antworten = [1, 0, 1, 1, 1, 1];
    const neu = await store.ergaenze("k", { fbc: "fb.1.1.x", fbp: "", ip: "203.0.113.7", ua: "UA" }, 1797116400, "2026-10-27T10:00:00.000Z");
    expect(neu).toBe(2);
    expect(aufrufe.at(-1)).toEqual([
      ["HSETNX", "k", "fbc", "fb.1.1.x"],
      ["HSETNX", "k", "ip", "203.0.113.7"],
      ["HSETNX", "k", "ua", "UA"],
      ["HSET", "k", "last_at", "2026-10-27T10:00:00.000Z"],
      ["HINCRBY", "k", "hits", 1],
      ["EXPIREAT", "k", 1797116400],
    ]);

    antworten = [1, 1];
    await store.ergaenze("k", { src: "wp" }, 1797116400);
    expect(aufrufe.at(-1)).toEqual([["HSETNX", "k", "src", "wp"], ["EXPIREAT", "k", 1797116400]]);

    antworten = [1, ["fb.1.1.x", null, "203.0.113.7", ""]];
    expect(await store.lies("k")).toEqual({ fbc: "fb.1.1.x", ip: "203.0.113.7" });
    expect(aufrufe.at(-1)).toEqual([["EXISTS", "k"], ["HMGET", "k", "fbc", "fbp", "ip", "ua"]]);
    antworten = [0, [null, null, null, null]];
    expect(await store.lies("k")).toBeNull();

    antworten = [21, 1];
    expect(await store.zaehle("rl", 120)).toBe(21);
    expect(aufrufe.at(-1)).toEqual([["INCR", "rl"], ["EXPIRE", "rl", 120]]);
  });

  test("Node lädt klickspeicher.ts direkt (für das Migrationsskript)", async () => {
    const wurzel = path.resolve(__dirname, "..");
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--input-type=module",
        "-e",
        "const m = await import('./lib/black-november/klickspeicher.ts'); console.log(typeof m.restStore, m.BN_CODE_RE.source)",
      ],
      { cwd: wurzel }
    );
    expect(stdout.trim()).toBe(`function ${BN_CODE_REGEX.source}`);
  });
});

test.describe("GET-Handler direkt (Log)", () => {
  const env = {
    BN_CLICK_STORE: "memory",
    BN_CLICK_USER: "unit",
    BN_CLICK_PASS: "unit pass",
    BN_CLICK_DELETE_AT: "2026-12-10T00:00:00+01:00",
    VERCEL: undefined,
    VERCEL_ENV: undefined,
  };
  const aufruf = (code: string, authorization?: string) =>
    klickGet(
      new Request(`http://localhost/wp-json/sb-bn/v1/click/${code}`, { headers: authorization ? { authorization } : {} }),
      { params: Promise.resolve({ code }) }
    );

  test("Fehltreffer loggt nur „[bn-click] miss <CODE>“, 401 ohne Zugangsdaten im Log", async () => {
    await mitEnv(env, async () => {
      const logs: string[] = [];
      const warn = console.warn;
      console.warn = (...teile: unknown[]) => logs.push(teile.map(String).join(" "));
      try {
        const miss = await aufruf("bn-zz2z", `Basic ${Buffer.from("unit:unitpass").toString("base64")}`);
        expect(miss.status).toBe(200);
        expect(await miss.json()).toEqual({ found: false });

        const ohne = await aufruf("BN-ZZ2Z", `Basic ${Buffer.from("unit:geheim-falsch").toString("base64")}`);
        expect(ohne.status).toBe(401);
      } finally {
        console.warn = warn;
      }
      expect(logs).toEqual(["[bn-click] miss BN-ZZ2Z", "[bn-click] 401 mit falscher Basic Auth"]);
      expect(logs.join("\n")).not.toContain("geheim-falsch");
    });
  });
});
