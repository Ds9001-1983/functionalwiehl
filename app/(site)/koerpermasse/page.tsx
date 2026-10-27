import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { KoerpermasseFormular } from "@/components/koerpermasse-formular";
import { KOERPERMASSE_TEXTE } from "@/content/koerpermasse";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.koerpermasse);

/**
 * „Körpermaße Digital“ wie live (/koerpermasse/, indexierbar, von der Startseite über den
 * Galerie-Teaser verlinkt). Mitglieder erfassen 8 Umfänge; der Versand geht per Mail an
 * das Studio (app/api/koerpermasse/route.ts). Die Seite bleibt statisch.
 */
export default function KoerpermassePage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream sm:text-4xl">{KOERPERMASSE_TEXTE.titel}</h1>
          <p className="mt-2 text-lg text-cream/85">{KOERPERMASSE_TEXTE.untertitel}</p>
        </div>
      </section>
      <Breadcrumbs name={KOERPERMASSE_TEXTE.titel} path={PAGES.koerpermasse.path} />

      <section className="container-site max-w-lg py-10">
        <KoerpermasseFormular />
      </section>
    </>
  );
}
