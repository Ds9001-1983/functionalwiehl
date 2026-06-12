import { NextResponse } from "next/server";

/**
 * Empfängt den Gesundheits-Check-up.
 *
 * PROTOTYP: keine Persistenz, kein Versand — nur Validierung + Erfolgsantwort.
 * Der Versand (E-Mail an info@functional-wiehl.de, z. B. via Resend) wird erst
 * scharf geschaltet, wenn die neue Datenschutzerklärung freigegeben ist
 * (docs/TODO-recht.md). Bis dahin dürfen Gesundheitsdaten (Art. 9 DSGVO)
 * nirgendwo gespeichert oder geloggt werden — auch nicht in Server-Logs!
 */
export async function POST(req: Request) {
  let body: {
    kontakt?: { name?: string; email?: string; telefon?: string };
    einwilligungGesundheit?: boolean;
    einwilligungDatenschutz?: boolean;
    antworten?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, fehler: "Ungültige Anfrage" }, { status: 400 });
  }

  const { kontakt, einwilligungGesundheit, einwilligungDatenschutz } = body;
  if (
    !kontakt?.name?.trim() ||
    !kontakt?.email?.includes("@") ||
    !kontakt?.telefon?.trim() ||
    einwilligungGesundheit !== true ||
    einwilligungDatenschutz !== true
  ) {
    return NextResponse.json(
      { ok: false, fehler: "Pflichtfelder oder Einwilligungen fehlen" },
      { status: 422 }
    );
  }

  // Bewusst KEIN console.log des Bodys (Gesundheitsdaten!).
  // TODO nach DSE-Freigabe: Versand an info@functional-wiehl.de implementieren.
  return NextResponse.json({ ok: true });
}
