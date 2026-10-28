# Functional Wiehl — Website

Neubau von [functional-wiehl.de](https://functional-wiehl.de) mit Next.js 16 (App Router,
Turbopack), Tailwind 4 und shadcn/base-ui. Löst das WordPress/Divi bei Alfahosting ab
(PHP2Shell, Audit vom 23.10.2026). Übernommen sind **nur die aktuellen Live-Inhalte vom
27.10.2026**: schlank wie live, ein One-Pager plus Aktionsseite, Körpermaße und Rechtliches.

## Struktur

| Pfad | Inhalt | Ort |
|---|---|---|
| `/` | One-Pager in Live-Reihenfolge: Hero, Black-November-Teaser `#black-november-section`, `#leistung`, `#aktuelles` (Instagram-Fallback, 3 Posts), `#preise` (inkl. Einmalig & Extras), `#checkup` (Check-up-Quiz, 27 Schritte), Galerie mit Körpermaße-Teaser, `#kontakt` | `app/(site)/page.tsx` |
| `/black-november/` | Landingpage BN26 (bis 09.11.2026), noindex, eigenes Template ohne Website-Rahmen | `app/black-november/` |
| `/koerpermasse/` | Körpermaße Digital, Versand per Mail | `app/(site)/koerpermasse/` |
| `/impressum/`, `/datenschutz/`, `/barrierefreiheit/` | Rechtstexte (Entwurf, Freigabe durch Conny ist das Gate) | `app/(site)/…`, Stammdaten in `content/recht.ts` |

- **Layouts:** Das Root-Layout (`app/layout.tsx`) hat Fonts, Consent-Provider, Banner und die
  Facebook-Domainverifizierung. Header, Footer, Sticky-Leiste, FAB, A11y-Werkzeuge und
  `AnalyticsScripts` liegen nur in `app/(site)/layout.tsx`, also nicht auf der LP.
- **Alte URLs** (24 WP-Seiten, Feeds, Autor-Archiv, `wp-sitemap*.xml`, die 9 entfallenen
  Redesign-Unterseiten, das alte BN-OG-Bild) leiten per 308 auf Startseiten-Anker:
  `content/redirects.ts`. `wp-login.php`, `xmlrpc.php`, `wp-admin` und übrige `wp-content`-Pfade
  liefern 404.
- **Trailing Slash wie WordPress:** `proxy.ts` ergänzt den Slash per 308 mit unveränderter Query
  (UTM, fbclid). `/wp-json`, `/api`, `_next` und Dateien werden nie umgeleitet.
- **Inhalte** liegen in `content/*.ts` (Preise, Leistungen, Check-up, Körpermaße, Black November,
  Recht, Redirects), Kontakt- und CTA-Ziele in `lib/cta.ts`.

### Endpunkte

| Methode und Pfad | Zweck |
|---|---|
| `POST /api/checkup/` | Check-up → Mail (HTML und Text) an `FORM_TO` (Prüfung, Rate-Limit, Honeypot `fw_hp`) |
| `POST /api/koerpermasse/` | Körpermaße → Mail (HTML und Text) an `FORM_TO` |
| `POST /wp-json/sb-bn/v1/click` | Klickspeicher: Beacon der LP (Code, fbc, fbp, URL, CTA, Einwilligung; IP und UA ergänzt der Server) |
| `GET /wp-json/sb-bn/v1/click/{code}` | Klickspeicher: Abruf durch n8n (Basic Auth), Antworten byte-genau wie WordPress |
| `GET/POST /api/test/mails/` | nur Abnahme: Testsenke des JSON-Mailtransports, sonst 404 |

## Nicht anfassen ⚠️

- **`lib/cta.ts`:** Die WhatsApp-URLs sind **byte-genau** die der Live-Seite vom 27.10.2026. Die
  Superchat-Automation des Kunden startet nur bei exakt diesen vorausgefüllten Texten. Nur diese
  Konstanten verwenden, nie per `encodeURIComponent` nachbauen. Absicherung:
  `tests/cta.spec.ts` gegen `tests/fixtures/live-ctas.json`.
- **Fixtures sind eingefroren** (`tests/fixtures/live-ctas.json`, `live-checkup.json`,
  `wp-rest-fehler.json`). Sie stammen aus dem Archiv `assets/raw/live-2026-10-27/` (gitignored,
  nur im Hauptrepo). Nach dem DNS-Wechsel nie gegen live neu erzeugen, die Skripte brechen bei
  `/_next/` ab.
- **`/wp-json/sb-bn/v1/click[/{code}]`:** Pfad und Antworten sind der Vertrag mit dem n8n-Workflow
  eHhcCrI24Jae2BQG. Kein Redirect, keine Bot-Challenge, keine Umbenennung.

## Black November (BN26)

- **LP:** Inhalt 1:1 nach live (`content/black-november.ts`, Regeln in `app/black-november/bn.css`).
  Die Runtime (`lib/black-november/runtime.ts`, Port von Code-Snippet #6) läuft als Inline-Script
  vor der Hydration: Aktionscode je Tab (`sessionStorage bn_code`), WhatsApp-Link aus Präfix +
  Code, Pixel **ohne Einwilligung** (Entscheidung Dennis) mit ViewContent, `BN_Engaged` und
  `Contact` (eventID `bnc-<Code>`), Beacon an den Klickspeicher.
- **Klickspeicher:** Upstash Redis über die REST-Pipeline ohne SDK (`lib/upstash-rest.ts`,
  `lib/black-november/klickspeicher*.ts`). Felder werden nur ergänzt, Ablauf 60 Tage, spätestens
  zum Löschdatum `BN_CLICK_DELETE_AT` (10.12.2026). Danach speichert der POST nichts mehr und
  die Hin-und-Rückweg-Tests werden absichtlich rot, das erzwingt den Rückbau.
- **Migration der WP-Klicks:** `npm run bn:migrate -- --env-file <datei> --codes <liste>
  [--wp-ip 109.237.132.28] [--dry-run|--check]`, Läufe 1–3 und curl-Prüfung in
  `docs/TODO-meta-capi.md`.
- **Rückbau:** Ab 10.11.2026 wird ein Datumstest in `tests/startseite.spec.ts` rot, solange der
  Teaser auf der Startseite steht (Anleitung in `components/sections/black-november-teaser.tsx`).

## Tracking & Consent

- Eigener Banner (Cookie `fw_consent`), Opt-in ohne vorausgewählte Häkchen, Widerruf löscht
  `_fbp`, `_fbc`, `_ga*` und lädt neu. **Hard-Gating:** Vor der Einwilligung geht auf der Website
  kein Byte an Google oder Meta.
- GA4 `G-H41716E7JE` nur mit Statistik-Einwilligung (Consent Mode v2, ad_* denied, ohne Signals),
  auf der LP nie. Meta-Pixel `965083147995308` auf der Website nur mit Marketing-Einwilligung
  (`lib/meta-pixel.ts`, startet höchstens einmal je Dokument).
- Alle Events laufen über `lib/tracking.ts`. Website-Klicks werden Custom Events `FW_*`;
  `Contact` gibt es nur auf der LP, `Lead` nur serverseitig aus n8n. Check-up und Körpermaße
  melden nichts an Meta. Details: `docs/TODO-meta-capi.md`.

## Formulare

Check-up und Körpermaße gehen als Mail mit HTML- und Text-Fassung über Alfahosting-SMTP (Postfach
gym@) an `FORM_TO` (`lib/mailer.ts`, nodemailer; Gestaltung in `lib/mail-html.ts`, ohne Bilder und
externe Inhalte). Der Check-up ist ein Klick-Funnel: Eine Einfachauswahl springt beim Klick weiter,
Mehrfachauswahl und Gewicht brauchen „Weiter“. Die Website speichert nichts; Gesundheitsdaten werden
nie geloggt, nur feste Codes wie `[form:checkup] versand`. Beide Formulare haben eine eigene
Art.-9-Einwilligung, Erfolg meldet der Client nur bei HTTP 200.

## Entwicklung und Abnahme

```bash
npm ci
npm run dev                          # http://localhost:3000
PW_PORT=3100 npm run abnahme         # Pflicht vor jedem Push: typecheck, lint, build, Playwright
npx playwright test tests/cta.spec.ts   # einzelne Specs (baut und startet selbst)
npm run check:redirects -- http://localhost:3000   # Redirect-Map gegen einen laufenden Server
npm run check:smtp [-- --nur-env | -- --an <adresse>]   # SMTP-Login bzw. Testmail (.env.local)
```

- `npm run abnahme` = `next typegen && tsc --noEmit`, `eslint`, `next build` und Playwright gegen
  den Prod-Build (`next start` auf `PW_PORT`, Standard 3100; je Worktree ein eigener Port).
  Projekte `mobile` (iPhone 14, WebKit) und `desktop` (Chrome).
- Die Tests setzen ihre Env selbst (`tests/helpers/test-env.ts`): Memory-Store für den
  Klickspeicher, JSON-Mailtransport, Testpostfach `abnahme@example.invalid`. Es gehen nie echte
  Mails raus. Jeder Test, der `/black-november/` öffnet, fängt die Tracker mit
  `trackerAbfangen()` aus `tests/helpers/meta-recorder.ts` ab, sonst gingen echte Events an den
  Pixel.
- `npm run test:live` (`@live`, gegen die Live-Domain) hat noch keine Tests.
- **CI:** Es gibt kein `.github/workflows`. Geprüft wird lokal vor jedem Push (SUPERBRAND-Regel).
- Assets: `node scripts/fetch-wp-media.mjs` (WP-Media-API nach `assets/raw/`, nur solange WP
  läuft). Das Studio-Video ist seit 27.10.2026 durch das Standbild `public/img/studio-luftbild.jpg`
  ersetzt (es blendete „14 Tage KOSTENLOS“ ein).

## Env-Variablen

Namen und Bedeutung stehen in `.env.example` (nie Werte ins Repo). Welche Werte Production und
Preview bekommen, steht im Runbook `docs/TODO-cutover.md`.

| Bereich | Variablen |
|---|---|
| Build | `NEXT_PUBLIC_ALLOW_INDEXING` (nur Production `true`, sonst noindex über robots.txt und X-Robots-Tag), `NEXT_PUBLIC_SITE_URL` |
| Upstash | `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Rückfall: `UPSTASH_REDIS_REST_URL`/`_TOKEN`) |
| Klickspeicher | `BN_CLICK_USER`, `BN_CLICK_PASS`, `BN_CLICK_DELETE_AT` |
| Rate-Limit | `RATE_LIMIT_SECRET`, optional `FORM_RATE_LIMIT` (Standard 5 je 10 min) |
| Mail | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `FORM_TO`, `ALERT_TO` |
| nur Tests (auf Vercel gesperrt) | `BN_CLICK_STORE=memory`, `MAIL_TRANSPORT=json` |
| später (Instagram-Paket) | `CRON_SECRET`, `INSTAGRAM_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `IG_BLOB_HOST` |

## Betrieb und Umschaltung

- Vercel, Funktionen in `fra1` (`vercel.json`). Sicherheits-Header und noindex nach Host in
  `next.config.ts`; HSTS setzt Vercel selbst.
- Hauptdomain `functional-wiehl.de` ohne www, `www` leitet per 308.
- **Runbook für Preview-Prüfung, DNS-Wechsel, Migrationsläufe und WP-Sperre:
  `docs/TODO-cutover.md`.**

## Offene Punkte / Docs

| Doc | Inhalt |
|---|---|
| `docs/TODO-cutover.md` | Runbook Umschaltung: Env, Preview-Prüfungen, DNS, Migration, WP-Sperre, Nachkontrolle |
| `docs/TODO-meta-capi.md` | Event-Zuordnung, n8n-Lead, Klickspeicher, curl-Prüfung, Migrationsläufe |
| `docs/TODO-recht.md` | Belege, offene Freigaben durch Conny, Abgleich DSE mit der Technik |

Nach dem Go-live: Instagram-API statt Fallback (Meta-App, Cron, Vercel Blob), Teaser-Rückbau am
10.11., Rückbau des Klickspeichers nach dem 10.12. Angebot und Audit liegen in `docs/*.pdf`.

---

Made with ❤️ by SUPERBRAND.marketing – Dein Superheld für deine Werbung.
