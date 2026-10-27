# TODO: Rechtliches vor dem Go-live

**Status (27.10.2026):** Impressum, Datenschutzerklärung und Barrierefreiheits-Erklärung sind
auf Live-Stand umgeschrieben und gehen als Entwurf an Conny. **Ihre Freigabe ist das Gate für die
DNS-Umschaltung.** Keine Rechtsberatung, wegen Art. 9 DSGVO und dem Pixel ohne Einwilligung auf
der Aktionsseite ist eine anwaltliche Prüfung empfohlen.

Quellen: `app/(site)/impressum/page.tsx`, `app/(site)/datenschutz/page.tsx`,
`app/(site)/barrierefreiheit/page.tsx`, Stammdaten in `content/recht.ts`, Prüfung in
`tests/recht.spec.ts`.

## Erledigt

- [x] **Registergericht belegt:** Registerportal der Länder (handelsregister.de), erweiterte Suche
      „Functional Wiehl“, abgerufen am 27.10.2026: *Nordrhein-Westfalen · Amtsgericht Köln · HRB
      54866 · Functional-Wiehl GmbH · Sitz Wiehl · aktuell*, frühere Firmen „GZO
      Gesundheits-Zentrum-Oberberg GmbH“ und „INJOY-Wiehl GmbH“. Gegenprobe: northdata.de
      (Amtsgericht Köln HRB 54866, EUID DER3306.HRB54866; R3306 ist im Registerportal das Gericht
      Köln) und Creditreform (Handelsregister Köln, HRB 54866). Damit ist auch die Firmierung mit
      Bindestrich belegt (`KONTAKT.firma`).
- [x] Impressum: Live-Text übernommen, Registergericht ergänzt, Anschrift der
      Inhaltsverantwortlichen ergänzt (§ 18 Abs. 2 MStV), WhatsApp und Bürozeiten wie live,
      **ODR-Link entfernt** (OS-Plattform seit 20.07.2025 eingestellt), info@ wie live.
- [x] Datenschutz: Basis Live-DSE inkl. der drei Abschnitte vom 20.10.2026 (wörtlich, Ergänzungen
      als eigene Absätze). Raus: Cookie Manager/Cookiebot, Newsletter, Flash, YouTube (3×),
      Facebook-Plug-in, altes Google Analytics (UA), Alfahosting als Webhoster, WordPress-Dienste
      (Complianz, Matomo, Smash Balloon, Site Kit, WPForms, Popup Maker), Prototyp-Hinweis.
      Neu: Vercel, Missbrauchsschutz (HMAC), eigener Banner (`fw_consent`, `fw_a11y`, `bn_code`,
      `bn_fbc`), Check-up und Körpermaße (Art. 9), Calendly, Google Maps (Link), GA4 nur mit
      Einwilligung, Pixel-Ausnahme auf `/black-november/`, Klickspeicher, Instagram-Beiträge,
      Aufsichtsbehörde, Widerruf, Stand-Datum.
- [x] Barrierefreiheit: Prototyp-Hinweis und Kursplan-Punkt raus, Geltungsbereich One-Pager,
      Instagram-Punkt, MLBF mit Anschrift, Stand-Datum.
- [x] Anschriften geprüft am 27.10.2026: Vercel (vercel.com/legal/privacy-policy), Alfahosting
      (alfahosting.de/impressum, **neue Anschrift** Edmund-von-Lippmann-Straße 13-15, 06112 Halle),
      SuperX GmbH (superchat.com/de/impressum), Calendly (calendly.com/legal/privacy-notice),
      WhatsApp Ireland (whatsapp.com/legal/privacy-policy-eea), LDI NRW (ldi.nrw.de/kontakt,
      Postfach), MLBF (mlbf-barrierefrei.de). Upstash nennt in DPA und Datenschutzhinweis keine
      Postanschrift.

## Offen: Freigabe Conny (Gate)

- [ ] **C1** Impressum, Datenschutzerklärung und Barrierefreiheit freigeben.
- [ ] **C2** Firmierung „Functional-Wiehl GmbH“ und Amtsgericht Köln, HRB 54866 bestätigen.
- [ ] **C4** Bürozeiten: Impressum live 09:00 Uhr, DSE-Seite live 08:30 Uhr. Eingetragen: 09:00.
- [ ] **C5** Datenschutzbeauftragter: Der Live-Absatz (Geschäftsführer als DSB) ist gestrichen, weil
      das wegen Interessenkonflikt nicht geht. Gibt es eine DSB-Pflicht (§ 38 BDSG, in der Regel ab
      20 Personen mit ständiger Datenverarbeitung)? Dann eine externe Person benennen.
- [ ] **C6** Löschfrist der Check-up- und Körpermaße-Mails im Postfach gym@. Vorschlag: spätestens
      sechs Monate nach Eingang (`RECHT.formularLoeschfrist`). Wer löscht, und wie?
- [ ] **C7** Art.-9-Einwilligung: Text der zweiten Checkbox bei Check-up und Körpermaße (Paket P1b
      bzw. P3a) zusammen mit der DSE freigeben.
- [ ] **C8** BFSG und VSBG: Mitarbeiterzahl und Umsatz. Greift die Ausnahme für Kleinstunternehmen,
      wird die Barrierefreiheits-Erklärung freiwillig. Der VSBG-Satz im Impressum („nicht bereit
      oder verpflichtet“) steht wie im alten Redesign-Entwurf, live gibt es ihn nicht.
- [ ] **C9** Bildrechte der Personen in den Instagram-Beiträgen für die Website.
- [ ] **C10** Anrede: Die Abschnitte vom 20.10. duzen, das Grundgerüst und die neuen Abschnitte
      siezen. Vereinheitlichen?
- [ ] **C11** Auftragsverarbeitung (AVV) prüfen bzw. abschließen: Alfahosting (Mail), Superchat,
      Vercel, Upstash, Calendly, SUPERBRAND (n8n). Wer ist Vertragspartner von Vercel und Upstash
      (Functional direkt oder SUPERBRAND als Unterauftragnehmer)?
- [ ] **C12** Alte WordPress-Einsendungen (Check-up, Körpermaße) exportieren oder löschen.
- [ ] **C13** Texte des Einwilligungsbanners (`components/consent/consent-banner.tsx`) zusammen mit
      der DSE freigeben. Seit der Prüfung vom 27.10.2026: Statistik = „pseudonyme Auswertung der
      Seitennutzung mit Cookies; Daten können an Google in den USA gehen“ (vorher „anonym“, falsch
      wegen `_ga`), Marketing = „Erfolgsmessung und gezielte Ausspielung unserer Anzeigen … Daten
      können an Meta in den USA gehen“ (vorher nur Erfolgsmessung, die DSE nennt beide Zwecke).
- [ ] **Pixel ohne Einwilligung auf `/black-november/`** (Entscheidung Dennis, Risiko nach § 25
      Abs. 1 TDDDG): Conny muss davon wissen. Die DSE beschreibt es offen und nennt lit. f als
      Rechtsgrundlage. Gilt nur bis zum Ende der Aktion; danach den Absatz „Ausnahme“ und den
      Abschnitt „Aktionscode und Klickdaten“ nach dem Löschdatum 10.12.2026 entfernen.

## Offen: Abgleich mit der Technik (vor der Umschaltung prüfen)

- [ ] **CAPI-Absatz (20.10., wörtlich):** nennt serverseitig „den Aufruf von Aktionsseiten, den
      Klick auf den WhatsApp-Button“. Nach dem WP-Aus kommt serverseitig nur noch der Lead aus n8n,
      außer „Conversions API mit Meta“ (Ein-Klick-Integration) ist im Events Manager aktiv
      (design-review (f)-5). Ist sie aus, die beiden Ereignisse aus dem Satz streichen.
- [x] **Paket P2 (BN)**, im Integrationsstand vom 27.10. gegen den Code geprüft (`lib/black-november/runtime.ts`,
      `components/consent/analytics-scripts.tsx`, `lib/tracking.ts`). Die DSE setzt voraus: GA4 nicht auf der LP, `bn_fbc` und `_fbp`/`_fbc` im
      Klickspeicher nur mit Marketing-Einwilligung, `fbclid` immer, TTL 60 Tage ab letztem Klick mit
      Deckel 10.12.2026, Felder wie im Vertrag (design-p2 Abschnitt 3), Pixel außerhalb der LP mit
      `autoConfig:false` und nur `FW_*`-Ereignissen, Formulare melden nichts an Meta.
- [ ] **Betrieb:** `vercel.json` mit `regions:["fra1"]` (sonst stimmt „Region Frankfurt am Main“
      für die Server-Funktionen nicht), Upstash in Frankfurt, kein Log-Drain (sonst stimmt die
      Log-Frist von 30 Tagen nicht; Vercel Pro hält Runtime-Logs 1 Tag, mit Observability Plus 30).
- [ ] **Instagram:** Der Abschnitt beschreibt den Endstand mit API, Vercel Blob und Upstash. Bis zum
      Instagram-Paket liegen die drei Fallback-Bilder als statische Dateien im Deployment; ein
      Datenfluss an Meta beim Seitenbesuch entsteht in beiden Fällen nicht.
- [ ] **GA4:** Aufbewahrungsdauer der Ereignisdaten im Property (2 oder 14 Monate) nachsehen und in
      der DSE ergänzen. Hängt am Container `GT-NMDMXSTT` ein Google-Ads-Konto, den Abschnitt erweitern.
- [ ] **n8n:** Serverstandort und Unterauftragsverarbeiter von n8n bei SUPERBRAND benennen (Abschnitt
      vom 20.10. sagt nur „Server unseres Dienstleisters“).
- [ ] **Klick-Migration:** Der Satz „Klickdaten aus der Zeit vor der Umstellung … übernommen“ stimmt
      erst nach Migrationslauf 1 (`npm run bn:migrate`).
- [ ] **Generator-Hinweis** (Weiß & Partner): Lizenz bzw. Pflicht zur Namensnennung des Musters prüfen.
- [x] **Paket P1:** `lib/seo.ts` beschreibt Impressum und DSE mit `KONTAKT.firma` („Functional-Wiehl GmbH“).
      Der Footer nennt wie live nur die Marke („© … Functional Wiehl.“), das Logo-Alt „Logo Functional
      Wiehl GmbH“ ist ebenfalls der Live-Text.

## Sonstiges

- [ ] AGB: `/geschaeftsbedingungen/` der Alt-Site ist ein generisches Template ohne
      Mitgliedschaftsbedingungen. Klären: eigene AGB-Seite nötig? (Redirect zeigt bis dahin auf
      /impressum/)
- [ ] BFSG: optional vollständiger WCAG-2.1-AA-Audit (`bfsg-check`) vor oder nach dem Go-live.
- [ ] Bildlizenzen: 9 `.credits.txt` in assets/raw/ (Stock/Freepik/Pexels/KI) – Weiterverwendung im
      Redesign und Attributionspflichten prüfen.
- [ ] Die Live-DSE bleibt bis zur Umschaltung falsch (Pixel auf der LP, GA4 ohne Einwilligung).
      Bewusst akzeptiert, kein Eingriff in WordPress außer der Härtung (design-review E17).
