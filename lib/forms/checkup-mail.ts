import {
  CHECKUP_TEXTE,
  EINWILLIGUNG,
  EINWILLIGUNG_STAND,
  KEINE_ANGABE,
  SCHRITT,
  type CheckupDaten,
  type SchrittId,
} from "@/content/checkup-fragen";
import { abschnittTitel, esc, kasten, knopf, kontaktKarte, mailHtml, telHref, zeilenTabelle, type MailZeile } from "@/lib/mail-html";

/**
 * Mail an FORM_TO für den Check-up (POST /api/checkup/): Text-Fassung (Zeilen „Frage: Antwort“,
 * von den Tests geprüft) und HTML-Fassung mit Kontaktkarte, „Auf einen Blick“ und den Antworten
 * nach Bereichen. Betreff und Vorschauzeile ohne Gesundheitsdaten.
 */

const DATUM = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  dateStyle: "medium",
  timeStyle: "short",
});
const ZAHL = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

/** Bereiche der HTML-Fassung, ab „11“ Gesundheitsdaten (Art. 9 DSGVO) */
const BEREICHE: readonly { titel: string; ids: readonly SchrittId[] }[] = [
  { titel: "Über dich", ids: ["2", "3", "4"] },
  { titel: "Ziele", ids: ["5", "F6A", "F6B", "F6C", "F6D", "7", "F7E"] },
  { titel: "Training", ids: ["8", "9", "10"] },
  {
    titel: "Gesundheit",
    ids: ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26"],
  },
];
const GESUNDHEIT = new Set<SchrittId>(BEREICHE[3].ids);

/** Kurzname je Gesundheitsfrage für „Auf einen Blick“ (Schlüssel = Live-Feldnamen) */
const KURZ: Readonly<Record<string, string>> = {
  aerztliche_behandlung: "In ärztlicher Behandlung",
  herz_kreislauf: "Herz-Kreislauf",
  venenerkrankung: "Venen",
  atemwegs_erkrankung: "Atemwege",
  stoffwechsel_erkrankung: "Stoffwechsel",
  orthopaedische_beschwerden: "Orthopädisch",
  psychische_erkrankung: "Psychische Erkrankung",
  sonstige_erkrankungen: "Sonstige Erkrankungen",
  regelmaessige_medikamente: "Medikamente",
  op_letzte_12_monate: "OP in den letzten 12 Monaten",
};
/** Detailfrage → Ja/Nein-Frage davor */
const DETAIL_ZU: Readonly<Record<string, string>> = {
  herz_kreislauf_details: "herz_kreislauf",
  venenerkrankung_details: "venenerkrankung",
  atemwegs_details: "atemwegs_erkrankung",
  stoffwechsel_details: "stoffwechsel_erkrankung",
  orthopaedische_details: "orthopaedische_beschwerden",
  medikamente_details: "regelmaessige_medikamente",
};

const zeile = (frage: string, antwort: string) =>
  /[?:]$/.test(frage) ? `${frage} ${antwort}` : `${frage}: ${antwort}`;

const alsText = (wert: unknown) => (typeof wert === "string" ? wert : (wert as readonly string[]).join(", "));

/** Ja bei Einfachauswahl, bei Mehrfachauswahl alles außer „Nein“ und „Keine Angabe“ */
function auffaellig(wert: unknown): boolean {
  if (typeof wert === "string") return wert === "Ja";
  return Array.isArray(wert) && wert.some((w) => w !== "Nein" && w !== KEINE_ANGABE);
}

function zeilenFuer(daten: CheckupDaten, id: SchrittId): MailZeile[] {
  const schritt = SCHRITT[id];
  if (schritt.typ === "gewicht") {
    return schritt.felder.map((f) => ({ label: f.label, wert: ZAHL.format(daten.antworten[f.key] as number) }));
  }
  const wert = daten.antworten[schritt.key];
  return [
    {
      label: schritt.mailTitel ?? schritt.titel,
      wert: alsText(wert),
      detail: schritt.detail,
      // Detailfragen gehören zum „Ja“ davor, auch mit „Keine Angabe“
      markiert: GESUNDHEIT.has(id) && (schritt.detail || auffaellig(wert)),
    },
  ];
}

function antwortZeilen(daten: CheckupDaten): string[] {
  return daten.pfad.flatMap((id) =>
    zeilenFuer(daten, id).map((z) => `${z.detail ? "  → " : ""}${zeile(z.label, z.wert)}`),
  );
}

/** „Herz-Kreislauf: Bluthochdruck, KHK“ – je auffälliger Gesundheitsfrage ein Eintrag */
function gesundheitHinweise({ antworten, pfad }: CheckupDaten): string[] {
  const hinweise = new Map<string, string>();
  for (const id of pfad) {
    if (!GESUNDHEIT.has(id)) continue;
    const schritt = SCHRITT[id];
    if (schritt.typ === "gewicht") continue;
    const wert = antworten[schritt.key];
    const basis = DETAIL_ZU[schritt.key];
    if (basis) {
      if (hinweise.has(basis) && auffaellig(wert)) hinweise.set(basis, alsText(wert));
    } else if (auffaellig(wert)) {
      hinweise.set(schritt.key, typeof wert === "string" ? "Ja" : alsText(wert));
    }
  }
  return [...hinweise].map(([key, text]) => (text === "Ja" ? KURZ[key] : `${KURZ[key]}: ${text}`));
}

function aufEinenBlick(daten: CheckupDaten): MailZeile[] {
  const a = daten.antworten;
  const blick: MailZeile[] = [];
  const fokus = [a.muskeln_fokus, a.cardio_fokus, a.gesundheit_fokus].find((w) => typeof w === "string");
  if (typeof a.trainingsziele === "string") {
    blick.push({ label: "Ziel", wert: [a.trainingsziele, fokus].filter(Boolean).join(" – ") });
  }
  if (typeof a.problemzonen === "string") blick.push({ label: "Problemzone", wert: a.problemzonen });
  if (typeof a.aktuelles_gewicht === "number" && typeof a.wunschgewicht === "number") {
    const diff = Math.round((a.wunschgewicht - a.aktuelles_gewicht) * 10) / 10;
    const vorzeichen = diff > 0 ? "+" : diff < 0 ? "−" : "±";
    blick.push({
      label: "Gewicht",
      wert: `${ZAHL.format(a.aktuelles_gewicht)} kg → ${ZAHL.format(a.wunschgewicht)} kg (${vorzeichen}${ZAHL.format(Math.abs(diff))} kg)`,
    });
  }
  if (typeof a.trainingsfrequenz === "string") blick.push({ label: "Möchte trainieren", wert: a.trainingsfrequenz });
  if (typeof a.fitnessstudio_erfahrung === "string") {
    const art = Array.isArray(a.training_art) && !a.training_art.includes(KEINE_ANGABE) ? ` (${alsText(a.training_art)})` : "";
    blick.push({ label: "Studio-Erfahrung", wert: `${a.fitnessstudio_erfahrung}${a.fitnessstudio_erfahrung === "Ja" ? art : ""}` });
  }
  return blick;
}

function checkupHtml(daten: CheckupDaten, eingang: string): string {
  const { name, email, telefon } = daten.kontakt;
  const tel = telHref(telefon);
  // kein mailto mit angehängten Parametern (?bcc=…) aus dem Formular
  const mailto = /^[^\s?&#"<>]+@[^\s?&#"<>]+$/.test(email) ? `mailto:${email}` : null;
  const karte = kontaktKarte(
    name,
    [
      { label: "E-Mail", wert: email, href: mailto },
      { label: "Telefon", wert: telefon, href: tel },
    ],
    (tel ? knopf(tel, "Anrufen") : "") + (mailto ? knopf(mailto, "E-Mail schreiben", "rahmen") : ""),
  );

  const hinweise = gesundheitHinweise(daten);
  const gesundheit = hinweise.length
    ? kasten(
        `<strong>Gesundheit: bitte beachten</strong><br>${hinweise.map((h) => `• ${esc(h)}`).join("<br>")}`,
        "achtung",
      )
    : kasten("<strong>Gesundheit:</strong> keine Erkrankungen, Medikamente oder OPs angegeben.", "gut");

  const bereiche = BEREICHE.map(({ titel, ids }) => {
    const zeilen = daten.pfad.filter((id) => ids.includes(id)).flatMap((id) => zeilenFuer(daten, id));
    return zeilen.length ? abschnittTitel(titel) + zeilenTabelle(zeilen) : "";
  }).join("");

  const einwilligung = kasten(
    `<strong>Beim Absenden angekreuzt</strong> (Text-Stand ${esc(EINWILLIGUNG_STAND)})<br>` +
      `☑ ${esc(EINWILLIGUNG.datenschutz)}<br>☑ ${esc(EINWILLIGUNG.gesundheit)}`,
  );

  return mailHtml({
    titel: "Neuer Check-up",
    unterzeile: `${CHECKUP_TEXTE.titel} · Eingang ${eingang} Uhr`,
    vorschau: `Check-up von ${name}, Eingang ${eingang} Uhr`,
    inhalt:
      karte +
      abschnittTitel("Auf einen Blick") +
      zeilenTabelle(aufEinenBlick(daten)) +
      `<div style="height:12px;"></div>` +
      gesundheit +
      bereiche +
      abschnittTitel("Einwilligung") +
      einwilligung,
    fuss:
      "Diese Mail enthält Gesundheitsdaten (Art. 9 DSGVO). Nur für die Trainingsberatung verwenden, " +
      `nicht weiterleiten und nach der Bearbeitung löschen.<br>„Antworten“ schreibt direkt an ${esc(name)}.`,
  });
}

export function checkupMail(daten: CheckupDaten, eingang: Date): { betreff: string; text: string; html: string } {
  const { name, email, telefon } = daten.kontakt;
  const zeit = DATUM.format(eingang);
  const text = [
    `Neuer ${CHECKUP_TEXTE.titel} über die Website`,
    `Eingang: ${zeit} Uhr`,
    "",
    "KONTAKT",
    `Name: ${name}`,
    `E-Mail: ${email}`,
    `Telefon: ${telefon}`,
    "",
    // Häkchen 1 ist eine Kenntnisnahme, keine Einwilligung (DSE: übrige Angaben nach lit. b)
    `BESTÄTIGUNG UND EINWILLIGUNG (beim Absenden angekreuzt, Text-Stand ${EINWILLIGUNG_STAND})`,
    `[x] ${EINWILLIGUNG.datenschutz}`,
    `[x] ${EINWILLIGUNG.gesundheit}`,
    "",
    "ANTWORTEN",
    ...antwortZeilen(daten),
    "",
    "--",
    "Diese Mail enthält Gesundheitsdaten (Art. 9 DSGVO). Nur für die Trainingsberatung verwenden,",
    "nicht weiterleiten und nach der Bearbeitung löschen. „Antworten“ schreibt direkt an die Person.",
  ].join("\n");
  // Betreff ohne Gesundheitsdaten
  return { betreff: `Neuer Check-up über die Website – ${name}`, text, html: checkupHtml(daten, zeit) };
}
