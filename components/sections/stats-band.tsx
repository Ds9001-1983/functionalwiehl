import { Reveal } from "@/components/motion/reveal";

/**
 * Editorialer Zahlen-Streifen (Social Proof) auf Indigo. Bewusst nur belegbare
 * Fakten — KEINE erfundenen Mitglieder-/Bewertungszahlen.
 *
 * TODO(Kunde): echte Kennzahlen ergänzen, sobald vom Studio freigegeben
 * (z. B. „X Mitglieder", „seit JJJJ in Wiehl", Google-Bewertung). Bis dahin
 * stehen hier nur Aussagen, die zu 100 % stimmen.
 */
const STATS: { value: string; label: string }[] = [
  { value: "24/7", label: "Zugang – trainiere, wann du willst" },
  { value: "6", label: "Trainingswelten unter einem Dach" },
  { value: "14", label: "Tage kostenlos testen" },
  { value: "1:1", label: "persönliche Betreuung statt Massenabfertigung" },
];

export function StatsBand({ items = STATS }: { items?: { value: string; label: string }[] }) {
  return (
    <section className="grain bg-brand-gradient">
      <div className="container-site py-14 sm:py-16">
        <Reveal
          stagger
          className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
        >
          {items.map((s) => (
            <div key={s.label}>
              <p className="font-heading text-5xl font-black leading-none text-cta tabular-nums sm:text-6xl">
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-snug text-cream/80 sm:text-base">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
