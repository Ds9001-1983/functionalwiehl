/**
 * Zentrale CTA-Ziele — einzige Quelle der Wahrheit.
 *
 * ⚠️ Die WhatsApp-URLs sind BYTE-GENAU von der Live-Site übernommen
 * (Stand 12.06.2026). Der Kunde nutzt Superchat: eingehende Nachrichten mit
 * exakt diesen vorausgefüllten Texten starten dort eine Automation.
 * Jede Änderung (auch nur ein Encoding-Detail) bricht die Automation still.
 * Absicherung: tests/cta.spec.ts vergleicht jede gerenderte URL gegen diese
 * Konstanten und diese Konstanten gegen tests/fixtures/live-ctas.json.
 */
export const CTA = {
  /** Haupt-CTA „14 TAGE kostenlos" (Header, Hero, Sticky-Bar, CTA-Bänder) */
  whatsappProbetraining:
    "https://api.whatsapp.com/send/?phone=492262752717&text=Hallo%2C+ich+m%C3%B6chte+das+14-Tage+Probetraining+buchen%21&type=phone_number&app_absent=0",
  /** Preiskarten „Plan wählen" / „Studententarif" */
  whatsappVertrag:
    "https://wa.me/492262752717?text=Ich+m%C3%B6chte+einen+Vertrag+abschlie%C3%9Fen+oder+die+14+Tage+Probetraining+vereinbaren.",
  calendly: "https://calendly.com/functionalwiehl/telefontermin",
  tel: "tel:+492262752717",
  mail: "mailto:info@functional-wiehl.de",
  mapsRoute:
    "https://www.google.com/maps/dir/?api=1&destination=Functional+Wiehl+GmbH%2C+Wilhelm-Gr%C3%BCmer-Weg+18%2C+51674+Wiehl",
  instagram: "https://www.instagram.com/functionalwiehl/",
  facebook: "https://www.facebook.com/functionalwiehl/",
} as const;

export const KONTAKT = {
  firma: "Functional Wiehl GmbH",
  strasse: "Wilhelm-Grümer-Weg 18",
  plzOrt: "51674 Wiehl",
  telefonAnzeige: "02262 / 752717",
  mail: "info@functional-wiehl.de",
} as const;

export const OEFFNUNGSZEITEN = {
  zugang: "24/7 Zugang – immer geöffnet",
  betreuung: [
    { tage: "Mo – Do", zeit: "08:00 – 22:00 Uhr" },
    { tage: "Freitag", zeit: "08:00 – 21:00 Uhr" },
    { tage: "Sa & So", zeit: "10:00 – 18:00 Uhr" },
  ],
} as const;
