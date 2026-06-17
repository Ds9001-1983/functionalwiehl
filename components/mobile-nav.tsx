"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/nav";
import { WhatsAppCta, CalendlyCta } from "./cta-buttons";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Menü öffnen"
        className="inline-flex size-11 items-center justify-center rounded-full text-brand hover:bg-brand/5 xl:hidden"
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
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-semibold text-brand hover:bg-brand/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <WhatsAppCta position="header" />
          <CalendlyCta position="header" variant="ghost" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
