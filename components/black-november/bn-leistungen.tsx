import Image from "next/image";
import cardioBild from "@/public/img/black-november/cardiobereich.jpg";
import kurzhantelBild from "@/public/img/black-november/kurzhantel-bereich.jpg";
import flaecheBild from "@/public/img/black-november/trainingsflaeche-img-0612.jpg";
import { cn } from "@/lib/utils";
import { BN_H2, BN_LEAD, BN_SEKTION_ALT, BN_WRAP } from "./bn-cta";
import { BnKartenSymbol } from "./bn-icons";
import { BN_LEISTUNGEN } from "./inhalt";

const FOTO = "w-full rounded-[14px] aspect-[4/3] object-cover";

/** „Das bekommst du“: 4 Karten und 3 Studiofotos (mobil 2 Spalten, erstes Bild 16:9 über volle Breite) */
export function BnLeistungen() {
  return (
    <section aria-labelledby="bn-h2-was" className={BN_SEKTION_ALT}>
      <div className={BN_WRAP}>
        <h2 id="bn-h2-was" className={BN_H2}>
          {BN_LEISTUNGEN.h2}
        </h2>
        <p className={BN_LEAD}>{BN_LEISTUNGEN.lead}</p>
        <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2">
          {BN_LEISTUNGEN.karten.map((karte) => (
            <div key={karte.titel} className="rounded-[18px] border border-bn-rand bg-white p-[22px]">
              <div className="mb-3 flex size-11 items-center justify-center rounded-[12px] bg-bn-gelb">
                <BnKartenSymbol icon={karte.icon} className="size-6" />
              </div>
              <h3 className="mt-0 mb-1.5 text-[20px] text-bn-ink">{karte.titel}</h3>
              <p className="m-0 text-[#3a3a3a]">{karte.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-[26px] grid grid-cols-2 gap-2.5 min-[720px]:grid-cols-[2fr_1fr_1fr]">
          <Image
            src={flaecheBild}
            alt={BN_LEISTUNGEN.bilderAlt.flaeche}
            sizes="(min-width: 1080px) 510px, (min-width: 720px) 50vw, 100vw"
            className={cn(FOTO, "col-span-full aspect-video min-[720px]:col-auto min-[720px]:aspect-[4/3]")}
          />
          <Image
            src={kurzhantelBild}
            alt={BN_LEISTUNGEN.bilderAlt.kurzhantel}
            sizes="(min-width: 1080px) 255px, (min-width: 720px) 25vw, 50vw"
            className={FOTO}
          />
          <Image
            src={cardioBild}
            alt={BN_LEISTUNGEN.bilderAlt.cardio}
            sizes="(min-width: 1080px) 255px, (min-width: 720px) 25vw, 50vw"
            className={FOTO}
          />
        </div>
      </div>
    </section>
  );
}
