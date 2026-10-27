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

/**
 * Site-weites HealthClub/ExerciseGym-Schema (app/(site)/layout.tsx). Stand wie live
 * (27.10.2026): Monatspreise 37,00–59,00 €, Betreuungszeiten wie BETREUUNGSZEITEN in
 * lib/cta.ts, Mail gym@. Kein alternateName mit dem alten Studionamen (live nicht vorhanden).
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
    "Fitnessstudio in Wiehl mit 24/7-Zugang. Betreuung Mo–Fr 08:00–21:00 Uhr, So 10:00–14:00 Uhr, Samstag ohne Betreuung.",
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
