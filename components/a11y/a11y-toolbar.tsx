"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Accessibility, Contrast, Link2, Minus, Plus, RotateCcw, X, Zap } from "lucide-react";
import { useA11y } from "./a11y-context";

/**
 * Native Barrierefreiheits-Leiste (BFSG) — kein Drittanbieter-Overlay.
 * Trigger unten links (frei vom WhatsApp-FAB rechts; mobil über der Sticky-Leiste).
 * Schaltet echte CSS-Modi (Schriftgröße, Kontrast, Bewegung, Links) — siehe globals.css.
 */
export function A11yToolbar() {
  const { settings, update, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape schließt + Fokus zurück zum Trigger
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Klick außerhalb schließt
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="fixed bottom-20 left-4 z-50 lg:bottom-6">
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Barrierefreiheit – Anzeige anpassen"
          className="absolute bottom-16 left-0 w-72 rounded-card border border-border bg-white p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-brand">Barrierefreiheit</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Schließen"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Schriftgröße */}
          <div className="mt-4">
            <p className="text-sm font-semibold">Schriftgröße</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => update({ fontScale: Math.max(0, settings.fontScale - 1) as 0 | 1 | 2 })}
                disabled={settings.fontScale === 0}
                aria-label="Schrift verkleinern"
                className="flex size-10 items-center justify-center rounded-xl border-2 border-border text-brand disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex-1 text-center text-sm font-bold" aria-live="polite">
                {["Normal", "Groß", "Sehr groß"][settings.fontScale]}
              </span>
              <button
                type="button"
                onClick={() => update({ fontScale: Math.min(2, settings.fontScale + 1) as 0 | 1 | 2 })}
                disabled={settings.fontScale === 2}
                aria-label="Schrift vergrößern"
                className="flex size-10 items-center justify-center rounded-xl border-2 border-border text-brand disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-4 space-y-2">
            <ToggleRow
              label="Kontrast erhöhen"
              icon={<Contrast className="size-4" />}
              pressed={settings.contrast}
              onClick={() => update({ contrast: !settings.contrast })}
            />
            <ToggleRow
              label="Animationen reduzieren"
              icon={<Zap className="size-4" />}
              pressed={settings.reduceMotion}
              onClick={() => update({ reduceMotion: !settings.reduceMotion })}
            />
            <ToggleRow
              label="Links hervorheben"
              icon={<Link2 className="size-4" />}
              pressed={settings.highlightLinks}
              onClick={() => update({ highlightLinks: !settings.highlightLinks })}
            />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill border-2 border-border py-2 text-sm font-bold text-brand hover:bg-muted"
          >
            <RotateCcw className="size-4" /> Zurücksetzen
          </button>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Barrierefreiheit"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex size-12 items-center justify-center rounded-full bg-brand text-cream shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none"
      >
        <Accessibility className="size-6" />
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  icon,
  pressed,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
        pressed ? "border-brand bg-brand text-cream" : "border-border text-foreground hover:border-brand/50"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        aria-hidden="true"
        className={`text-xs font-bold ${pressed ? "text-cream" : "text-muted-foreground"}`}
      >
        {pressed ? "An" : "Aus"}
      </span>
    </button>
  );
}
