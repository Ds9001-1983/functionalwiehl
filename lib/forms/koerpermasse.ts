import {
  EINWILLIGUNG_DATENSCHUTZ,
  EINWILLIGUNG_KOERPERMASSE,
  EINWILLIGUNG_TEXT_STAND,
  HANDY_MUSTER,
  KONTAKT_GRENZEN,
  LOESCHHINWEIS,
  MASS_GRENZEN,
  MASSE,
  type MassId,
} from "@/content/koerpermasse";

/**
 * Serverseitige Prüfung und Mailtext für „Körpermaße Digital“ (POST /api/koerpermasse/).
 * Fehler nennen nur den Feldnamen, nie den Wert – die Antwort darf geloggt werden,
 * die Werte nicht (Art. 9 DSGVO).
 */

export type KoerpermasseDaten = {
  masse: Record<MassId, number>;
  vorname: string;
  nachname: string;
  handy: string;
};

export type KoerpermassePruefung = { ok: true; daten: KoerpermasseDaten } | { ok: false; feld: string };

/** Steuerzeichen raus, Leerraum zusammenfassen (Namen landen im Betreff) */
function saeubern(wert: unknown): string | null {
  if (typeof wert !== "string") return null;
  return wert.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Zahl im Bereich und auf dem 0,1-Raster der Eingabefelder (step 0.1) */
function gueltigesMass(wert: unknown): wert is number {
  if (typeof wert !== "number" || !Number.isFinite(wert)) return false;
  if (wert < MASS_GRENZEN.min || wert > MASS_GRENZEN.max) return false;
  return Math.abs(wert * 10 - Math.round(wert * 10)) < 1e-6;
}

export function pruefeKoerpermasse(json: unknown): KoerpermassePruefung {
  if (!json || typeof json !== "object") return { ok: false, feld: "anfrage" };
  const body = json as Record<string, unknown>;

  const roh = body.masse;
  if (!roh || typeof roh !== "object") return { ok: false, feld: "masse" };
  const masse = {} as Record<MassId, number>;
  for (const { id } of MASSE) {
    const wert = (roh as Record<string, unknown>)[id];
    if (!gueltigesMass(wert)) return { ok: false, feld: id };
    masse[id] = Math.round(wert * 10) / 10;
  }

  const kontakt = (body.kontakt ?? {}) as Record<string, unknown>;
  const vorname = saeubern(kontakt.vorname);
  if (!vorname || vorname.length > KONTAKT_GRENZEN.nameMax) return { ok: false, feld: "vorname" };
  const nachname = saeubern(kontakt.nachname);
  if (!nachname || nachname.length > KONTAKT_GRENZEN.nameMax) return { ok: false, feld: "nachname" };
  const handy = saeubern(kontakt.handy);
  const ziffern = handy?.replace(/\D/g, "").length ?? 0;
  if (
    !handy ||
    handy.length > KONTAKT_GRENZEN.handyMax ||
    !HANDY_MUSTER.test(handy) ||
    ziffern < KONTAKT_GRENZEN.handyMin
  ) {
    return { ok: false, feld: "handy" };
  }

  if (body.einwilligungDatenschutz !== true) return { ok: false, feld: "einwilligungDatenschutz" };
  if (body.einwilligungKoerpermasse !== true) return { ok: false, feld: "einwilligungKoerpermasse" };

  return { ok: true, daten: { masse, vorname, nachname, handy } };
}

const BERLIN = "Europe/Berlin";
const datumFormat = new Intl.DateTimeFormat("de-DE", { timeZone: BERLIN, day: "2-digit", month: "2-digit", year: "numeric" });
const zeitFormat = new Intl.DateTimeFormat("de-DE", { timeZone: BERLIN, hour: "2-digit", minute: "2-digit" });
const cmFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

/** Betreff „Körpermaße: Vorname Nachname (TT.MM.JJJJ)“, Text mit Zeilen wie „Oberschenkel Links: 55,5 cm“ */
export function koerpermasseMail(daten: KoerpermasseDaten, eingang: Date): { betreff: string; text: string } {
  const datum = datumFormat.format(eingang);
  const zeit = zeitFormat.format(eingang);
  const name = `${daten.vorname} ${daten.nachname}`;

  const zeilen = [
    "Neue Körpermaße über die Website (Formular „Körpermaße Digital“, /koerpermasse/)",
    `Eingang: ${datum}, ${zeit} Uhr`,
    "",
    "Kontakt",
    `Vorname: ${daten.vorname}`,
    `Nachname: ${daten.nachname}`,
    `Handynummer: ${daten.handy}`,
    "",
    "Körpermaße",
    ...MASSE.map(({ id, name: feld }) => `${feld}: ${cmFormat.format(daten.masse[id])} cm`),
    "",
    `Einwilligungen erteilt am ${datum}, ${zeit} Uhr (Text-Stand ${EINWILLIGUNG_TEXT_STAND}):`,
    `- ${EINWILLIGUNG_DATENSCHUTZ.vor}${EINWILLIGUNG_DATENSCHUTZ.link}${EINWILLIGUNG_DATENSCHUTZ.nach}.`,
    `- ${EINWILLIGUNG_KOERPERMASSE}`,
    "",
    LOESCHHINWEIS,
  ];

  return { betreff: `Körpermaße: ${name} (${datum})`, text: zeilen.join("\n") };
}
