import { NextResponse, type NextRequest } from "next/server";
import { mailFehlerCode, sendeMail, testMails, testTransportAktiv } from "@/lib/mailer";

/**
 * Testsenke des JSON-Mailtransports für die Playwright-Abnahme.
 * Aktiv NUR bei MAIL_TRANSPORT=json außerhalb von Vercel, sonst 404 (auch in
 * Preview und Production existiert dann nichts zum Auslesen).
 *
 *   GET  /api/test/mails/?an=<adresse>&betreff=<teilstring>  → { mails: TestMail[] }, neueste zuerst
 *   POST /api/test/mails/  { an, betreff, text }              → schickt eine Mail durch lib/mailer.ts
 *
 * Helfer für Tests: tests/helpers/mails.ts (holeTestMails, erwarteTestMail).
 */

const keinCache = { "Cache-Control": "no-store" };

export function GET(request: NextRequest) {
  if (!testTransportAktiv()) return new NextResponse(null, { status: 404 });
  const an = request.nextUrl.searchParams.get("an");
  const betreff = request.nextUrl.searchParams.get("betreff");
  const mails = testMails()
    .filter((m) => (!an || m.an.includes(an)) && (!betreff || m.betreff.includes(betreff)))
    .toReversed();
  return NextResponse.json({ mails }, { headers: keinCache });
}

export async function POST(request: NextRequest) {
  if (!testTransportAktiv()) return new NextResponse(null, { status: 404 });
  const body = (await request.json().catch(() => null)) as { an?: unknown; betreff?: unknown; text?: unknown } | null;
  if (typeof body?.an !== "string" || typeof body.betreff !== "string" || typeof body.text !== "string") {
    return NextResponse.json({ ok: false, fehler: "an, betreff und text erwartet" }, { status: 400, headers: keinCache });
  }
  try {
    await sendeMail({ an: body.an, betreff: body.betreff, text: body.text });
    return NextResponse.json({ ok: true }, { headers: keinCache });
  } catch (err) {
    return NextResponse.json({ ok: false, fehler: mailFehlerCode(err) }, { status: 500, headers: keinCache });
  }
}
