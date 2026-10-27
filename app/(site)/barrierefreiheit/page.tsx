import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BEHOERDEN, RECHT } from "@/content/recht";
import { CTA, KONTAKT } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.barrierefreiheit);

/**
 * Erklärung zur Barrierefreiheit (BFSG / EN 301 549), Selbstbewertung für den
 * One-Pager mit Körpermaße- und Rechtsseiten. Ob die Ausnahme für Kleinstunternehmen
 * greift, klärt Conny (docs/TODO-recht.md); dann wird es eine freiwillige Erklärung.
 */
export default function BarrierefreiheitPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Erklärung zur Barrierefreiheit</h1>
          <p className="mt-2 text-cream/85">
            Stand: {RECHT.stand}, Grundlage: Selbstbewertung
          </p>
        </div>
      </section>
      <Breadcrumbs name="Barrierefreiheit" path={PAGES.barrierefreiheit.path} />

      <section className="container-site max-w-3xl space-y-8 py-12">
        <div>
          <h2 className="text-xl">Unser Anspruch</h2>
          <p className="mt-3 text-muted-foreground">
            Die {RECHT.firma} ist bemüht, ihre Website im Einklang mit dem
            Barrierefreiheitsstärkungsgesetz (BFSG) und der harmonisierten Norm EN 301 549 barrierefrei
            zugänglich zu machen. Grundlage sind die Web Content Accessibility Guidelines (WCAG) 2.1 auf
            Konformitätsstufe AA.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Geltungsbereich</h2>
          <p className="mt-3 text-muted-foreground">
            Diese Erklärung gilt für die Website functional-wiehl.de: die Startseite mit den Bereichen
            Leistungen, Aktuelles, Preise, Check-up und Kontakt, die Seite Körpermaße Digital sowie
            Impressum, Datenschutzerklärung und diese Erklärung.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Stand der Vereinbarkeit</h2>
          <p className="mt-3 text-muted-foreground">
            Diese Website ist nach unserer Einschätzung <strong>weitgehend konform</strong> mit den
            genannten Anforderungen. Die Seite wurde mobil-zuerst und semantisch aufgebaut, ist per
            Tastatur bedienbar, nutzt durchgängige Überschriften-Strukturen, Alternativtexte für
            aussagekräftige Bilder und sichtbare Fokus-Markierungen. Die Menüpunkte führen direkt zu den
            Bereichen der Startseite.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Hilfen zur Bedienung auf dieser Seite</h2>
          <p className="mt-3 text-muted-foreground">
            Über die Schaltfläche <strong>„Barrierefreiheit“</strong> unten links kannst du die
            Darstellung an deine Bedürfnisse anpassen:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>✓ Schriftgröße in zwei Stufen vergrößern</li>
            <li>✓ Kontrast erhöhen</li>
            <li>✓ Animationen reduzieren</li>
            <li>✓ Links hervorheben</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Über den Link „Zum Inhalt springen“ (erscheint beim Tabben) gelangst du direkt zum
            Hauptinhalt. Deine Einstellungen werden lokal in deinem Browser gespeichert.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Bekannte Einschränkungen</h2>
          <p className="mt-3 text-muted-foreground">
            Trotz unserer Bemühungen können einzelne Inhalte noch nicht vollständig barrierefrei sein:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>
              Die Beiträge im Bereich „Aktuelles“ stammen aus unserem Instagram-Konto. Videos (Reels)
              erscheinen dort nur als Vorschaubild mit einem Link zu Instagram; die Videos selbst und
              ihre Untertitel liegen bei Instagram. Die Bildbeschreibung folgt dem Text des jeweiligen
              Beitrags.
            </li>
            <li>
              Beim Klick auf WhatsApp-, Telefon- oder Terminbuchungs-Schaltflächen verlässt du unsere
              Website; für externe Dienste (WhatsApp, Calendly, Instagram) können wir die
              Barrierefreiheit nicht gewährleisten.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl">Feedback und Kontakt</h2>
          <p className="mt-3 text-muted-foreground">
            Sind dir Barrieren aufgefallen oder benötigst du Inhalte in einer anderen Form? Melde dich
            gern – wir helfen weiter und verbessern uns:
          </p>
          <p className="mt-3">
            {RECHT.firma}
            <br />
            {KONTAKT.strasse}, {KONTAKT.plzOrt}
            <br />
            Telefon:{" "}
            <a href={CTA.tel} className="underline">
              {KONTAKT.telefonAnzeige}
            </a>
            <br />
            E-Mail:{" "}
            <a href={CTA.mail} className="underline">
              {KONTAKT.mail}
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl">Durchsetzungsverfahren</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Hilft dir unsere Rückmeldung nicht weiter, kannst du dich an die zuständige
            Marktüberwachungsbehörde wenden. Für das BFSG ist das die {BEHOERDEN.barrierefreiheit.name},{" "}
            {BEHOERDEN.barrierefreiheit.anschrift}, E-Mail {BEHOERDEN.barrierefreiheit.mail}. Auf ihrer
            Website{" "}
            <a
              href={BEHOERDEN.barrierefreiheit.web}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              www.mlbf-barrierefrei.de
            </a>{" "}
            kannst du Barrieren melden oder einen Antrag nach § 32 Abs. 1 BFSG stellen.
          </p>
        </div>
      </section>
    </>
  );
}
