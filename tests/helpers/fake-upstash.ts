import http from "node:http";
import type { AddressInfo } from "node:net";

/**
 * Minimaler Nachbau der Upstash-REST-Pipeline (POST /pipeline, Bearer-Token) für den Test
 * von scripts/bn-migrate-clicks.mjs. Kennt nur die Befehle, die Klickspeicher und Skript
 * benutzen, mit Redis-Semantik (HSETNX → 0/1, TTL → -2/-1/Sekunden, abgelaufene Schlüssel weg).
 */
export type FakeUpstash = {
  url: string;
  token: string;
  hashes: Map<string, Map<string, string>>;
  /** Ablauf je Schlüssel in Unix-Sekunden */
  ablauf: Map<string, number>;
  /** alle empfangenen Befehle in Reihenfolge */
  befehle: (string | number)[][];
  stoppe: () => Promise<void>;
};

export async function starteFakeUpstash(token = "fake-upstash-token"): Promise<FakeUpstash> {
  const hashes = new Map<string, Map<string, string>>();
  const ablauf = new Map<string, number>();
  const zaehler = new Map<string, number>();
  const befehle: (string | number)[][] = [];
  const jetzt = () => Math.floor(Date.now() / 1000);

  const lebt = (key: string) => {
    const bis = ablauf.get(key);
    if (bis !== undefined && bis <= jetzt()) {
      hashes.delete(key);
      zaehler.delete(key);
      ablauf.delete(key);
    }
    return hashes.has(key) || zaehler.has(key);
  };

  function fuehreAus([name, key, ...rest]: (string | number)[]): unknown {
    const k = String(key);
    lebt(k);
    switch (String(name).toUpperCase()) {
      case "HSETNX": {
        const hash = hashes.get(k) ?? new Map<string, string>();
        hashes.set(k, hash);
        if (hash.has(String(rest[0]))) return 0;
        hash.set(String(rest[0]), String(rest[1]));
        return 1;
      }
      case "HSET": {
        const hash = hashes.get(k) ?? new Map<string, string>();
        hashes.set(k, hash);
        const neu = hash.has(String(rest[0])) ? 0 : 1;
        hash.set(String(rest[0]), String(rest[1]));
        return neu;
      }
      case "HINCRBY": {
        const hash = hashes.get(k) ?? new Map<string, string>();
        hashes.set(k, hash);
        const wert = Number(hash.get(String(rest[0])) ?? 0) + Number(rest[1]);
        hash.set(String(rest[0]), String(wert));
        return wert;
      }
      case "HMGET":
        return rest.map((feld) => hashes.get(k)?.get(String(feld)) ?? null);
      case "HGETALL":
        return [...(hashes.get(k) ?? new Map<string, string>())].flat();
      case "EXISTS":
        return lebt(k) ? 1 : 0;
      case "DEL": {
        const da = lebt(k);
        hashes.delete(k);
        zaehler.delete(k);
        ablauf.delete(k);
        return da ? 1 : 0;
      }
      case "EXPIREAT":
        if (!lebt(k)) return 0;
        ablauf.set(k, Number(rest[0]));
        return 1;
      case "EXPIRE":
        if (!lebt(k)) return 0;
        ablauf.set(k, jetzt() + Number(rest[0]));
        return 1;
      case "TTL":
        if (!lebt(k)) return -2;
        return ablauf.has(k) ? (ablauf.get(k) as number) - jetzt() : -1;
      case "INCR": {
        const wert = (zaehler.get(k) ?? 0) + 1;
        zaehler.set(k, wert);
        return wert;
      }
      default:
        throw new Error(`ERR unknown command '${String(name)}'`);
    }
  }

  const server = http.createServer((req, res) => {
    const teile: Buffer[] = [];
    req.on("data", (teil: Buffer) => teile.push(teil));
    req.on("end", () => {
      if (req.method !== "POST" || req.url !== "/pipeline") {
        res.writeHead(404).end();
        return;
      }
      if (req.headers.authorization !== `Bearer ${token}`) {
        res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      const liste = JSON.parse(Buffer.concat(teile).toString("utf8")) as (string | number)[][];
      const antwort = liste.map((befehl) => {
        befehle.push(befehl);
        try {
          return { result: fuehreAus(befehl) };
        } catch (err) {
          return { error: (err as Error).message };
        }
      });
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(antwort));
    });
  });
  await new Promise<void>((fertig) => server.listen(0, "127.0.0.1", fertig));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    token,
    hashes,
    ablauf,
    befehle,
    stoppe: () => new Promise((fertig) => server.close(() => fertig())),
  };
}
