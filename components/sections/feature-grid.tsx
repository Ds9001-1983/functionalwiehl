import Link from "next/link";
import { Check } from "lucide-react";
import { LEISTUNGEN } from "@/content/leistungen";

/** Die 6 Leistungs-Karten — jede verlinkt auf ihre Unterseite (Hub & Spoke). */
export function FeatureGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LEISTUNGEN.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          className="group flex flex-col rounded-card border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h3 className="text-lg">{l.titel}</h3>
          {!compact && <p className="mt-2 text-sm text-muted-foreground">{l.beschreibung}</p>}
          <ul className="mt-3 space-y-1.5">
            {l.punkte.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-whatsapp" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <span className="mt-4 text-sm font-bold text-brand underline-offset-4 group-hover:underline">
            Mehr erfahren →
          </span>
        </Link>
      ))}
    </div>
  );
}
