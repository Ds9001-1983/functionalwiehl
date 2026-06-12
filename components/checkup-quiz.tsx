"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHECKUP_FRAGEN, FOKUS_NACH_ZIEL, type CheckupFrage } from "@/content/checkup-fragen";
import { trackEvent } from "@/lib/tracking";

type Antworten = Record<string, string | string[] | number>;

type Status = "laeuft" | "kontakt" | "sendet" | "fertig" | "fehler";

function optionenFuer(frage: CheckupFrage, antworten: Antworten): string[] {
  if (frage.id === "fokus") {
    const ziel = antworten["ziel"];
    return FOKUS_NACH_ZIEL[String(ziel)] ?? Object.values(FOKUS_NACH_ZIEL).flat();
  }
  return frage.typ === "zahl" ? [] : frage.optionen;
}

export function CheckupQuiz() {
  const [gestartet, setGestartet] = useState(false);
  const [schritt, setSchritt] = useState(0);
  const [antworten, setAntworten] = useState<Antworten>({});
  const [status, setStatus] = useState<Status>("laeuft");
  const [kontakt, setKontakt] = useState({ name: "", email: "", telefon: "" });
  const [einwilligungDatenschutz, setEinwilligungDatenschutz] = useState(false);
  const [einwilligungGesundheit, setEinwilligungGesundheit] = useState(false);

  const gesamt = CHECKUP_FRAGEN.length + 1; // + Kontakt-Schritt
  const frage = CHECKUP_FRAGEN[schritt];
  const optionen = useMemo(() => (frage ? optionenFuer(frage, antworten) : []), [frage, antworten]);

  const aktuelleAntwort = frage ? antworten[frage.id] : undefined;
  const beantwortet =
    frage &&
    (frage.typ === "multi"
      ? Array.isArray(aktuelleAntwort) && aktuelleAntwort.length > 0
      : aktuelleAntwort !== undefined && aktuelleAntwort !== "");

  function weiter() {
    if (schritt + 1 >= CHECKUP_FRAGEN.length) setStatus("kontakt");
    else setSchritt(schritt + 1);
  }

  function zurueck() {
    if (status === "kontakt") setStatus("laeuft");
    else if (schritt > 0) setSchritt(schritt - 1);
  }

  function toggleMulti(option: string) {
    if (!frage) return;
    const bisher = Array.isArray(aktuelleAntwort) ? aktuelleAntwort : [];
    const neu = bisher.includes(option)
      ? bisher.filter((o) => o !== option)
      : option === "Keine"
        ? ["Keine"]
        : [...bisher.filter((o) => o !== "Keine"), option];
    setAntworten({ ...antworten, [frage.id]: neu });
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!einwilligungDatenschutz || !einwilligungGesundheit) return;
    setStatus("sendet");
    try {
      const res = await fetch("/api/checkup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antworten, kontakt, einwilligungGesundheit, einwilligungDatenschutz }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // NIE Antwortdaten ins Tracking — nur die Ziel-Kategorie
      trackEvent("checkup_submit", {
        position: "quiz",
        ergebnis_kategorie: String(antworten["ziel"] ?? "unbekannt"),
      });
      setStatus("fertig");
    } catch {
      setStatus("fehler");
    }
  }

  if (!gestartet) {
    return (
      <div className="rounded-card border border-border bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl">Willkommen zu deinem persönlichen Gesundheits-Assessment</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Beantworte Schritt für Schritt ein paar Fragen zu Alltag, Zielen und Gesundheit – am
          Ende melden wir uns mit deiner persönlichen Trainingsempfehlung. Dauert ca. 3 Minuten.
        </p>
        <Button
          onClick={() => setGestartet(true)}
          className="mt-6 min-h-12 rounded-pill bg-brand px-8 text-base font-bold text-cream hover:bg-brand/90"
        >
          🚀 Los geht&apos;s!
        </Button>
      </div>
    );
  }

  if (status === "fertig") {
    return (
      <div role="status" className="rounded-card border border-border bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl">✅ Vielen Dank!</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Dein Check-up wurde erfolgreich übermittelt. Wir melden uns schnellstmöglich bei dir.
        </p>
      </div>
    );
  }

  if (status === "kontakt" || status === "sendet" || status === "fehler") {
    return (
      <form onSubmit={absenden} className="rounded-card border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-muted-foreground">
          Fast geschafft — Schritt {gesamt} von {gesamt}
        </p>
        <h2 className="mt-1 text-xl">Wohin dürfen wir deine Empfehlung schicken?</h2>
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="checkup-name">Name *</Label>
            <Input
              id="checkup-name"
              required
              autoComplete="name"
              value={kontakt.name}
              onChange={(e) => setKontakt({ ...kontakt, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="checkup-email">E-Mail *</Label>
            <Input
              id="checkup-email"
              type="email"
              required
              autoComplete="email"
              value={kontakt.email}
              onChange={(e) => setKontakt({ ...kontakt, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="checkup-telefon">Telefon *</Label>
            <Input
              id="checkup-telefon"
              type="tel"
              required
              autoComplete="tel"
              value={kontakt.telefon}
              onChange={(e) => setKontakt({ ...kontakt, telefon: e.target.value })}
              className="mt-1"
            />
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              required
              checked={einwilligungDatenschutz}
              onChange={(e) => setEinwilligungDatenschutz(e.target.checked)}
              className="mt-0.5 size-5 accent-brand"
            />
            <span>
              Ich habe die{" "}
              <Link href="/datenschutz/" className="underline" target="_blank">
                Datenschutzerklärung
              </Link>{" "}
              zur Kenntnis genommen. *
            </span>
          </label>

          {/* Art. 9 DSGVO: ausdrückliche, separate Einwilligung — eigene,
              unangekreuzte Checkbox mit konkretem Text (docs/TODO-recht.md) */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              required
              checked={einwilligungGesundheit}
              onChange={(e) => setEinwilligungGesundheit(e.target.checked)}
              className="mt-0.5 size-5 accent-brand"
            />
            <span>
              Ich willige ausdrücklich ein, dass die Functional Wiehl GmbH meine im Check-up
              angegebenen <strong>Gesundheitsdaten</strong> (Art. 9 DSGVO) zur Erstellung meiner
              Trainingsempfehlung und zur Kontaktaufnahme verarbeitet. Ich kann diese
              Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. *
            </span>
          </label>
        </div>

        {status === "fehler" && (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Das hat leider nicht geklappt. Versuch es bitte erneut oder schreib uns direkt per
            WhatsApp.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={zurueck} className="rounded-pill">
            ← Zurück
          </Button>
          <Button
            type="submit"
            disabled={status === "sendet"}
            className="min-h-12 rounded-pill bg-brand px-8 font-bold text-cream hover:bg-brand/90"
          >
            {status === "sendet" ? "Wird gesendet …" : "🚀 Jetzt absenden"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-muted-foreground">
          Frage {schritt + 1} von {gesamt}
        </p>
        <div className="h-2 w-32 overflow-hidden rounded-pill bg-muted" aria-hidden="true">
          <div
            className="h-full rounded-pill bg-brand transition-all"
            style={{ width: `${((schritt + 1) / gesamt) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="mt-3 text-xl">{frage.frage}</h2>
      {frage.typ === "multi" && (
        <p className="mt-1 text-sm text-muted-foreground">
          {("hinweis" in frage && frage.hinweis) || "Mehrfachauswahl möglich"}
        </p>
      )}

      <div className="mt-5">
        {frage.typ === "zahl" ? (
          <div className="flex max-w-xs items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={frage.min}
              max={frage.max}
              value={aktuelleAntwort === undefined ? "" : String(aktuelleAntwort)}
              onChange={(e) =>
                setAntworten({ ...antworten, [frage.id]: e.target.value ? Number(e.target.value) : "" })
              }
              aria-label={frage.frage}
            />
            <span className="text-sm text-muted-foreground">{frage.einheit}</span>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {optionen.map((option) => {
              const aktiv =
                frage.typ === "multi"
                  ? Array.isArray(aktuelleAntwort) && aktuelleAntwort.includes(option)
                  : aktuelleAntwort === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={aktiv}
                  onClick={() =>
                    frage.typ === "multi"
                      ? toggleMulti(option)
                      : setAntworten({ ...antworten, [frage.id]: option })
                  }
                  className={`min-h-12 rounded-xl border-2 px-4 py-2 text-left text-sm font-semibold transition-colors ${
                    aktiv
                      ? "border-brand bg-brand text-cream"
                      : "border-border bg-white text-foreground hover:border-brand/50"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={zurueck} disabled={schritt === 0} className="rounded-pill">
          ← Zurück
        </Button>
        <Button
          type="button"
          onClick={weiter}
          disabled={!beantwortet}
          className="min-h-12 rounded-pill bg-brand px-8 font-bold text-cream hover:bg-brand/90"
        >
          Weiter →
        </Button>
      </div>
    </div>
  );
}
