import { execFile } from "node:child_process";
import { randomInt } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { BN_CODE_ZEICHEN } from "../lib/cta";
import wpFehler from "./fixtures/wp-rest-fehler.json";
import { starteFakeUpstash } from "./helpers/fake-upstash";
import { LOKALER_SERVER, TEST_ENV } from "./helpers/test-env";

/**
 * Klickspeicher-Vertrag mit n8n (GET) und der LP (Beacon-POST) gegen den Prod-Build mit
 * Memory-Store, dazu scripts/bn-migrate-clicks.mjs gegen diesen Server als „WordPress“ und
 * einen Upstash-Nachbau (tests/helpers/fake-upstash.ts).
 * Jeder Test nutzt eigene Codes und eine eigene x-real-ip (Rate-Limit je IP und Minute).
 *
 * Hinweis: Ab dem Löschdatum (BN_CLICK_DELETE_AT, 10.12.2026) speichert der POST nichts mehr –
 * dann werden die Hin-und-Rückweg-Tests rot. Gewollt: Danach werden Route-Handler, Skript
 * und diese Tests entfernt (design-p2.md 4.3).
 */
test.skip(({ isMobile }) => isMobile, "reine HTTP-Prüfung, einmal genügt");

const KLICK = "/wp-json/sb-bn/v1/click";
const ohneRedirect = { maxRedirects: 0 } as const;

const code = () => `BN-${Array.from({ length: 4 }, () => BN_CODE_ZEICHEN[randomInt(BN_CODE_ZEICHEN.length)]).join("")}`;
/** Zufällige Test-IP aus 198.18.0.0/15 (Benchmark-Netz), damit sich Tests das Rate-Limit nicht teilen */
const testIp = () => `198.${18 + randomInt(2)}.${randomInt(256)}.${randomInt(1, 255)}`;
const basic = (benutzer: string, passwort: string) => `Basic ${Buffer.from(`${benutzer}:${passwort}`, "utf8").toString("base64")}`;
const AUTH = basic(TEST_ENV.BN_CLICK_USER, TEST_ENV.BN_CLICK_PASS);

function beacon(daten: Record<string, unknown>) {
  return JSON.stringify({ fbp: "", fbc: "", url: "", cta: "hero", consent: 0, ...daten });
}

async function poste(
  request: APIRequestContext,
  body: string,
  optionen: { ip: string; origin?: string | null; ua?: string; pfad?: string }
) {
  const headers: Record<string, string> = { "Content-Type": "text/plain;charset=UTF-8", "x-real-ip": optionen.ip };
  if (optionen.origin) headers.origin = optionen.origin;
  if (optionen.ua) headers["user-agent"] = optionen.ua;
  return request.post(optionen.pfad ?? KLICK, { ...ohneRedirect, headers, data: body });
}

const hole = (request: APIRequestContext, bnCode: string, auth: string | null = AUTH, slash = "") =>
  request.get(`${KLICK}/${bnCode}${slash}`, { ...ohneRedirect, headers: auth ? { authorization: auth } : {} });

test.describe("GET /wp-json/sb-bn/v1/click/{code} (n8n)", () => {
  test("ohne Auth → 401 rest_forbidden byte-genau wie WP, ohne Redirect, auch mit Slash", async ({ request }) => {
    for (const slash of ["", "/"]) {
      const res = await hole(request, "BN-ZZZZ", null, slash);
      expect(res.status(), slash).toBe(401);
      expect(res.headers()["location"]).toBeUndefined();
      expect(res.headers()["content-type"]).toBe("application/json; charset=UTF-8");
      expect(await res.text()).toBe(wpFehler.rest_forbidden.body);
    }
  });

  test("falsche Auth → 401 (Passwort, Benutzer, kaputter Header, anderes Schema)", async ({ request }) => {
    for (const auth of [
      basic(TEST_ENV.BN_CLICK_USER, "abcd efgh ijkX"),
      basic("admin", TEST_ENV.BN_CLICK_PASS),
      "Basic kaputt!",
      `Bearer ${TEST_ENV.BN_CLICK_PASS}`,
    ]) {
      const res = await hole(request, "BN-ZZZZ", auth);
      expect(res.status(), auth).toBe(401);
      expect(await res.text()).toBe(wpFehler.rest_forbidden.body);
    }
  });

  test("unbekannter Code → 200 {found:false}, nicht gecacht, noindex", async ({ request }) => {
    const res = await hole(request, code());
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ found: false });
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("Passwort mit und ohne Leerzeichen (WP-App-Passwort) wird angenommen", async ({ request }) => {
    for (const passwort of [TEST_ENV.BN_CLICK_PASS, TEST_ENV.BN_CLICK_PASS.replace(/ /g, ""), " abcd  efgh ijkl "]) {
      const res = await hole(request, code(), basic(TEST_ENV.BN_CLICK_USER, passwort));
      expect(res.status(), JSON.stringify(passwort)).toBe(200);
    }
  });

  test("Code passt nicht auf die WP-Route → 404 rest_no_route wörtlich, auch ohne Auth", async ({ request }) => {
    for (const falsch of ["BN-0000", "BN-ABC", "BN-ABCDE", "XX-ABCD"]) {
      for (const auth of [AUTH, null]) {
        const res = await hole(request, falsch, auth);
        expect(res.status(), falsch).toBe(404);
        expect(await res.text()).toBe(wpFehler.rest_no_route.body);
      }
    }
  });

  test("GET auf die reine POST-Route → 404 rest_no_route wie WP", async ({ request }) => {
    for (const pfad of [KLICK, `${KLICK}/`]) {
      const res = await request.get(pfad, ohneRedirect);
      expect(res.status(), pfad).toBe(404);
      expect(await res.text()).toBe(wpFehler.rest_no_route.body);
    }
  });
});

test.describe("POST /wp-json/sb-bn/v1/click (Beacon der LP)", () => {
  test("Hin- und Rückweg: POST → GET liefert genau found, fbc, fbp, ip, ua", async ({ request, baseURL }) => {
    const bn = code();
    const fbc = "fb.1.1761555555555.IwAR0_Ab-c";
    const fbp = "fb.1.1761555555555.1234567890";
    const url = `${baseURL}/black-november/?utm_source=facebook&fbclid=IwAR0_Ab-c`;
    const res = await poste(request, beacon({ code: bn, fbc, fbp, url, cta: "sticky", consent: 1 }), {
      ip: "203.0.113.7",
      origin: new URL(baseURL ?? "").origin,
      ua: "PlaywrightTest/1.0",
    });
    expect(res.status()).toBe(204);
    expect(res.headers()["location"]).toBeUndefined();

    const antwort = await hole(request, bn);
    expect(antwort.status()).toBe(200);
    const json = await antwort.json();
    expect(Object.keys(json).sort()).toEqual(["fbc", "fbp", "found", "ip", "ua"]);
    expect(json).toEqual({ found: true, fbc, fbp, ip: "203.0.113.7", ua: "PlaywrightTest/1.0" });

    // n8n schickt den Code in Großbuchstaben, WP hätte aber auch klein und mit Slash geantwortet
    expect(await (await hole(request, bn.toLowerCase(), AUTH, "/")).json()).toEqual(json);
  });

  test("POST mit Slash am Ende und ohne Origin (curl, alte Clients) → 204 ohne Redirect", async ({ request }) => {
    const bn = code();
    const res = await poste(request, beacon({ code: bn }), { ip: testIp(), pfad: `${KLICK}/` });
    expect(res.status()).toBe(204);
    expect(res.headers()["location"]).toBeUndefined();
    expect((await (await hole(request, bn)).json()).found).toBe(true);
  });

  test("nur vorhandene Felder: ohne Einwilligung kein fbp und ohne fbclid kein fbc", async ({ request }) => {
    const bn = code();
    const ip = testIp();
    await poste(request, beacon({ code: bn }), { ip, ua: "PlaywrightTest/1.0" });
    expect(await (await hole(request, bn)).json()).toEqual({ found: true, ip, ua: "PlaywrightTest/1.0" });
  });

  test("Felder werden nur ergänzt: zweiter Klick überschreibt fbc nicht, füllt fehlendes fbp", async ({ request }) => {
    const bn = code();
    const ip = testIp();
    const fbc = "fb.1.1761555555555.erster";
    await poste(request, beacon({ code: bn, fbc }), { ip, ua: "Erster/1.0" });
    await poste(request, beacon({ code: bn, fbc: "fb.1.1761555555555.zweiter", fbp: "fb.1.1761555555555.42", consent: 1 }), {
      ip: testIp(),
      ua: "Zweiter/1.0",
    });
    expect(await (await hole(request, bn)).json()).toEqual({ found: true, fbc, fbp: "fb.1.1761555555555.42", ip, ua: "Erster/1.0" });
  });

  test("Felder in falschem Format werden nicht gespeichert", async ({ request }) => {
    const bn = code();
    const ip = testIp();
    const res = await poste(request, beacon({ code: bn, fbc: "<script>", fbp: "fb.1.x.y" }), { ip, ua: "Format/1.0" });
    expect(res.status()).toBe(204);
    expect(await (await hole(request, bn)).json()).toEqual({ found: true, ip, ua: "Format/1.0" });
  });

  test("Ablehnungen: ungültiger Code 400, kaputtes JSON 400, fremder Origin 403, Origin null 403, 5 KB 413", async ({
    request,
  }) => {
    const ip = testIp();
    expect((await poste(request, beacon({ code: "BN-AB1C" }), { ip })).status()).toBe(400);
    expect((await poste(request, beacon({ code: "bn-ab2c" }), { ip })).status()).toBe(400);
    expect((await poste(request, "{kein json", { ip })).status()).toBe(400);

    const fremd = code();
    expect((await poste(request, beacon({ code: fremd }), { ip, origin: "https://boese.example" })).status()).toBe(403);
    expect((await poste(request, beacon({ code: fremd }), { ip, origin: "null" })).status()).toBe(403);
    expect(await (await hole(request, fremd)).json()).toEqual({ found: false });

    const gross = beacon({ code: code(), url: `https://functional-wiehl.de/?x=${"a".repeat(5 * 1024)}` });
    expect((await poste(request, gross, { ip })).status()).toBe(413);
  });

  test("Rate-Limit: die 21. Anfrage je IP und Minute → 429, andere IP unberührt", async ({ request }) => {
    // Nicht über eine Minutengrenze laufen, sonst verteilen sich die Anfragen auf zwei Fenster
    const sekunde = new Date().getSeconds();
    if (sekunde > 50) await new Promise((r) => setTimeout(r, (61 - sekunde) * 1000));
    const ip = testIp();
    const status: number[] = [];
    for (let i = 0; i < 21; i++) status.push((await poste(request, beacon({ code: code() }), { ip })).status());
    expect(status.slice(0, 20)).toEqual(Array(20).fill(204));
    expect(status[20]).toBe(429);
    expect((await poste(request, beacon({ code: code() }), { ip: testIp() })).status()).toBe(204);
  });
});

test.describe("Migration scripts/bn-migrate-clicks.mjs", () => {
  test.skip(!LOKALER_SERVER, "braucht den lokalen Prod-Build als Quelle");

  const wurzel = path.resolve(__dirname, "..");

  type Lauf = { exit: number; stdout: string; stderr: string };
  function migriere(args: string[], env: Record<string, string>): Promise<Lauf> {
    return new Promise((fertig) => {
      execFile(
        process.execPath,
        ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/bn-migrate-clicks.mjs", "--pause", "0", ...args],
        // bewusst nur diese Env, nie echte KV-/BN-Werte aus der Shell
        { cwd: wurzel, env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", ...env } },
        (err, stdout, stderr) => fertig({ exit: err ? Number((err as { code?: number }).code ?? 1) : 0, stdout, stderr })
      );
    });
  }
  const zeile = (lauf: Lauf, art: string) => lauf.stdout.match(new RegExp(`^  ${art}: (\\d+)(?: \\((.*)\\))?$`, "m"));
  const anzahl = (lauf: Lauf, art: string) => Number(zeile(lauf, art)?.[1] ?? NaN);
  const codesVon = (lauf: Lauf, art: string) => zeile(lauf, art)?.[2]?.split(", ") ?? [];

  test("schreibt idempotent per HSETNX, verkürzt keine Laufzeit und gibt keine Klickdaten aus", async ({
    request,
    baseURL,
  }) => {
    const [a, b, c] = [code(), code(), code()];
    const ipA = testIp();
    const fbc = "fb.1.1761555555555.migration";
    await poste(request, beacon({ code: a, fbc, fbp: "fb.1.1761555555555.77", consent: 1 }), { ip: ipA, ua: "MigrationA/1.0" });
    await poste(request, beacon({ code: b }), { ip: testIp(), ua: "MigrationB/1.0" });

    const ordner = await mkdtemp(path.join(tmpdir(), "bn-migrate-"));
    const fake = await starteFakeUpstash();
    try {
      // A mit Klickzeit vor 50 Tagen (→ Ablauf Klick + 60 Tage), B ohne Zeit, C unbekannt, dazu Müll
      const klickA = Date.now() - 50 * 86_400_000;
      const liste = path.join(ordner, "codes.csv");
      await writeFile(
        liste,
        [
          '"id";"wa_hash";"code";"created_at"',
          `"1";"x";"${a}";"${new Date(klickA).toISOString()}"`,
          `"2";"y";"${b.toLowerCase()}";""`,
          `"3";"z";"${c}";""`,
          `"4";"z";"${a}";""`,
          `"5";"z";"BN-0000";""`,
        ].join("\n")
      );
      // B gibt es im Ziel schon mit anderer IP und langer Laufzeit (z. B. Klick über die neue LP)
      const keyB = `bn:migtest:click:${b}`;
      const ablaufB = Math.floor(Date.parse(TEST_ENV.BN_CLICK_DELETE_AT) / 1000);
      fake.hashes.set(keyB, new Map([["ip", "192.0.2.99"]]));
      fake.ablauf.set(keyB, ablaufB);

      const env = {
        KV_REST_API_URL: fake.url,
        KV_REST_API_TOKEN: fake.token,
        BN_CLICK_USER: TEST_ENV.BN_CLICK_USER,
        BN_CLICK_PASS: TEST_ENV.BN_CLICK_PASS,
        BN_CLICK_DELETE_AT: TEST_ENV.BN_CLICK_DELETE_AT,
      };
      const args = ["--base-url", baseURL ?? "", "--codes", liste, "--prefix", "bn:migtest"];

      const erster = await migriere(args, env);
      expect(erster.exit, erster.stderr + erster.stdout).toBe(0);
      expect(codesVon(erster, "gefunden")).toEqual([a, b]);
      expect(codesVon(erster, "neu geschrieben")).toEqual([a]);
      expect(codesVon(erster, "ergänzt")).toEqual([b]);
      expect(codesVon(erster, "nicht gefunden")).toEqual([c]);
      expect(codesVon(erster, "ungültig \\(übersprungen\\)")).toEqual(["BN-0000"]);
      expect(anzahl(erster, "Fehler")).toBe(0);
      for (const geheim of [ipA, "MigrationA", "MigrationB", fbc, "fb.1.1761555555555.77", "192.0.2.99"]) {
        expect(erster.stdout + erster.stderr, geheim).not.toContain(geheim);
      }

      const hashA = Object.fromEntries(fake.hashes.get(`bn:migtest:click:${a}`) ?? []);
      expect(hashA).toMatchObject({ fbc, fbp: "fb.1.1761555555555.77", ip: ipA, ua: "MigrationA/1.0", src: "wp" });
      expect(hashA.first_at).toBe(new Date(klickA).toISOString());
      expect(Date.parse(hashA.migrated_at)).toBeGreaterThan(Date.now() - 60_000);
      expect(hashA.hits).toBeUndefined(); // Migration ist kein Klick
      expect(fake.ablauf.get(`bn:migtest:click:${a}`)).toBe(Math.floor((klickA + 60 * 86_400_000) / 1000));

      const hashB = Object.fromEntries(fake.hashes.get(keyB) ?? []);
      expect(hashB).toMatchObject({ ip: "192.0.2.99", ua: "MigrationB/1.0", src: "wp" }); // ip nicht überschrieben
      expect(fake.ablauf.get(keyB)).toBe(ablaufB); // längere Laufzeit bleibt

      const zweiter = await migriere(args, env);
      expect(zweiter.exit).toBe(0);
      expect(anzahl(zweiter, "neu geschrieben")).toBe(0);
      expect(anzahl(zweiter, "ergänzt")).toBe(0);
      expect(codesVon(zweiter, "schon vorhanden")).toEqual([a, b]);

      const vergleich = await migriere([...args, "--check"], env);
      expect(vergleich.exit).toBe(0);
      expect(codesVon(vergleich, "gleich")).toEqual([a]);
      expect(codesVon(vergleich, "abweichend")).toEqual([b]);
      expect(codesVon(vergleich, "nicht in WP")).toEqual([c]);

      const loeschen = await migriere(["--prefix", "bn:migtest", "--delete", a, "--delete", c], env);
      expect(loeschen.exit).toBe(0);
      expect(codesVon(loeschen, "gelöscht")).toEqual([a]);
      expect(codesVon(loeschen, "nicht vorhanden")).toEqual([c]);
      expect(fake.hashes.has(`bn:migtest:click:${a}`)).toBe(false);
    } finally {
      await fake.stoppe();
      await rm(ordner, { recursive: true, force: true });
    }
  });

  test("--dry-run schreibt nichts, --wp-ip löst den Host fest auf die IP auf, falsche Auth bricht ab", async ({
    request,
    baseURL,
  }) => {
    const bn = code();
    await poste(request, beacon({ code: bn }), { ip: testIp() });
    const ordner = await mkdtemp(path.join(tmpdir(), "bn-migrate-"));
    const fake = await starteFakeUpstash();
    try {
      const liste = path.join(ordner, "codes.txt");
      await writeFile(liste, `Codes aus der WP-Datenbank:\n${bn}\n`);
      const env = {
        KV_REST_API_URL: fake.url,
        KV_REST_API_TOKEN: fake.token,
        BN_CLICK_USER: TEST_ENV.BN_CLICK_USER,
        BN_CLICK_PASS: TEST_ENV.BN_CLICK_PASS,
      };
      // .invalid löst im DNS nie auf – ein Treffer beweist, dass der eigene lookup greift
      const quelle = new URL(baseURL ?? "");
      const ueberIp = `http://bn-migration.invalid:${quelle.port}`;
      const probe = await migriere(["--base-url", ueberIp, "--wp-ip", "127.0.0.1", "--codes", liste, "--dry-run"], env);
      expect(probe.exit, probe.stderr + probe.stdout).toBe(0);
      expect(probe.stdout).toContain("Probelauf");
      expect(codesVon(probe, "gefunden")).toEqual([bn]);
      expect(fake.befehle).toHaveLength(0);

      const falsch = await migriere(["--base-url", quelle.origin, "--codes", liste], { ...env, BN_CLICK_PASS: "falsch" });
      expect(falsch.exit).toBe(2);
      expect(falsch.stderr).toContain("401");
      expect(fake.befehle).toHaveLength(0);

      const ohneRedis = await migriere(["--base-url", quelle.origin, "--codes", liste], { ...env, KV_REST_API_URL: "" });
      expect(ohneRedis.exit).toBe(2);
      expect(ohneRedis.stderr).toContain("KV_REST_API_URL");
    } finally {
      await fake.stoppe();
      await rm(ordner, { recursive: true, force: true });
    }
  });
});
