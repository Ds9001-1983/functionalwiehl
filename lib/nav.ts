/**
 * Hauptnavigation wie live (menu-functional2026): Anker auf dem One-Pager, immer in der
 * Slash-Form "/#…", damit sie auch von Körpermaße und Rechtsseiten funktionieren.
 * Großschreibung wie live nur per CSS (uppercase), damit Screenreader nicht buchstabieren.
 * In eigenem, framework-neutralem Modul, damit Server- (SiteFooter) und Client-Komponenten
 * (SiteHeader, MobileNav) das echte Array importieren.
 */
export const NAV_ITEMS = [
  { label: "Gym", href: "/" },
  { label: "Leistungen", href: "/#leistung" },
  { label: "Aktuelles", href: "/#aktuelles" },
  { label: "Preise", href: "/#preise" },
  { label: "Check up", href: "/#checkup" },
  { label: "Kontakt", href: "/#kontakt" },
] as const;
