import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhoneIcon, WhatsAppIcon } from "@/components/cta-buttons";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { VideoSection } from "@/components/sections/video-section";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <section className="grain bg-brand-gradient">
        <div className="container-site py-16 sm:py-20">
          <span className="eyebrow text-cta">
            <span aria-hidden="true" className="h-px w-8 bg-cta/70" />
            Kontakt & Anfahrt
          </span>
          <h1 className="mt-4 text-display text-cream">So findest du uns in Wiehl</h1>
          <p className="mt-5 max-w-xl text-cream/85">
            Der schnellste Weg zu uns ist WhatsApp – oder du rufst einfach an.
          </p>
        </div>
      </section>
      <Breadcrumbs name="Kontakt" path={PAGES.kontakt.path} />

      {/* Kontakt-Schnellzeile: große Touch-Buttons (Daumen-Ergonomie) */}
      <Reveal stagger className="container-site grid gap-3 py-12 sm:grid-cols-2">
        {KONTAKT_WEGE.map((w) => (
          <TrackedLink
            key={w.label}
            href={w.href}
            event={w.event}
            params={w.params}
            {...(w.extern ? { target: "_blank", rel: "noopener" } : {})}
            className="group flex min-h-16 items-center gap-4 rounded-card border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-cream transition-colors group-hover:bg-brand/90">
              {w.icon}
            </span>
            <span>
              <span className="block font-bold text-brand">{w.label}</span>
              <span className="block text-sm text-muted-foreground">{w.sub}</span>
            </span>
          </TrackedLink>
        ))}
      </Reveal>

      <section className="bg-sand">
        <div className="container-site grid gap-8 py-16 sm:py-20 md:grid-cols-2">
          <div>
            <SectionHeading as="h2" eyebrow="Zeiten" title="Öffnungs- & Betreuungszeiten" />
            <p className="mt-5 font-heading text-3xl font-black text-brand">{OEFFNUNGSZEITEN.zugang}</p>
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
            <SectionHeading as="h2" eyebrow="Anfahrt" title="So kommst du her" />
            <address className="mt-5 not-italic leading-relaxed">
              <strong>{KONTAKT.firma}</strong>
              <br />
              {KONTAKT.strasse}
              <br />
              {KONTAKT.plzOrt}
            </address>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "Kostenlose Parkplätze direkt vor Ort",
                "Bushaltestelle „Wiehl Zentrum“ – 2 Min. Fußweg",
                "Barrierefrei zugänglich",
                "Aus Oberwiehl, Bielstein, Marienhagen und Nümbrecht in wenigen Minuten erreichbar",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-whatsapp" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <a
              href={CTA.mapsRoute}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex min-h-12 items-center rounded-pill border-2 border-brand px-6 font-bold text-brand transition-colors hover:bg-brand/5"
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
