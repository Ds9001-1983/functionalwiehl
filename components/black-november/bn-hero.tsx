import Image from "next/image";
import heroBild from "@/public/img/black-november/trainingsflaeche-img-0612.jpg";
import { CTA } from "@/lib/cta";
import { BN_HERO } from "@/content/black-november";
import { BN_CTA_KLASSEN, BN_WRAP, BnCta } from "./bn-cta";

/**
 * Hero der LP. Live ist IMG_0612 ein CSS-Hintergrund mit Preload (768/1536 px); hier
 * next/image mit `preload` (LCP-Bild, ersetzt das veraltete `priority`) und dem Verlauf darüber.
 */
export function BnHero() {
  return (
    <section data-bn-hero="" aria-labelledby="bn-h1" className="relative overflow-hidden bg-bn-ink text-white">
      <Image src={heroBild} alt="" fill preload sizes="100vw" className="object-cover object-center" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,.72)_0%,rgba(11,11,11,.86)_55%,#0b0b0b_100%)]"
      />
      <div className={`${BN_WRAP} relative pt-9 pb-11`}>
        <span className="inline-block rounded-full bg-bn-gelb px-3 py-1.5 text-[13px] font-extrabold tracking-[.08em] text-bn-ink uppercase">
          {BN_HERO.eyebrow}
        </span>
        <h1
          id="bn-h1"
          className="mt-4 mb-2 text-[clamp(44px,12vw,96px)] leading-[.95] font-black tracking-[-.02em] text-white"
        >
          {BN_HERO.h1} <span className="block text-bn-gelb">{BN_HERO.h1Akzent}</span>
        </h1>
        <p className="mt-0 mb-[22px] max-w-[640px] text-[clamp(18px,4.6vw,22px)] text-[#f2f2f2]">
          6 Monate trainieren zum <strong className="text-bn-gelb">halben Preis</strong> – in deinem Studio
          mitten in Wiehl, <strong className="text-bn-gelb">24/7 geöffnet</strong>.
        </p>
        {/* Live steht der Vorlesetext als aria-label am <p>; das ist dort laut ARIA unzulässig
            und wird von Screenreadern oft ignoriert, deshalb hier als sr-only-Text. */}
        <p className="mt-0 mb-[22px] flex flex-wrap items-baseline gap-3">
          <span className="sr-only">{BN_HERO.preisAria}</span>
          <span aria-hidden="true" className="text-[clamp(40px,10vw,64px)] leading-none font-black text-bn-gelb">
            {BN_HERO.preis} <small className="text-[.38em] font-bold text-white">{BN_HERO.proMonat}</small>
          </span>
          <span aria-hidden="true" className="text-[20px] text-[#cfcfcf] line-through">
            {BN_HERO.statt}
          </span>
        </p>
        <BnCta position="hero" label={BN_HERO.cta} icon="voll" />
        <noscript>
          <p>
            <a className={BN_CTA_KLASSEN} href={CTA.whatsappBlackNovemberNoscript}>
              {BN_HERO.cta}
            </a>
          </p>
        </noscript>
        <p className="mt-3 mb-0 text-[14px] text-[#d6d6d6]">{BN_HERO.micro}</p>
        <ul aria-label={BN_HERO.chipsAria} className="mt-[22px] flex list-none flex-wrap gap-2 p-0">
          {BN_HERO.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-[rgba(255,243,163,.45)] px-3 py-1.5 text-[14px] text-white"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
