import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

/**
 * Editorialer Sektions-Kopf: Eyebrow + großer Index („01") + Display-Titel.
 * Ersetzt die nackten <h2> über die ganze Site und gibt jeder Sektion
 * denselben charakterstarken Rhythmus.
 *
 * tone="dark"  → für helle Hintergründe (Indigo-Text)
 * tone="light" → für Indigo-/dunkle Hintergründe (Creme-Text)
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  as = "h2",
  tone = "dark",
  className,
  children,
}: {
  eyebrow?: string;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  as?: ElementType;
  tone?: Tone;
  className?: string;
  children?: ReactNode;
}) {
  const Tag = as;
  const light = tone === "light";

  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && (
        <span className={cn("eyebrow", light ? "text-cta" : "text-whatsapp")}>
          <span
            aria-hidden="true"
            className={cn("h-px w-8", light ? "bg-cta/70" : "bg-whatsapp/70")}
          />
          {eyebrow}
        </span>
      )}
      <div className="mt-3 flex items-baseline gap-4">
        {index && (
          <span
            aria-hidden="true"
            className={cn(
              "font-heading text-2xl font-black tabular-nums sm:text-3xl",
              light ? "text-cream/35" : "text-brand/25"
            )}
          >
            {index}
          </span>
        )}
        <Tag
          className={cn(
            "text-headline",
            light && "text-cream"
          )}
        >
          {title}
        </Tag>
      </div>
      {description && (
        <p className={cn("mt-4 text-base sm:text-lg", light ? "text-cream/85" : "text-muted-foreground")}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
