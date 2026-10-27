import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { clientIp, gleicherOrigin, ipSchluessel } from "../lib/request";
import { UpstashFehler, upstashAusEnv, upstashPipeline } from "../lib/upstash-rest";

/**
 * Unit-Tests der P0-Helfer (ohne Browser und ohne Server):
 * lib/upstash-rest.ts (Pipeline-Vertrag, Env-Auswahl, von Node direkt ladbar) und
 * lib/request.ts (IP, HMAC-Schlüssel, Origin-Prüfung).
 */
test.skip(({ isMobile }) => isMobile, "Unit-Tests, einmal genügt");

type Aufruf = { url: string; init: RequestInit };

function fakeFetch(antwort: unknown, status = 200) {
  const aufrufe: Aufruf[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    aufrufe.push({ url, init });
    return new Response(JSON.stringify(antwort), { status });
  }) as unknown as typeof fetch;
  return { impl, aufrufe };
}

test.describe("lib/upstash-rest.ts", () => {
  test("schickt alle Befehle als eine Pipeline mit Bearer-Token", async () => {
    const { impl, aufrufe } = fakeFetch([{ result: 1 }, { result: "OK" }]);
    const pipeline = upstashPipeline({ url: "https://beispiel.upstash.io/", token: "tkn", fetchImpl: impl });
    const ergebnis = await pipeline([
      ["HSETNX", "bn:test:click:BN-AB2C", "fbc", "fb.1.1.x"],
      ["EXPIREAT", "bn:test:click:BN-AB2C", 1797116400],
    ]);
    expect(ergebnis).toEqual([1, "OK"]);
    expect(aufrufe).toHaveLength(1);
    expect(aufrufe[0].url).toBe("https://beispiel.upstash.io/pipeline");
    expect(aufrufe[0].init.method).toBe("POST");
    expect((aufrufe[0].init.headers as Record<string, string>).Authorization).toBe("Bearer tkn");
    expect(JSON.parse(aufrufe[0].init.body as string)).toEqual([
      ["HSETNX", "bn:test:click:BN-AB2C", "fbc", "fb.1.1.x"],
      ["EXPIREAT", "bn:test:click:BN-AB2C", 1797116400],
    ]);
  });

  test("leere Pipeline ruft Upstash gar nicht auf", async () => {
    const { impl, aufrufe } = fakeFetch([]);
    expect(await upstashPipeline({ url: "https://x", token: "t", fetchImpl: impl })([])).toEqual([]);
    expect(aufrufe).toHaveLength(0);
  });

  test("Fehler: Befehlsfehler, HTTP-Status und falsche Antwortlänge werfen UpstashFehler", async () => {
    const befehl = [["INCR", "rl:x"]] as const;
    const mitFehler = upstashPipeline({ url: "https://x", token: "t", fetchImpl: fakeFetch([{ error: "ERR boom" }]).impl });
    await expect(mitFehler(befehl)).rejects.toThrow(UpstashFehler);
    await expect(mitFehler(befehl)).rejects.toThrow(/INCR/);

    const http = upstashPipeline({ url: "https://x", token: "t", fetchImpl: fakeFetch({}, 401).impl });
    await expect(http(befehl)).rejects.toMatchObject({ name: "UpstashFehler", status: 401 });

    const laenge = upstashPipeline({ url: "https://x", token: "t", fetchImpl: fakeFetch([]).impl });
    await expect(laenge(befehl)).rejects.toThrow(/unerwartete/);
  });

  test("Env: leere KV-Werte gelten als nicht konfiguriert („||“ statt „??“)", () => {
    expect(upstashAusEnv({ KV_REST_API_URL: "", KV_REST_API_TOKEN: "" })).toBeNull();
    expect(upstashAusEnv({})).toBeNull();
    expect(upstashAusEnv({ KV_REST_API_URL: "https://x", KV_REST_API_TOKEN: "" })).toBeNull();
    expect(upstashAusEnv({ KV_REST_API_URL: "https://x", KV_REST_API_TOKEN: "t" })).toBeInstanceOf(Function);
    expect(
      upstashAusEnv({ KV_REST_API_URL: "", UPSTASH_REDIS_REST_URL: "https://y", UPSTASH_REDIS_REST_TOKEN: "t" })
    ).toBeInstanceOf(Function);
  });

  test("Node lädt das Modul direkt (ohne Imports, nur entfernbare TS-Syntax)", async () => {
    const wurzel = path.resolve(__dirname, "..");
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--input-type=module",
        "-e",
        "const m = await import('./lib/upstash-rest.ts'); console.log(Object.keys(m).sort().join(','))",
      ],
      { cwd: wurzel }
    );
    expect(stdout.trim()).toBe("UpstashFehler,upstashAusEnv,upstashPipeline");
  });
});

test.describe("lib/request.ts", () => {
  test("clientIp: erst x-real-ip, dann erster x-forwarded-for-Eintrag", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Headers({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers())).toBe("");
  });

  test("ipSchluessel: HMAC mit RATE_LIMIT_SECRET, kein ungesalzener Hash", () => {
    const vorher = process.env.RATE_LIMIT_SECRET;
    try {
      process.env.RATE_LIMIT_SECRET = "geheim-a";
      const a = ipSchluessel("203.0.113.7");
      expect(a).toMatch(/^[0-9a-f]{32}$/);
      expect(ipSchluessel("203.0.113.7")).toBe(a);
      expect(ipSchluessel("203.0.113.8")).not.toBe(a);
      expect(createHash("sha256").update("203.0.113.7").digest("hex")).not.toContain(a);
      process.env.RATE_LIMIT_SECRET = "geheim-b";
      expect(ipSchluessel("203.0.113.7")).not.toBe(a);
    } finally {
      if (vorher === undefined) delete process.env.RATE_LIMIT_SECRET;
      else process.env.RATE_LIMIT_SECRET = vorher;
    }
  });

  test("gleicherOrigin: nur gleicher Host, null nie, fehlender Origin nur auf Wunsch", () => {
    const h = (init: Record<string, string>) => new Headers(init);
    expect(gleicherOrigin(h({ host: "functional-wiehl.de", origin: "https://functional-wiehl.de" }))).toBe(true);
    expect(gleicherOrigin(h({ host: "localhost:3100", origin: "http://localhost:3100" }))).toBe(true);
    expect(gleicherOrigin(h({ host: "functional-wiehl.de", origin: "https://boese.example" }))).toBe(false);
    expect(gleicherOrigin(h({ host: "functional-wiehl.de", origin: "null" }))).toBe(false);
    expect(gleicherOrigin(h({ host: "functional-wiehl.de" }))).toBe(false);
    expect(gleicherOrigin(h({ host: "functional-wiehl.de" }), { ohneOriginErlaubt: true })).toBe(true);
    expect(
      gleicherOrigin(h({ host: "functional-wiehl.de", origin: "https://www.functional-wiehl.de" }), {
        weitereHosts: ["www.functional-wiehl.de"],
      })
    ).toBe(true);
  });
});
