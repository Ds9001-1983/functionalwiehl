import type { Metadata } from "next";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.koerpermasse);

/**
 * Stub aus P0: Die URL /koerpermasse/ bleibt wie live erreichbar (Teaser auf der
 * Startseite verlinkt sie). Formular, Route und Texte (Sie-Form) folgen in P3.
 */
export default function KoerpermassePage() {
  return (
    <section className="container-site max-w-3xl py-16">
      <h1 className="text-3xl sm:text-4xl">Körpermaße Digital</h1>
      <p className="mt-3 text-lg text-muted-foreground">Präzise Messungen für Ihr optimales Training</p>
    </section>
  );
}
