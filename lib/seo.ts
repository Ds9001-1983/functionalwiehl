import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://functional-wiehl.de";

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

/**
 * Eine Quelle für Title/Description/Canonical — keine Drift zwischen
 * Metadata, OG und Sitemap. Formel: Keyword vorn, ≤ 60 Zeichen Title,
 * 140–155 Zeichen Description mit Du-Form-Nutzen + Wiehl + CTA.
 */
export const PAGES = {
  home: {
    title: "Fitnessstudio Wiehl – 24/7 trainieren | Functional Wiehl",
    description:
      "Krafttraining, Kurse & Personal Training in Wiehl – mit 24/7-Zugang, kostenlosen Parkplätzen und persönlicher Betreuung. Teste uns 14 Tage kostenlos!",
    path: "/",
  },
  trainingUndKurse: {
    title: "Training & Kurse in Wiehl | Functional Wiehl",
    description:
      "Krafttraining, Cardio, Functional Training und Gruppenkurse in Wiehl – plus Körperanalyse und Ernährungs-Coaching. Starte mit 14 Tagen kostenlos.",
    path: "/training-und-kurse/",
  },
  personalTraining: {
    title: "Personal Training in Wiehl | Functional Wiehl",
    description:
      "Personal Training in Wiehl: individueller Plan, Körperanalyse und 1:1-Betreuung durch erfahrene Trainer. Sichere dir jetzt dein kostenloses Erstgespräch.",
    path: "/personal-training/",
  },
  fitnessstudio247: {
    title: "24 Stunden Fitnessstudio in Wiehl | Functional Wiehl",
    description:
      "Dein Gym in Wiehl mit 24/7-Zugang: trainiere vor der Frühschicht oder nach Feierabend. Kostenlose Parkplätze, faire Tarife – 14 Tage kostenlos testen.",
    path: "/24-7-fitnessstudio/",
  },
  frauenAb50: {
    title: "Fitness für Frauen ab 50 in Wiehl | Functional Wiehl",
    description:
      "Gesundheitsstudie „50 über 50“ in Wiehl: 50 Frauen ab 50 trainieren begleitet – als Neukundin 4 Wochen gratis. Melde dich jetzt für deinen Platz.",
    path: "/frauen-ab-50/",
  },
  probetraining: {
    title: "14 Tage kostenloses Probetraining | Functional Wiehl",
    description:
      "Teste Functional Wiehl 14 Tage kostenlos: alle Geräte, alle Kurse, persönliche Einweisung – ohne Risiko und ohne Abo-Falle. Jetzt per WhatsApp starten.",
    path: "/probetraining/",
  },
  kursplan: {
    title: "Kursplan – alle Fitnesskurse | Functional Wiehl",
    description:
      "Der aktuelle Kursplan von Functional Wiehl: alle Gruppenkurse mit Zeiten auf einen Blick. Als Neuling testest du jeden Kurs 14 Tage kostenlos.",
    path: "/kursplan/",
  },
  gesundheitsCheck: {
    title: "Fitness- & Gesundheits-Check-up | Functional Wiehl",
    description:
      "Dein persönlicher Fitness- und Gesundheits-Check-up bei Functional Wiehl: Ziele, Fitnesslevel und Gesundheit im Blick – wir melden uns mit deiner Empfehlung.",
    path: "/gesundheits-check/",
  },
  ueberUns: {
    title: "Über uns – ehemals INJOY Wiehl | Functional Wiehl",
    description:
      "Aus INJOY Wiehl wurde Functional Wiehl: gleiches Team, gleicher Standort am Wilhelm-Grümer-Weg – neuer Name. Lerne die Menschen hinter dem Studio kennen.",
    path: "/ueber-uns/",
  },
  kontakt: {
    title: "Kontakt & Anfahrt | Functional Wiehl",
    description:
      "Functional Wiehl, Wilhelm-Grümer-Weg 18, 51674 Wiehl: kostenlose Parkplätze, Bushaltestelle in 2 Minuten, barrierefrei. Schreib uns per WhatsApp oder ruf an.",
    path: "/kontakt/",
  },
  impressum: {
    title: "Impressum | Functional Wiehl",
    description: "Impressum der Functional Wiehl GmbH, Wilhelm-Grümer-Weg 18, 51674 Wiehl.",
    path: "/impressum/",
  },
  datenschutz: {
    title: "Datenschutz | Functional Wiehl",
    description: "Datenschutzerklärung der Functional Wiehl GmbH.",
    path: "/datenschutz/",
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
