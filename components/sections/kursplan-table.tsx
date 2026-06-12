import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WOCHENTAGE, type Kursplan, type Kurstermin } from "@/content/kursplan";

function terminSort(a: Kurstermin, b: Kurstermin) {
  return a.start.localeCompare(b.start);
}

function TerminKarte({ termin, plan }: { termin: Kurstermin; plan: Kursplan }) {
  const kurs = plan.kurse.find((k) => k.id === termin.kursId);
  if (!kurs) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
      <div>
        <p className="font-bold text-brand">{kurs.name}</p>
        <p className="text-xs text-muted-foreground">
          {kurs.dauerMin} min · {kurs.beschreibung}
        </p>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-brand">{termin.start}</p>
        {/* Belegungs-Badge erscheint erst, wenn die Studio-App-API echte
            Werte liefert (docs/TODO-kursplan-api.md) */}
        {typeof termin.freiePlaetze === "number" && (
          <Badge variant={termin.freiePlaetze > 0 ? "secondary" : "destructive"} className="mt-1">
            {termin.freiePlaetze > 0 ? `${termin.freiePlaetze} Plätze frei` : "Ausgebucht"}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Kursplan als echtes HTML statt A4-Bild (SEO, A11y, mobile Lesbarkeit).
 * Mobil: Tages-Tabs (nur Tage mit Kursen). Desktop: Wochen-Grid.
 */
export function KursplanTable({ plan }: { plan: Kursplan }) {
  const tageMitKursen = ([1, 2, 3, 4, 5, 6, 7] as const).filter((t) =>
    plan.termine.some((termin) => termin.wochentag === t)
  );

  return (
    <div>
      {/* Mobil: Tabs pro Wochentag */}
      <div className="md:hidden">
        <Tabs defaultValue={String(tageMitKursen[0])}>
          <TabsList className="w-full overflow-x-auto">
            {tageMitKursen.map((t) => (
              <TabsTrigger key={t} value={String(t)} className="flex-1">
                {WOCHENTAGE[t - 1].slice(0, 2)}
              </TabsTrigger>
            ))}
          </TabsList>
          {tageMitKursen.map((t) => (
            <TabsContent key={t} value={String(t)} className="mt-4 space-y-2">
              <h3 className="text-base">{WOCHENTAGE[t - 1]}</h3>
              {plan.termine
                .filter((termin) => termin.wochentag === t)
                .sort(terminSort)
                .map((termin) => (
                  <TerminKarte key={`${termin.kursId}-${termin.start}`} termin={termin} plan={plan} />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Desktop: Wochen-Grid */}
      <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-5">
        {tageMitKursen.map((t) => (
          <div key={t}>
            <h3 className="text-base">{WOCHENTAGE[t - 1]}</h3>
            <div className="mt-3 space-y-2">
              {plan.termine
                .filter((termin) => termin.wochentag === t)
                .sort(terminSort)
                .map((termin) => (
                  <TerminKarte key={`${termin.kursId}-${termin.start}`} termin={termin} plan={plan} />
                ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{plan.stand}</p>
    </div>
  );
}
