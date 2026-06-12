# TODO: Meta Conversions API (CAPI)

**Status:** bewusst NICHT im Prototyp (Plan §4) · Browser-Pixel `965083147995308` ist consent-gated eingebaut.

## Warum noch nicht

- Das bestehende CAPI-Setup läuft laut Performance-Audit sauber auf der
  WordPress-Instanz — es bleibt aktiv, bis die Domain umzieht.
- Server-Side-Events vom Prototyp (Vercel-Preview-Domain) würden die
  Conversion-Daten verfälschen und erfordern die Domain-Verifizierung,
  die erst nach dem Umzug möglich ist.

## Migrationsweg (nach Domain-Umzug)

1. Domain functional-wiehl.de im Meta Business Manager (neu) verifizieren.
2. CAPI-Access-Token erzeugen → Vercel-Env `META_CAPI_TOKEN`.
3. Route Handler `/api/track` anlegen: nimmt `event_id` (crypto.randomUUID im
   Client), Event-Name, `_fbp`/`_fbc`-Cookies entgegen und forwarded an
   `graph.facebook.com/v21.0/965083147995308/events`.
4. `lib/tracking.ts`: dieselbe `event_id` an `fbq("track", …, { eventID })`
   übergeben → Browser/Server-Deduplikation greift ab Tag 1.
5. Events-Mapping wie im Event-Glossar (Plan §4): whatsapp_click→Lead/Contact,
   calendly_click→Schedule, checkup_submit→CompleteRegistration.
6. WP-seitiges CAPI deaktivieren (Doppelzählung vermeiden).

## Ebenfalls beim Cutover (Tracking)

- [ ] Matomo: läuft self-hosted auf der WP-Instanz (Site-ID 1). Entscheidung:
      Matomo Cloud / eigener Host / entfällt. Angebot Stufe 1 verspricht
      „Ziele in Matomo definieren" — mit Kunde klären, ob Matomo nach dem
      WP-Aus weiterbetrieben wird.
- [ ] GA4-Property `G-H41716E7JE`: Key Events anlegen für `whatsapp_click`,
      `tel_click`, `calendly_click`, `checkup_submit` (Stufe 1 des Angebots).
