import { BN_WRAP, BnCta } from "./bn-cta";
import { BN_ABSCHLUSS } from "./inhalt";

/**
 * Abschluss auf Gelb. Die Micro-Zeile hat live dieselbe Größe wie der Text darüber
 * (`.bn-final p` schlägt `.bn-micro`), nur die Farbe ist dunkler – hier 1:1 übernommen.
 */
export function BnAbschluss() {
  return (
    <section aria-labelledby="bn-h2-final" className="bg-bn-gelb py-[52px] text-center">
      <div className={BN_WRAP}>
        <h2 id="bn-h2-final" className="mt-0 mb-2 text-[clamp(30px,7vw,46px)] leading-[1.05] font-black text-bn-ink">
          {BN_ABSCHLUSS.h2}
        </h2>
        <p className="mx-auto mt-0 mb-[22px] max-w-[560px] text-[18px] text-[#1a1a1a]">{BN_ABSCHLUSS.text}</p>
        <BnCta position="final" label={BN_ABSCHLUSS.cta} icon="blase" />
        <p className="mx-auto mt-0 mb-[22px] max-w-[560px] text-[18px] text-[#333]">{BN_ABSCHLUSS.micro}</p>
      </div>
    </section>
  );
}
