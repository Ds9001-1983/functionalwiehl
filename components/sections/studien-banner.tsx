import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/**
 * Banner für die „50 über 50"-Gesundheitsstudie (Start 15.06.2026).
 * Status ist bewusst flexibel — Start liegt während der Bauzeit;
 * Nachrücker-Regelung mit dem Studio in Klärung (Plan, offener Punkt 1).
 */
export function StudienBanner({
  status = "laeuft",
}: {
  status?: "startet" | "laeuft";
}) {
  return (
    <section className="grain bg-cta">
      <Reveal className="container-site flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <span className="eyebrow text-cta-foreground/80">
            <span aria-hidden="true" className="h-px w-8 bg-cta-foreground/50" />
            Gesundheitsstudie · auf 50 Teilnehmerinnen begrenzt
          </span>
          <h2 className="mt-3 text-headline text-cta-foreground">
            „50 über 50“ – wie viel kann sich in 4 Wochen verändern?
          </h2>
          <p className="mt-3 text-cta-foreground/90">
            {status === "startet"
              ? "Wir suchen 50 Frauen ab 50 für unsere betreute Gesundheitsstudie – Start am 15.06.2026. Neukundinnen erhalten 4 Wochen gratis Zugang zum Studio."
              : "Unsere betreute Gesundheitsstudie für 50 Frauen ab 50 läuft – frag jetzt nach freien Plätzen. Neukundinnen erhalten 4 Wochen gratis Zugang zum Studio."}
          </p>
        </div>
        <Link
          href="/frauen-ab-50/"
          className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-pill bg-brand px-6 font-bold text-cream transition-colors hover:bg-brand/90"
        >
          Mehr zur Studie
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}
