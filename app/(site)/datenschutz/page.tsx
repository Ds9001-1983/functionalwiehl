import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KONTAKT } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.datenschutz);

/**
 * ENTWURF — beschreibt die tatsächlich eingesetzten Dienste dieser Site
 * (statt der Cookiebot/Newsletter-Texte der Alt-Site, die nie eingesetzt waren).
 * Vor Go-Live juristisch prüfen lassen → docs/TODO-recht.md, offener Punkt 2 im Plan.
 */
export default function DatenschutzPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Datenschutzerklärung</h1>
        </div>
      </section>
      <Breadcrumbs name="Datenschutz" path={PAGES.datenschutz.path} />

      <section className="container-site max-w-3xl space-y-8 py-12">
        <p className="rounded-card bg-cta/40 p-4 text-sm">
          <strong>Hinweis (Prototyp):</strong> Diese Datenschutzerklärung ist ein strukturierter
          Entwurf auf Basis der tatsächlich eingesetzten Dienste und wird vor Veröffentlichung
          juristisch geprüft und finalisiert.
        </p>

        <div>
          <h2 className="text-xl">1. Verantwortlicher</h2>
          <p className="mt-3">
            {KONTAKT.firma}, {KONTAKT.strasse}, {KONTAKT.plzOrt}
            <br />
            Telefon: {KONTAKT.telefonAnzeige} · E-Mail: {KONTAKT.mail}
          </p>
        </div>

        <div>
          <h2 className="text-xl">2. Hosting (Vercel)</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf der Seite verarbeitet
            Vercel technisch notwendige Daten (IP-Adresse, Datum/Uhrzeit, aufgerufene Seite,
            Browser-Informationen) in Server-Logfiles. Rechtsgrundlage: Art. 6 Abs. 1 lit. f
            DSGVO (berechtigtes Interesse am sicheren Betrieb). Mit Vercel besteht ein
            Auftragsverarbeitungsvertrag; die Übermittlung in die USA stützt sich auf das EU-US
            Data Privacy Framework bzw. Standardvertragsklauseln.
          </p>
        </div>

        <div>
          <h2 className="text-xl">3. Cookies & Einwilligung</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Statistik- und Marketing-Dienste laden erst nach deiner Einwilligung über unseren
            Cookie-Banner (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Deine Entscheidung speichern
            wir 12 Monate im Cookie <code>fw_consent</code> (technisch notwendig). Du kannst
            deine Einwilligung jederzeit über „Cookie-Einstellungen“ im Footer widerrufen.
          </p>
        </div>

        <div>
          <h2 className="text-xl">4. Google Analytics 4 (Statistik, nur nach Einwilligung)</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Zur Auswertung der Seitennutzung setzen wir Google Analytics 4 (Google Ireland Ltd.)
            mit IP-Anonymisierung ein. Es werden Nutzungsereignisse (z.&nbsp;B. Seitenaufrufe,
            Klicks auf Kontakt-Buttons) verarbeitet. Rechtsgrundlage: deine Einwilligung.
            Widerruf jederzeit über die Cookie-Einstellungen.
          </p>
        </div>

        <div>
          <h2 className="text-xl">5. Meta Pixel (Marketing, nur nach Einwilligung)</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Zur Erfolgsmessung unserer Anzeigen auf Facebook und Instagram setzen wir das Meta
            Pixel (Meta Platforms Ireland Ltd.) ein. Verarbeitet werden Ereignisdaten wie
            Seitenaufrufe und Klicks auf Kontakt-Buttons. Rechtsgrundlage: deine Einwilligung.
            Es besteht eine gemeinsame Verantwortlichkeit mit Meta für die Datenerhebung.
          </p>
        </div>

        <div>
          <h2 className="text-xl">6. Kontaktaufnahme über WhatsApp, Telefon, E-Mail & Calendly</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Unsere Kontakt-Buttons öffnen externe Dienste (WhatsApp der Meta Platforms Ireland
            Ltd., Calendly LLC) bzw. dein Telefon-/E-Mail-Programm. Erst mit dem Klick verlässt
            du unsere Website; es gelten dann die Datenschutzbestimmungen des jeweiligen
            Anbieters. Inhalte deiner Nachricht verarbeiten wir zur Bearbeitung deiner Anfrage
            (Art. 6 Abs. 1 lit. b DSGVO). Zur Bearbeitung von WhatsApp-Anfragen nutzen wir den
            Dienst Superchat (SuperX GmbH, Berlin) als Auftragsverarbeiter.
          </p>
        </div>

        <div>
          <h2 className="text-xl">7. Fitness- & Gesundheits-Check-up</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            In unserem Online-Check-up kannst du freiwillig Angaben zu Zielen, Training und
            Gesundheit machen. Gesundheitsangaben sind besondere Kategorien personenbezogener
            Daten (Art. 9 DSGVO); wir verarbeiten sie ausschließlich auf Grundlage deiner
            ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die du im Formular separat
            erteilst. Die Angaben nutzen wir nur zur Erstellung deiner Trainingsempfehlung und
            zur Kontaktaufnahme; eine Weitergabe an Dritte erfolgt nicht. Du kannst deine
            Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen ({KONTAKT.mail}).
          </p>
        </div>

        <div>
          <h2 className="text-xl">8. Deine Rechte</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
            Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie
            Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21
            DSGVO). Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren –
            zuständig für NRW: Landesbeauftragte für Datenschutz und Informationsfreiheit
            Nordrhein-Westfalen.
          </p>
        </div>
      </section>
    </>
  );
}
