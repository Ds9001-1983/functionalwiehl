import Link from "next/link";

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
    <section className="bg-cta">
      <div className="container-site flex flex-col items-start gap-3 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cta-foreground/80">
            Gesundheitsstudie · auf 50 Teilnehmerinnen begrenzt
          </p>
          <h2 className="mt-1 text-2xl text-cta-foreground sm:text-3xl">
            „50 über 50“ – wie viel kann sich in 4 Wochen verändern?
          </h2>
          <p className="mt-2 max-w-2xl text-cta-foreground/90">
            {status === "startet"
              ? "Wir suchen 50 Frauen ab 50 für unsere betreute Gesundheitsstudie – Start am 15.06.2026. Neukundinnen erhalten 4 Wochen gratis Zugang zum Studio."
              : "Unsere betreute Gesundheitsstudie für 50 Frauen ab 50 läuft – frag jetzt nach freien Plätzen. Neukundinnen erhalten 4 Wochen gratis Zugang zum Studio."}
          </p>
        </div>
        <Link
          href="/frauen-ab-50/"
          className="inline-flex min-h-12 shrink-0 items-center rounded-pill bg-brand px-6 font-bold text-cream hover:bg-brand/90"
        >
          Mehr zur Studie
        </Link>
      </div>
    </section>
  );
}
