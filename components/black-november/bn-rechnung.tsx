import { cn } from "@/lib/utils";
import { BN_RECHNUNG } from "@/content/black-november";
import { BN_H2, BN_LEAD, BN_SEKTION, BN_WRAP } from "./bn-cta";

const ZELLE = "border-b border-[rgba(255,255,255,.14)] px-0 py-3 text-left";
const WERT = "text-right font-extrabold whitespace-nowrap";
const SPAREN = "border-b-0 text-[20px] text-bn-gelb";

/** #angebot „So viel sparst du“ – Ziel des Skip-Links */
export function BnRechnung() {
  return (
    <section id="angebot" aria-labelledby="bn-h2-calc" className={BN_SEKTION}>
      <div className={BN_WRAP}>
        <h2 id="bn-h2-calc" className={BN_H2}>
          {BN_RECHNUNG.h2}
        </h2>
        <p className={BN_LEAD}>{BN_RECHNUNG.lead}</p>
        <div className="max-w-[620px] rounded-[20px] bg-bn-ink p-[26px] text-white">
          <table className="w-full border-collapse text-[17px]">
            <caption className="mb-1.5 text-left text-[20px] font-extrabold text-bn-gelb">{BN_RECHNUNG.caption}</caption>
            <tbody>
              {BN_RECHNUNG.zeilen.map((zeile) => (
                <tr key={zeile.label}>
                  <th scope="row" className={cn(ZELLE, "font-bold")}>
                    {zeile.label}
                  </th>
                  <td className={cn(ZELLE, WERT)}>
                    {"statt" in zeile && <s className="mr-2 font-medium text-[#9a9a9a]">{zeile.statt}</s>}
                    {zeile.wert}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className={cn(ZELLE, "font-bold", SPAREN)}>
                  {BN_RECHNUNG.sparen.label}
                </th>
                <td className={cn(ZELLE, WERT, SPAREN)}>{BN_RECHNUNG.sparen.wert}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3.5 mb-0 max-w-[620px] text-[14px] text-[#555]">{BN_RECHNUNG.fussnote}</p>
      </div>
    </section>
  );
}
