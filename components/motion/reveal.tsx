"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealProps = {
  children: ReactNode;
  /** Wrapper-Tag (default div). */
  as?: ElementType;
  className?: string;
  /** Staggert die direkten Kinder nacheinander statt den Block als Ganzes. */
  stagger?: boolean;
  /** Startverzögerung in Sekunden. */
  delay?: number;
};

/**
 * Sanftes Einblenden (Fade + Translate-Up) beim Reinscrollen via GSAP
 * ScrollTrigger. Der Grundzustand (versteckt) kommt aus globals.css über
 * `[data-reveal]` und greift NUR mit aktivem JS (html.js) und ohne
 * Reduced-Motion — so ist der Inhalt sonst immer sofort sichtbar.
 *
 * - `stagger`: die Kinder bekommen automatisch `data-reveal` und erscheinen
 *   nacheinander (z. B. Bento-Kacheln, Galerie).
 */
export function Reveal({ children, as, className, stagger = false, delay = 0 }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (reduced || !root) return;
    gsap.registerPlugin(ScrollTrigger);

    const targets = stagger ? Array.from(root.children) : [root];

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        delay,
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, stagger, delay]);

  // Einzel-Modus: der Wrapper selbst ist das Reveal-Ziel.
  if (!stagger) {
    return (
      <Tag ref={ref} data-reveal="" className={className}>
        {children}
      </Tag>
    );
  }

  // Stagger-Modus: jedes Kind bekommt data-reveal (für den CSS-Grundzustand).
  const items = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as React.ReactElement<Record<string, unknown>>, { "data-reveal": "" })
      : child
  );
  return (
    <Tag ref={ref} className={className}>
      {items}
    </Tag>
  );
}
