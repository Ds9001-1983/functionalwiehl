/**
 * Hauptnavigation — in eigenem, framework-neutralem Modul, damit sowohl
 * Server- (SiteFooter) als auch Client-Komponenten (SiteHeader, MobileNav)
 * das echte Array importieren (nicht nur eine Client-Referenz).
 */
export const NAV_ITEMS = [
  { label: "Training & Kurse", href: "/training-und-kurse/" },
  { label: "Personal Training", href: "/personal-training/" },
  { label: "24/7-Studio", href: "/24-7-fitnessstudio/" },
  { label: "Kursplan", href: "/kursplan/" },
  { label: "Preise", href: "/#preise" },
  { label: "Über uns", href: "/ueber-uns/" },
  { label: "Kontakt", href: "/kontakt/" },
] as const;
