import type { Metadata } from "next";
import { KONTAKT } from "./cta";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://functional-wiehl.de";

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

/**
 * Eine Quelle für Title/Description/Canonical — keine Drift zwischen
 * Metadata, OG und Sitemap. Enthält genau die indexierbaren Seiten (One-Pager,
 * Körpermaße, Rechtsseiten); die BN-Landingpage steht bewusst nicht hier
 * (noindex, Metadaten in content/black-november.ts).
 */
export const PAGES = {
  home: {
    // Title wörtlich wie live (Stand 27.10.2026), live ohne Meta-Description
    title: "Functional - Dein Fitnessstudio in Wiehl | 7 Tage lang 24 Stunden geöffnet",
    description:
      "Fitnessstudio in Wiehl mit 24/7-Zugang: Krafttraining, Cardio, Gruppenkurse & Personal Training. Kostenlose Parkplätze, barrierefrei, mitten in Wiehl.",
    path: "/",
  },
  koerpermasse: {
    // Title wörtlich wie live (Stand 27.10.2026)
    title: "Körpermaße | Functional - Dein Fitnessstudio in Wiehl",
    description:
      "Körpermaße Digital: 8 Körperumfänge in 2–3 Minuten erfassen – für ein optimal angepasstes Training bei Functional Wiehl.",
    path: "/koerpermasse/",
  },
  impressum: {
    title: "Impressum | Functional Wiehl",
    description: `Impressum der ${KONTAKT.firma}, ${KONTAKT.strasse}, ${KONTAKT.plzOrt}.`,
    path: "/impressum/",
  },
  datenschutz: {
    title: "Datenschutz | Functional Wiehl",
    description: `Datenschutzerklärung der ${KONTAKT.firma}.`,
    path: "/datenschutz/",
  },
  barrierefreiheit: {
    title: "Barrierefreiheit | Functional Wiehl",
    description:
      "Erklärung zur Barrierefreiheit der Website von Functional Wiehl nach BFSG – inklusive Hinweisen zur Bedienung und Feedback-Möglichkeit.",
    path: "/barrierefreiheit/",
  },
} as const satisfies Record<string, PageSeo>;

export function pageMetadata(page: PageSeo, ogImage?: string): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName: "Functional Wiehl",
      locale: "de_DE",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}
