import { KURSPLAN_STATISCH, type Kursplan } from "@/content/kursplan";

/**
 * Adapter für die Kursplan-Daten — einzige Bezugsquelle der UI.
 *
 * Phase 1 (jetzt): statisches Objekt aus content/kursplan.ts → Seite ist SSG.
 *
 * Phase 2 (TODO, siehe docs/TODO-kursplan-api.md): Die Studio-App pflegt
 * Kursplan, Anmeldungen und freie Plätze. Sobald deren API bereitsteht:
 *
 *   const res = await fetch(`${process.env.KURSPLAN_API_URL}/api/v1/kursplan`, {
 *     headers: { "x-api-key": process.env.KURSPLAN_API_KEY! },
 *     next: { revalidate: 900 }, // ISR 15 min — frische Plätze ohne Realtime-Aufwand
 *   });
 *   if (!res.ok) return KURSPLAN_STATISCH; // Seite bricht nie
 *   return mapAppSchema(await res.json());
 */
export async function getKursplan(): Promise<Kursplan> {
  return KURSPLAN_STATISCH;
}
