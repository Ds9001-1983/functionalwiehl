import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { matchHas } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";

/**
 * Betrieb: Sicherheits-Header, noindex nach Host, vercel.json und scripts/smtp-check.mjs.
 * Alles reine HTTP- bzw. Unit-Prüfungen → nur im Projekt desktop.
 */
test.skip(({ isMobile }) => isMobile, "reine HTTP- und Unit-Prüfung, einmal genügt");

const wurzel = path.resolve(__dirname, "..");

const SICHERHEIT: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "x-frame-options": "SAMEORIGIN",
  "content-security-policy": "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
};

test.describe("Sicherheits-Header und noindex (Abnahme-Build)", () => {
  test("auf Seiten, API, Dateien und Weiterleitungen", async ({ request }) => {
    const ziele = [
      { pfad: "/", status: 200 },
      { pfad: "/koerpermasse/", status: 200 },
      { pfad: "/impressum", status: 308 }, // Proxy ergänzt den Slash
      { pfad: "/api/koerpermasse/", status: 405 },
      { pfad: "/robots.txt", status: 200 },
      { pfad: "/gibt-es-nicht/", status: 404 },
    ];
    for (const { pfad, status } of ziele) {
      const res = await request.get(pfad, { maxRedirects: 0 });
      expect(res.status(), pfad).toBe(status);
      const headers = res.headers();
      for (const [name, wert] of Object.entries(SICHERHEIT)) {
        expect(headers[name], `${pfad}: ${name}`).toBe(wert);
      }
      // HSTS setzt Vercel selbst (nur für die jeweilige Subdomain) – kein zweiter Header von uns
      expect(headers["strict-transport-security"], pfad).toBeUndefined();
      // kein Hinweis auf das Framework (poweredByHeader: false)
      expect(headers["x-powered-by"], pfad).toBeUndefined();
    }
  });

  test("ohne NEXT_PUBLIC_ALLOW_INDEXING: X-Robots-Tag noindex auf jedem Host, auch der Hauptdomain", async ({ request }) => {
    test.skip(process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true", "Abnahme-Build läuft mit Indexing-Flag");
    for (const host of [undefined, "functional-wiehl.de", "functionalwiehl.vercel.app"]) {
      for (const pfad of ["/", "/koerpermasse/", "/api/koerpermasse/"]) {
        const res = await request.get(pfad, { maxRedirects: 0, headers: host ? { host } : {} });
        expect(res.headers()["x-robots-tag"], `${host ?? "localhost"}${pfad}`).toBe("noindex, nofollow");
      }
    }
  });
});

test.describe("noindex nach Host (next.config.ts headers())", () => {
  type Regel = Awaited<ReturnType<NonNullable<typeof nextConfig.headers>>>[number];

  async function regelnMit(flag: string | undefined): Promise<Regel[]> {
    const vorher = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    if (flag === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    else process.env.NEXT_PUBLIC_ALLOW_INDEXING = flag;
    try {
      return await nextConfig.headers!();
    } finally {
      if (vorher === undefined) delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
      else process.env.NEXT_PUBLIC_ALLOW_INDEXING = vorher;
    }
  }

  /** Bekommt eine Antwort an diesen Host noindex? Ausgewertet mit Nexts eigenem matchHas. */
  function noindexFuer(regeln: Regel[], host: string | undefined): boolean {
    const req = { headers: host === undefined ? {} : { host } } as unknown as Parameters<typeof matchHas>[0];
    return regeln
      .filter((r) => r.headers.some((h) => h.key === "X-Robots-Tag" && h.value.includes("noindex")))
      .some((r) => r.source === "/:path*" && matchHas(req, {}, r.has, r.missing) !== false);
  }

  const INDEXIERBAR = ["functional-wiehl.de", "www.functional-wiehl.de", "Functional-Wiehl.DE", "functional-wiehl.de:443"];
  const NICHT_INDEXIERBAR = [
    "functionalwiehl.vercel.app",
    "functionalwiehl-git-main-superbrand.vercel.app",
    "localhost:3100",
    "staging.functional-wiehl.de",
    "functional-wiehl.de.angreifer.example",
    "xfunctional-wiehl.de",
    "functional-wiehlxde",
    undefined,
  ];

  test("NEXT_PUBLIC_ALLOW_INDEXING=true: nur Hauptdomain und www ohne noindex", async () => {
    const regeln = await regelnMit("true");
    for (const host of INDEXIERBAR) expect(noindexFuer(regeln, host), host).toBe(false);
    for (const host of NICHT_INDEXIERBAR) expect(noindexFuer(regeln, host), String(host)).toBe(true);
  });

  test("ohne Flag (Preview, lokal) oder mit anderem Wert: überall noindex", async () => {
    for (const flag of [undefined, "", "false", "1"]) {
      const regeln = await regelnMit(flag);
      for (const host of [...INDEXIERBAR, ...NICHT_INDEXIERBAR]) {
        expect(noindexFuer(regeln, host), `${flag}: ${host}`).toBe(true);
      }
    }
  });

  test("Sicherheits-Header gelten unabhängig vom Flag für alle Pfade", async () => {
    for (const flag of [undefined, "true"]) {
      const regel = (await regelnMit(flag)).find((r) => r.headers.some((h) => h.key === "X-Content-Type-Options"));
      expect(regel?.source).toBe("/:path*");
      expect(regel?.has).toBeUndefined();
      expect(regel?.missing).toBeUndefined();
      expect(regel?.headers.map((h) => h.key.toLowerCase()).sort()).toEqual(Object.keys(SICHERHEIT).sort());
    }
  });
});

test("vercel.json: Functions in Frankfurt (fra1)", () => {
  const config = JSON.parse(readFileSync(path.join(wurzel, "vercel.json"), "utf8")) as Record<string, unknown>;
  expect(config.$schema).toBe("https://openapi.vercel.sh/vercel.json");
  expect(config.framework).toBe("nextjs");
  expect(config.regions).toEqual(["fra1"]);
});

test.describe("scripts/smtp-check.mjs", () => {
  type Lauf = { code: number; ausgabe: string };

  /** Startet das Skript mit genau dieser Env (keine Werte aus der Shell oder .env.local) */
  async function smtpCheck(env: Record<string, string>, args: string[] = []): Promise<Lauf> {
    try {
      const { stdout, stderr } = await promisify(execFile)(
        process.execPath,
        ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/smtp-check.mjs", ...args],
        {
          cwd: wurzel,
          env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env },
          timeout: 20_000,
        }
      );
      return { code: 0, ausgabe: stdout + stderr };
    } catch (err) {
      const e = err as { code?: number; stdout?: string; stderr?: string };
      return { code: typeof e.code === "number" ? e.code : -1, ausgabe: `${e.stdout ?? ""}${e.stderr ?? ""}` };
    }
  }

  const PASSWORT = "kein-echtes-passwort-4711";
  const DUMMY = {
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: "9", // discard, lokal geschlossen → sofortiger Verbindungsfehler
    SMTP_USER: "gym@example.invalid",
    SMTP_PASS: PASSWORT,
    SMTP_FROM: "Functional Wiehl Website <gym@example.invalid>",
    FORM_TO: "gym@example.invalid",
    ALERT_TO: "alarm@example.invalid",
  };

  test("ohne SMTP-Env: Exit 1 mit Hinweis auf .env.local", async () => {
    const lauf = await smtpCheck({});
    expect(lauf.code).toBe(1);
    expect(lauf.ausgabe).toContain("Mailversand nicht konfiguriert: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM");
    expect(lauf.ausgabe).toContain(".env.local");
  });

  test("falscher Aufruf: Exit 2", async () => {
    expect((await smtpCheck(DUMMY, ["--an", "keine-adresse"])).code).toBe(2);
    expect((await smtpCheck(DUMMY, ["--an", "a@example.invalid,b@example.invalid"])).code).toBe(2);
    expect((await smtpCheck(DUMMY, ["--unbekannt"])).code).toBe(2);
  });

  test("--nur-env: warnt vor falschem Host, Port, Absender und MAIL_TRANSPORT, ohne zu verbinden", async () => {
    const lauf = await smtpCheck(
      {
        ...DUMMY,
        SMTP_HOST: "mail.functional-wiehl.de",
        SMTP_PORT: "25",
        SMTP_FROM: "Website <info@example.invalid>",
        MAIL_TRANSPORT: "json",
        ALERT_TO: "",
      },
      ["--nur-env"]
    );
    expect(lauf.code).toBe(0);
    expect(lauf.ausgabe).toContain("alfa3102.alfahosting-server.de");
    expect(lauf.ausgabe).toContain("SMTP_PORT=25");
    expect(lauf.ausgabe).toContain("weicht vom Login SMTP_USER ab");
    expect(lauf.ausgabe).toContain("MAIL_TRANSPORT=json");
    expect(lauf.ausgabe).toContain("ALERT_TO fehlt");
    expect(lauf.ausgabe).toContain("Keine Verbindung aufgebaut");
    expect(lauf.ausgabe).not.toContain(PASSWORT);
  });

  test("SMTP nicht erreichbar: Exit 1, nur Fehlercode, kein Passwort", async () => {
    const lauf = await smtpCheck(DUMMY, ["--an", "test@example.invalid"]);
    expect(lauf.code).toBe(1);
    expect(lauf.ausgabe).toMatch(/^SMTP-Fehler: [A-Z0-9/]+$/m);
    expect(lauf.ausgabe).not.toContain("Testmail an");
    expect(lauf.ausgabe).not.toContain(PASSWORT);
  });
});
