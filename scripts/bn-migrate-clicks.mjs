#!/usr/bin/env node
/**
 * Platzhalter (P0): Migration der BN-Klickdaten aus WordPress nach Upstash.
 * Paket P2b füllt das Skript (Ablauf in assets/raw/plan-2026-10-27/design-p2.md, Abschnitt 4):
 *   node --env-file=<lokale Env-Datei> scripts/bn-migrate-clicks.mjs --codes <datei> [--wp-ip …] [--dry-run]
 * Redis-Zugriff dann über lib/upstash-rest.ts (ohne Imports, direkt von Node ladbar).
 */
console.error("bn:migrate ist noch nicht umgesetzt (folgt mit Paket P2b). Es wurde nichts gelesen oder geschrieben.");
process.exit(1);
