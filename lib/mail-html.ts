/**
 * HTML-Gerüst der Formular-Mails an gym@ (Check-up, Körpermaße). Die Text-Fassung geht immer
 * mit (multipart/alternative), das HTML ist nur die schönere Ansicht derselben Angaben.
 *
 * - Tabellen-Layout mit Inline-Styles, höchstens 600 px breit: So sehen Gmail, Outlook und
 *   Apple Mail gleich aus. Keine Bilder, keine externen Inhalte (lib/mailer.ts sperrt URLs).
 * - Jeder Wert aus einem Formular läuft durch esc(). Links nur tel: und mailto: aus geprüften Werten.
 * - Die Vorschauzeile (Posteingang, Sperrbildschirm) enthält nie Gesundheitsdaten.
 */

export const MAIL_FARBEN = {
  brand: "#2e3192",
  creme: "#fbf3d5",
  gelb: "#fff3a4",
  braun: "#503c2a",
  text: "#1f2140",
  grau: "#6b6f86",
  linie: "#e8e4d4",
  flaeche: "#f6f3e8",
  achtung: "#fff6c2",
  gut: "#e7f4ea",
  gutText: "#1f5f32",
} as const;

export const MAIL_SCHRIFT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const F = MAIL_FARBEN;
const SCHRIFT = MAIL_SCHRIFT;

const ZEICHEN: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** HTML-Escaping für Text und Attribute */
export function esc(wert: string | number): string {
  return String(wert).replace(/[&<>"']/g, (z) => ZEICHEN[z]);
}

/** tel:-Ziel aus einer Telefonnummer wie „0151 / 123 456-78“, null bei zu wenig Ziffern */
export function telHref(telefon: string): string | null {
  const ziffern = telefon.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return ziffern.replace(/\D/g, "").length >= 6 ? `tel:${ziffern}` : null;
}

/** Knopf als Tabelle (Outlook kennt kein padding an Links) */
export function knopf(href: string, text: string, art: "gelb" | "rahmen" = "gelb"): string {
  const farbe = art === "gelb" ? `background:${F.gelb};color:${F.braun};border:2px solid ${F.gelb};` : `background:#ffffff;color:${F.brand};border:2px solid ${F.brand};`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 8px 0;"><tr><td style="border-radius:999px;${farbe}"><a href="${esc(href)}" style="display:inline-block;padding:10px 20px;font-family:${SCHRIFT};font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;color:${art === "gelb" ? F.braun : F.brand};">${esc(text)}</a></td></tr></table>`;
}

/** Überschrift eines Abschnitts in Kapitälchen-Optik */
export function abschnittTitel(titel: string): string {
  return `<p style="margin:28px 0 10px;font-family:${SCHRIFT};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${F.brand};">${esc(titel)}</p>`;
}

export type MailZeile = {
  label: string;
  wert: string;
  /** eingerückte Detailfrage nach einem „Ja“ */
  detail?: boolean;
  /** gelb hinterlegt, z. B. eine Erkrankung */
  markiert?: boolean;
};

/** Zweispaltige Liste Frage → Antwort */
export function zeilenTabelle(zeilen: readonly MailZeile[]): string {
  const tr = zeilen
    .map((z, i) => {
      const grund = z.markiert ? F.achtung : i % 2 ? "#ffffff" : F.flaeche;
      const label = `${z.detail ? "↳ " : ""}${esc(z.label)}`;
      return `<tr style="background:${grund};"><td style="padding:10px 14px${z.detail ? " 10px 30px" : ""};font-family:${SCHRIFT};font-size:14px;line-height:1.4;color:${F.grau};vertical-align:top;width:58%;">${label}</td><td style="padding:10px 14px;font-family:${SCHRIFT};font-size:14px;line-height:1.4;color:${F.text};font-weight:700;vertical-align:top;">${esc(z.wert)}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${F.linie};border-radius:12px;overflow:hidden;">${tr}</table>`;
}

/** Hinweiskasten (gelb = beachten, grün = unauffällig, neutral = Einwilligungen u. Ä.) */
export function kasten(inhalt: string, art: "achtung" | "gut" | "neutral" = "neutral"): string {
  const stil =
    art === "achtung"
      ? `background:${F.achtung};border:1px solid #efe08a;color:${F.braun};`
      : art === "gut"
        ? `background:${F.gut};border:1px solid #cfe6d4;color:${F.gutText};`
        : `background:${F.flaeche};border:1px solid ${F.linie};color:${F.grau};`;
  return `<div style="${stil}border-radius:12px;padding:14px 16px;font-family:${SCHRIFT};font-size:14px;line-height:1.5;">${inhalt}</div>`;
}

/** Kontaktkarte: Name groß, darunter Angaben und Knöpfe */
export function kontaktKarte(name: string, angaben: readonly { label: string; wert: string; href?: string | null }[], knoepfe: string): string {
  const zeilen = angaben
    .map((a) => {
      const wert = a.href
        ? `<a href="${esc(a.href)}" style="color:${F.brand};text-decoration:none;font-weight:700;">${esc(a.wert)}</a>`
        : `<span style="color:${F.text};font-weight:700;">${esc(a.wert)}</span>`;
      return `<tr><td style="padding:3px 12px 3px 0;font-family:${SCHRIFT};font-size:14px;color:${F.grau};white-space:nowrap;">${esc(a.label)}</td><td style="padding:3px 0;font-family:${SCHRIFT};font-size:15px;">${wert}</td></tr>`;
    })
    .join("");
  return `<div style="border:1px solid ${F.linie};border-radius:16px;padding:20px 20px 12px;background:#ffffff;">
<p style="margin:0 0 10px;font-family:${SCHRIFT};font-size:22px;line-height:1.25;font-weight:800;color:${F.text};">${esc(name)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">${zeilen}</table>
${knoepfe}
</div>`;
}

/**
 * Komplette Mail: Kopf in Indigo, weiße Karte mit dem Inhalt, Fußzeile.
 * `vorschau` erscheint im Posteingang neben dem Betreff – ohne Gesundheitsdaten.
 */
export function mailHtml(teile: { titel: string; unterzeile: string; vorschau: string; inhalt: string; fuss: string }): string {
  const { titel, unterzeile, vorschau, inhalt, fuss } = teile;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(titel)}</title>
<style>
@media (max-width: 480px) {
  .fw-aussen { padding: 12px 6px !important; }
  .fw-kopf { padding: 22px 18px 20px !important; }
  .fw-karte { padding: 18px 14px 22px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background:${F.creme};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${F.creme};">${esc(vorschau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${F.creme};">
<tr><td align="center" class="fw-aussen" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td class="fw-kopf" style="background:${F.brand};border-radius:20px 20px 0 0;padding:26px 28px 24px;">
<p style="margin:0 0 6px;font-family:${SCHRIFT};font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${F.gelb};">Functional Wiehl · Website</p>
<h1 style="margin:0;font-family:${SCHRIFT};font-size:26px;line-height:1.2;font-weight:800;color:#ffffff;">${esc(titel)}</h1>
<p style="margin:8px 0 0;font-family:${SCHRIFT};font-size:14px;color:${F.creme};">${esc(unterzeile)}</p>
</td></tr>
<tr><td class="fw-karte" style="background:#ffffff;border-radius:0 0 20px 20px;padding:24px 28px 28px;">
${inhalt}
</td></tr>
<tr><td style="padding:18px 12px 0;font-family:${SCHRIFT};font-size:12px;line-height:1.5;color:${F.grau};text-align:center;">${fuss}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
