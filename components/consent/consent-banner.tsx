"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useConsent } from "./consent-context";

const DATENSCHUTZ = "/datenschutz/";

/**
 * Schlanker Eigenbau statt CMP-SaaS (kein TCF nötig, nur 2 Empfänger).
 * Bottom-Sheet als Overlay → kein CLS. Hard-Gating: GA4/Pixel laden erst
 * nach Opt-in (analytics-scripts.tsx). Ausnahme BN-LP: Pixel ohne Einwilligung
 * (Entscheidung Dennis), deshalb dort ein zusätzlicher Hinweis.
 * Liegt im Root-Layout und erscheint auch auf der LP.
 */
export function ConsentBanner() {
  const { consent, bannerOpen, loading, save } = useConsent();
  const pathname = usePathname();
  const [detail, setDetail] = useState(false);
  // Opt-in heißt: nichts vorangekreuzt (EuGH Planet49). Beim erneuten Öffnen zeigen die
  // Häkchen die gespeicherte Entscheidung (siehe „Einstellungen“).
  const [statistik, setStatistik] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (loading || !bannerOpen) return null;

  const speichern = (choice: { statistik: boolean; marketing: boolean }) => {
    setDetail(false);
    save(choice);
  };
  const einstellungenZeigen = () => {
    setStatistik(consent?.statistik ?? false);
    setMarketing(consent?.marketing ?? false);
    setDetail(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] sm:p-6"
    >
      <div className="container-site flex flex-col gap-4">
        <div>
          <p className="font-bold text-brand">Deine Privatsphäre</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Wir nutzen Cookies, um zu verstehen, wie unsere Website genutzt wird (Statistik), und
            um unsere Werbung zu verbessern (Marketing). Du entscheidest – Training geht auch ohne
            Cookies. Details in der{" "}
            {/* normales <a>: Dokumentgrenze, damit der LP-Pixel nicht per Client-Navigation mitwandert */}
            <a href={DATENSCHUTZ} className="underline">
              Datenschutzerklärung
            </a>
            .
          </p>
          {pathname.startsWith("/black-november") && (
            <p className="mt-2 text-sm text-muted-foreground">
              Auf dieser Aktionsseite messen wir den Erfolg unserer Anzeige mit dem Meta-Pixel auch
              ohne deine Einwilligung. Details in der Datenschutzerklärung.
            </p>
          )}
        </div>

        {detail && (
          <div className="flex flex-col gap-3 rounded-card bg-muted p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="consent-notwendig" className="font-semibold">
                Notwendig
                <span className="block text-xs font-normal text-muted-foreground">
                  Für den Betrieb der Seite erforderlich (z. B. diese Einstellung).
                </span>
              </Label>
              <input id="consent-notwendig" type="checkbox" checked disabled className="size-5" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="consent-statistik" className="font-semibold">
                Statistik (Google Analytics)
                <span className="block text-xs font-normal text-muted-foreground">
                  Anonyme Auswertung der Seitennutzung.
                </span>
              </Label>
              <input
                id="consent-statistik"
                type="checkbox"
                checked={statistik}
                onChange={(e) => setStatistik(e.target.checked)}
                className="size-5 accent-brand"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="consent-marketing" className="font-semibold">
                Marketing (Meta Pixel)
                <span className="block text-xs font-normal text-muted-foreground">
                  Erfolgsmessung unserer Anzeigen auf Facebook & Instagram.
                </span>
              </Label>
              <input
                id="consent-marketing"
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="size-5 accent-brand"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={() => speichern({ statistik: true, marketing: true })}
            className="rounded-pill bg-brand font-bold text-cream hover:bg-brand/90"
          >
            Alle akzeptieren
          </Button>
          <Button
            variant="outline"
            onClick={() => speichern({ statistik: false, marketing: false })}
            className="rounded-pill"
          >
            Nur notwendige
          </Button>
          {detail ? (
            <Button
              variant="ghost"
              onClick={() => speichern({ statistik, marketing })}
              className="rounded-pill"
            >
              Auswahl speichern
            </Button>
          ) : (
            <Button variant="ghost" onClick={einstellungenZeigen} className="rounded-pill">
              Einstellungen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Footer-Link „Cookie-Einstellungen" — Widerruf jederzeit möglich (TTDSG). */
export function ConsentRevokeButton({ className }: { className?: string }) {
  const { openBanner } = useConsent();
  return (
    <button type="button" onClick={openBanner} className={cn("underline-offset-2 hover:underline", className)}>
      Cookie-Einstellungen
    </button>
  );
}
