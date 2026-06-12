import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KONTAKT } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.impressum);

export default function ImpressumPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Impressum</h1>
        </div>
      </section>
      <Breadcrumbs name="Impressum" path={PAGES.impressum.path} />

      <section className="container-site max-w-3xl space-y-6 py-12">
        <div>
          <h2 className="text-xl">Angaben gemäß § 5 DDG</h2>
          <address className="mt-3 not-italic leading-relaxed">
            {KONTAKT.firma}
            <br />
            {KONTAKT.strasse}
            <br />
            {KONTAKT.plzOrt}
          </address>
        </div>

        <div>
          <h2 className="text-xl">Vertreten durch</h2>
          <p className="mt-3">
            Geschäftsführende Gesellschafter: Peter Nelles und Cornelia Nelles
          </p>
        </div>

        <div>
          <h2 className="text-xl">Kontakt</h2>
          <p className="mt-3">
            Telefon: {KONTAKT.telefonAnzeige}
            <br />
            E-Mail: {KONTAKT.mail}
          </p>
        </div>

        <div>
          <h2 className="text-xl">Registereintrag</h2>
          <p className="mt-3">
            Handelsregister: HRB 54866
            <br />
            {/* TODO (docs/TODO-recht.md): Registergericht vom Kunden bestätigen
                lassen (vermutlich Amtsgericht Köln) — Pflichtangabe! */}
            Registergericht: <em>[wird ergänzt – Bestätigung des Registergerichts ausstehend]</em>
          </p>
        </div>

        <div>
          <h2 className="text-xl">Umsatzsteuer-ID</h2>
          <p className="mt-3">
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE240642364
          </p>
        </div>

        <div>
          <h2 className="text-xl">Verantwortlich für den Inhalt</h2>
          <p className="mt-3">
            Cornelia Nelles
            <br />
            {KONTAKT.strasse}, {KONTAKT.plzOrt}
          </p>
        </div>

        <div>
          <h2 className="text-xl">EU-Streitschlichtung</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
            bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </>
  );
}
