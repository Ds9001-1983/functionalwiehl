# Meta: Pixel, Conversions API und Event-Zuordnung

**Stand 27.10.2026 (Go-live-Paket, Integration).** Browser-Pixel `965083147995308`, GA4
`G-H41716E7JE`. Code: `lib/tracking.ts`, `lib/meta-pixel.ts`, `lib/black-november/runtime.ts`,
`components/consent/*`. Abgesichert durch `tests/tracking.spec.ts`, `tests/consent.spec.ts` und
`tests/black-november.spec.ts` (Tracker werden in der Abnahme immer abgefangen).

## Event-Zuordnung

| Wo | Pixel | Events |
|---|---|---|
| `/black-november/` | lädt **ohne Einwilligung** (Entscheidung Dennis), `autoConfig` wie live | PageView, ViewContent, `BN_Engaged` (15 s und 50 % gescrollt), `Contact` mit eventID `bnc-<Code>` beim WhatsApp-Klick |
| übrige Website | erst nach Marketing-Einwilligung, `autoConfig` aus | PageView, Custom Events `FW_WhatsApp_Klick` (`ziel` = probetraining/mitglied/allgemein), `FW_Anruf_Klick`, `FW_Mail_Klick`, `FW_Telefontermin_Klick` |
| n8n eHhcCrI24Jae2BQG | serverseitig, Graph-API v26.0 | `Lead` (`action_source` chat) mit fbc, fbp, IP und UA aus dem Klickspeicher (unten) |

- Kein Website-Event heißt `Contact` oder `Lead`: Die BN26-Anzeigen optimieren auf Contact, Klicks
  ohne Aktionscode würden das Ergebnis verfälschen. Custom Events lassen sich später gezielt zu
  Custom Conversions machen.
- Check-up und Körpermaße melden nichts an Meta (Nähe zu Art. 9 DSGVO). An GA4 geht nur
  `checkup_submit` ohne Inhalte und nur mit Statistik-Einwilligung.
- GA4 mit Consent Mode v2 im Basic Mode: `gtag` existiert erst nach der Statistik-Einwilligung,
  ad_* bleiben denied, ohne Google Signals. Auf der LP lädt GA4 nie.
- Eine eigene CAPI der Website gibt es nicht. Das CAPI-Setup auf der WP-Instanz (Audit vom
  12.06.2026) endet mit der WP-Sperre.

## Offen (lesend in Meta prüfen, Dennis)

- [ ] Ist im Events Manager „Conversions API mit Meta“ (Ein-Klick-Integration) aktiv? Davon hängen
      der CAPI-Absatz der DSE und mögliche Doppelzählungen ab (design-review (f)-5).
- [ ] Automatische Events bzw. automatischer erweiterter Abgleich: Die LP läuft wie live mit
      `autoConfig`. Prüfen, dass das Contact nicht verwässert und keine Formulareingaben erfasst.
- [ ] Hängt am Google-Container `GT-NMDMXSTT` ein Google-Ads-Konto?

## Ebenfalls beim Cutover (Tracking)

- [ ] Matomo: läuft self-hosted auf der WP-Instanz (Site-ID 1) und fällt mit WP weg. Entscheidung:
      Matomo Cloud / eigener Host / entfällt. Angebot Stufe 1 verspricht
      „Ziele in Matomo definieren" — mit Kunde klären, ob Matomo nach dem
      WP-Aus weiterbetrieben wird.
- [ ] GA4-Property `G-H41716E7JE`: Key Events anlegen für `whatsapp_click`,
      `tel_click`, `calendly_click`, `mail_click`, `checkup_submit` (Stufe 1 des Angebots).

## Klickspeicher für n8n (BN26, Next.js statt WordPress)

**Stand 27.10.2026 (Paket P2b).** Der WP-Klickspeicher aus Snippet #6 ist unter **denselben
Pfaden** nachgebaut, damit der n8n-Workflow eHhcCrI24Jae2BQG unverändert bleibt.

| | `POST /wp-json/sb-bn/v1/click` | `GET /wp-json/sb-bn/v1/click/{code}` |
|---|---|---|
| Aufrufer | LP-Beacon (neue LP und alte WP-LP während der DNS-Umstellung) | n8n „Klickdaten von Landingpage holen“ (Basic Auth, 8 s, `neverError`) |
| Prüfung | Origin (eigene Domain, www, Preview), ≤ 4 KB, 20/min je IP (HMAC mit `RATE_LIMIT_SECRET`), Code `^BN-[A-HJ-NP-Z2-9]{4}$` | Pfad wie die WP-Route `BN-[A-Za-z2-9]{4}` (sonst 404 `rest_no_route`), dann Basic Auth (sonst 401 `rest_forbidden`, Body byte-genau wie WP) |
| Antwort | 204 (400/403/413/429/503 wertet niemand aus) | 200 `{found:false}` oder `{found:true,fbc,fbp,ip,ua}` mit nur den vorhandenen Feldern; 503 `{found:false}` bei Speicherfehler |

- **Kein 308** auf beiden Pfaden, mit und ohne Slash (`proxy.ts` lässt `/wp-json` aus). Redirect-Regeln
  in `content/redirects.ts` dürfen `/wp-json/sb-bn/` nie abdecken – `tests/klickspeicher.spec.ts` prüft das.
- **Speicher:** Upstash Redis (Frankfurt) über die REST-Pipeline, ohne SDK. Hash
  `bn:<VERCEL_ENV>:click:<CODE>` mit `fbc fbp ip ua url cta consent first_at last_at hits src`.
  Felder werden **nur ergänzt** (HSETNX), nie überschrieben. `EXPIREAT` = min(Klick + 60 Tage,
  `BN_CLICK_DELETE_AT`). Rate-Limit-Zähler `bn:<env>:rl:<hmac>:<minute>` leben 2 Minuten.
- **Basic Auth:** `BN_CLICK_USER`/`BN_CLICK_PASS` = das Paar aus dem n8n-Credential „Unnamed
  credential“ (WP-App-Passwort). Leerzeichen im Passwort zählen auf beiden Seiten nicht. Ohne
  gesetzte Werte ist der GET immer 401.
- **Code:** `lib/black-november/klickspeicher.ts` (ohne Imports, auch vom Migrationsskript geladen),
  `lib/black-november/klickspeicher-server.ts`, `app/wp-json/sb-bn/v1/click/route.ts` und `…/[code]/route.ts`.
  `BN_CLICK_STORE=memory` gilt nur lokal und in der Abnahme, auf Vercel ist er gesperrt (dann 503).
- **Logs (Vercel, täglich ansehen):** `[bn-click] miss <CODE>` = n8n fragt einen Code ab, den es
  nicht gibt (Migrationslücke oder Klick vor dem Umzug ohne Übernahme). `[bn-click] 401 …` = das
  n8n-Credential passt nicht zu den Env-Werten. `[bn-click] POST nicht gespeichert …` bzw.
  `… nicht konfiguriert` = Upstash fehlt oder antwortet nicht. Nutzdaten stehen nie im Log.

### Prüfung per curl (Preview mit Bypass-Header, danach Hauptdomain)

```bash
H=https://functional-wiehl.de   # Preview: Host der Preview, dazu -H "x-vercel-protection-bypass: $BYPASS"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $H/wp-json/sb-bn/v1/click/BN-ZZZZ      # 401, kein Redirect
curl -s -u "$BN_CLICK_USER:$BN_CLICK_PASS" $H/wp-json/sb-bn/v1/click/BN-ZZZZ                   # {"found":false}
curl -s -o /dev/null -w '%{http_code}\n' -X POST $H/wp-json/sb-bn/v1/click -H 'Content-Type: text/plain' \
  -H "Origin: $H" --data '{"code":"BN-ZZZ2","fbp":"","fbc":"","url":"","cta":"hero","consent":0}' # 204
curl -s -u "$BN_CLICK_USER:$BN_CLICK_PASS" $H/wp-json/sb-bn/v1/click/BN-ZZZ2                   # found:true, ip = eigene IP
```

Mit `-H 'x-real-ip: 1.2.3.4'` gegenprüfen, dass trotzdem die **echte** IP gespeichert wird (Vercel
überschreibt den Header, von außen nicht belegt). Danach den Testcode löschen:
`npm run bn:migrate -- --env-file <datei> --prefix bn:<env> --delete BN-ZZZ2`.

### Migration der WP-Klicks (`scripts/bn-migrate-clicks.mjs`)

- **Code-Liste:** am besten alle Codes der letzten 60 Tage aus der WP-Datenbank (Speicherort laut
  Snippet #6 im Backup), sonst der CSV-Export der n8n-Data-Table 7ArobN9NrAvRU6tT (Spalte `code`,
  `wa_hash` vorher entfernen). CSV mit Spalte `code` (optional eine Zeitspalte wie `created_at`
  für Klick + 60 Tage) oder beliebiger Text mit BN-Codes. Liste außerhalb des Repos ablegen.
- **Env-Datei** (per `vercel env pull`, danach löschen): `BN_CLICK_USER`, `BN_CLICK_PASS`,
  `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `BN_CLICK_DELETE_AT`.
- **Läufe** (idempotent, Ausgabe nur Codes und Zähler):
  1. T0 nach dem Production-Deploy, noch vor dem DNS-Wechsel:
     `npm run bn:migrate -- --env-file <datei> --codes <liste>` (zuerst gern mit `--dry-run`)
  2. Direkt nach dem DNS-Wechsel mit aktueller Liste: `… --codes <liste> --wp-ip 109.237.132.28`
     (TLS wird weiter gegen functional-wiehl.de geprüft, es gibt kein `--insecure`)
  3. Nach etwa 2 × TTL (TTL 300) noch einmal wie Lauf 2, dann WP sperren. Danach bricht das Skript
     erwartbar mit 401/403 ab.
- `--check` vergleicht WP und Redis, `--delete <CODE>` entfernt Testcodes. Exit-Code 1 bei einzelnen
  Fehlern, 2 bei Abbruch (Env, Zugangsdaten, WP gesperrt).
- **Lücke:** Klicks auf der alten LP nach dem letzten Lauf. Diese Leads gehen ohne fbc/fbp/IP/UA an
  Meta (nur Telefon-Hash und Land) und tauchen als `[bn-click] miss` im Log auf.

### Löschung

- Alle `bn:*`-Schlüssel verfallen spätestens zum Löschdatum **10.12.2026** per `EXPIREAT`; ab dann
  speichert der POST nichts mehr und der GET antwortet `{found:false}`. Die Upstash-DB selbst bleibt
  (Instagram-Feed, Rate-Limits, design-review.md (a)-11).
- Danach Route-Handler, `lib/black-november/klickspeicher*.ts`, das Skript und die Tests entfernen
  (`tests/klickspeicher.spec.ts` wird ab dem Löschdatum ohnehin rot). n8n-Data-Table und die
  Klickdaten im WP-Backup löscht Dennis nach OK.
