import Image from "next/image";
import Link from "next/link";
import logoWeiss from "@/public/img/functional-wiehl-logo-weiss-trans-schmal.png";
import { CTA, KONTAKT, OEFFNUNGSZEITEN } from "@/lib/cta";
import { NAV_ITEMS } from "@/lib/nav";
import { ConsentRevokeButton } from "./consent/consent-banner";
import { TrackedLink } from "./tracked-link";

export function SiteFooter() {
  return (
    <footer className="grain bg-brand-deep text-cream/75">
      {/* Editorialer Wortmarken-Block */}
      <div className="container-site border-b border-cream/10 py-12">
        <p className="font-heading text-display text-cream">
          Trainier mit uns.
        </p>
        <p className="mt-3 max-w-md text-cream/70">
          Dein Fitnessstudio in Wiehl – rund um die Uhr. Schreib uns, wir melden uns mit deinem
          Starttermin.
        </p>
      </div>

      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src={logoWeiss} alt="Functional Wiehl GmbH" className="h-10 w-auto" sizes="180px" />
          <p className="mt-4 text-sm">
            Ehemals INJOY Wiehl. Gleiches Team, gleicher Standort, neuer Name.
          </p>
        </div>

        <div>
          <p className="eyebrow text-cta">Kontakt</p>
          <address className="mt-4 text-sm not-italic leading-relaxed">
            {KONTAKT.firma}
            <br />
            {KONTAKT.strasse}
            <br />
            {KONTAKT.plzOrt}
          </address>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <TrackedLink href={CTA.tel} event="tel_click" params={{ position: "footer" }} className="transition-colors hover:text-cta">
                {KONTAKT.telefonAnzeige}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={CTA.mail} event="mail_click" params={{ position: "footer" }} className="transition-colors hover:text-cta">
                {KONTAKT.mail}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={CTA.whatsappProbetraining}
                event="whatsapp_click"
                params={{ position: "footer", preset: "probetraining" }}
                className="transition-colors hover:text-cta"
              >
                WhatsApp schreiben
              </TrackedLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cta">Öffnungszeiten</p>
          <p className="mt-4 text-sm font-semibold text-cream">{OEFFNUNGSZEITEN.zugang}</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {OEFFNUNGSZEITEN.betreuung.map((z) => (
              <li key={z.tage}>
                Betreuung {z.tage}: {z.zeit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cta">Seiten</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-cta">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/probetraining/" className="transition-colors hover:text-cta">
                Probetraining
              </Link>
            </li>
            <li>
              <Link href="/frauen-ab-50/" className="transition-colors hover:text-cta">
                Frauen ab 50
              </Link>
            </li>
            <li>
              <Link href="/gesundheits-check/" className="transition-colors hover:text-cta">
                Gesundheits-Check
              </Link>
            </li>
          </ul>
          <ul className="mt-4 flex gap-4 text-sm">
            <li>
              <a href={CTA.instagram} target="_blank" rel="noopener" className="transition-colors hover:text-cta">
                Instagram
              </a>
            </li>
            <li>
              <a href={CTA.facebook} target="_blank" rel="noopener" className="transition-colors hover:text-cta">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Functional Wiehl GmbH – ehemals INJOY Wiehl. Alle Rechte
            vorbehalten.
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link href="/impressum/" className="transition-colors hover:text-cta">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz/" className="transition-colors hover:text-cta">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit/" className="transition-colors hover:text-cta">
                Barrierefreiheit
              </Link>
            </li>
            <li>
              <ConsentRevokeButton />
            </li>
          </ul>
        </div>
        <div className="container-site pb-5 text-xs text-cream/45">
          Made with ❤️ by{" "}
          <a
            href="https://superbrand.marketing/"
            target="_blank"
            rel="noopener"
            className="underline-offset-2 hover:underline"
          >
            SUPERBRAND.marketing
          </a>{" "}
          – Dein Superheld für deine Werbung.
        </div>
      </div>
    </footer>
  );
}
