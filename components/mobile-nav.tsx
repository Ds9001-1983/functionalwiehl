"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/nav";
import { WhatsAppCta } from "./cta-buttons";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Ziel des angetippten Menüpunkts: navigiert wird erst, wenn das Sheet ganz zu ist
  const ziel = useRef<string | null>(null);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(offen) => {
        const href = ziel.current;
        if (offen || !href) return;
        ziel.current = null;
        // Nach der Schließ-Animation gibt base-ui die Scroll-Sperre frei; erst dann
        // scrollt Next zum Anker (auch seitenübergreifend, z. B. von /impressum/ nach /#preise).
        requestAnimationFrame(() => router.push(href));
      }}
    >
      <SheetTrigger
        aria-label="Menü öffnen"
        className="inline-flex size-11 items-center justify-center rounded-full text-brand hover:bg-brand/5 lg:hidden"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left text-brand">Menü</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                // Sheet erst schließen, dann scrollen: Solange es offen ist, sperrt base-ui das
                // Scrollen der Seite. stopImmediatePropagation hält zusätzlich den Anker-Handler
                // von SmoothScroll (am document, nach React registriert) zurück.
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                ziel.current = item.href;
                setOpen(false);
              }}
              className="rounded-xl px-3 py-3 text-base font-semibold tracking-wide text-brand uppercase hover:bg-brand/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <WhatsAppCta ziel="probetraining" position="header" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
