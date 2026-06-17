import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Step = { titel: string; text: string };

/**
 * Editoriale Karten-Reihe — wahlweise mit großer, dezent eingefärbter
 * Schritt-Nummer (Ablauf) oder ohne (Feature-Karten). Ersetzt die mehrfach
 * duplizierten Inline-Karten-Grids (Probetraining, Personal Training, 24/7 …).
 */
export function Steps({
  items,
  numbered = true,
  columns = 3,
}: {
  items: Step[];
  numbered?: boolean;
  columns?: 2 | 3;
}) {
  return (
    <Reveal
      stagger
      className={cn("grid gap-4", columns === 3 ? "md:grid-cols-3" : "sm:grid-cols-2")}
    >
      {items.map((it, i) => (
        <div
          key={it.titel}
          className="group rounded-card border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          {numbered && (
            <span
              aria-hidden="true"
              className="font-heading text-4xl font-black tabular-nums text-brand/15"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          )}
          <h3 className={cn("text-lg", numbered && "mt-2")}>{it.titel}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
        </div>
      ))}
    </Reveal>
  );
}
