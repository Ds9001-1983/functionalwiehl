# TODO: Rechtliches vor Go-Live

**Status:** offen — Prototyp enthält Entwürfe, KEINE freigegebenen Rechtstexte.

## Datenschutzerklärung (kritisch)

Die Alt-Site nutzt ein **unausgefülltes Muster** (beschreibt Cookiebot und einen
Newsletter, die es nie gab; Matomo/Pixel/Calendly fehlen). Die neue Erklärung
([app/datenschutz/page.tsx](../app/datenschutz/page.tsx)) ist ein strukturierter
Entwurf auf Basis der echten Dienste und muss juristisch geprüft werden:

- [ ] Vercel-Hosting (US-Transfer, DPF/SCC), Server-Logs, next/image-Optimizer
- [ ] Consent-Cookie `fw_consent` (§ 25 TDDDG)
- [ ] GA4 (nur nach Einwilligung) + Meta Pixel (gemeinsame Verantwortlichkeit)
- [ ] WhatsApp-Kontakt inkl. **Superchat** (SuperX GmbH) als Auftragsverarbeiter — AVV prüfen!
- [ ] Calendly-Link-out
- [ ] **Gesundheits-Check Art. 9 DSGVO**: Einwilligungstext der separaten
      Checkbox prüfen; Verarbeitungsverzeichnis ergänzen; ggf. DSFA prüfen
- [ ] Matomo ergänzen, falls es nach Cutover weiterläuft

## Gesundheits-Check (Art. 9 DSGVO)

- Prototyp: `/api/checkup` validiert nur und speichert NICHTS (kein Log der
  Antworten!). Versand an info@functional-wiehl.de erst nach DSE-Freigabe
  implementieren (z. B. Resend, EU-Region, TLS).
- [ ] Speicher-/Löschkonzept festlegen (wer empfängt, wo abgelegt, wann gelöscht)
- [ ] Empfänger klären: E-Mail-Postfach oder CRM?

## Impressum

- [ ] **Registergericht zu HRB 54866 bestätigen** (vermutlich AG Köln) — Pflicht-
      angabe nach § 5 DDG, fehlt auch auf der Alt-Site! Platzhalter in
      [app/impressum/page.tsx](../app/impressum/page.tsx) ersetzen.

## Sonstiges

- [ ] AGB: `/geschaeftsbedingungen/` der Alt-Site ist ein generisches Template
      ohne Mitgliedschaftsbedingungen. Klären: eigene AGB-Seite nötig?
      (Redirect zeigt bis dahin auf /impressum/)
- [~] BFSG (seit 28.06.2025): Barrierefreiheits-Leiste (nativ) + Erklärungsseite
      `/barrierefreiheit/` sind eingebaut (Entwurf). Offen: juristische Endprüfung
      der Erklärung, Bestätigung der zuständigen Marktüberwachungsstelle (MLBF) +
      Verfahrensangaben, optional vollständiger WCAG-2.1-AA-Audit (`bfsg-check`)
- [ ] Bildlizenzen: 9 `.credits.txt` in assets/raw/ (Stock/Freepik/Pexels/KI) —
      Weiterverwendung im Redesign + Attributionspflichten prüfen
- [ ] Foto-Einwilligungen für künftige Team-Fotos (/ueber-uns/)
