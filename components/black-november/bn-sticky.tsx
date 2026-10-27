import { BnCta } from "./bn-cta";
import { BN_STICKY_CTA } from "./inhalt";

/**
 * Mobile Sticky-CTA (unter 900 px). Startet versteckt und ohne Fokus; die Runtime schaltet
 * data-show, aria-hidden und tabIndex beim Scrollen über das Ende des Heros um. Weil das vor
 * der Hydration passieren kann, unterdrückt suppressHydrationWarning die Attribut-Abweichung.
 * z-50: unter dem Consent-Banner (z-[60]).
 */
export function BnSticky() {
  return (
    <div
      data-bn-sticky=""
      data-show="false"
      aria-hidden="true"
      suppressHydrationWarning
      className="fixed inset-x-0 bottom-0 z-50 translate-y-[110%] bg-[rgba(11,11,11,.94)] px-3.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] transition-transform duration-[250ms] ease-[ease] data-[show=true]:translate-y-0 motion-reduce:transition-none min-[900px]:hidden"
    >
      <BnCta
        position="sticky"
        label={BN_STICKY_CTA}
        tabIndex={-1}
        className="max-w-none min-h-[54px] text-[17px] shadow-none hover:shadow-none"
      />
    </div>
  );
}
