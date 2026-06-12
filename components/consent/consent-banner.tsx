"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useConsent } from "./consent-context";

/**
 * Schlanker Eigenbau statt CMP-SaaS (kein TCF nötig, nur 2 Empfänger).
 * Bottom-Sheet als Overlay → kein CLS. Hard-Gating: GA4/Pixel laden erst
 * nach Opt-in (analytics-scripts.tsx).
 */
export function ConsentBanner() {
  const { bannerOpen, loading, save } = useConsent();
  const [detail, setDetail] = useState(false);
  const [statistik, setStatistik] = useState(true);
  const [marketing, setMarketing] = useState(true);

  if (loading || !bannerOpen) return null;

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
            <Link href="/datenschutz/" className="underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
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
            onClick={() => save({ statistik: true, marketing: true })}
            className="rounded-pill bg-brand font-bold text-cream hover:bg-brand/90"
          >
            Alle akzeptieren
          </Button>
          <Button
            variant="outline"
            onClick={() => save({ statistik: false, marketing: false })}
            className="rounded-pill"
          >
            Nur notwendige
          </Button>
          {detail ? (
            <Button
              variant="ghost"
              onClick={() => save({ statistik, marketing })}
              className="rounded-pill"
            >
              Auswahl speichern
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setDetail(true)} className="rounded-pill">
              Einstellungen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Footer-Link „Cookie-Einstellungen" — Widerruf jederzeit möglich (TTDSG). */
export function ConsentRevokeButton() {
  const { openBanner } = useConsent();
  return (
    <button type="button" onClick={openBanner} className="underline-offset-2 hover:underline">
      Cookie-Einstellungen
    </button>
  );
}
