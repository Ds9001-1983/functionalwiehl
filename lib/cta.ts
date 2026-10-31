/**
 * Zentrale CTA-Ziele — einzige Quelle der Wahrheit.
 *
 * ⚠️ Die WhatsApp-URLs sind BYTE-GENAU von der Live-Site übernommen
 * (Stand 27.10.2026, Quelle: tests/fixtures/live-ctas.json, eingefroren vor der
 * WP-Abschaltung aus assets/raw/live-2026-10-27/). Der Kunde nutzt Superchat:
 * eingehende Nachrichten mit exakt diesen vorausgefüllten Texten starten dort
 * eine Automation. Jede Änderung (auch nur ein Encoding-Detail) bricht die
 * Automation still. Die Literale bewusst NICHT per encodeURIComponent bauen
 * (das ergäbe „!“ statt „%21“).
 * Absicherung: tests/cta.spec.ts vergleicht jede gerenderte URL gegen diese
 * Konstanten und diese Konstanten gegen tests/fixtures/live-ctas.json.
 */
export const CTA = {
  /** Header „Buche ein Probetraining“ */
  whatsappProbetraining:
    "https://wa.me/492262752717?text=Hallo%2C%20ich%20m%C3%B6chte%20ein%20Probetraining%20buchen%21",
  /** „Mitglied werden“ / Preiskarten „Buchen“ */
  whatsappMitglied: "https://wa.me/492262752717?text=Ich%20m%C3%B6chte%20Mitglied%20werden.",
  /** „Kontakt über WhatsApp“, Fragen-Button, WhatsApp-Nummer im Kontakt */
  whatsappAllgemein: "https://wa.me/492262752717",
  /** BN-LP: Präfix der WhatsApp-URL, dahinter folgt der Aktionscode (siehe whatsappBlackNovember) */
  whatsappBlackNovemberPrefix:
    "https://wa.me/492262752717?text=Hallo%20Functional-Team!%20Ich%20m%C3%B6chte%20mir%20das%20Black-November-Angebot%20sichern%3A%2050%20%25%20auf%20mein%20Abo%20(12%20Monate).%20Mein%20Aktionscode%3A%20",
  /** BN-LP ohne JavaScript (<noscript>-Link wörtlich wie live, eigener Text ohne Code) */
  whatsappBlackNovemberNoscript:
    "https://wa.me/492262752717?text=Hallo%20Functional-Team%21%20Ich%20m%C3%B6chte%20mir%20das%20Black-November-Angebot%20sichern%3A%2050%20%25%20auf%20mein%20Abo.",
  /** Startseiten-Teaser → LP, UTM wie live */
  blackNovemberLp: "/black-november/?utm_source=website&utm_medium=startseite&utm_campaign=bn26",
  calendly: "https://calendly.com/functionalwiehl/telefontermin",
  tel: "tel:+492262752717",
  /** Startseite und LP (wie live) */
  mail: "mailto:gym@functional-wiehl.de",
  /** Impressum und Datenschutz (wie live) */
  mailRecht: "mailto:info@functional-wiehl.de",
  /** Adresse im Kontakt-Block (live: ganzer Blurb verlinkt) */
  maps: "https://g.co/kgs/8WPjTLD",
  instagram: "https://www.instagram.com/functionalwiehl/",
  facebook: "https://www.facebook.com/functionalwiehl/",
} as const;

/** Black November: Nachricht vor dem Aktionscode, Klartext wie in Snippet #6 (bn.html) */
export const BN_WHATSAPP_TEXT =
  "Hallo Functional-Team! Ich möchte mir das Black-November-Angebot sichern: 50 % auf mein Abo (12 Monate). Mein Aktionscode: ";
/** Alphabet des Aktionscodes (ohne I, O, 0, 1) */
export const BN_CODE_ZEICHEN = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const BN_CODE_REGEX = /^BN-[A-HJ-NP-Z2-9]{4}$/;

/** WhatsApp-URL mit Aktionscode, byte-gleich zum Live-Aufbau `encodeURIComponent(msg)`. */
export function whatsappBlackNovember(code: string): string {
  if (!BN_CODE_REGEX.test(code)) throw new Error(`Ungültiger BN-Aktionscode: ${code}`);
  return `https://wa.me/492262752717?text=${encodeURIComponent(BN_WHATSAPP_TEXT + code)}`;
}

export const KONTAKT = {
  firma: "Functional-Wiehl GmbH",
  strasse: "Wilhelm-Grümer-Weg 18",
  plzOrt: "51674 Wiehl",
  telefonAnzeige: "02262 / 752717",
  mail: "gym@functional-wiehl.de",
  mailRecht: "info@functional-wiehl.de",
} as const;

/** Öffnungs- und Betreuungszeiten (#kontakt, Stand 31.10.2026) */
export const BETREUUNGSZEITEN = {
  zugang: { label: "24/7 Zugang", wert: "IMMER GEÖFFNET" },
  zeilen: [
    { label: "Betreuung Mo-Fr", wert: "08:00 – 21:00" },
    { label: "Betreuung Sa", wert: "10:00 – 14:00" },
    { label: "Sonntag", wert: "ohne Betreuung" },
  ],
} as const;
