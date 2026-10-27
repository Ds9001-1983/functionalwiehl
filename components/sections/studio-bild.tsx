import Image from "next/image";
import { cn } from "@/lib/utils";
import studioLuftbild from "@/public/img/studio-luftbild.jpg";

/**
 * Standbild aus dem Drohnenflug der Live-Site (Hero und „So findest du uns“ in #kontakt).
 * Ersetzt seit 27.10.2026 das Video: Es blendete „14 Tage KOSTENLOS“ ein, das Angebot gibt es
 * nicht mehr (Entscheidung Dennis). Das erste Bild zeigt nur „Dein Gym in Wiehl“.
 * Hochformat 960×1706 – der Ausschnitt sitzt auf dem Functional-Schild (ca. 45 % Höhe).
 */
export function StudioBild({
  className,
  sizes,
  preload = false,
}: {
  className?: string;
  sizes: string;
  /** nur im Hero setzen (LCP-Kandidat), sonst lazy */
  preload?: boolean;
}) {
  return (
    <Image
      src={studioLuftbild}
      alt="Luftaufnahme von Wiehl mit dem Schild von Functional Wiehl über dem Studio"
      sizes={sizes}
      preload={preload}
      className={cn("h-full w-full object-cover object-[50%_45%]", className)}
    />
  );
}
