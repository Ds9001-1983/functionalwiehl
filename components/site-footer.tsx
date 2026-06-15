import Image from "next/image";
import Link from "next/link";
import logoWeiss from "@/public/img/functional-wiehl-logo-weiss-trans-schmal.png";
import { CTA, KONTAKT, OEFFNUNGSZEITEN } from "@/lib/cta";
import { ConsentRevokeButton } from "./consent/consent-banner";
import { TrackedLink } from "./tracked-link";
import { NAV_ITEMS } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="bg-footer text-white/85">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src={logoWeiss} alt="Functional Wiehl GmbH" className="h-10 w-auto" sizes="180px" />
          <p className="mt-3 text-sm">
            Dein Fitnessstudio in Wiehl – ehemals INJOY Wiehl. Gleiches Team, gleicher Standort,
            neuer Name.
          </p>
        </div>

        <div>
          <p className="font-bold text-white">Kontakt</p>
          <address className="mt-3 text-sm not-italic leading-relaxed">
            {KONTAKT.firma}
            <br />
            {KONTAKT.strasse}
            <br />
            {KONTAKT.plzOrt}
          </address>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <TrackedLink href={CTA.tel} event="tel_click" params={{ position: "footer" }} className="hover:underline">
                {KONTAKT.telefonAnzeige}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={CTA.mail} event="mail_click" params={{ position: "footer" }} className="hover:underline">
                {KONTAKT.mail}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={CTA.whatsappProbetraining}
                event="whatsapp_click"
                params={{ position: "footer", preset: "probetraining" }}
                className="hover:underline"
              >
                WhatsApp schreiben
              </TrackedLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">Öffnungszeiten</p>
          <p className="mt-3 text-sm font-semibold text-white">{OEFFNUNGSZEITEN.zugang}</p>
          <ul className="mt-1 space-y-1 text-sm">
            {OEFFNUNGSZEITEN.betreuung.map((z) => (
              <li key={z.tage}>
                Betreuung {z.tage}: {z.zeit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">Seiten</p>
          <ul className="mt-3 space-y-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/probetraining/" className="hover:underline">
                Probetraining
              </Link>
            </li>
            <li>
              <Link href="/frauen-ab-50/" className="hover:underline">
                Frauen ab 50
              </Link>
            </li>
            <li>
              <Link href="/gesundheits-check/" className="hover:underline">
                Gesundheits-Check
              </Link>
            </li>
          </ul>
          <ul className="mt-4 flex gap-4 text-sm">
            <li>
              <a href={CTA.instagram} target="_blank" rel="noopener" className="hover:underline">
                Instagram
              </a>
            </li>
            <li>
              <a href={CTA.facebook} target="_blank" rel="noopener" className="hover:underline">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Functional Wiehl GmbH – ehemals INJOY Wiehl. Alle Rechte
            vorbehalten.
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link href="/impressum/" className="hover:underline">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz/" className="hover:underline">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/barrierefreiheit/" className="hover:underline">
                Barrierefreiheit
              </Link>
            </li>
            <li>
              <ConsentRevokeButton />
            </li>
          </ul>
        </div>
        <div className="container-site pb-5 text-xs text-white/60">
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
