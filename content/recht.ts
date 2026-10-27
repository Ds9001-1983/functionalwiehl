import { KONTAKT } from "@/lib/cta";

/**
 * Stammdaten der Rechtsseiten (Impressum, Datenschutz, Barrierefreiheit).
 * Firmierung, Anschrift, Telefon und Mail kommen aus KONTAKT (lib/cta.ts), hier
 * steht nur, was allein die Rechtstexte brauchen. Belege und offene Freigaben
 * (Conny) stehen in docs/TODO-recht.md.
 */
export const RECHT = {
  firma: KONTAKT.firma,
  // Registerportal handelsregister.de, abgerufen 27.10.2026 (Beleg in docs/TODO-recht.md)
  registergericht: "Amtsgericht Köln",
  registernummer: "HRB 54866",
  ustId: "DE240642364",
  vertretung: "Peter Nelles und Cornelia Nelles",
  verantwortlichInhalt: "Cornelia Nelles",
  /** Verantwortliche im Sinne der DSGVO, Wortlaut wie in der Live-DSE */
  verantwortlicheDse: "Cornelia und Peter Nelles",
  // Wie im Live-Impressum (die Live-DSE nennt 08:30 Uhr, Freigabe Conny)
  buero: "Das Büro ist von Montag bis Freitag von 09:00 Uhr bis 13:30 Uhr besetzt.",
  /** Stand-Datum von Datenschutzerklärung und Barrierefreiheits-Erklärung */
  stand: "27.10.2026",
  /** Löschdatum der Black-November-Klickdaten, deckt sich mit BN_CLICK_DELETE_AT (Entscheidung Dennis) */
  bnLoeschdatum: "10.12.2026",
  /** Vorschlag zur Löschfrist der Check-up- und Körpermaße-Mails, Freigabe Conny */
  formularLoeschfrist: "sechs Monate",
} as const;

/** Anbieter, die die Datenschutzerklärung nennt (Anschriften geprüft am 27.10.2026) */
export const ANBIETER = {
  vercel: "Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA",
  // Upstash nennt in DPA und Datenschutzhinweis keine Postanschrift
  upstash: "Upstash, Inc. (Delaware, USA)",
  alfahosting: "Alfahosting GmbH, Edmund-von-Lippmann-Straße 13-15, 06112 Halle (Saale)",
  superx: "Prenzlauer Allee 242-247, 10405 Berlin",
  calendly: "Calendly, LLC, 115 E Main St., Ste A1B, Buford, GA 30518, USA",
  google: "Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland",
  meta: "Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland",
  whatsapp: "WhatsApp Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland",
} as const;

/** Aufsichts- und Durchsetzungsstellen (geprüft am 27.10.2026 auf ldi.nrw.de bzw. mlbf-barrierefrei.de) */
export const BEHOERDEN = {
  datenschutz: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",
    anschrift: "Postfach 20 04 44, 40102 Düsseldorf",
    web: "https://www.ldi.nrw.de/",
  },
  barrierefreiheit: {
    name: "Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF AöR)",
    anschrift: "Carl-Miller-Straße 6, 39112 Magdeburg",
    mail: "kontakt@mlbf-barrierefrei.de",
    web: "https://www.mlbf-barrierefrei.de/",
  },
} as const;
