import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhoneIcon, WhatsAppIcon } from "@/components/cta-buttons";
import { CtaBand } from "@/components/sections/cta-band";
import { VideoSection } from "@/components/sections/video-section";
import { TrackedLink } from "@/components/tracked-link";
import { CTA, KONTAKT, OEFFNUNGSZEITEN } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.kontakt);

const KONTAKT_WEGE = [
  {
    label: "WhatsApp",
    sub: "Antwort meist in wenigen Stunden",
    href: CTA.whatsappProbetraining,
    event: "whatsapp_click" as const,
    params: { position: "kontaktzeile" as const, preset: "probetraining" as const },
    icon: <WhatsAppIcon className="size-6" />,
    extern: false,
  },
  {
    label: KONTAKT.telefonAnzeige,
    sub: "Zu den Betreuungszeiten",
    href: CTA.tel,
    event: "tel_click" as const,
    params: { position: "kontaktzeile" as const },
    icon: <PhoneIcon className="size-6" />,
    extern: false,
  },
  {
    label: "Telefontermin buchen",
    sub: "Wunschtermin über Calendly",
    href: CTA.calendly,
    event: "calendly_click" as const,
    params: { position: "kontaktzeile" as const },
    icon: <span aria-hidden="true">📅</span>,
    extern: true,
  },
  {
    label: KONTAKT.mail,
    sub: "Für alles Schriftliche",
    href: CTA.mail,
    event: "mail_click" as const,
    params: { position: "kontaktzeile" as const },
    icon: <span aria-hidden="true">✉️</span>,
    extern: false,
  },
];

export default function KontaktPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-12">
          <h1 className="text-3xl text-cream sm:text-4xl">
            Kontakt & Anfahrt: So findest du uns in Wiehl
          </h1>
          <p className="mt-3 max-w-xl text-cream/90">
            Der schnellste Weg zu uns ist WhatsApp – oder du rufst einfach an.
          </p>
        </div>
      </section>
      <Breadcrumbs name="Kontakt" path={PAGES.kontakt.path} />

      {/* Kontakt-Schnellzeile: große Touch-Buttons (Daumen-Ergonomie) */}
      <section className="container-site grid gap-3 py-10 sm:grid-cols-2">
        {KONTAKT_WEGE.map((w) => (
          <TrackedLink
            key={w.label}
            href={w.href}
            event={w.event}
            params={w.params}
            {...(w.extern ? { target: "_blank", rel: "noopener" } : {})}
            className="flex min-h-16 items-center gap-4 rounded-card border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-cream">
              {w.icon}
            </span>
            <span>
              <span className="block font-bold text-brand">{w.label}</span>
              <span className="block text-sm text-muted-foreground">{w.sub}</span>
            </span>
          </TrackedLink>
        ))}
      </section>

      <section className="bg-muted">
        <div className="container-site grid gap-8 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-xl sm:text-2xl">Öffnungs- & Betreuungszeiten</h2>
            <p className="mt-3 text-2xl font-extrabold text-brand">{OEFFNUNGSZEITEN.zugang}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {OEFFNUNGSZEITEN.betreuung.map((z) => (
                <li key={z.tage} className="flex max-w-xs justify-between gap-4">
                  <span>Betreuung {z.tage}</span>
                  <span className="font-semibold">{z.zeit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl">Anfahrt</h2>
            <address className="mt-3 not-italic leading-relaxed">
              <strong>{KONTAKT.firma}</strong>
              <br />
              {KONTAKT.strasse}
              <br />
              {KONTAKT.plzOrt}
            </address>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>✓ Kostenlose Parkplätze direkt vor Ort</li>
              <li>✓ Bushaltestelle „Wiehl Zentrum“ – 2 Min. Fußweg</li>
              <li>✓ Barrierefrei zugänglich</li>
              <li>
                ✓ Aus Oberwiehl, Bielstein, Marienhagen und Nümbrecht in wenigen Minuten erreichbar
              </li>
            </ul>
            <a
              href={CTA.mapsRoute}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand hover:bg-brand/5"
            >
              Route in Google Maps öffnen
            </a>
          </div>
        </div>
      </section>

      <VideoSection />

      <CtaBand />
    </>
  );
}
