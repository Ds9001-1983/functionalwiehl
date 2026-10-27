/**
 * 308-Weiterleitungen (next.config.ts → redirects, alle permanent) für den Umzug von
 * WordPress auf den One-Pager. Quelle: wp-sitemap-posts-page-1.xml (24 URLs, Stand
 * 27.10.2026) plus Benutzer-Sitemap, Feeds und die 9 entfallenen Redesign-Unterseiten.
 *
 * - Ziele mit #anker sind gewollt: Next übernimmt das Fragment in den Location-Header,
 *   die Query (UTM, fbclid) kommt davor (/?utm_source=x#preise). Belegt im Next-Quellcode
 *   shared/lib/router/utils/prepare-destination.js, getestet in tests/redirects.spec.ts.
 * - Quellen OHNE Slash schreiben: Next hängt an jede Quelle (?:/)? an, die Regel greift so
 *   für /preise und /preise/ mit einem einzigen Sprung. Mit Slash in der Quelle käme die
 *   Form ohne Slash erst über den Proxy (2 × 308).
 * - Nicht hier: /black-november/ (Landingpage bis zum Löschdatum, danach Entscheidung P2),
 *   /wp-json/* (Route Handler P2), wp-login.php, xmlrpc.php, wp-admin (404 über not-found).
 *   Alle übrigen wp-content-Pfade liefern ebenfalls 404.
 */
export const REDIRECTS: { source: string; destination: string }[] = [
  // WordPress-Seiten ohne eigenen Inhalt mehr → Startseite
  { source: "/home", destination: "/" },
  { source: "/start", destination: "/" },
  { source: "/wartung", destination: "/" },
  { source: "/landingpage-v2", destination: "/" },
  { source: "/fitness-app", destination: "/" },
  // Leistungsseiten → „Unsere Leistungen“
  { source: "/cardiotraining", destination: "/#leistung" },
  { source: "/polar", destination: "/#leistung" },
  { source: "/figur-muskeltraining", destination: "/#leistung" },
  { source: "/muskelaufbau", destination: "/#leistung" },
  { source: "/ruecken", destination: "/#leistung" },
  { source: "/functional-training", destination: "/#leistung" },
  { source: "/gewichtsmanagement", destination: "/#leistung" },
  { source: "/abnehmen", destination: "/#leistung" },
  { source: "/group-fitness", destination: "/#leistung" },
  // Tarife → Preise
  { source: "/preise", destination: "/#preise" },
  { source: "/studententarif", destination: "/#preise" },
  { source: "/best-ager", destination: "/#preise" },
  // Rechtliches
  { source: "/cookie-richtlinie-eu", destination: "/datenschutz/" },
  // Offen: eigene AGB-Seite nötig? Bis zur Klärung → Impressum (docs/TODO-recht.md)
  { source: "/geschaeftsbedingungen", destination: "/impressum/" },
  // Autor-Archiv (verrät den WP-Login-Namen) und Feeds aus dem Live-<head>
  { source: "/author/web2330", destination: "/" },
  { source: "/feed", destination: "/" },
  { source: "/comments/feed", destination: "/" },
  // WP-Sitemaps → Next-Sitemap (.xml umgeht den Slash-Proxy)
  { source: "/wp-sitemap.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap-posts-page-1.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap-users-1.xml", destination: "/sitemap.xml" },
  // OG-Bild der BN-Landingpage aus wp-content, damit geteilte Link-Vorschauen nicht brechen
  {
    source: "/wp-content/uploads/2026/10/black-november-functional-1080.jpg",
    destination: "/black-november/opengraph-image.jpg",
  },
  // Entfallene Unterseiten des Redesigns (Prototyp-Domain, evtl. schon geteilt)
  { source: "/training-und-kurse", destination: "/#leistung" },
  { source: "/personal-training", destination: "/#leistung" },
  { source: "/kursplan", destination: "/#leistung" },
  { source: "/24-7-fitnessstudio", destination: "/#kontakt" },
  { source: "/kontakt", destination: "/#kontakt" },
  { source: "/gesundheits-check", destination: "/#checkup" },
  { source: "/probetraining", destination: "/" },
  { source: "/frauen-ab-50", destination: "/" },
  { source: "/ueber-uns", destination: "/" },
];

/** Bleibende Seiten: nie umleiten (Menü, Ads, Teaser und externe Links hängen daran). */
export const KEINE_WEITERLEITUNG = [
  "/",
  "/koerpermasse/",
  "/black-november/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
] as const;

/** Die 9 Routen des Redesigns, die mit dem One-Pager entfallen sind (Tests). */
export const ENTFALLENE_ROUTEN = [
  "/training-und-kurse/",
  "/personal-training/",
  "/24-7-fitnessstudio/",
  "/frauen-ab-50/",
  "/probetraining/",
  "/kursplan/",
  "/ueber-uns/",
  "/kontakt/",
  "/gesundheits-check/",
] as const;
