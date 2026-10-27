import { CTA } from "@/lib/cta";
import { BN_FAQ, BN_MAPS_URL } from "@/content/black-november";
import { BN_H2, BN_SEKTION_ALT, BN_WRAP } from "./bn-cta";

/** Natives <details> wie live (kein Accordion-Baustein): funktioniert ohne JS, +/– in bn.css */
function Frage({ frage, children }: { frage: string; children: React.ReactNode }) {
  return (
    <details className="border-b border-bn-faq py-1">
      <summary className="relative cursor-pointer list-none py-3.5 pr-8 pl-0 text-[18px] font-extrabold text-bn-ink">
        {frage}
      </summary>
      <p className="mt-0 mb-4 text-[#333]">{children}</p>
    </details>
  );
}

const LINK = "font-bold text-bn-ink underline underline-offset-2";

export function BnFaq() {
  return (
    <section aria-labelledby="bn-h2-faq" className={`bn-faq ${BN_SEKTION_ALT}`}>
      <div className={BN_WRAP}>
        <h2 id="bn-h2-faq" className={BN_H2}>
          {BN_FAQ.h2}
        </h2>
        <Frage frage={BN_FAQ.kosten.frage}>{BN_FAQ.kosten.antwort}</Frage>
        <Frage frage={BN_FAQ.startgebuehr.frage}>{BN_FAQ.startgebuehr.antwort}</Frage>
        <Frage frage={BN_FAQ.anmeldung.frage}>
          {BN_FAQ.anmeldung.antwort}{" "}
          <a href={CTA.tel} className={LINK}>
            {BN_FAQ.anmeldung.telefon}
          </a>
          .
        </Frage>
        <Frage frage={BN_FAQ.dauer.frage}>{BN_FAQ.dauer.antwort}</Frage>
        <Frage frage={BN_FAQ.anfahrt.frage}>
          {BN_FAQ.anfahrt.antwort}{" "}
          <a href={BN_MAPS_URL} target="_blank" rel="noopener" className={LINK}>
            {BN_FAQ.anfahrt.link}
          </a>
        </Frage>
      </div>
    </section>
  );
}
