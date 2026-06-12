import Image from "next/image";
import Link from "next/link";
import logo from "@/public/img/logo-functional-neu.png";
import { WhatsAppCta } from "./cta-buttons";
import { MobileNav } from "./mobile-nav";

export const NAV_ITEMS = [
  { label: "Training & Kurse", href: "/training-und-kurse/" },
  { label: "Personal Training", href: "/personal-training/" },
  { label: "24/7-Studio", href: "/24-7-fitnessstudio/" },
  { label: "Kursplan", href: "/kursplan/" },
  { label: "Preise", href: "/#preise" },
  { label: "Über uns", href: "/ueber-uns/" },
  { label: "Kontakt", href: "/kontakt/" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Functional Wiehl – Startseite" className="shrink-0">
          <Image
            src={logo}
            alt="Logo Functional Wiehl GmbH"
            priority
            className="h-9 w-auto"
            sizes="160px"
          />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-5 xl:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppCta position="header" size="sm" className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
