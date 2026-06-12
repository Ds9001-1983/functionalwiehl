#!/usr/bin/env node
/**
 * Lädt alle Medien der Bestands-Site functional-wiehl.de über die offene
 * WP-REST-API nach assets/raw/ und schreibt ein Manifest (original → sanitisiert,
 * Alt-Texte, Mime-Types). Zusätzlich werden die et-cache-CSS-Dateien der
 * Startseite nach url()-Referenzen durchsucht (Divi lädt Sektions-Hintergründe
 * ausschließlich über CSS — die fehlen in der Media-API-Sicht sonst nicht,
 * aber die Zuordnung "wird wo benutzt" geht verloren).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://functional-wiehl.de";
const OUT = path.resolve(import.meta.dirname, "../assets/raw");

function sanitize(name) {
  // Emojis, "×" u. ä. brechen statische Imports und Build-Tooling
  return decodeURIComponent(name)
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { data: await res.json(), totalPages: Number(res.headers.get("x-wp-totalpages") || 1) };
}

async function download(url, dest) {
  if (existsSync(dest)) return "skip";
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  FEHLER ${res.status}: ${url}`);
    return "error";
  }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return "ok";
}

await mkdir(OUT, { recursive: true });

// 1) Media-API paginieren
const manifest = [];
let page = 1;
let totalPages = 1;
do {
  const { data, totalPages: tp } = await fetchJson(
    `${BASE}/wp-json/wp/v2/media?per_page=100&page=${page}`
  );
  totalPages = tp;
  for (const item of data) {
    const src = item.source_url;
    const orig = src.split("/").pop();
    const file = sanitize(orig);
    const dest = path.join(OUT, file);
    const status = await download(encodeURI(decodeURI(src)), dest);
    manifest.push({
      id: item.id,
      original: orig,
      file,
      alt: item.alt_text || null,
      title: item.title?.rendered || null,
      mime: item.mime_type,
      source_url: src,
      status,
    });
    console.log(`${status === "ok" ? "✓" : status === "skip" ? "·" : "✗"} ${file}`);
  }
  page++;
} while (page <= totalPages);

// 2) et-cache-CSS der Startseite nach url()-Referenzen durchsuchen
const html = await (await fetch(BASE)).text();
const cssUrls = [...html.matchAll(/href="([^"]*et-cache[^"]*\.css[^"]*)"/g)].map((m) => m[1]);
const cssRefs = new Set();
for (const cssUrl of cssUrls) {
  try {
    const css = await (await fetch(new URL(cssUrl, BASE))).text();
    for (const m of css.matchAll(/url\(["']?(https?:\/\/functional-wiehl\.de[^"')]+)["']?\)/g)) {
      cssRefs.add(m[1]);
    }
  } catch (e) {
    console.warn(`CSS nicht ladbar: ${cssUrl} (${e.message})`);
  }
}
const cssBackgrounds = [];
for (const url of cssRefs) {
  if (!/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url)) continue;
  const file = sanitize(url.split("/").pop().split("?")[0]);
  const status = await download(url, path.join(OUT, file));
  cssBackgrounds.push({ url, file, status });
  console.log(`CSS-BG ${status}: ${file}`);
}

await writeFile(
  path.join(OUT, "manifest.json"),
  JSON.stringify({ stand: new Date().toISOString(), media: manifest, cssBackgrounds }, null, 2)
);
console.log(
  `\nFERTIG: ${manifest.length} Media-Items, ${cssBackgrounds.length} CSS-Hintergründe → assets/raw/`
);
