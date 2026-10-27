import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RECHT } from "@/content/recht";
import { CTA, KONTAKT } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.impressum);

/**
 * Impressum mit dem Live-Text (Stand 27.10.2026), ergänzt um die Pflichtangaben,
 * die live fehlen (Registergericht, Anschrift der Inhaltsverantwortlichen).
 * Den Link zur EU-OS-Plattform gibt es nicht mehr, die Plattform ist seit 20.07.2025 eingestellt.
 */
export default function ImpressumPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Impressum</h1>
        </div>
      </section>
      <Breadcrumbs name="Impressum" path={PAGES.impressum.path} />

      <section className="container-site max-w-3xl space-y-8 py-12">
        <div>
          <h2 className="text-xl">Angaben gemäß § 5 DDG</h2>
          <address className="mt-3 not-italic leading-relaxed">
            {RECHT.firma}
            <br />
            {KONTAKT.strasse}
            <br />
            {KONTAKT.plzOrt}
          </address>
        </div>

        <div>
          <h2 className="text-xl">Vertretungsberechtigte</h2>
          <p className="mt-3">
            Vertretungsberechtigt als geschäftsführende Gesellschafter:
            <br />
            {RECHT.vertretung}
          </p>
        </div>

        <div>
          <h2 className="text-xl">Registereintrag</h2>
          <p className="mt-3">
            Registergericht: {RECHT.registergericht}
            <br />
            Registernummer: {RECHT.registernummer}
          </p>
        </div>

        <div>
          <h2 className="text-xl">Umsatzsteuer-ID</h2>
          <p className="mt-3">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {RECHT.ustId}</p>
        </div>

        <div>
          <h2 className="text-xl">Kontakt</h2>
          <p className="mt-3 leading-relaxed">
            Telefon{" "}
            <a href={CTA.tel} className="underline">
              {KONTAKT.telefonAnzeige}
            </a>
            <br />
            E-Mail{" "}
            <a href={CTA.mailRecht} className="underline">
              {KONTAKT.mailRecht}
            </a>
            <br />
            WhatsApp{" "}
            <a href={CTA.whatsappAllgemein} target="_blank" rel="noopener noreferrer" className="underline">
              {KONTAKT.telefonAnzeige}
            </a>
          </p>
          <p className="mt-3">
            <strong>GYM is OPEN 24/7.</strong> {RECHT.buero}
          </p>
        </div>

        <div>
          <h2 className="text-xl">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="mt-3">
            {RECHT.verantwortlichInhalt}
            <br />
            {KONTAKT.strasse}, {KONTAKT.plzOrt}
          </p>
        </div>

        <div>
          <h2 className="text-xl">Folgen Sie uns</h2>
          <ul className="mt-3 flex gap-6">
            <li>
              <a href={CTA.facebook} target="_blank" rel="noopener noreferrer" className="underline">
                Facebook
              </a>
            </li>
            <li>
              <a href={CTA.instagram} target="_blank" rel="noopener noreferrer" className="underline">
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl">Verbraucherstreitbeilegung</h2>
          <p className="mt-3">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </>
  );
}
