import type { ReactNode } from "react";
import { Accessibility, Bus, Car, Clock, Mail, MapPin } from "lucide-react";
import { CalendlyCta, PhoneIcon, WhatsAppCta, WhatsAppIcon } from "@/components/cta-buttons";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { BETREUUNGSZEITEN, CTA, KONTAKT } from "@/lib/cta";
import { StudioVideo } from "./studio-video";

const linkStil = "font-semibold text-brand underline-offset-4 hover:underline";

/**
 * #kontakt wie live: Öffnungszeiten (BETREUUNGSZEITEN), Kontakt & Anfahrt, die Buttons
 * „Kontakt über WhatsApp“ und „Jetzt Telefontermin vereinbaren“ sowie das Studio-Video
 * unter „So findest du uns“.
 */
export function KontaktSection({ index }: { index?: string }) {
  return (
    // overflow-x-clip: der versetzte Zierrahmen am Video ragt mobil sonst 8 px über den Rand
    <section id="kontakt" className="scroll-mt-24 overflow-x-clip bg-sand">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading index={index} eyebrow="Kontakt" title="Kontakt & Öffnungszeiten" />

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-2 text-xl">
                <Clock className="size-5 shrink-0" aria-hidden="true" />
                Öffnungszeiten
              </h3>
              <dl className="mt-4 divide-y divide-border rounded-card border border-border bg-white px-5">
                {[BETREUUNGSZEITEN.zugang, ...BETREUUNGSZEITEN.zeilen].map((z) => (
                  <div key={z.label} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                    <dt className="font-semibold text-foreground">{z.label}</dt>
                    <dd className="font-bold tabular-nums text-brand">{z.wert}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-xl">
                <MapPin className="size-5 shrink-0" aria-hidden="true" />
                Kontakt & Anfahrt
              </h3>
              <ul className="mt-4 space-y-3 text-[15px]">
                <Zeile icon={<MapPin className="size-4.5" />}>
                  <address className="not-italic">
                    <a href={CTA.maps} target="_blank" rel="noopener noreferrer" className={linkStil}>
                      {KONTAKT.strasse}
                      <br />
                      {KONTAKT.plzOrt}
                    </a>
                  </address>
                </Zeile>
                <Zeile icon={<PhoneIcon className="size-4.5" />}>
                  <span className="sr-only">Telefon: </span>
                  <TrackedLink href={CTA.tel} event="tel_click" params={{ position: "kontakt" }} className={linkStil}>
                    {KONTAKT.telefonAnzeige}
                  </TrackedLink>
                </Zeile>
                <Zeile icon={<WhatsAppIcon className="size-4.5" />}>
                  <span className="sr-only">WhatsApp: </span>
                  <TrackedLink
                    href={CTA.whatsappAllgemein}
                    event="whatsapp_click"
                    params={{ position: "kontakt", preset: "allgemein" }}
                    className={linkStil}
                  >
                    {KONTAKT.telefonAnzeige}
                  </TrackedLink>
                </Zeile>
                <Zeile icon={<Mail className="size-4.5" />}>
                  <span className="sr-only">E-Mail: </span>
                  <TrackedLink href={CTA.mail} event="mail_click" params={{ position: "kontakt" }} className={linkStil}>
                    {KONTAKT.mail}
                  </TrackedLink>
                </Zeile>
                <Zeile icon={<Car className="size-4.5" />}>Kostenlose Parkplätze direkt vor Ort</Zeile>
                <Zeile icon={<Bus className="size-4.5" />}>Bushaltestelle „Wiehl Zentrum“ 2 Min. Fußweg</Zeile>
                <Zeile icon={<Accessibility className="size-4.5" />}>Barrierefrei zugänglich</Zeile>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <WhatsAppCta ziel="allgemein" position="kontakt" />
              <CalendlyCta position="kontakt" variant="ghost" />
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl">
              <MapPin className="size-5 shrink-0" aria-hidden="true" />
              So findest du uns
            </h3>
            <div className="relative isolate mt-4">
              <span
                aria-hidden="true"
                className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-card border-2 border-brand/15"
              />
              <StudioVideo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Zeile({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-whatsapp">
        {icon}
      </span>
      <div>{children}</div>
    </li>
  );
}
