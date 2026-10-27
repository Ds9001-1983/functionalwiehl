import { BN_ERSPARNIS, BN_FUSSNOTE, BN_PREIS, BN_STATT } from "@/content/black-november";
import { CTA } from "@/lib/cta";

/**
 * Black-November-Teaser (BN26) direkt nach dem Hero, Inhalt und Farben wie live
 * (#0b0b0b / #fff3a3, Systemschrift), nur die Überschrift im Redesign-Font.
 *
 * RÜCKBAU von Hand nach dem Kampagnenende (BN_AKTION_ENDE, 09.11.2026 23:59):
 * Komponente samt Einbindung in app/(site)/page.tsx und die BN-Tests in
 * tests/startseite.spec.ts löschen. Ab dem 10.11. schlägt der Datumstest dort fehl,
 * solange der Teaser noch steht.
 */
export function BlackNovemberTeaser() {
  return (
    <section
      id="black-november-section"
      aria-labelledby="fbn-title"
      className="relative isolate scroll-mt-24 overflow-hidden bg-bn-ink font-bn text-white"
    >
      {/* Wasserzeichen „50 %“: rein dekorativ (live ::before mit leerem Alt-Text) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 right-[-2%] -z-10 whitespace-nowrap text-[52vw] leading-none font-black tracking-[-0.04em] text-transparent [-webkit-text-stroke:2px_rgba(255,243,163,0.09)] min-[901px]:top-1/2 min-[901px]:bottom-auto min-[901px]:-translate-y-1/2 min-[901px]:text-[clamp(160px,24vw,360px)]"
      >
        50 %
      </span>

      <div className="container-site grid items-center gap-6 py-10 min-[901px]:grid-cols-[1.25fr_1fr] min-[901px]:gap-12 min-[901px]:py-16">
        <div>
          <p className="mb-3.5 inline-block rounded-full bg-bn-gelb px-3 py-1.5 text-[11px] leading-tight font-extrabold tracking-[0.05em] text-bn-ink uppercase min-[901px]:mb-4.5 min-[901px]:px-3.5 min-[901px]:text-[13px] min-[901px]:tracking-[0.08em]">
            Black November · nur für kurze Zeit
          </p>
          <h2
            id="fbn-title"
            className="text-[clamp(38px,5.2vw,68px)] leading-[1.02] text-white"
          >
            Black November <span className="block text-bn-gelb">50 % auf dein Abo</span>
          </h2>
          <p className="mt-3.5 max-w-[34ch] text-[17px] leading-normal font-medium text-[#e9e9e9] min-[901px]:text-[clamp(17px,1.6vw,21px)]">
            6 Monate trainieren zum <strong className="font-extrabold text-white">halben Preis</strong> – in
            deinem Studio mitten in Wiehl, <strong className="font-extrabold text-white">24/7 geöffnet</strong>.
          </p>
        </div>

        <div className="rounded-[22px] border border-bn-gelb/20 bg-linear-160 from-bn-gelb/7 to-bn-gelb/0 to-60% px-5 pt-5.5 pb-5 min-[901px]:px-7.5 min-[901px]:pt-7.5 min-[901px]:pb-6.5">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 leading-none">
            <span className="text-[clamp(46px,5vw,64px)] font-black tracking-[-0.02em] text-bn-gelb">
              {BN_PREIS}
            </span>
            <span className="text-lg font-bold">/ Monat*</span>
            <span className="text-[17px] font-semibold text-bn-grau">
              statt <s className="decoration-2">{BN_STATT}</s>
            </span>
          </p>
          <p className="mt-2 mb-4.5 inline-block rounded-lg bg-bn-gelb/12 px-3 py-1.5 text-[15px] font-extrabold text-bn-gelb min-[901px]:mt-2.5 min-[901px]:mb-5.5">
            Du sparst {BN_ERSPARNIS}
          </p>
          {/* Bewusst <a> statt <Link>: voller Seitenaufruf wie live, damit die LP-Runtime
              (Pixel, Aktionscode) genauso startet wie aus der Anzeige. UTM exakt aus lib/cta.ts. */}
          <a
            href={CTA.blackNovemberLp}
            className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-bn-gelb px-6 py-4 text-[17px] leading-tight font-extrabold text-bn-ink transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(255,243,163,0.25)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0 min-[901px]:text-lg"
          >
            Jetzt zum Angebot
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 flex-none"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
          <p className="mt-4 text-[13px] leading-normal text-bn-grau">{BN_FUSSNOTE}</p>
        </div>
      </div>
    </section>
  );
}
