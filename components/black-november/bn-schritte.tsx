import { BN_H2, BN_LEAD, BN_SEKTION, BN_WRAP, BnCta } from "./bn-cta";
import { BN_SCHRITTE } from "./inhalt";

/** „So einfach geht's“: nummerierte Schritte (Zähler in bn.css) und zweiter CTA */
export function BnSchritte() {
  return (
    <section aria-labelledby="bn-h2-wie" className={BN_SEKTION}>
      <div className={BN_WRAP}>
        <h2 id="bn-h2-wie" className={BN_H2}>
          {BN_SCHRITTE.h2}
        </h2>
        <p className={BN_LEAD}>{BN_SCHRITTE.lead}</p>
        <ol className="bn-schritte m-0 grid list-none gap-3.5 p-0 min-[720px]:grid-cols-3">
          {BN_SCHRITTE.schritte.map((schritt) => (
            <li key={schritt.titel} className="rounded-[18px] border border-bn-rand bg-white p-[22px]">
              <h3 className="mt-0 mb-1 text-[19px]">{schritt.titel}</h3>
              <p className="m-0 text-[#3a3a3a]">{schritt.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-[26px]">
          <BnCta position="steps" label={BN_SCHRITTE.cta} icon="blase" />
        </p>
      </div>
    </section>
  );
}
