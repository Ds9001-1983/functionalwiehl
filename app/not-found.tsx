import Link from "next/link";
import { WhatsAppCta } from "@/components/cta-buttons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const linkStil = "font-bold text-brand underline-offset-4 hover:underline";

/**
 * Root-404: rendert nur im Root-Layout (nicht in app/(site)/layout.tsx) und
 * bindet Header und Footer deshalb selbst ein. noindex setzt Next selbst.
 * Greift auch für alle WordPress-Reste (wp-login.php, wp-admin, wp-content …).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main id="inhalt" className="flex-1">
        <section className="container-site flex min-h-[50svh] flex-col items-start justify-center gap-4 py-16">
          <h1 className="text-3xl sm:text-4xl">Diese Seite gibt es nicht (mehr)</h1>
          <p className="max-w-xl text-muted-foreground">
            Kein Problem – hier geht&apos;s zur{" "}
            <Link href="/" className={linkStil}>
              Startseite
            </Link>
            , zu den{" "}
            <Link href="/#preise" className={linkStil}>
              Preisen
            </Link>{" "}
            oder zum{" "}
            <Link href="/#kontakt" className={linkStil}>
              Kontakt
            </Link>
            . Oder schreib uns direkt:
          </p>
          <WhatsAppCta ziel="allgemein" position="not_found" size="lg" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
