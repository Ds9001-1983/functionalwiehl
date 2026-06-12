# Functional Wiehl — Multipage-Redesign (Prototyp)

Neubau von [functional-wiehl.de](https://functional-wiehl.de) als Multipage-Site
(Next.js 16, App Router, Tailwind 4, shadcn/ui) — Umsetzung von Stufe 2 des
Angebots AN-2026-0612-FW auf Basis des Performance-Audits vom 12.06.2026.

## Warum Multipage

Der bisherige One-Pager rankt fast nur für Marken-Suchen. Jede Unterseite
adressiert jetzt ein eigenes Suchcluster: `/training-und-kurse/`,
`/personal-training/`, `/24-7-fitnessstudio/`, `/frauen-ab-50/` (Studie „50
über 50"), `/probetraining/` (Meta-Ads-Landing), dazu `/kursplan/`,
`/gesundheits-check/`, `/ueber-uns/` (Injoy-Rebrand-Story), `/kontakt/`.

## Nicht anfassen ⚠️

- **`lib/cta.ts`** — die WhatsApp-URLs sind byte-genau die der Live-Site;
  die Superchat-Automation des Kunden hängt an exakt diesen Links inkl.
  vorausgefüllter Texte. Absicherung: `tests/cta.spec.ts` gegen
  `tests/fixtures/live-ctas.json` (neu erzeugen: `node scripts/extract-live-ctas.mjs`).
- **Anchor-IDs** in `app/training-und-kurse/page.tsx` — Ziele der 301-Redirect-Map.

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:3000
npx next build       # Production-Build (alle Seiten SSG)
npx playwright test  # CTA-Regression, Consent-Gating, Smoke + axe (mobil/Desktop)
node scripts/check-redirects.mjs http://localhost:3000   # 301-Map prüfen
```

Assets neu von der Live-Site ziehen: `node scripts/fetch-wp-media.mjs`
(WP-Media-API, 108 Items → `assets/raw/`, gitignored) ·
Video re-encodieren: `bash scripts/encode-video.sh` (61 MB → 4,5 MB).

## Tracking & Consent

Eigener schlanker Consent-Banner (Cookie `fw_consent`), **Hard-Gating**: GA4
(`G-H41716E7JE`) und Meta Pixel (`965083147995308`) laden erst nach Opt-in.
Alle Conversion-Events laufen über `lib/tracking.ts` (`whatsapp_click`,
`tel_click`, `calendly_click`, `mail_click`, `checkup_submit`).

## Prototyp-Status

- Global `noindex` (Header + robots.ts), bis die Domain umzieht —
  Freischaltung über Env `NEXT_PUBLIC_ALLOW_INDEXING=true`.
- `/api/checkup` speichert/versendet noch nichts (Art.-9-Gesundheitsdaten —
  erst nach Freigabe der Datenschutzerklärung, siehe `docs/TODO-recht.md`).
- Kursplan statisch; Anbindung an die Studio-App vorbereitet
  (`lib/kursplan-source.ts`, siehe `docs/TODO-kursplan-api.md`).

## Offene Punkte / Docs

| Doc | Inhalt |
|---|---|
| `docs/TODO-recht.md` | Datenschutzerklärung, Impressum-Registergericht, AGB, BFSG, Bildlizenzen |
| `docs/TODO-kursplan-api.md` | Live-Kursplan + freie Plätze aus der Studio-App |
| `docs/TODO-meta-capi.md` | Meta Conversions API + Matomo/GA4-Cutover |
| `docs/TODO-cutover.md` | Domain-Umzug, Redirects scharf schalten, Verzeichnis-Konsolidierung |

Angebot & Audit liegen in `docs/*.pdf`.

---

Made with ❤️ by SUPERBRAND.marketing – Dein Superheld für deine Werbung.
