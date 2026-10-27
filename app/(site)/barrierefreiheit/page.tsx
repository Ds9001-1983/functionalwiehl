import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KONTAKT, CTA } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.barrierefreiheit);

/**
 * Erklärung zur Barrierefreiheit (BFSG / EN 301 549).
 * ENTWURF — juristische Endprüfung ausstehend (docs/TODO-recht.md).
 */
export default function BarrierefreiheitPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Erklärung zur Barrierefreiheit</h1>
        </div>
      </section>
      <Breadcrumbs name="Barrierefreiheit" path={PAGES.barrierefreiheit.path} />

      <section className="container-site max-w-3xl space-y-8 py-12">
        <p className="rounded-card bg-cta/40 p-4 text-sm">
          <strong>Hinweis (Prototyp):</strong> Diese Erklärung ist ein Entwurf und wird vor
          Veröffentlichung juristisch geprüft und mit den Ergebnissen einer formellen Prüfung
          finalisiert.
        </p>

        <div>
          <h2 className="text-xl">Unser Anspruch</h2>
          <p className="mt-3 text-muted-foreground">
            Die Functional Wiehl GmbH ist bemüht, ihre Website im Einklang mit dem
            Barrierefreiheitsstärkungsgesetz (BFSG) und der harmonisierten Norm EN 301 549
            barrierefrei zugänglich zu machen. Grundlage sind die Web Content Accessibility
            Guidelines (WCAG) 2.1 auf Konformitätsstufe AA.
          </p>
        </div>

        <div>
          <h2 className="text-xl">Stand der Vereinbarkeit</h2>
          <p className="mt-3 text-muted-foreground">
            Diese Website ist nach unserer Einschätzung <strong>weitgehend konform</strong> mit
            den genannten Anforderungen. Die Seite wurde mobil-zuerst und semantisch korrekt
            aufgebaut, ist per Tastatur bedienbar, nutzt durchgängige Überschriften-Strukturen,
            Alternativtexte für aussagekräftige Bilder und sichtbare Fokus-Markierungen.
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
            Trotz unserer Bemühungen können einzelne Inhalte noch nicht vollständig barrierefrei
            sein:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>
              Das eingebettete Studiovideo wird ohne Ton und ohne sprachliche Inhalte abgespielt;
              es transportiert keine für das Verständnis nötigen Informationen.
            </li>
            <li>
              Beim Klick auf WhatsApp-, Telefon- oder Terminbuchungs-Schaltflächen verlässt du
              unsere Website; für externe Dienste (WhatsApp, Calendly) können wir die
              Barrierefreiheit nicht gewährleisten.
            </li>
            <li>
              Der Kursplan wird derzeit manuell gepflegt; eine automatische Anbindung an unsere
              Studio-App ist in Vorbereitung.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl">Feedback und Kontakt</h2>
          <p className="mt-3 text-muted-foreground">
            Sind dir Barrieren aufgefallen oder benötigst du Inhalte in einer anderen Form? Melde
            dich gern – wir helfen weiter und verbessern uns:
          </p>
          <p className="mt-3">
            {KONTAKT.firma}
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
            Marktüberwachungsbehörde wenden. Für das BFSG ist dies die Marktüberwachungsstelle der
            Länder für die Barrierefreiheit von Produkten und Dienstleistungen (MLBF). Die genaue
            Zuständigkeit und Verfahrensangaben werden im Rahmen der finalen rechtlichen Prüfung
            ergänzt.
          </p>
        </div>
      </section>
    </>
  );
}
