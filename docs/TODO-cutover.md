# Cutover-Runbook: functional-wiehl.de von WordPress auf Vercel

**Stand:** 27.10.2026 · **Anlass:** PHP2Shell (CVE-2026-109618/109619) auf dem WordPress bei
Alfahosting · **Grundlage:** `assets/raw/plan-2026-10-27/PLAN.md` (Entscheidungen von Dennis),
`design-review.md` (hat Vorrang), `design-p2.md` §4.3 (Black November), `design-p3.md` §7.
`assets/raw/` ist gitignored und liegt nur im Hauptrepo.

## Rollen und Regeln

| Kürzel | Wer | Darf |
|---|---|---|
| **D** | Dennis | Panels (Alfahosting, Vercel, Meta, n8n), Secrets, jede Freigabe |
| **C** | Conny (Functional) | Rechtstexte freigeben, Eingang in gym@ bestätigen |
| **K** | Claude | lesend jederzeit (curl, dig, `npm run …`); **per Chrome in Panels nur nach OK von D vor jedem ändernden Schritt** (Entscheidung 27.10.) |

- K liest und nennt keine Secrets. Env-Werte mit Secrets trägt D ein.
- Jeder Schritt hat eine Prüfung. Erst abhaken, wenn die Prüfung grün ist.
- Vor jedem Push: `npm run abnahme` lokal grün (globale CI-Regel), Bericht mit Befehl, Ergebnis, Anzahl Tests, Dauer.

## Feste Werte

| Was | Wert |
|---|---|
| Hauptdomain | `functional-wiehl.de` (ohne www), `www` → 308 auf die Hauptdomain |
| WordPress (alt) | Alfahosting, IP `109.237.132.28`, Nameserver `cns1.alfahosting.info` |
| SMTP | `alfa3102.alfahosting-server.de:465`, Postfach gym@ (nicht `mail.functional-wiehl.de`: Zertifikat lautet auf `*.alfahosting-server.de`) |
| Meta-Domainverifizierung | TXT `facebook-domain-verification=snffiuije1a574j1cpn13fi981px5k` |
| Black November | aktiv bis 09.11.2026, 23:59; Löschdatum der Klickdaten **10.12.2026** |
| n8n | Workflow `eHhcCrI24Jae2BQG` (BN26 → CAPI), Data Table `7ArobN9NrAvRU6tT` |
| Tracking | Pixel `965083147995308`, GA4 `G-H41716E7JE`, Container `GT-NMDMXSTT` |
| Vercel-Functions | Region `fra1` (`vercel.json`) |

## Env-Variablen (Vercel, nur Namen; Werte nie ins Repo)

| Name | Production | Preview | Wer |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://functional-wiehl.de` | nicht setzen | D |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` (erst zum Umschalten, Schritt 4.1) | **nie** | D |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Frankfurt (Marketplace) | dieselbe DB (Schlüssel getrennt per `bn:<VERCEL_ENV>`), sonst scheitert die curl-Kette in Schritt 3 | D |
| `BN_CLICK_USER`, `BN_CLICK_PASS` | Paar aus dem n8n-Credential „Unnamed credential“ | eigenes Testpaar | D |
| `BN_CLICK_DELETE_AT` | `2026-12-10T00:00:00+01:00` | gleich | D |
| `RATE_LIMIT_SECRET` | zufällig, ≥ 32 Zeichen | eigener Wert | D |
| `SMTP_HOST`, `SMTP_PORT` | `alfa3102.alfahosting-server.de`, `465` | gleich | D |
| `SMTP_USER`, `SMTP_PASS` | Postfach gym@ | gleich | D |
| `SMTP_FROM` | `Functional Wiehl Website <gym@functional-wiehl.de>` | gleich | D |
| `FORM_TO` | `gym@functional-wiehl.de` | Adresse von Dennis (Testeinsendungen landen nicht bei Conny) | D |
| `ALERT_TO` | Adresse von Dennis | gleich | D |
| `FORM_RATE_LIMIT` | optional, Standard 5 je 10 min | – | D |
| `MAIL_TRANSPORT`, `BN_CLICK_STORE` | **nie** (nur Tests; auf Vercel gesperrt) | **nie** | – |
| später: `CRON_SECRET`, `INSTAGRAM_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `IG_BLOB_HOST` | Instagram-Paket | – | D |

`NEXT_PUBLIC_*` wirken beim **Build**: nach einer Änderung neu deployen.

---

## Schritt 0 – Sofort (parallel zur Entwicklung)

**0.1 Sicherung**
- [x] K: Live-Kopien vom 27.10. nach `assets/raw/live-2026-10-27/`, Pläne nach `assets/raw/plan-2026-10-27/`.
- [x] K: WP-Medien (112 Dateien, Manifest), Körpermaße-Teaser, BN-OG-Bild, 3 Instagram-Fallback-Posts, WP-Fehlerantworten (`assets/raw/wp-errors.txt`).

**0.2 Alfahosting** (D im Panel oder K per Chrome, **je Schritt OK von D**)
- [ ] Vorher prüfen, welche weiteren Domains und Seiten im Paket liegen (betrifft das PHP-Update, E4).
- [ ] WP-Backup **verschlüsselt** (Dateien und DB), Aufbewahrung festlegen. Umfang (E6): Code-Snippet #6, Handler `fitness_checkup_submit` und `process_measurement_data`, Complianz-Nachweise, Matomo-Export. Darin liegen IP/UA-Klickdaten (Löschung zum 10.12.).
- [ ] D: In der DB prüfen, ob Check-up- oder Körpermaße-Einsendungen gespeichert sind → an C exportieren oder löschen (C12).
- [ ] TTL für `@` und `www` auf **300**. **Ab hier laufen die 24 h bis zum frühesten Umschalten.**
  - K prüft: `dig +noall +answer @cns1.alfahosting.info functional-wiehl.de A` und `… www.functional-wiehl.de` zeigen TTL 300.
- [ ] TXT `facebook-domain-verification=…` (Wert oben) setzen.
  - K prüft: `dig +short TXT functional-wiehl.de @1.1.1.1` und `@8.8.8.8`; D prüft im Business Manager.
- [ ] Prüfen, ob es einen eigenen A-Record `mail` → `109.237.132.28` gibt, sonst anlegen. Wildcard, MX, DKIM, DMARC nicht anfassen.
- [ ] PHP auf eine abgesicherte Version heben (8.2.35, 8.3.36, 8.4.27 oder 8.5.12+), danach Startseite, `/black-november/` und Formulare testen.
- [ ] `xmlrpc.php` sperren (`Require all denied`), Basic Auth vor `wp-login.php`, Admin `web2330` umbenennen. `/wp-json/` und `admin-ajax.php` bleiben bis zum Umschalten offen (LP und Formulare laufen darüber).
  - K prüft: `curl -s -o /dev/null -w '%{http_code}\n' https://functional-wiehl.de/xmlrpc.php` → 403, `…/wp-login.php` → 401.

**0.3 Vercel (Pro-Team)** (D; K per Chrome nur nach OK)
- [ ] Domains `functional-wiehl.de` (primär) und `www` (308 auf die Hauptdomain) anlegen, **noch ohne DNS-Umstellung**. Zielwerte notieren: A-Record-IP für `@`, CNAME-Ziel für `www`.
- [ ] Upstash Redis über den Marketplace, Region Frankfurt, mit Production und Preview verbinden. Prüfen, welche Namen die Integration setzt (`KV_REST_API_*` oder `UPSTASH_REDIS_REST_*`, der Code nimmt beide).
- [ ] Env-Werte laut Tabelle (ohne `NEXT_PUBLIC_ALLOW_INDEXING`).
- [ ] Bypass-Token für die Deployment Protection erzeugen (für die curl-Prüfungen auf der Preview).
- [ ] Keine Firewall- oder Bot-Regel auf `/wp-json/*` (sonst blockiert sie n8n).

**0.4 Links außerhalb der Website** (D sammelt, K prüft)
- [ ] Google-Unternehmensprofil, FB-Seite, IG-Bio, Weiterleitung nach der Calendly-Buchung, Superchat-Textbausteine, Anzeigen-URLs.
- [ ] K gleicht jede URL gegen `REDIRECTS` und `KEINE_WEITERLEITUNG` (P1) in `content/redirects.ts` ab, **vor** dem Umschalten (E5).

## Schritt 1–2 – Entwicklung (K)

P0 Fundament → Worktrees parallel → Merge **P2 → P3 → P1**, je Rebase auf `main` und `npm run abnahme`. Details in `PLAN.md`.

## Schritt 3 – Integration und Preview

- [x] K: Integrations-Commit (README, Alias `CTA.whatsappVertrag` entfernen), `npm run abnahme` grün, Bericht an D. Branch `golive/integration`, per Fast-Forward nach `main` (27.10.2026, noch nicht gepusht).
- [ ] K nach OK von D: Push nach `main` (Account Ds9001-1983). Vercel baut die Preview mit noindex.

**Prüfungen auf der Preview** (K, Header `x-vercel-protection-bypass: <Token>` bei jedem curl; `$P` = Preview-URL)
- [ ] Header (E15): `curl -sI "$P/" | grep -iE 'x-robots-tag|strict-transport|x-frame|content-security|permissions-policy'`
  → `x-robots-tag: noindex, nofollow`, **genau ein** `strict-transport-security` (setzt Vercel; `next.config.ts` sendet bewusst keinen), dazu die eigenen Sicherheits-Header.
- [ ] Klickspeicher ohne 308 (design-p2 §5):
  - `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$P/wp-json/sb-bn/v1/click/BN-ZZZZ"` → `401` ohne Redirect
  - `curl -s -u "$U:$PW" "$P/wp-json/sb-bn/v1/click/BN-ZZZZ"` → `{"found":false}`
  - POST mit `-H 'Content-Type: text/plain' -H "Origin: $P"` auf `…/click` → `204`, danach GET → `found:true`; Testcode wieder löschen (`npm run bn:migrate -- --delete <CODE>`).
- [ ] `curl -sI "$P/black-november?utm_source=a&fbclid=b"` → 308 mit Query; `…/black-november/` → 200; `x-vercel-id` zeigt `fra1`; TTFB notieren.
- [ ] SMTP (D legt `.env.local` mit den SMTP-Werten an, z. B. per `vercel env pull`; K liest die Datei nicht aus):
  - `npm run check:smtp` → `SMTP OK: alfa3102.alfahosting-server.de:465 (TLS) als gym@…`, keine Warnung
  - `npm run check:smtp -- --an <Adresse von Dennis>` → D prüft im Header `spf=pass`, `dkim=pass` (Selector `cloudpit`), `dmarc=pass`
  - `.env.local` danach löschen.
- [ ] Je eine Testeinsendung Check-up (`/#checkup`) und Körpermaße (`/koerpermasse/`) mit Namen „TEST“ → kommt bei `FORM_TO` (Preview: Dennis) an, Betreff „Körpermaße: TEST … (TT.MM.JJJJ)“.
- [ ] D: Pixel Helper auf LP (Pixel ohne Einwilligung) und Startseite (erst nach Einwilligung).

**In Meta prüfen** (lesend, D oder MCP)
- [ ] Automatische Events und automatischer erweiterter Abgleich aktiv? Beides kann Contact verwässern bzw. Formulareingaben erfassen → abschalten (Schreibaktion: D).
- [ ] „Conversions API mit Meta“ aktiv? Hängt am Container `GT-NMDMXSTT` ein Google-Ads-Konto?

**In GA4 prüfen** (lesend, D)
- [ ] Datenstream → Erweiterte Messung → Seitenaufrufe: Ist „Seitenwechsel anhand von Browserverlaufsereignissen“
      an? Dann zählt GA4 jede Client-Navigation doppelt, weil `trackPageview()` (`lib/tracking.ts`) selbst ein
      `page_view` sendet. Entweder die Option abschalten (Schreibaktion: D) oder K entfernt das manuelle
      `page_view` für GA4 (der Pixel braucht seins weiter, `disablePushState`).

**Gate vor Schritt 4:** C gibt Impressum, Datenschutz und Barrierefreiheit frei (offene Punkte unten).

## Schritt 4 – Umschalten (nachts, frühestens 24 h nach der TTL-Senkung, Chrome nur mit OK)

**Vorbedingungen:** TTL seit ≥ 24 h auf 300 (K: dig) · Freigabe C · Preview-Prüfungen grün · Code-Liste für die Migration liegt vor (K zieht nur die Spalte `code` aus der n8n Data Table `7ArobN9NrAvRU6tT` per n8n-MCP, lesend, Datei außerhalb des Repos; Entscheidung Dennis 27.10.: n8n-Tabelle statt DB-Vollexport).

1. [ ] D: `NEXT_PUBLIC_ALLOW_INDEXING=true` und `NEXT_PUBLIC_SITE_URL` in Production setzen, **Production-Deploy**.
   - K prüft auf der Production-URL `*.vercel.app`: weiterhin `x-robots-tag: noindex` (Regel nach Host), Klickspeicher-Testcode POST/GET wie oben, danach Testcode löschen.
2. [ ] K (Freigabe D): **Migrationslauf 1** `npm run bn:migrate -- --codes <Datei>` (ohne IP-Pinning).
3. [ ] DNS bei Alfahosting (D oder K per Chrome nach OK):
   - `@` A 109.237.132.28 → **zwei** A-Records `216.150.1.1` und `216.150.16.1` (Vercel-Empfehlung Rang 1, Stand 27.10.; Rang 2 wäre `76.76.21.21`)
   - `www`: A 109.237.132.28 löschen (seit 27.10. eigener Eintrag mit TTL 300), CNAME → `fbddb5fbb4f53f2c.vercel-dns-017.com`
   - `app.` (Fitness-App bei Hetzner) und `rm01`/`rm._domainkey` (Rapidmail) ebenfalls nicht anfassen
   - SPF `v=spf1 a mx include:secure-mailgate.com ~all` → `v=spf1 ip4:109.237.132.28 mx include:secure-mailgate.com ~all` (nur **ein** SPF-Eintrag; `a` zeigte sonst auf Vercel)
   - **Nicht anfassen:** NS, MX, `mail`, DKIM, DMARC, Google-TXT, FB-TXT, Wildcard
4. [ ] K: `dig +short functional-wiehl.de A @1.1.1.1` (ebenso `@8.8.8.8`, `@9.9.9.9`, `@cns1.alfahosting.info`), Zertifikat in Vercel abwarten, dann
   `curl -sI https://functional-wiehl.de/` (200, **kein** `x-robots-tag`, genau ein HSTS), `curl -sI https://www.functional-wiehl.de/` (308 → Hauptdomain), `curl -sI http://functional-wiehl.de/` (→ https).
5. [ ] K (Freigabe D): **Lauf 2** mit `--wp-ip 109.237.132.28` und aktueller Code-Liste. Nach 2 × TTL (≥ 10 min) **Lauf 3** (letzter Lauf).
6. [ ] **WP-Webroot sperren**, direkt nach Lauf 3 (D im Panel oder K per Chrome nach OK): `.htaccess` mit `Require all denied` oder Domain auf einen leeren Ordner, PHP für die Domain aus.
   K, Gegenprobe (alles 403 oder 404):
   ```sh
   for p in "" wp-login.php xmlrpc.php wp-json/ wp-admin/admin-ajax.php; do
     curl -sk -o /dev/null -w "%{http_code} /$p\n" --resolve functional-wiehl.de:443:109.237.132.28 "https://functional-wiehl.de/$p"
   done
   curl -s -o /dev/null -w '%{http_code} Host-Header\n' -H 'Host: functional-wiehl.de' http://109.237.132.28/
   curl -s -o /dev/null -w '%{http_code} Default-vHost\n' http://109.237.132.28/
   curl -sk -o /dev/null -w '%{http_code} Wildcard\n' https://zufall-4711.functional-wiehl.de/
   ```
   Die Wildcard zeigt weiter auf Alfahosting: auch dort darf kein WordPress antworten (E4).

**Rückweg:** Bis Schritt 4.6 reicht es, `@` wieder als A auf `109.237.132.28` und `www` wieder als A zu setzen (TTL 300). Nach der WP-Sperre gibt es keinen Rückweg auf WordPress, dann wird in Vercel repariert.

## Schritt 5 – Nachkontrolle (gleiche Nacht und folgende Tage)

- [ ] K: Ad-URL ohne Weiterleitung: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' 'https://functional-wiehl.de/black-november/?utm_source=facebook&utm_campaign=bn26&fbclid=test'` → `200` ohne Ziel.
- [ ] K: `npm run check:redirects -- https://functional-wiehl.de` und `npm run test:live` (lesend, keine Formular-Absendungen).
- [ ] K: Klickspeicher `curl -s -u "$U:$PW" https://functional-wiehl.de/wp-json/sb-bn/v1/click/<migrierter Code>` → `found:true`.
- [ ] D: n8n-Durchlauf mit `test_event_code` (Schreibaktion in n8n, nur D) → fbc und fbp im Events Manager; sonst einen echten Lead prüfen.
- [ ] D (K lesend im Network-Tab): ViewContent, `BN_Engaged`, Contact `bnc-…` kommen an, Custom Conversion feuert, Domainverifizierung grün. Pixel auf der LP ohne, sonst nur mit Einwilligung.
- [ ] D (eigenes Handy): Superchat „Mitglied werden“, „Probetraining“ und „Black November“ je einmal live auslösen.
- [ ] Je eine Testeinsendung Check-up und Körpermaße mit „TEST“; C bestätigt den Eingang in gym@ und löscht beide.
- [ ] D/K: Mail über gym@ und info@ senden und empfangen, SPF, DKIM und DMARC im Header.
- [ ] D: Search Console: `/sitemap.xml` einreichen, `wp-sitemap.xml` entfernen, Abdeckung und 404 eine Woche beobachten.
- [ ] D/K: Links aus 0.4 noch einmal prüfen.
- [ ] D: Vercel-Logs in den ersten zwei Wochen täglich (Vercel Pro hält Runtime-Logs nur 1 Tag): `[bn-click]` (Fehltreffer = Migrationslücke), `[form:koerpermasse]` und `[form:checkup]` (nur Codes, nie Inhalte). Danach siehe „Überwachung im Betrieb“.

## Schritt 6 – Nach dem Go-live

**Überwachung im Betrieb.** Fehler beim Formular-Versand (502/503) und im Klickspeicher landen nur
im Log (`[form:…]`, `[bn-click]`); die Person sieht eine ehrliche Fehlermeldung, das Studio merkt
nichts, n8n bekommt still `{found:false}`. Einen Mail-Alarm an `ALERT_TO` gibt es im Code bewusst
nicht: Beim häufigsten Fehler (SMTP-Ausfall, etwa nach einem Passwortwechsel für gym@) käme er
ebenfalls nicht an. `ALERT_TO` prüft bisher nur `check:smtp`, das Instagram-Paket alarmiert darüber.
- [ ] D: In Vercel unter Settings → Alerts eine Regel „Error anomaly“ (5xx) für das Projekt anlegen,
      Benachrichtigung an Dennis. Vercel löst erst oberhalb einer Mindestaktivität aus, ein einzelner
      502 eines selten genutzten Formulars bleibt womöglich darunter. Deshalb zusätzlich:
- [ ] D: Nach jedem Passwortwechsel für gym@ sofort `SMTP_PASS` in Vercel (Production und Preview)
      ändern, neu deployen und `npm run check:smtp` laufen lassen.
- [ ] D: Wöchentlich die Logs auf `[form:` und `[bn-click]` mit Status ≥ 500 filtern (bei 1 Tag
      Aufbewahrung nur eine Stichprobe) und einmal im Monat eine Testeinsendung Check-up mit „TEST“,
      die C in gym@ bestätigt und löscht. Kein Log-Drain, ohne die Log-Frist in der DSE anzupassen.

- [ ] **Instagram-Paket:** D oder C legt die Meta-App „Functional Website Feed“ an (Instagram Login, nur `instagram_business_basic`, Datenschutz-URL `/datenschutz/`) und erzeugt den Token. K: `lib/instagram/*`, Cron `/api/cron/instagram/` (mit Slash, Vercel-Crons folgen keinen Redirects), `crons` in `vercel.json`, `remotePatterns` nur für den Blob-Host, Alarm an `ALERT_TO`. Bis dahin greift der statische Fallback.
- [ ] **10.11.:** Teaser entfernen, `/black-november/` leitet per 308 auf `/#preise` (K; ein Datumstest wird ab dem 10.11. rot und erzwingt den Rückbau).
- [ ] **10.12.:** BN-Schlüssel verfallen per `EXPIREAT`. Nach OK von D: n8n Data Table `7ArobN9NrAvRU6tT` leeren, Klickdaten im WP-Backup löschen, Klick-Routen zurückbauen (K). Die Upstash-DB **bleibt** (Rate-Limit, Instagram), gelöscht werden nur `bn:*` (design-review (a)-11).
- [ ] WordPress-Dateien und DB nach Ablauf der Aufbewahrungsfrist löschen (D).
- [ ] **Alfahosting nicht kündigen**, solange Mail und DNS dort liegen.

## Offene Freigaben

**Conny (Gate für Schritt 4):**
- C1 Impressum, Datenschutz, Barrierefreiheit
- C2 Firmierung „Functional-Wiehl GmbH“, Amtsgericht Köln, HRB 54866 (northdata stimmt überein, handelsregister.de gegenprüfen)
- C5 Datenschutzbeauftragter nötig?
- C6 Löschfrist für Check-up- und Körpermaße-Mails (Vorschlag 6 Monate, so steht es im Hinweis der Körpermaße-Mail, `content/koerpermasse.ts` → `LOESCHHINWEIS`)
- C7 Text der Art.-9-Einwilligung zu den Körpermaßen (`EINWILLIGUNG_KOERPERMASSE`)
- C13 Texte des Einwilligungsbanners (Kategorien Statistik und Marketing) mit der DSE
- C14 Rechtsgrundlagen der Formulare außerhalb von Art. 9 (Check-up lit. b, Körpermaße lit. a, siehe `docs/TODO-recht.md`)
- Hinweis: Der Pixel läuft auf der LP ohne Einwilligung (Entscheidung Dennis, Risiko § 25 TDDDG bewusst getragen, endet mit der LP)
- nicht blockierend: C8 BFSG-Kennzahlen, C12 alte WordPress-Einsendungen

**Dennis:** Umschalt-Nacht festlegen (frühestens 28./29.10., TTL 300 seit 27.10. 12:50). Die Code-Liste zieht K aus der n8n-Tabelle (siehe Schritt 4).
