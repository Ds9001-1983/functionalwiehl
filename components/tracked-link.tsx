"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEvent, type EventName, type EventParams } from "@/lib/tracking";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: EventName;
  params?: EventParams;
};

/** Einziger Klick-Tracking-Pfad für externe CTAs (WhatsApp/Tel/Calendly/Mail). */
export function TrackedLink({ event, params, children, ...anchor }: TrackedLinkProps) {
  return (
    <a {...anchor} onClick={() => trackEvent(event, params)}>
      {children}
    </a>
  );
}
