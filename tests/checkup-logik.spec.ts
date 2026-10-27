import { expect, test } from "@playwright/test";
import live from "./fixtures/live-checkup.json";
import {
  CHECKUP_GESAMT,
  CHECKUP_SCHRITTE,
  CHECKUP_TEXTE as T,
  ERSTER_SCHRITT,
  KEINE_ANGABE,
  SCHRITT,
  antwortGueltig,
  antwortKeys,
  antwortenFuerPfad,
  gewichtGueltig,
  naechsterSchritt,
  pfadFuer,
  pruefeCheckup,
  type CheckupAntworten,
  type SchrittId,
} from "../content/checkup-fragen";

/**
 * Check-up-Logik ohne Browser: Wortlaut gegen die Live-Fixture vom 27.10.2026
 * (tests/fixtures/live-checkup.json), Verzweigungen, pfadFuer() und die Server-Prüfung
 * pruefeCheckup() (gemeinsam von Quiz und /api/checkup/ genutzt).
 */
test.skip(({ isMobile }) => isMobile, "Unit-Tests, einmal genügt");

/** Antworten, bei denen jede Ja/Nein-Frage mit „Nein“ und jede Mehrfachauswahl leer beantwortet ist */
const NEIN_ZU_ALLEM: CheckupAntworten = {
  fitnessstudio_erfahrung: "Nein",
  training_art: [KEINE_ANGABE],
  trainingsfrequenz: "1x pro Woche",
  aerztliche_behandlung: "Nein",
  herz_kreislauf: "Nein",
  venenerkrankung: "Nein",
  atemwegs_erkrankung: "Nein",
  stoffwechsel_erkrankung: "Nein",
  orthopaedische_beschwerden: "Nein",
  psychische_erkrankung: "Nein",
  sonstige_erkrankungen: ["Nein"],
  regelmaessige_medikamente: "Nein",
  op_letzte_12_monate: "Nein",
};
const ANFANG: CheckupAntworten = { beruf: "sitzend", stresslevel: "mittel", fitnesslevel: "hoch" };
const MEDIZIN_NEIN: SchrittId[] = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "23", "24", "26"];

const ZIELPFADE: { name: string; antworten: CheckupAntworten; pfad: SchrittId[] }[] = [
  {
    name: "Muskeln → Gewicht → 8 (F7E entfällt)",
    antworten: {
      ...ANFANG,
      trainingsziele: "Muskeln & Körperstruktur",
      muskeln_fokus: "Gewichtsreduktion",
      aktuelles_gewicht: 90,
      wunschgewicht: 80.5,
      ...NEIN_ZU_ALLEM,
    },
    pfad: ["2", "3", "4", "5", "F6A", "7", ...MEDIZIN_NEIN],
  },
  {
    name: "Cardio → Problemzonen → Versuche → 8",
    antworten: {
      ...ANFANG,
      trainingsziele: "Cardio & Mobility",
      cardio_fokus: "Mehr Ausdauer",
      problemzonen: "Beine",
      bisherige_versuche: ["Sport"],
      ...NEIN_ZU_ALLEM,
    },
    pfad: ["2", "3", "4", "5", "F6B", "F6D", "F7E", ...MEDIZIN_NEIN],
  },
  {
    name: "Gesundheit (Rücken) → Problemzonen → Versuche → 8",
    antworten: {
      ...ANFANG,
      trainingsziele: "Gesundheit und Lifestyle",
      gesundheit_fokus: "Rückentraining",
      problemzonen: "Rücken",
      bisherige_versuche: [KEINE_ANGABE],
      ...NEIN_ZU_ALLEM,
    },
    pfad: ["2", "3", "4", "5", "F6C", "F6D", "F7E", ...MEDIZIN_NEIN],
  },
  {
    name: "Gesundheit (Lebensstil) → Versuche → 8",
    antworten: {
      ...ANFANG,
      trainingsziele: "Gesundheit und Lifestyle",
      gesundheit_fokus: "Stressabbau",
      bisherige_versuche: ["Ernährung", "Medizinisch (z.B. Physio)"],
      ...NEIN_ZU_ALLEM,
    },
    pfad: ["2", "3", "4", "5", "F6C", "F7E", ...MEDIZIN_NEIN],
  },
];

const payloadFuer = (antworten: CheckupAntworten, extra: Record<string, unknown> = {}) => ({
  antworten,
  pfad: pfadFuer(antworten),
  kontakt: { name: "Test Person", email: "test@example.com", telefon: "0151 / 123 456-78" },
  einwilligungDatenschutz: true,
  einwilligungGesundheit: true,
  fw_hp: "",
  dauerMs: 60_000,
  ...extra,
});

test.describe("Wortlaut wie live (Fixture vom 27.10.2026)", () => {
  test("Fixture stammt aus dem WP-Archiv, nicht aus dem Redesign", () => {
    expect(live.quelle).toBe("home.html");
    expect(live.stand.startsWith("2026-10-27")).toBe(true);
    expect(live.skript.gesamt).toBe(CHECKUP_GESAMT);
  });

  test("alle 29 Frage-Schritte: Reihenfolge, Zähler, Titel, Feldnamen, Werte, Icons, Sprünge", () => {
    expect(CHECKUP_SCHRITTE.map((s) => s.id)).toEqual(live.schritte.map((s) => s.id));
    for (const l of live.schritte) {
      const s = SCHRITT[l.id as SchrittId];
      const ort = `Schritt ${l.id}`;
      expect(s.nummer, ort).toBe(l.nummer);
      expect(s.titel, ort).toBe(l.titel);
      expect(s.untertitel, ort).toBe(l.untertitel);
      expect(s.typ, ort).toBe(l.typ);
      const sprung = (z: string | undefined) => (z === "27" ? "kontakt" : z);

      if (s.typ === "gewicht") {
        expect(s.felder.map((f) => `${f.icon} ${f.label} *`), ort).toEqual(l.felder!.map((f) => f.label));
        expect(s.felder.map((f) => f.platzhalter), ort).toEqual(l.felder!.map((f) => f.platzhalter));
        expect(s.weiter, ort).toBe(sprung(l.weiter));
        continue;
      }
      expect(s.key, ort).toBe(l.key);
      expect(
        s.optionen.map((o) => ({ wert: o.wert, icon: o.icon })),
        ort
      ).toEqual(l.optionen!.map((o) => ({ wert: o.wert, icon: o.icon })));
      // Live zeigt als Beschriftung genau den gespeicherten Wert
      for (const o of l.optionen!) expect(o.label, ort).toBe(o.wert);
      if (s.typ === "single") {
        expect(s.optionen.map((o) => o.weiter), ort).toEqual(
          l.optionen!.map((o) => sprung("weiter" in o ? o.weiter : undefined))
        );
      } else {
        expect(s.weiter, ort).toBe(sprung(l.weiter));
        expect(l.weiterKey, ort).toBe(l.key);
      }
    }
  });

  test("Texte rund um die Fragen: live, Anrede durchgehend Du", () => {
    expect(T.titel).toBe(live.start.titel);
    expect(T.startButton).toBe(live.start.button);
    expect(T.startUntertitel).toBe(live.start.untertitel!.replace("Ihrem", "deinem"));
    expect(T.kontaktTitel).toBe(live.kontakt.titel);
    expect(Object.values(T.kontaktFelder).map((f) => `${f.icon} ${f.label}`)).toEqual(
      live.kontakt.felder.map((f) => f.label.replace("Ihr Name", "Dein Name"))
    );
    expect([T.zurueck, T.absenden]).toEqual(live.kontakt.buttons);
    expect(T.sendet).toBe(live.kontakt.sendet);
    expect(T.erfolgTitel).toBe(live.erfolg.titel);
    expect(T.erfolgText).toBe(
      live.erfolg.text.replace("\n", " ").replace("Ihr Check-up", "Dein Check-up").replace("bei Ihnen", "bei dir")
    );
    expect(KEINE_ANGABE).toBe(live.skript.keineAngabe);
    expect(T.gewichtFehlt).toBe(live.skript.hinweisGewicht);
    expect(T.fehler).toBe(live.skript.fehlerNetz);
  });
});

test.describe("Schritt-Modell", () => {
  test("IDs und Feldnamen eindeutig, jeder Sprung zeigt auf einen Schritt, alle Schritte erreichbar", () => {
    const ids = CHECKUP_SCHRITTE.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = CHECKUP_SCHRITTE.flatMap(antwortKeys);
    expect(new Set(keys).size).toBe(keys.length);

    const ziele = CHECKUP_SCHRITTE.flatMap((s) =>
      s.typ === "single" ? s.optionen.map((o) => o.weiter) : [s.weiter]
    );
    for (const z of ziele) expect(z === "kontakt" || (z !== undefined && z in SCHRITT), String(z)).toBe(true);

    const erreichbar = new Set<SchrittId>([ERSTER_SCHRITT]);
    for (const s of CHECKUP_SCHRITTE) {
      for (const z of s.typ === "single" ? s.optionen.map((o) => o.weiter) : [s.weiter]) {
        if (z && z !== "kontakt") erreichbar.add(z);
      }
    }
    expect([...erreichbar].sort()).toEqual([...ids].sort());
  });

  for (const { name, antworten, pfad } of ZIELPFADE) {
    test(`Zielpfad ${name}`, () => {
      expect(pfadFuer(antworten)).toEqual(pfad);
      expect(pruefeCheckup(payloadFuer(antworten))).toMatchObject({ ok: true });
    });
  }

  test("Ja/Nein: bei Ja die Detailfrage, bei Nein überspringen", () => {
    const paare: [SchrittId, SchrittId, SchrittId][] = [
      ["12", "13", "14"],
      ["14", "15", "16"],
      ["16", "17", "18"],
      ["18", "19", "20"],
      ["20", "21", "22"],
      ["24", "25", "26"],
    ];
    for (const [frage, detail, danach] of paare) {
      const s = SCHRITT[frage];
      if (s.typ !== "single") throw new Error(frage);
      expect(naechsterSchritt(s, { [s.key]: "Ja" }), frage).toBe(detail);
      expect(naechsterSchritt(s, { [s.key]: "Nein" }), frage).toBe(danach);
      expect(SCHRITT[detail].detail, detail).toBe(true);
      expect(SCHRITT[detail].typ, detail).toBe("multi");
      expect(naechsterSchritt(SCHRITT[detail], { [antwortKeys(SCHRITT[detail])[0]]: [KEINE_ANGABE] })).toBe(danach);
    }
    // ohne Detailfrage: beide Antworten führen weiter (8 → 9 auch bei „Nein“, wie live)
    for (const [frage, danach] of [
      ["8", "9"],
      ["11", "12"],
      ["22", "23"],
      ["26", "kontakt"],
    ] as const) {
      const s = SCHRITT[frage];
      if (s.typ !== "single") throw new Error(frage);
      expect(naechsterSchritt(s, { [s.key]: "Ja" }), frage).toBe(danach);
      expect(naechsterSchritt(s, { [s.key]: "Nein" }), frage).toBe(danach);
    }
  });

  test("alle Ja: jede Detailfrage liegt auf dem Pfad", () => {
    const antworten: CheckupAntworten = {
      ...ZIELPFADE[0].antworten,
      fitnessstudio_erfahrung: "Ja",
      herz_kreislauf: "Ja",
      herz_kreislauf_details: ["Bluthochdruck", "KHK"],
      venenerkrankung: "Ja",
      venenerkrankung_details: ["Thrombose"],
      atemwegs_erkrankung: "Ja",
      atemwegs_details: [KEINE_ANGABE],
      stoffwechsel_erkrankung: "Ja",
      stoffwechsel_details: ["Diabetes TYP 1", "Gicht"],
      orthopaedische_beschwerden: "Ja",
      orthopaedische_details: ["HWS (Halswirbelsäule)", "Knie"],
      regelmaessige_medikamente: "Ja",
      medikamente_details: ["Andere Medikamente"],
    };
    expect(pfadFuer(antworten)).toEqual([
      "2", "3", "4", "5", "F6A", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17",
      "18", "19", "20", "21", "22", "23", "24", "25", "26",
    ]);
  });

  test("unvollständige oder ungültige Antworten ergeben keinen Pfad", () => {
    expect(pfadFuer({})).toBeNull();
    const { op_letzte_12_monate: _op, ...ohneLetzte } = ZIELPFADE[3].antworten;
    expect(_op).toBe("Nein");
    expect(pfadFuer(ohneLetzte)).toBeNull();
    expect(pfadFuer({ ...ZIELPFADE[3].antworten, beruf: "Astronaut" })).toBeNull();
    // F6A-Pfad ohne Gewicht bricht ab
    const { aktuelles_gewicht: _g, ...ohneGewicht } = ZIELPFADE[0].antworten;
    expect(_g).toBe(90);
    expect(pfadFuer(ohneGewicht)).toBeNull();
  });

  test("Mehrfachauswahl: nur erlaubte Werte, „Keine Angabe“ allein, „Nein“ schließt aus", () => {
    const s = SCHRITT["23"];
    const mit = (wert: unknown) => antwortGueltig(s, { sonstige_erkrankungen: wert as string[] });
    expect(mit(["Krebs", "Allergie"])).toBe(true);
    expect(mit(["Nein"])).toBe(true);
    expect(mit([KEINE_ANGABE])).toBe(true);
    expect(mit([])).toBe(false);
    expect(mit(["Nein", "Krebs"])).toBe(false);
    expect(mit([KEINE_ANGABE, "Krebs"])).toBe(false);
    expect(mit(["Krebs", "Krebs"])).toBe(false);
    expect(mit(["Schnupfen"])).toBe(false);
    expect(mit("Krebs")).toBe(false);
    expect(mit([1])).toBe(false);
  });

  test("Gewicht: 35–250 kg in Schritten von 0,1, nur Zahlen", () => {
    for (const ok of [35, 250, 75, 75.5, 82.3]) expect(gewichtGueltig(ok), String(ok)).toBe(true);
    for (const falsch of [34.9, 250.1, 75.55, "75", Number.NaN, Infinity, null]) {
      expect(gewichtGueltig(falsch), String(falsch)).toBe(false);
    }
  });

  test("verlassene Zweige: pfadFuer ignoriert sie, antwortenFuerPfad entfernt sie", () => {
    const mitResten = {
      ...ZIELPFADE[3].antworten,
      problemzonen: "Rücken", // vor dem Zurück gewählt
      herz_kreislauf_details: ["KHK"], // erst Ja, dann Nein
      aktuelles_gewicht: 90,
    };
    const pfad = pfadFuer(mitResten)!;
    expect(pfad).toEqual(ZIELPFADE[3].pfad);
    expect(antwortenFuerPfad(mitResten, pfad)).toEqual(ZIELPFADE[3].antworten);
  });
});

test.describe("pruefeCheckup (Server)", () => {
  const gueltig = ZIELPFADE[0].antworten;

  test("gültig: liefert getrimmten Kontakt, Pfad und nur die Pfad-Antworten", () => {
    const ergebnis = pruefeCheckup(
      payloadFuer(gueltig, { kontakt: { name: "  Test Person ", email: " test@example.com", telefon: "+49 (0) 2262 752717" } })
    );
    expect(ergebnis).toEqual({
      ok: true,
      daten: {
        antworten: gueltig,
        pfad: ZIELPFADE[0].pfad,
        kontakt: { name: "Test Person", email: "test@example.com", telefon: "+49 (0) 2262 752717" },
        dauerMs: 60_000,
      },
    });
  });

  const faelle: [string, unknown, string][] = [
    ["kein Objekt", [], "format"],
    ["Name fehlt", payloadFuer(gueltig, { kontakt: { name: " ", email: "a@b.de", telefon: "0151 1234567" } }), "kontakt"],
    ["Name mit Zeilenumbruch", payloadFuer(gueltig, { kontakt: { name: "A\nBcc: x@y.de", email: "a@b.de", telefon: "0151 1234567" } }), "kontakt"],
    ["E-Mail ohne Domain", payloadFuer(gueltig, { kontakt: { name: "A", email: "a@b", telefon: "0151 1234567" } }), "kontakt"],
    ["Telefon mit Buchstaben", payloadFuer(gueltig, { kontakt: { name: "A", email: "a@b.de", telefon: "ruf mich an" } }), "kontakt"],
    ["Kontakt fehlt", payloadFuer(gueltig, { kontakt: undefined }), "kontakt"],
    ["Datenschutz fehlt", payloadFuer(gueltig, { einwilligungDatenschutz: false }), "einwilligung"],
    ["Art. 9 nur als String", payloadFuer(gueltig, { einwilligungGesundheit: "true" }), "einwilligung"],
    ["dauerMs fehlt", payloadFuer(gueltig, { dauerMs: undefined }), "dauer"],
    ["dauerMs negativ", payloadFuer(gueltig, { dauerMs: -1 }), "dauer"],
    ["Antworten fehlen", payloadFuer(gueltig, { antworten: null }), "antworten"],
    ["unbekannter Wert", { ...payloadFuer(gueltig), antworten: { ...gueltig, beruf: "Astronaut" } }, "antworten"],
    ["Gewicht als String", { ...payloadFuer(gueltig), antworten: { ...gueltig, wunschgewicht: "80" } }, "antworten"],
    ["Antwort abseits des Pfads", { ...payloadFuer(gueltig), antworten: { ...gueltig, problemzonen: "Bauch" } }, "antworten"],
    ["fremder Schlüssel", { ...payloadFuer(gueltig), antworten: { ...gueltig, notiz: "x" } }, "antworten"],
    ["Pfad fehlt", payloadFuer(gueltig, { pfad: undefined }), "pfad"],
    ["Pfad unvollständig", payloadFuer(gueltig, { pfad: ZIELPFADE[0].pfad.slice(0, -1) }), "pfad"],
    ["Pfad aus anderem Zweig", payloadFuer(gueltig, { pfad: ZIELPFADE[1].pfad }), "pfad"],
  ];
  for (const [name, json, grund] of faelle) {
    test(`ungültig: ${name}`, () => {
      expect(pruefeCheckup(json)).toEqual({ ok: false, grund });
    });
  }
});
