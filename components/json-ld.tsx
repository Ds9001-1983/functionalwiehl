import { KONTAKT } from "@/lib/cta";
import { CTA } from "@/lib/cta";
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

/** Site-weites HealthClub/ExerciseGym-Schema (Root-Layout). */
export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": ["HealthClub", "ExerciseGym"],
  "@id": `${SITE_URL}/#studio`,
  name: KONTAKT.firma,
  alternateName: "INJOY Wiehl",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/img/logo-functional-neu.png`,
  image: [`${SITE_URL}/img/img_4942.jpg`],
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
    "Fitnessstudio in Wiehl mit 24/7-Zugang – ehemals INJOY Wiehl. Betreuungszeiten: Mo–Do 8–22, Fr 8–21, Sa/So 10–18 Uhr.",
  priceRange: "ab 8,00 € pro Woche",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "24/7-Zugang", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kostenlose Parkplätze", value: true },
    { "@type": "LocationFeatureSpecification", name: "Barrierefrei zugänglich", value: true },
  ],
  sameAs: [CTA.instagram, CTA.facebook],
} as const;

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

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
