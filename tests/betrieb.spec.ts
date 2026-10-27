import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { matchHas } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";

/**
 * Betrieb: Sicherheits-Header, noindex nach Host und vercel.json.
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
