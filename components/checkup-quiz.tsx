"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrackedLink } from "@/components/tracked-link";
import { useConsent } from "@/components/consent/consent-context";
import {
  CHECKUP_GESAMT,
  CHECKUP_TEXTE as T,
  EINWILLIGUNG,
  ERSTER_SCHRITT,
  GEWICHT,
  KEINE_ANGABE,
  SCHRITT,
  TELEFON_MUSTER,
  antwortenFuerPfad,
  gewichtGueltig,
  naechsterSchritt,
  pfadFuer,
  type CheckupAntwort,
  type CheckupPayload,
  type GewichtFeld,
  type Option,
  type SchrittId,
} from "@/content/checkup-fragen";
import { CTA } from "@/lib/cta";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export type CheckupQuizProps = {
  /**
   * Überschriftenebene im Quiz (Fragen, Start, Kontakt, Erfolg). Standard "h3": Auf der
   * Startseite trägt die umgebende <section id="checkup"> die H2 (CHECKUP_TEXTE.titel).
   */
  ueberschrift?: "h2" | "h3";
  /** zusätzliche Klassen für die Karte */
  className?: string;
};

type Phase = "start" | "fragen" | "kontakt" | "fertig";
type GewichtKey = GewichtFeld["key"];

/**
 * Fitness- & Gesundheits-Check-up (27 Schritte wie live, Inhalte aus content/checkup-fragen.ts).
 * Ein Schritt pro Ansicht, „Zurück“ über den Verlauf, Versand an POST /api/checkup/.
 *
 * Einbau auf der Startseite (app/(site)/page.tsx), die Section trägt H2 und Anker:
 *   <section id="checkup" …>
 *     <SectionHeading title={CHECKUP_TEXTE.titel} … />
 *     <CheckupQuiz />
 *     <p>{CHECKUP_TEXTE.hinweis} <Link href="/datenschutz/">{CHECKUP_TEXTE.hinweisLink}</Link>.</p>
 *   </section>
 * Feste IDs (#checkup-name, #checkup-email, #checkup-telefon) → nur einmal pro Seite einbinden.
 */
export function CheckupQuiz({ ueberschrift: H = "h3", className }: CheckupQuizProps) {
  const { consent } = useConsent();
  const [phase, setPhase] = useState<Phase>("start");
  const [verlauf, setVerlauf] = useState<SchrittId[]>([ERSTER_SCHRITT]);
  const [antworten, setAntworten] = useState<Record<string, CheckupAntwort>>({});
  const [gewicht, setGewicht] = useState<Record<GewichtKey, string>>({
    aktuelles_gewicht: "",
    wunschgewicht: "",
  });
  const [gewichtFehler, setGewichtFehler] = useState<string | null>(null);
  const [kontakt, setKontakt] = useState({ name: "", email: "", telefon: "" });
  const [einwilligungDatenschutz, setEinwilligungDatenschutz] = useState(false);
  const [einwilligungGesundheit, setEinwilligungGesundheit] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const startZeit = useRef(0);
  const karteRef = useRef<HTMLDivElement>(null);
  const kopfRef = useRef<HTMLHeadingElement>(null);
  const fokusNachWechsel = useRef(false);
  const id = useId();

  const schritt = SCHRITT[verlauf[verlauf.length - 1]];

  // Nach jedem Schrittwechsel: Fokus auf die neue Überschrift, Karte bei Bedarf ins Bild holen.
  // Bewusst ohne Smooth-Scroll: Ein schneller Tipp während der Animation träfe sonst die falsche Stelle.
  useEffect(() => {
    if (!fokusNachWechsel.current) return;
    fokusNachWechsel.current = false;
    kopfRef.current?.focus({ preventScroll: true });
    const karte = karteRef.current;
    if (!karte) return;
    const { top } = karte.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight / 2) {
      karte.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [phase, verlauf]);

  function wechsle(aktion: () => void) {
    fokusNachWechsel.current = true;
    aktion();
  }

  function starten() {
    startZeit.current = Date.now();
    wechsle(() => setPhase("fragen"));
  }

  function weiter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let neu: Record<string, CheckupAntwort> = antworten;
    if (schritt.typ === "multi" && !Array.isArray(antworten[schritt.key])) {
      neu = { ...antworten, [schritt.key]: [KEINE_ANGABE] }; // ohne Auswahl wie live
    }
    if (schritt.typ === "gewicht") {
      const roh = schritt.felder.map((f) => gewicht[f.key].trim());
      if (roh.some((w) => !w)) return setGewichtFehler(T.gewichtFehlt);
      const werte = roh.map((w) => Math.round(Number(w.replace(",", ".")) * 10) / 10);
      if (!werte.every(gewichtGueltig)) return setGewichtFehler(T.gewichtBereich);
      setGewichtFehler(null);
      neu = { ...antworten, ...Object.fromEntries(schritt.felder.map((f, i) => [f.key, werte[i]])) };
    }
    const ziel = naechsterSchritt(schritt, neu);
    if (!ziel) return;
    setAntworten(neu);
    wechsle(() => (ziel === "kontakt" ? setPhase("kontakt") : setVerlauf([...verlauf, ziel])));
  }

  function zurueck() {
    setFehler(null);
    setGewichtFehler(null);
    if (phase === "kontakt") return wechsle(() => setPhase("fragen"));
    if (verlauf.length === 1) return wechsle(() => setPhase("start"));
    wechsle(() => setVerlauf(verlauf.slice(0, -1)));
  }

  function waehle(option: Option) {
    if (schritt.typ === "gewicht") return;
    if (schritt.typ === "single") return setAntworten({ ...antworten, [schritt.key]: option.wert });

    const bisher = antworten[schritt.key];
    const auswahl = (Array.isArray(bisher) ? (bisher as string[]) : []).filter((w) => w !== KEINE_ANGABE);
    const exklusiv = schritt.optionen.filter((o) => o.exklusiv).map((o) => o.wert);
    const neu = auswahl.includes(option.wert)
      ? auswahl.filter((w) => w !== option.wert)
      : option.exklusiv
        ? [option.wert]
        : [...auswahl.filter((w) => !exklusiv.includes(w)), option.wert];
    // leer = noch keine Auswahl (beim Weiter wird daraus „Keine Angabe“), Reihenfolge wie die Optionen
    const sortiert = schritt.optionen.map((o) => o.wert).filter((w) => neu.includes(w));
    const rest = { ...antworten };
    delete rest[schritt.key];
    setAntworten(sortiert.length ? { ...rest, [schritt.key]: sortiert } : rest);
  }

  async function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sendet) return;
    const pfad = pfadFuer(antworten);
    if (!pfad) return setFehler(T.fehler);
    const payload: CheckupPayload = {
      antworten: antwortenFuerPfad(antworten, pfad),
      pfad,
      kontakt: { name: kontakt.name.trim(), email: kontakt.email.trim(), telefon: kontakt.telefon.trim() },
      einwilligungDatenschutz,
      einwilligungGesundheit,
      fw_hp: honeypot,
      dauerMs: Math.max(0, Date.now() - startZeit.current),
    };
    setSendet(true);
    setFehler(null);
    try {
      const res = await fetch("/api/checkup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return setFehler(res.status === 429 ? T.fehlerZuVieleAnfragen : T.fehler);
      // Nur GA4 und nur mit Statistik-Einwilligung, NIE Antwort- oder Ergebnisdaten (Art. 9 DSGVO)
      if (consent?.statistik) trackEvent("checkup_submit", { position: "quiz" });
      wechsle(() => setPhase("fertig"));
    } catch {
      setFehler(T.fehler);
    } finally {
      setSendet(false);
    }
  }

  const karte = cn("scroll-mt-24 rounded-card border border-border bg-white p-6 shadow-sm sm:p-8", className);
  const kopf = "outline-none text-xl";
  const primaer = "min-h-12 rounded-pill bg-brand px-8 text-base font-bold text-cream hover:bg-brand/90";
  const zurueckButton = (
    <Button type="button" variant="ghost" onClick={zurueck} className="min-h-12 rounded-pill px-5">
      {T.zurueck}
    </Button>
  );

  if (phase === "start") {
    return (
      <div ref={karteRef} data-slot="checkup-quiz" className={cn(karte, "text-center")}>
        <H ref={kopfRef} tabIndex={-1} className={cn(kopf, "text-2xl")}>
          {T.startUntertitel}
        </H>
        <Button onClick={starten} className={cn(primaer, "mt-6")}>
          {T.startButton}
        </Button>
      </div>
    );
  }

  if (phase === "fertig") {
    return (
      <div ref={karteRef} data-slot="checkup-quiz" role="status" className={cn(karte, "text-center")}>
        <H ref={kopfRef} tabIndex={-1} className={cn(kopf, "text-2xl")}>
          {T.erfolgTitel}
        </H>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{T.erfolgText}</p>
      </div>
    );
  }

  const nummer = phase === "kontakt" ? CHECKUP_GESAMT : schritt.nummer;
  const fortschritt = (
    <div className="flex items-center justify-between gap-4">
      <p id={`${id}-zaehler`} className="text-sm font-semibold text-muted-foreground">
        Frage {nummer} von {CHECKUP_GESAMT}
      </p>
      <div className="h-2 w-32 overflow-hidden rounded-pill bg-muted" aria-hidden="true">
        <div
          className="h-full rounded-pill bg-brand transition-all"
          style={{ width: `${(nummer / CHECKUP_GESAMT) * 100}%` }}
        />
      </div>
    </div>
  );

  if (phase === "kontakt") {
    const felder = [
      { key: "name", typ: "text", autoComplete: "name" },
      { key: "email", typ: "email", autoComplete: "email" },
      { key: "telefon", typ: "tel", autoComplete: "tel" },
    ] as const;
    return (
      <div ref={karteRef} data-slot="checkup-quiz" className={cn(karte, "relative")}>
        <form onSubmit={absenden}>
          {fortschritt}
          <H ref={kopfRef} tabIndex={-1} aria-describedby={`${id}-zaehler`} className={cn(kopf, "mt-3")}>
            {T.kontaktTitel}
          </H>
          <div className="mt-5 space-y-4">
            {felder.map(({ key, typ, autoComplete }) => (
              <div key={key}>
                <Label htmlFor={`checkup-${key}`}>
                  <span aria-hidden="true">{T.kontaktFelder[key].icon}</span>
                  {T.kontaktFelder[key].label}
                </Label>
                <Input
                  id={`checkup-${key}`}
                  type={typ}
                  required
                  autoComplete={autoComplete}
                  maxLength={key === "email" ? 254 : key === "name" ? 100 : 30}
                  pattern={key === "telefon" ? TELEFON_MUSTER : undefined}
                  title={key === "telefon" ? "Ziffern, Leerzeichen und + ( ) / - ." : undefined}
                  value={kontakt[key]}
                  onChange={(e) => setKontakt({ ...kontakt, [key]: e.target.value })}
                  className="mt-1.5 h-11"
                />
              </div>
            ))}

            {/* Honeypot: außerhalb des Sichtbereichs, NICHT aria-hidden (axe: aria-hidden-focus) */}
            <div className="absolute top-0 -left-[10000px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-hp`}>Bitte leer lassen</label>
              <input
                id={`${id}-hp`}
                name="fw_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                checked={einwilligungDatenschutz}
                onChange={(e) => setEinwilligungDatenschutz(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span>
                Ich habe die{" "}
                <Link href="/datenschutz/" className="underline" target="_blank">
                  Datenschutzerklärung<span className="sr-only"> (öffnet in neuem Tab)</span>
                </Link>{" "}
                zur Kenntnis genommen. *
              </span>
            </label>

            {/* Art. 9 DSGVO: ausdrückliche, separate Einwilligung – eigene, unangekreuzte Checkbox */}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                checked={einwilligungGesundheit}
                onChange={(e) => setEinwilligungGesundheit(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span>{EINWILLIGUNG.gesundheit} *</span>
            </label>
          </div>

          {fehler && (
            <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {fehler}{" "}
              <TrackedLink
                href={CTA.whatsappAllgemein}
                event="whatsapp_click"
                params={{ position: "quiz", preset: "allgemein" }}
                className="font-bold underline"
              >
                {T.fehlerWhatsApp}
              </TrackedLink>
            </p>
          )}
          <p aria-live="polite" className="sr-only">
            {sendet ? T.sendet : ""}
          </p>

          {/* mobil untereinander (Absenden oben, volle Breite), ab sm nebeneinander */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {zurueckButton}
            <Button type="submit" disabled={sendet} className={cn(primaer, "w-full sm:w-auto")}>
              {sendet ? T.sendet : T.absenden}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const auswahl = schritt.typ === "gewicht" ? undefined : antworten[schritt.key];
  return (
    <div ref={karteRef} data-slot="checkup-quiz" className={karte}>
      <form onSubmit={weiter} noValidate>
        {fortschritt}
        <H ref={kopfRef} tabIndex={-1} aria-describedby={`${id}-zaehler`} className={cn(kopf, "mt-3")}>
          {schritt.titel}
        </H>
        {schritt.untertitel && <p className="mt-1 text-sm text-muted-foreground">{schritt.untertitel}</p>}

        <div className="mt-5">
          {schritt.typ === "gewicht" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {schritt.felder.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={`${id}-${f.key}`}>
                    <span aria-hidden="true">{f.icon}</span>
                    {f.label} *
                  </Label>
                  <Input
                    id={`${id}-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    min={GEWICHT.min}
                    max={GEWICHT.max}
                    step={GEWICHT.schritt}
                    placeholder={f.platzhalter}
                    required
                    aria-invalid={gewichtFehler ? true : undefined}
                    aria-describedby={gewichtFehler ? `${id}-gewicht-fehler` : undefined}
                    value={gewicht[f.key]}
                    onChange={(e) => setGewicht({ ...gewicht, [f.key]: e.target.value })}
                    className="mt-1.5 h-11"
                  />
                </div>
              ))}
              {gewichtFehler && (
                <p
                  id={`${id}-gewicht-fehler`}
                  role="alert"
                  className="text-sm text-destructive sm:col-span-2"
                >
                  {gewichtFehler}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {schritt.optionen.map((option) => {
                const aktiv =
                  schritt.typ === "multi"
                    ? Array.isArray(auswahl) && auswahl.includes(option.wert)
                    : auswahl === option.wert;
                return (
                  <button
                    key={option.wert}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => waehle(option)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-sm font-semibold transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                      aktiv
                        ? "border-brand bg-brand text-cream"
                        : "border-border bg-white text-foreground hover:border-brand/50",
                    )}
                  >
                    <span aria-hidden="true" className="text-xl leading-none">
                      {option.icon}
                    </span>
                    <span className="flex-1">{option.wert}</span>
                    {schritt.typ === "multi" && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded border-2 text-xs",
                          aktiv ? "border-cream" : "border-border",
                        )}
                      >
                        {aktiv ? "✓" : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {zurueckButton}
          <Button
            type="submit"
            disabled={schritt.typ === "single" && !naechsterSchritt(schritt, antworten)}
            className={primaer}
          >
            {T.weiter}
          </Button>
        </div>
      </form>
    </div>
  );
}
