import { CTA, KONTAKT } from "@/lib/cta";
import { SITE_URL } from "@/lib/seo";

/**
 * Einzige Schema-Quelle der Site — Komponenten emittieren NIE eigenes JSON-LD
 * (sonst konkurrierende Angaben, z. B. doppelte Öffnungszeiten).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Google-Maps-Suche nach Studio und Adresse (Ziel für hasMap) */
const MAPS_SUCHE =
  "https://www.google.com/maps/search/?api=1&query=Functional+Wiehl+Wilhelm-Gr%C3%BCmer-Weg+18+51674+Wiehl";

/**
 * Site-weites HealthClub/ExerciseGym-Schema (app/(site)/layout.tsx). Stand wie live
 * (27.10.2026): Monatspreise 37,00–59,00 €, Betreuungszeiten wie BETREUUNGSZEITEN in
 * lib/cta.ts, Mail gym@. Kein alternateName mit dem alten Studionamen (live nicht vorhanden).
 * Seit 28.10.2026 für die lokale Suche zusätzlich geo (OpenStreetMap, Hausnummer genau),
 * hasMap und areaServed (SEO-Plan im Vault, 60-Recherchen).
 */
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": ["HealthClub", "ExerciseGym"],
  "@id": `${SITE_URL}/#studio`,
  name: "Functional Wiehl",
  legalName: KONTAKT.firma,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/img/logo-functional-neu.png`,
  // die 4 Slider-Bilder der Live-Startseite
  image: ["img_4942.jpg", "img_4880.jpg", "img_4865-2.jpg", "img_4949.jpg"].map((b) => `${SITE_URL}/img/${b}`),
  telephone: "+492262752717",
  email: KONTAKT.mail,
  address: {
    "@type": "PostalAddress",
    streetAddress: KONTAKT.strasse,
    postalCode: "51674",
    addressLocality: "Wiehl",
    addressRegion: "NRW",
    addressCountry: "DE",
  },
  geo: { "@type": "GeoCoordinates", latitude: 50.94576, longitude: 7.58249 },
  hasMap: MAPS_SUCHE,
  areaServed: ["Wiehl", "Oberwiehl", "Bielstein", "Nümbrecht", "Gummersbach"].map((name) => ({
    "@type": "Place",
    name,
  })),
  // 24/7-Zugang ist die maßgebliche Öffnungszeit eines 24h-Gyms;
  // die Betreuungszeiten stehen in der description und on-page.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  description:
    "Fitnessstudio in Wiehl mit 24/7-Zugang. Betreuung Mo–Fr 08:00–21:00 Uhr, Sa 10:00–14:00 Uhr, Sonntag ohne Betreuung.",
  priceRange: "37,00–59,00 € pro Monat",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "24/7-Zugang", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kostenlose Parkplätze", value: true },
    { "@type": "LocationFeatureSpecification", name: "Barrierefrei zugänglich", value: true },
  ],
  sameAs: [CTA.instagram, CTA.facebook],
} as const;

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
