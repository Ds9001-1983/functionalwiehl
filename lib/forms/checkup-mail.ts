import { CHECKUP_TEXTE, EINWILLIGUNG, EINWILLIGUNG_STAND, type CheckupDaten } from "@/content/checkup-fragen";
import { aufEinenBlick, bereiche, DATUM, gesundheitHinweise, zeilenFuer } from "@/lib/forms/checkup-bericht";
import {
  abschnittTitel,
  esc,
  kasten,
  knopf,
  kontaktKarte,
  MAIL_FARBEN,
  MAIL_SCHRIFT,
  mailHtml,
  telHref,
  zeilenTabelle,
} from "@/lib/mail-html";

/**
 * Mail an FORM_TO für den Check-up (POST /api/checkup/): Text-Fassung (Zeilen „Frage: Antwort“,
 * von den Tests geprüft) und HTML-Fassung mit Kontaktkarte, „Auf einen Blick“ und den Antworten
 * nach Bereichen. Betreff und Vorschauzeile ohne Gesundheitsdaten.
 *
 * Dieselben Angaben hängen als PDF an der Mail (lib/forms/checkup-pdf.ts), damit das Team den
 * Check-up in einem anderen System ablegen kann. `anhang` sagt, ob das PDF dabei ist.
 */

/** "pdf" = PDF hängt an, "fehlt" = PDF ließ sich nicht erstellen, die Mail geht trotzdem raus */
export type CheckupAnhang = "pdf" | "fehlt";

const ANHANG_TEXT: Record<CheckupAnhang, string> = {
  pdf: "Im Anhang: derselbe Check-up als PDF für die Ablage.",
  fehlt: "Hinweis: Das PDF konnte nicht erstellt werden. Alle Angaben stehen vollständig in dieser Mail.",
};

const zeile = (frage: string, antwort: string) =>
  /[?:]$/.test(frage) ? `${frage} ${antwort}` : `${frage}: ${antwort}`;

function antwortZeilen(daten: CheckupDaten): string[] {
  return daten.pfad.flatMap((id) =>
    zeilenFuer(daten, id).map((z) => `${z.detail ? "  → " : ""}${zeile(z.label, z.wert)}`),
  );
}

function checkupHtml(daten: CheckupDaten, eingang: string, anhang: CheckupAnhang): string {
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

  const antworten = bereiche(daten)
    .map(({ titel, zeilen }) => abschnittTitel(titel) + zeilenTabelle(zeilen))
    .join("");

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
      `<p style="margin:12px 0 0;font-family:${MAIL_SCHRIFT};font-size:13px;line-height:1.4;color:${anhang === "pdf" ? MAIL_FARBEN.grau : MAIL_FARBEN.braun};">📎 ${esc(ANHANG_TEXT[anhang])}</p>` +
      abschnittTitel("Auf einen Blick") +
      zeilenTabelle(aufEinenBlick(daten)) +
      `<div style="height:12px;"></div>` +
      gesundheit +
      antworten +
      abschnittTitel("Einwilligung") +
      einwilligung,
    fuss:
      "Diese Mail enthält Gesundheitsdaten (Art. 9 DSGVO). Nur für die Trainingsberatung verwenden, " +
      `nicht weiterleiten und nach der Bearbeitung löschen.<br>„Antworten“ schreibt direkt an ${esc(name)}.`,
  });
}

export function checkupMail(
  daten: CheckupDaten,
  eingang: Date,
  anhang: CheckupAnhang = "pdf",
): { betreff: string; text: string; html: string } {
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
    ANHANG_TEXT[anhang],
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
  return { betreff: `Neuer Check-up über die Website – ${name}`, text, html: checkupHtml(daten, zeit, anhang) };
}
