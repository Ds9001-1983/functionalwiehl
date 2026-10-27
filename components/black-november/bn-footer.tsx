import { ConsentRevokeButton } from "@/components/consent/consent-banner";
import { CTA } from "@/lib/cta";
import { BN_FOOTER, BN_LINKS, BN_MAPS_URL } from "@/content/black-november";
import { BN_WRAP } from "./bn-cta";

const LINK = "text-white";

/**
 * Eigener Footer wie live (kein SiteFooter). Alle Links sind normale <a>: Die LP wird nur
 * per Dokument-Navigation verlassen, damit ihr Pixel (ohne Einwilligung) nicht auf die
 * Website mitwandert. „Cookie-Einstellungen“ öffnet den Banner (live: Complianz).
 * Unten mobil 120 px Luft für die Sticky-CTA.
 */
export function BnFooter() {
  return (
    <footer className="bg-bn-ink pt-[34px] pb-[120px] text-[15px] text-[#cfcfcf] min-[900px]:pb-10">
      <div className={BN_WRAP}>
        <strong className="text-white">{BN_FOOTER.firma}</strong>
        <br />
        <a href={BN_MAPS_URL} target="_blank" rel="noopener" className={LINK}>
          {BN_FOOTER.adresse}
        </a>
        <br />
        <a href={CTA.tel} className={LINK}>
          {BN_FOOTER.telefon}
        </a>{" "}
        ·{" "}
        <a href={CTA.mail} className={LINK}>
          {BN_FOOTER.mail}
        </a>
        <div className="mt-3 flex flex-wrap gap-x-[18px] gap-y-2">
          <a href={BN_LINKS.website} className={LINK}>
            {BN_FOOTER.website}
          </a>
          <a href={BN_LINKS.impressum} className={LINK}>
            {BN_FOOTER.impressum}
          </a>
          <a href={BN_LINKS.datenschutz} className={LINK}>
            {BN_FOOTER.datenschutz}
          </a>
          <ConsentRevokeButton className="cursor-pointer text-white" />
        </div>
        <p className="mt-5 mb-0 text-[13px] text-[#9a9a9a]">
          {BN_FOOTER.creditVor}
          <a href={BN_LINKS.superbrand} target="_blank" rel="noopener" className="text-bn-link no-underline">
            {BN_FOOTER.creditLink}
          </a>
          {BN_FOOTER.creditNach}
        </p>
      </div>
    </footer>
  );
}
