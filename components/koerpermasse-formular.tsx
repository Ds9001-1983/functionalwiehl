"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck, House, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EINWILLIGUNG_DATENSCHUTZ,
  EINWILLIGUNG_KOERPERMASSE,
  KONTAKT_GRENZEN,
  KOERPERMASSE_TEXTE as T,
  MASS_GRENZEN,
  MASS_GRUPPEN,
  MASSE,
  type KoerpermasseAnfrage,
  type MassId,
} from "@/content/koerpermasse";

/**
 * „Körpermaße Digital“ wie live: Startansicht → Schritt 1 (8 Maße) → Schritt 2 (Kontakt,
 * Einwilligungen) → Erfolg mit „Neue Messung“. Sie-Form, Texte aus content/koerpermasse.ts.
 *
 * Bewusst KEIN Tracking (weder GA4 noch Pixel): Körpermaße gelten vorsorglich als
 * Gesundheitsdaten (Art. 9 DSGVO). Erfolg nur bei 200 {ok:true}, sonst ehrlicher Fehler.
 */

type Schritt = "start" | "masse" | "kontakt" | "fertig";
type Versand = "ruhe" | "sendet" | "fehler" | "zuViele";

const LEERE_MASSE = Object.fromEntries(MASSE.map((m) => [m.id, ""])) as Record<MassId, string>;
const LEERER_KONTAKT = { vorname: "", nachname: "", handy: "" };
const SCHRITT_NR: Record<Exclude<Schritt, "start">, number> = { masse: 1, kontakt: 2, fertig: 3 };

const knopfHaupt = "min-h-11 w-full rounded-pill bg-brand px-6 text-base font-bold text-cream hover:bg-brand/90";

function Fortschritt({ aktiv }: { aktiv: number }) {
  return (
    <ol aria-label="Fortschritt" className="flex items-center justify-center">
      {[1, 2, 3].map((n) => (
        <li key={n} className="flex items-center" aria-current={n === aktiv ? "step" : undefined}>
          {n > 1 && (
            <span aria-hidden="true" className={`mx-1 h-[3px] w-9 rounded-full ${n <= aktiv ? "bg-brand" : "bg-border"}`} />
          )}
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
              n <= aktiv ? "bg-brand text-cream" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="sr-only">Schritt </span>
            {n}
            <span className="sr-only"> von 3{n < aktiv ? ", erledigt" : ""}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function KoerpermasseFormular() {
  const [schritt, setSchritt] = useState<Schritt>("start");
  const [masse, setMasse] = useState(LEERE_MASSE);
  const [kontakt, setKontakt] = useState(LEERER_KONTAKT);
  const [einwilligungDatenschutz, setEinwilligungDatenschutz] = useState(false);
  const [einwilligungKoerpermasse, setEinwilligungKoerpermasse] = useState(false);
  const [versand, setVersand] = useState<Versand>("ruhe");

  // Nach jedem Wechsel den Fokus auf die neue Überschrift (Screenreader, Tastatur) –
  // nicht beim ersten Rendern, sonst springt die Seite beim Laden.
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  const wechsel = useRef(false);
  useEffect(() => {
    if (!wechsel.current) return;
    wechsel.current = false;
    ueberschrift.current?.focus();
  }, [schritt]);

  function gehe(ziel: Schritt) {
    wechsel.current = true;
    setSchritt(ziel);
  }

  function neueMessung() {
    setMasse(LEERE_MASSE);
    setKontakt(LEERER_KONTAKT);
    setEinwilligungDatenschutz(false);
    setEinwilligungKoerpermasse(false);
    setVersand("ruhe");
    gehe("masse");
  }

  async function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (versand === "sendet") return;
    setVersand("sendet");
    const anfrage: KoerpermasseAnfrage = {
      masse: Object.fromEntries(MASSE.map((m) => [m.id, Number(masse[m.id])])) as Record<MassId, number>,
      kontakt,
      einwilligungDatenschutz,
      einwilligungKoerpermasse,
      // Honeypot aus dem DOM lesen: Bots setzen den Wert oft ohne Eingabe-Events
      fw_hp: String(new FormData(e.currentTarget).get("fw_hp") ?? ""),
    };
    try {
      const res = await fetch("/api/koerpermasse/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anfrage),
      });
      const daten = (await res.json().catch(() => null)) as { ok?: unknown } | null;
      if (res.ok && daten?.ok === true) {
        setVersand("ruhe");
        gehe("fertig");
        return;
      }
      setVersand(res.status === 429 ? "zuViele" : "fehler");
    } catch {
      setVersand("fehler");
    }
  }

  if (schritt === "start") {
    return (
      <div className="space-y-4">
        <ul className="space-y-3">
          {T.karten.map((karte, i) => {
            const Icon = i === 0 ? Target : TrendingUp;
            return (
              <li key={karte.titel} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{karte.titel}</span>
                  <span className="block text-sm text-muted-foreground">{karte.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <Button type="button" onClick={() => gehe("masse")} className={knopfHaupt}>
          {T.start}
        </Button>
        <p className="text-center text-sm text-muted-foreground">{T.dauer}</p>
        <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="font-semibold text-brand underline">
            Functional Wiehl
          </Link>
        </p>
      </div>
    );
  }

  const sendet = versand === "sendet";

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={() => gehe("start")}
            disabled={sendet}
            aria-label={T.zurUebersicht}
            title={T.zurUebersicht}
            className="rounded-full text-muted-foreground"
          >
            <House className="size-5" />
          </Button>
          <h2 className="text-2xl">{T.wizardTitel}</h2>
          <span className="size-9" aria-hidden="true" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{T.wizardUntertitel}</p>
      </div>

      <Fortschritt aktiv={SCHRITT_NR[schritt]} />

      {schritt === "masse" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            gehe("kontakt");
          }}
          className="space-y-3 rounded-card border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <h3 ref={ueberschrift} tabIndex={-1} className="text-lg outline-none">
            {T.schritt1}
          </h3>
          {MASS_GRUPPEN.map((gruppe) => (
            <fieldset key={gruppe.titel} className="rounded-xl bg-muted p-3">
              <legend className="float-left mb-2 w-full text-sm font-semibold text-foreground">{gruppe.titel}</legend>
              <div className="clear-both grid grid-cols-2 gap-3">
                {gruppe.felder.map((feld) => (
                  <div key={feld.id}>
                    <Label htmlFor={`km-${feld.id}`}>{feld.label}</Label>
                    <Input
                      id={`km-${feld.id}`}
                      name={feld.name}
                      type="number"
                      inputMode="decimal"
                      step={MASS_GRENZEN.schritt}
                      min={MASS_GRENZEN.min}
                      max={MASS_GRENZEN.max}
                      required
                      value={masse[feld.id]}
                      onChange={(e) => setMasse({ ...masse, [feld.id]: e.target.value })}
                      className="mt-1 h-10 bg-white"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
          <Button type="submit" className={knopfHaupt}>
            {T.weiter}
          </Button>
        </form>
      )}

      {schritt === "kontakt" && (
        <form
          onSubmit={absenden}
          aria-busy={sendet}
          className="relative space-y-4 rounded-card border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <h3 ref={ueberschrift} tabIndex={-1} className="text-lg outline-none">
            {T.schritt2}
          </h3>
          <div>
            <Label htmlFor="km-vorname">{T.vorname}</Label>
            <Input
              id="km-vorname"
              name="Vorname"
              required
              maxLength={KONTAKT_GRENZEN.nameMax}
              autoComplete="given-name"
              value={kontakt.vorname}
              onChange={(e) => setKontakt({ ...kontakt, vorname: e.target.value })}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="km-nachname">{T.nachname}</Label>
            <Input
              id="km-nachname"
              name="Nachname"
              required
              maxLength={KONTAKT_GRENZEN.nameMax}
              autoComplete="family-name"
              value={kontakt.nachname}
              onChange={(e) => setKontakt({ ...kontakt, nachname: e.target.value })}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label htmlFor="km-handy">{T.handy}</Label>
            <Input
              id="km-handy"
              name="Handynummer"
              type="tel"
              required
              minLength={KONTAKT_GRENZEN.handyMin}
              maxLength={KONTAKT_GRENZEN.handyMax}
              // Browser kompilieren pattern mit dem v-Flag: ( ) / - in der Klasse escapen
              pattern={"[+0-9 \\(\\)\\/\\-]+"}
              autoComplete="tel"
              value={kontakt.handy}
              onChange={(e) => setKontakt({ ...kontakt, handy: e.target.value })}
              className="mt-1 h-10"
            />
          </div>

          {/* Honeypot: außerhalb des Sichtbereichs, aus der Tab-Reihenfolge genommen;
              bewusst ohne aria-hidden (axe: aria-hidden-focus) */}
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="km-fw-hp">Bitte leer lassen</label>
            <input id="km-fw-hp" name="fw_hp" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
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
              {EINWILLIGUNG_DATENSCHUTZ.vor}
              <Link href="/datenschutz/" target="_blank" className="font-semibold text-brand underline">
                {EINWILLIGUNG_DATENSCHUTZ.link}
              </Link>
              {EINWILLIGUNG_DATENSCHUTZ.nach} *
            </span>
          </label>

          {/* Art. 9 DSGVO: eigene, unangekreuzte Checkbox (Wortlaut: Freigabe Conny) */}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              required
              checked={einwilligungKoerpermasse}
              onChange={(e) => setEinwilligungKoerpermasse(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-brand"
            />
            <span>{EINWILLIGUNG_KOERPERMASSE} *</span>
          </label>

          <p className="rounded-xl border border-brand/20 bg-secondary p-3 text-sm text-brand">
            <strong>{T.hinweisFett}</strong> {T.hinweis}
          </p>

          {(versand === "fehler" || versand === "zuViele") && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {versand === "zuViele" ? T.fehlerZuViele : T.fehler}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => gehe("masse")}
              disabled={sendet}
              className="min-h-11 flex-1 rounded-pill"
            >
              {T.zurueck}
            </Button>
            <Button type="submit" disabled={sendet} className={`${knopfHaupt} flex-2`}>
              {sendet ? T.sendet : T.senden}
            </Button>
          </div>
        </form>
      )}

      {schritt === "fertig" && (
        <div role="status" className="space-y-3 rounded-card border border-border bg-white p-6 text-center shadow-sm">
          <span aria-hidden="true" className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
            <CircleCheck className="size-6" />
          </span>
          <h3 ref={ueberschrift} tabIndex={-1} className="text-xl outline-none">
            {T.erfolgTitel}
          </h3>
          <p className="text-muted-foreground">{T.erfolgText}</p>
          <Button type="button" onClick={neueMessung} className={knopfHaupt}>
            {T.neueMessung}
          </Button>
        </div>
      )}
    </div>
  );
}
