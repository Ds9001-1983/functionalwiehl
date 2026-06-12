# TODO: Kursplan-Anbindung an die Studio-App

**Status:** offen (Kundenwunsch, Briefing 12.06.2026) · **Jetzt:** Kursplan statisch aus `content/kursplan.ts`

## Ausgangslage

Das Studio pflegt Kursplan, Kurs-Anmeldungen und freie Plätze in der eigenen
Studio-App („FUNCTIONAL 24/7"). Die Website soll diese Daten künftig live
anzeigen, statt sie doppelt zu pflegen.

## Architektur (vorbereitet)

Die UI bezieht Daten ausschließlich über den Adapter
[`lib/kursplan-source.ts`](../lib/kursplan-source.ts) → `getKursplan()`.
Umstellung auf die App-API erfordert **nur diese eine Datei** zu ändern:

1. `fetch(KURSPLAN_API_URL, { headers: { "x-api-key": … }, next: { revalidate: 900 } })`
   — ISR 15 min: ausreichend frische „freie Plätze" ohne Realtime-Aufwand.
2. Mapping des App-Schemas auf `Kursplan` (`content/kursplan.ts` definiert das Zielmodell;
   `freiePlaetze: number` aktiviert automatisch die Belegungs-Badges in `KursplanTable`).
3. `try/catch`-Fallback auf `KURSPLAN_STATISCH` — die Seite bricht nie.
4. Optional: On-Demand-Revalidation per Webhook aus der App (`revalidatePath("/kursplan")`).

## Offene Fragen an den App-Anbieter

- [ ] Gibt es einen REST-Endpoint (z. B. `GET /api/v1/kursplan`)? Format/Schema?
- [ ] Authentifizierung (API-Key/OAuth)? Rate-Limits?
- [ ] Enthält die Antwort Kapazität + aktuelle Anmeldungen (→ freie Plätze)?
- [ ] Deep-Link-Schema für „Jetzt anmelden" direkt in die App?
- [ ] Korrekte App-Store-/Play-Store-Links (die Alt-Site hatte defekte Platzhalter:
      Package-ID `.wpapp`, leere iOS-ID)
- [ ] Webhook bei Kursplan-Änderungen möglich?

## Außerdem offen (Content)

- [ ] Kursplan-Daten gegen aktuellen Stand prüfen — abgetippt aus
      `Kursplan_Neu-Dokument-A4.png` (06/2025), Instagram erwähnt einen
      „Übergangs Kursplan 04/26". Kursdauern sind angenommen (45/30/60 min).
