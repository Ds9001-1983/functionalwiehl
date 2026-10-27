import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConsentRevokeButton } from "@/components/consent/consent-banner";
import { ANBIETER, BEHOERDEN, RECHT } from "@/content/recht";
import { CTA, KONTAKT } from "@/lib/cta";
import { PAGES, pageMetadata } from "@/lib/seo";
import { GA4_ID } from "@/lib/tracking";

export const metadata: Metadata = pageMetadata(PAGES.datenschutz);

/**
 * Datenschutzerklärung auf Basis der Live-DSE (Stand 27.10.2026):
 * - Einleitung, I–III und die Fanpage-Abschnitte aus dem Muster, ohne Muster-Reste
 *   (Cookiebot, Newsletter, Flash, YouTube, Social-Plug-in) und ohne WordPress-Dienste.
 * - Die drei Abschnitte vom 20.10.2026 (Superchat, Meta-Pixel/CAPI, WhatsApp-Auswertung)
 *   stehen wörtlich drin. Ergänzungen dazu sind eigene Absätze (Kommentar „Ergänzung“).
 * - Neu sind die Abschnitte zu Vercel, Banner, Formularen, GA4, Klickspeicher und Instagram.
 * Die Rechtsgrundlagen und Fristen gibt Conny frei, siehe docs/TODO-recht.md.
 *
 * Kein href mit „whatsapp“ oder „calendly“ (auch nicht als Anker-ID): tests/cta.spec.ts
 * lässt solche hrefs nur als CTA-Konstanten zu. Deren Datenschutz-Links stehen als Text da.
 */

const ABSCHNITTE = {
  hosting: "Hosting und Server-Logfiles",
  missbrauch: "Schutz vor Missbrauch",
  einwilligung: "Einwilligungsverwaltung und Speicherung auf Ihrem Gerät",
  kontakt: "Kontaktanfragen / Kontaktmöglichkeit",
  checkup: "Fitness- & Gesundheits-Check-up",
  koerpermasse: "Körpermaße Digital",
  messenger: "WhatsApp Kontaktaufnahme",
  superchat: "WhatsApp Business Platform und Kommunikationssoftware Superchat",
  terminbuchung: "Terminvereinbarung über Calendly",
  maps: "Anfahrt über Google Maps",
  analytics: "Google Analytics 4 (nur mit Einwilligung)",
  pixel: "Meta-Pixel und Meta Conversions API",
  klickdaten: "Aktionscode und Klickdaten (Aktion „Black November“)",
  auswertung: "Automatisierte Auswertung von WhatsApp-Nachrichten zur Erfolgsmessung",
  instagramFeed: "Instagram-Beiträge auf unserer Website",
  facebook: "Facebook",
  instagram: "Instagram",
  verlinkung: "Allgemeine Verlinkung auf Profile bei Drittanbietern",
} as const;

type AbschnittId = keyof typeof ABSCHNITTE;

function Abschnitt({ id, children }: { id: AbschnittId; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h3 className="text-lg">
        {ABSCHNITTE[id]}
      </h3>
      {children}
    </section>
  );
}

function Extern({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-words underline">
      {children ?? href}
    </a>
  );
}

function Mail({ an }: { an: "gym" | "info" }) {
  return an === "gym" ? (
    <a href={CTA.mail} className="underline">
      {KONTAKT.mail}
    </a>
  ) : (
    <a href={CTA.mailRecht} className="underline">
      {KONTAKT.mailRecht}
    </a>
  );
}

export default function DatenschutzPage() {
  return (
    <>
      <section className="bg-brand">
        <div className="container-site py-10">
          <h1 className="text-3xl text-cream">Datenschutzerklärung</h1>
          <p className="mt-2 text-cream/85">Stand: {RECHT.stand}</p>
        </div>
      </section>
      <Breadcrumbs name="Datenschutz" path={PAGES.datenschutz.path} />

      <div className="container-site max-w-3xl space-y-10 py-12 leading-relaxed">
        <div className="space-y-3">
          <p>
            Personenbezogene Daten (nachfolgend zumeist nur „Daten“ genannt) werden von uns nur im
            Rahmen der Erforderlichkeit sowie zum Zwecke der Bereitstellung eines funktionsfähigen und
            nutzerfreundlichen Internetauftritts, inklusive seiner Inhalte und der dort angebotenen
            Leistungen, verarbeitet.
          </p>
          <p>
            Gemäß Art. 4 Ziffer 1. der Verordnung (EU) 2016/679, also der Datenschutz-Grundverordnung
            (nachfolgend nur „DSGVO“ genannt), gilt als „Verarbeitung“ jeder mit oder ohne Hilfe
            automatisierter Verfahren ausgeführter Vorgang oder jede solche Vorgangsreihe im
            Zusammenhang mit personenbezogenen Daten, wie das Erheben, das Erfassen, die Organisation,
            das Ordnen, die Speicherung, die Anpassung oder Veränderung, das Auslesen, das Abfragen, die
            Verwendung, die Offenlegung durch Übermittlung, Verbreitung oder eine andere Form der
            Bereitstellung, den Abgleich oder die Verknüpfung, die Einschränkung, das Löschen oder die
            Vernichtung.
          </p>
          <p>
            Mit der nachfolgenden Datenschutzerklärung informieren wir Sie insbesondere über Art,
            Umfang, Zweck, Dauer und Rechtsgrundlage der Verarbeitung personenbezogener Daten, soweit wir
            entweder allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung
            entscheiden. Zudem informieren wir Sie nachfolgend über die von uns zu Optimierungszwecken
            sowie zur Steigerung der Nutzungsqualität eingesetzten Fremdkomponenten, soweit hierdurch
            Dritte Daten in wiederum eigener Verantwortung verarbeiten.
          </p>
          <p>Unsere Datenschutzerklärung ist wie folgt gegliedert:</p>
          <nav aria-label="Gliederung der Datenschutzerklärung" className="rounded-card bg-muted p-5">
            <ol className="space-y-1.5">
              <li>
                <a href="#verantwortlicher" className="underline">
                  I. Informationen über uns als Verantwortliche
                </a>
              </li>
              <li>
                <a href="#rechte" className="underline">
                  II. Rechte der Nutzer und Betroffenen
                </a>
              </li>
              <li>
                <a href="#datenverarbeitung" className="underline">
                  III. Informationen zur Datenverarbeitung
                </a>
                <ul className="mt-1.5 space-y-1 pl-5 text-sm">
                  {(Object.keys(ABSCHNITTE) as AbschnittId[]).map((id) => (
                    <li key={id}>
                      <a href={`#${id}`} className="underline">
                        {ABSCHNITTE[id]}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ol>
          </nav>
        </div>

        <section id="verantwortlicher" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl">
            I. Informationen über uns als Verantwortliche
          </h2>
          <p>Verantwortlicher Anbieter dieses Internetauftritts im datenschutzrechtlichen Sinne ist:</p>
          <address className="not-italic">
            {RECHT.firma}
            <br />
            {RECHT.verantwortlicheDse}
            <br />
            {KONTAKT.strasse}
            <br />
            {KONTAKT.plzOrt}
            <br />
            Telefon:{" "}
            <a href={CTA.tel} className="underline">
              {KONTAKT.telefonAnzeige}
            </a>
            <br />
            E-Mail: <Mail an="info" />
          </address>
        </section>

        <section id="rechte" className="scroll-mt-20 space-y-3">
          <h2 className="text-2xl">
            II. Rechte der Nutzer und Betroffenen
          </h2>
          <p>
            Mit Blick auf die nachfolgend noch näher beschriebene Datenverarbeitung haben die Nutzer und
            Betroffenen das Recht
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              auf Bestätigung, ob sie betreffende Daten verarbeitet werden, auf Auskunft über die
              verarbeiteten Daten, auf weitere Informationen über die Datenverarbeitung sowie auf Kopien
              der Daten (vgl. auch Art. 15 DSGVO);
            </li>
            <li>
              auf Berichtigung oder Vervollständigung unrichtiger bzw. unvollständiger Daten (vgl. auch
              Art. 16 DSGVO);
            </li>
            <li>
              auf unverzügliche Löschung der sie betreffenden Daten (vgl. auch Art. 17 DSGVO), oder,
              alternativ, soweit eine weitere Verarbeitung gemäß Art. 17 Abs. 3 DSGVO erforderlich ist,
              auf Einschränkung der Verarbeitung nach Maßgabe von Art. 18 DSGVO;
            </li>
            <li>
              auf Erhalt der sie betreffenden und von ihnen bereitgestellten Daten und auf Übermittlung
              dieser Daten an andere Anbieter/Verantwortliche (vgl. auch Art. 20 DSGVO);
            </li>
            {/* Ergänzung: Widerruf nach Art. 7 Abs. 3 DSGVO */}
            <li>
              eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen; die
              Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon unberührt (vgl.
              auch Art. 7 Abs. 3 DSGVO);
            </li>
            <li>
              auf Beschwerde gegenüber der Aufsichtsbehörde, sofern sie der Ansicht sind, dass die sie
              betreffenden Daten durch den Anbieter unter Verstoß gegen datenschutzrechtliche
              Bestimmungen verarbeitet werden (vgl. auch Art. 77 DSGVO).
            </li>
          </ul>
          {/* Ergänzung: zuständige Aufsichtsbehörde und Weg zur Ausübung der Rechte */}
          <p>
            Für uns zuständig ist die {BEHOERDEN.datenschutz.name}, {BEHOERDEN.datenschutz.anschrift} (
            <Extern href={BEHOERDEN.datenschutz.web}>www.ldi.nrw.de</Extern>). Zur Ausübung Ihrer Rechte
            genügt eine formlose Nachricht an die oben genannten Kontaktdaten, zum Beispiel an{" "}
            <Mail an="info" />.
          </p>
          <p>
            Darüber hinaus ist der Anbieter dazu verpflichtet, alle Empfänger, denen gegenüber Daten
            durch den Anbieter offengelegt worden sind, über jedwede Berichtigung oder Löschung von Daten
            oder die Einschränkung der Verarbeitung, die aufgrund der Artikel 16, 17 Abs. 1, 18 DSGVO
            erfolgt, zu unterrichten. Diese Verpflichtung besteht jedoch nicht, soweit diese Mitteilung
            unmöglich oder mit einem unverhältnismäßigen Aufwand verbunden ist. Unbeschadet dessen hat
            der Nutzer ein Recht auf Auskunft über diese Empfänger.
          </p>
          <p>
            <strong>
              Ebenfalls haben die Nutzer und Betroffenen nach Art. 21 DSGVO das Recht auf Widerspruch
              gegen die künftige Verarbeitung der sie betreffenden Daten, sofern die Daten durch den
              Anbieter nach Maßgabe von Art. 6 Abs. 1 lit. f) DSGVO verarbeitet werden. Insbesondere ist
              ein Widerspruch gegen die Datenverarbeitung zum Zwecke der Direktwerbung statthaft.
            </strong>
          </p>
        </section>

        <section id="datenverarbeitung" className="scroll-mt-20 space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl">
              III. Informationen zur Datenverarbeitung
            </h2>
            <p>
              Ihre bei Nutzung unseres Internetauftritts verarbeiteten Daten werden gelöscht oder
              gesperrt, sobald der Zweck der Speicherung entfällt, der Löschung der Daten keine
              gesetzlichen Aufbewahrungspflichten entgegenstehen und nachfolgend keine anderslautenden
              Angaben zu einzelnen Verarbeitungsverfahren gemacht werden.
            </p>
          </div>

          <Abschnitt id="hosting">
            <p>
              Unsere Website wird bei der {ANBIETER.vercel}, gehostet. Vercel liefert die Seiten über ein
              weltweites Servernetz aus; die Server-Funktionen unserer Website (etwa der Versand unserer
              Formulare und der Klickspeicher der Aktion „Black November“) laufen in der Region Frankfurt
              am Main. Vercel verarbeitet die Daten in unserem Auftrag (Art. 28 DSGVO).
            </p>
            <p>
              Aus technischen Gründen, insbesondere zur Gewährleistung eines sicheren und stabilen
              Internetauftritts, verarbeitet Vercel bei jedem Aufruf sog. Server-Logfiles: die IP-Adresse
              des Internetanschlusses, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite, die Website,
              von der aus Sie auf unseren Internetauftritt gewechselt haben (Referrer URL), sowie Typ und
              Version Ihres Internetbrowsers und das Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. f DSGVO. Unser berechtigtes Interesse liegt in der Stabilität, Funktionalität und
              Sicherheit unseres Internetauftritts. Die Logfiles werden spätestens nach 30 Tagen
              gelöscht.
            </p>
            <p>
              Vercel ist nach dem EU-US Data Privacy Framework zertifiziert. Soweit Daten in die USA
              übermittelt werden, beruht das damit auf dem Angemessenheitsbeschluss der EU-Kommission vom
              10.07.2023 (Art. 45 DSGVO).
            </p>
            <p>
              Schriftarten liefern wir von unserem eigenen Server aus. Eine Verbindung zu Google oder
              anderen Schriftanbietern entsteht dabei nicht.
            </p>
          </Abschnitt>

          <Abschnitt id="missbrauch">
            <p>
              Damit unsere Formulare und der Klickspeicher nicht massenhaft automatisiert aufgerufen
              werden, zählen wir die Anfragen je Absender. Dafür bilden wir aus Ihrer IP-Adresse mit einem
              geheimen Schlüssel einen Prüfwert (HMAC); die IP-Adresse selbst speichern wir dafür nicht.
              Der Prüfwert liegt höchstens zehn Minuten in der Datenbank der {ANBIETER.upstash} in einem
              Rechenzentrum in Frankfurt am Main und wird danach automatisch gelöscht. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im Schutz unserer Website vor
              Missbrauch.
            </p>
          </Abschnitt>

          <Abschnitt id="einwilligung">
            <p>
              Beim ersten Besuch fragen wir über unser eigenes Einwilligungsbanner, ob wir Dienste zur
              Statistik (Google Analytics) und zum Marketing (Meta-Pixel) einsetzen dürfen. Ohne Ihre
              Einwilligung laden wir diese Dienste nicht. Einzige Ausnahme ist das Meta-Pixel auf unserer
              Aktionsseite /black-november/, siehe{" "}
              <a href="#pixel" className="underline">
                {ABSCHNITTE.pixel}
              </a>
              .
            </p>
            <p>
              Ihre Auswahl speichern wir für 12 Monate im Cookie <code>fw_consent</code> auf Ihrem Gerät.
              Es enthält Ihre Entscheidung zu den Kategorien „Statistik“ und „Marketing“ und den Zeitpunkt
              der Entscheidung; eine Datenbank mit Einwilligungen führen wir nicht. Das Cookie ist für die
              Einwilligungsverwaltung unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage
              ist Art. 6 Abs. 1 lit. f DSGVO, unser berechtigtes Interesse liegt darin, Ihre Entscheidung
              zu beachten und nachweisen zu können.
            </p>
            <p>
              Ihre Einwilligung können Sie jederzeit mit Wirkung für die Zukunft ändern oder widerrufen,
              über den Link „Cookie-Einstellungen“ im Seitenfuß oder direkt hier:{" "}
              <span className="font-semibold text-brand">
                <ConsentRevokeButton />
              </span>
              .
            </p>
            <p>Außerdem speichern wir auf Ihrem Gerät:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Ihre Barrierefreiheits-Einstellungen (Schriftgröße, Kontrast, Animationen, Links), wenn
                Sie sie über die Schaltfläche „Barrierefreiheit“ ändern, im lokalen Speicher Ihres
                Browsers (<code>fw_a11y</code>). Die Einstellungen verlassen Ihr Gerät nicht.
              </li>
              <li>
                Den Aktionscode auf der Aktionsseite /black-november/ im Sitzungsspeicher Ihres Browsers (
                <code>bn_code</code>), damit derselbe Code in Ihrer WhatsApp-Nachricht steht, und nur mit
                Ihrer Marketing-Einwilligung die Facebook-Klick-ID (<code>bn_fbc</code>). Der
                Sitzungsspeicher wird gelöscht, wenn Sie das Browserfenster bzw. den Tab schließen.
              </li>
            </ul>
            <p>
              Welche Cookies Google Analytics und das Meta-Pixel setzen, steht in den jeweiligen
              Abschnitten unten.
            </p>
            <p>
              Sie können die Installation der Cookies durch eine Einstellung Ihres Internet-Browsers
              verhindern oder einschränken. Ebenfalls können Sie bereits gespeicherte Cookies jederzeit
              löschen. Die hierfür erforderlichen Schritte und Maßnahmen hängen jedoch von Ihrem konkret
              genutzten Internet-Browser ab. Bei Fragen benutzen Sie daher bitte die Hilfefunktion oder
              Dokumentation Ihres Internet-Browsers oder wenden sich an dessen Hersteller bzw. Support.
            </p>
            <p>
              Sollten Sie die Installation der Cookies verhindern oder einschränken, kann dies allerdings
              dazu führen, dass nicht sämtliche Funktionen unseres Internetauftritts vollumfänglich
              nutzbar sind.
            </p>
          </Abschnitt>

          <Abschnitt id="kontakt">
            <p>
              Sofern Sie per E-Mail, Telefon oder über unsere Formulare mit uns in Kontakt treten, werden
              die dabei von Ihnen angegebenen Daten zur Bearbeitung Ihrer Anfrage genutzt. Die Angabe der
              Daten ist zur Bearbeitung und Beantwortung Ihrer Anfrage erforderlich – ohne deren
              Bereitstellung können wir Ihre Anfrage nicht oder allenfalls eingeschränkt beantworten.
            </p>
            <p>Rechtsgrundlage für diese Verarbeitung ist Art. 6 Abs. 1 lit. b) DSGVO.</p>
            <p>
              Ihre Daten werden gelöscht, sofern Ihre Anfrage abschließend beantwortet worden ist und der
              Löschung keine gesetzlichen Aufbewahrungspflichten entgegenstehen, wie bspw. bei einer sich
              etwaig anschließenden Vertragsabwicklung.
            </p>
            {/* Ergänzung: Mail-Hoster */}
            <p>
              Unsere E-Mail-Postfächer betreibt die {ANBIETER.alfahosting}, als Auftragsverarbeiter (Art.
              28 DSGVO). Für Check-up und Körpermaße gelten zusätzlich die beiden folgenden Abschnitte.
            </p>
          </Abschnitt>

          <Abschnitt id="checkup">
            <p>
              Im Bereich „Check-up“ unserer Startseite können Sie freiwillig einen Fragebogen ausfüllen
              und an uns senden. Je nach Ihren Antworten verarbeiten wir dabei Angaben zu Beruf,
              Stresslevel, Fitnesslevel, Trainingszielen und Problemzonen, Gewicht und Wunschgewicht,
              bisherigen Versuchen und Trainingserfahrung, gewünschter Trainingshäufigkeit, ärztlicher
              Behandlung, Erkrankungen (Herz-Kreislauf, Venen, Atemwege, Stoffwechsel, orthopädische
              Beschwerden, psychische und sonstige Erkrankungen), Medikamenten und Operationen in den
              letzten 12 Monaten sowie Ihren Namen, Ihre E-Mail-Adresse und Ihre Telefonnummer.
            </p>
            <p>
              Ein großer Teil dieser Angaben sind Gesundheitsdaten und damit besondere Kategorien
              personenbezogener Daten (Art. 9 DSGVO). Wir verarbeiten sie nur mit Ihrer ausdrücklichen
              Einwilligung, die Sie im Formular gesondert erteilen (Art. 9 Abs. 2 lit. a DSGVO, für die
              übrigen Angaben Art. 6 Abs. 1 lit. a DSGVO). Wir nutzen die Angaben allein, um Ihnen eine
              passende Trainingsempfehlung zu geben und Sie dazu zu kontaktieren.
            </p>
            <p>
              Nach dem Absenden leitet unser Server (Vercel, Region Frankfurt am Main) Ihre Angaben
              verschlüsselt (TLS) über den Mailserver der Alfahosting GmbH als E-Mail an unser Postfach{" "}
              <Mail an="gym" /> weiter. Die Website selbst speichert und protokolliert die Angaben nicht.
              Zugriff auf das Postfach hat nur unser Team. Inhalte des Check-ups geben wir nicht an Dritte
              weiter, insbesondere nicht an Google oder Meta.
            </p>
            <p>
              Wir löschen die E-Mail, sobald Ihre Anfrage abgeschlossen ist, spätestens{" "}
              {RECHT.formularLoeschfrist} nach Eingang. Ihre Einwilligung können Sie jederzeit mit Wirkung
              für die Zukunft widerrufen, zum Beispiel per E-Mail an <Mail an="gym" />.
            </p>
          </Abschnitt>

          <Abschnitt id="koerpermasse">
            <p>
              Auf der Seite /koerpermasse/ können Mitglieder ihre Körpermaße an uns senden: den Umfang von
              Oberschenkel, Unterschenkel und Bizeps (jeweils links und rechts), Bauch und Hüfte sowie
              Vorname, Nachname und Handynummer. Wir nutzen die Angaben, um Ihr Training zu planen und
              anzupassen.
            </p>
            <p>
              Weil Körpermaße Rückschlüsse auf Ihre Gesundheit zulassen können, verarbeiten wir sie
              vorsorglich nur mit Ihrer ausdrücklichen Einwilligung, die Sie im Formular gesondert
              erteilen (Art. 9 Abs. 2 lit. a DSGVO). Im Übrigen dient die Verarbeitung der Durchführung
              Ihrer Mitgliedschaft (Art. 6 Abs. 1 lit. b DSGVO).
            </p>
            <p>
              Übermittlung und Zugriff erfolgen wie beim Check-up: Unser Server leitet die Angaben
              verschlüsselt per E-Mail an <Mail an="gym" /> weiter, die Website speichert sie nicht, und
              wir geben sie nicht an Dritte weiter. Wir löschen die E-Mail spätestens{" "}
              {RECHT.formularLoeschfrist} nach Eingang. Ihre Einwilligung können Sie jederzeit mit Wirkung
              für die Zukunft widerrufen.
            </p>
          </Abschnitt>

          <Abschnitt id="messenger">
            <p>
              Zur Kontaktaufnahme ermöglicht der Anbieter dem Kunden unter anderem die Kontaktmöglichkeit
              über den Messenger-Dienst WhatsApp. WhatsApp ist ein Dienst der {ANBIETER.whatsapp},
              nachfolgend WhatsApp, eine Tochtergesellschaft der Meta Platforms, Inc.
            </p>
            {/* Ergänzung: Die Schaltflächen sind reine Links */}
            <p>
              Unsere WhatsApp-Schaltflächen sind einfache Links. Erst wenn Sie darauf tippen, öffnet sich
              WhatsApp mit einer vorbereiteten Nachricht, die Sie selbst absenden.
            </p>
            <p>
              Durch die Kommunikation des Nutzers mit dem Anbieter über WhatsApp erhält sowohl der
              Anbieter, als auch WhatsApp die Mobilrufnummer des Nutzers und die Information, dass der
              Nutzer den Anbieter kontaktiert hat.
            </p>
            <p>
              Die vorgenannten Daten werden von WhatsApp auch an Server von Meta in den USA weitergeleitet
              und von WhatsApp und Meta entsprechend der WhatsApp-Datenschutzrichtlinie verarbeitet, was
              auch die Verarbeitung zu deren eigenen Zwecken, wie der Verbesserung des WhatsApp-Dienstes,
              beinhaltet. Die Meta Platforms, Inc. ist nach dem EU-US Data Privacy Framework zertifiziert;
              für Übermittlungen in die USA besteht damit ein Angemessenheitsbeschluss der EU-Kommission
              vom 10.07.2023.
            </p>
            <p>
              Näheres zum Zweck und Umfang der Datenerhebung und der weiteren Verarbeitung dieser Daten
              durch WhatsApp und Meta sowie diesbezügliche Rechte und Einstellungsmöglichkeiten zum Schutz
              der Privatsphäre sind in der Datenschutzrichtlinie von WhatsApp enthalten:
              www.whatsapp.com/legal/privacy-policy-eea.
            </p>
            <p>
              Rechtsgrundlage dieser Verarbeitungen und der Übermittlung an WhatsApp ist Art. 6 Abs. 1 S.
              1 b. DSGVO, soweit die Kontaktaufnahme eine bestehende Vertragsbeziehung betrifft oder der
              Anbahnung einer solchen Vertragsbeziehung dient. Sollte die Kontaktaufnahme nicht aufgrund
              der vorstehenden Zwecke erfolgen, ist Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO. Das
              berechtigte Interesse des Anbieters besteht an der Verbesserung der Servicequalität.
            </p>
          </Abschnitt>

          {/* Abschnitt vom 20.10.2026, wörtlich */}
          <Abschnitt id="superchat">
            <p>
              Für die Kommunikation über WhatsApp nutzen wir die WhatsApp Business Platform (Cloud API)
              der Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Irland („Meta“). Die
              Nachrichten verwalten wir mit der Kommunikationssoftware Superchat der SuperX GmbH, die für
              uns als Auftragsverarbeiter tätig ist.
            </p>
            <p>
              Verarbeitet werden dabei deine Mobilrufnummer, dein WhatsApp-Profilname, die Inhalte unserer
              Unterhaltung sowie die Angaben, die du uns im Chat mitteilst (z. B. Name, Anschrift,
              Geburtsdatum, E-Mail-Adresse und – wenn du sie im Chat angibst – deine Bankverbindung für
              den Beitragseinzug). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung
              der Anbahnung oder Durchführung einer Mitgliedschaft dient, im Übrigen unser berechtigtes
              Interesse an einer schnellen und komfortablen Kommunikation (Art. 6 Abs. 1 lit. f DSGVO).
              Die Daten werden gelöscht, sobald sie für diese Zwecke nicht mehr erforderlich sind und
              keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            {/* Ergänzung: Anschrift laut Superchat-Impressum */}
            <p>Anschrift der SuperX GmbH: {ANBIETER.superx}.</p>
          </Abschnitt>

          <Abschnitt id="terminbuchung">
            <p>
              Für die Vereinbarung eines Telefontermins verlinken wir auf den Dienst Calendly der{" "}
              {ANBIETER.calendly}. Calendly wird erst aufgerufen, wenn Sie auf unseren Link zur
              Terminvereinbarung klicken; vorher werden keine Daten an Calendly übertragen. Bei der Buchung
              verarbeitet Calendly die von Ihnen eingegebenen Daten (zum Beispiel Name, E-Mail-Adresse,
              Telefonnummer und Wunschtermin) sowie technische Daten wie Ihre IP-Adresse, und zwar in
              unserem Auftrag (Art. 28 DSGVO).
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, weil der Termin der Anbahnung einer
              Mitgliedschaft dient. Calendly ist nach dem EU-US Data Privacy Framework zertifiziert.
              Weitere Informationen finden Sie in den Datenschutzhinweisen von Calendly unter
              calendly.com/legal/privacy-notice.
            </p>
          </Abschnitt>

          <Abschnitt id="maps">
            <p>
              Unsere Anschrift im Bereich „Kontakt“ ist mit Google Maps verlinkt, einem Dienst der{" "}
              {ANBIETER.google}. Eine Verbindung zu Google entsteht erst, wenn Sie den Link anklicken. Dann
              gilt die Datenschutzerklärung von Google:{" "}
              <Extern href="https://policies.google.com/privacy">policies.google.com/privacy</Extern>.
            </p>
          </Abschnitt>

          <Abschnitt id="analytics">
            <p>
              Wenn Sie im Einwilligungsbanner der Kategorie „Statistik“ zustimmen, setzen wir Google
              Analytics 4 ein, einen Webanalysedienst der {ANBIETER.google} („Google“). Ohne Ihre
              Einwilligung wird Google Analytics nicht geladen. Auf unserer Aktionsseite /black-november/
              ist Google Analytics nicht eingebunden.
            </p>
            <p>
              Google Analytics erfasst, welche Seiten Sie aufrufen, und Klicks auf unsere WhatsApp-,
              Telefon-, E-Mail- und Terminbuchungs-Links sowie das Absenden des Check-ups (ohne dessen
              Inhalte). Dazu kommen technische Angaben wie Gerätetyp, Browser, ungefährer Standort und die
              Seite, von der Sie gekommen sind. Google setzt dafür die Cookies <code>_ga</code> und{" "}
              <code>_ga_&lt;Kennung&gt;</code> mit einer Laufzeit von bis zu 2 Jahren. Unsere
              Mess-ID lautet {GA4_ID}.
            </p>
            <p>
              Nach Angaben von Google werden IP-Adressen in Google Analytics 4 nicht protokolliert oder
              gespeichert. Die erhobenen Daten können an die Google LLC in den USA übermittelt werden; die
              Google LLC ist nach dem EU-US Data Privacy Framework zertifiziert.
            </p>
            <p>
              Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Sie
              können sie jederzeit über die „Cookie-Einstellungen“ im Seitenfuß widerrufen. Weitere
              Informationen finden Sie in der Datenschutzerklärung von Google unter{" "}
              <Extern href="https://policies.google.com/privacy">policies.google.com/privacy</Extern>.
            </p>
          </Abschnitt>

          {/* Abschnitt vom 20.10.2026, wörtlich; Ergänzungen sind eigene Absätze */}
          <Abschnitt id="pixel">
            <p>
              Wir setzen auf unserer Website das Meta-Pixel sowie die Conversions API von Meta ein. Damit
              messen wir, wie erfolgreich unsere Werbeanzeigen auf Facebook und Instagram sind, und können
              Anzeigen gezielter ausspielen (z. B. an Personen, die sich bereits für unser Angebot
              interessiert haben).
            </p>
            <p>
              Das Meta-Pixel wird nur geladen, wenn du im Cookie-Banner in Marketing-Cookies eingewilligt
              hast (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Deine Einwilligung kannst du jederzeit
              über die Cookie-Einstellungen widerrufen.
            </p>
            {/* Ergänzung: Ereignisse mit Einwilligung */}
            <p>
              Mit deiner Einwilligung übermittelt das Pixel Seitenaufrufe sowie Klicks auf unsere
              WhatsApp-, Telefon-, E-Mail- und Terminbuchungs-Links an Meta. Meta setzt dabei die Cookies{" "}
              <code>_fbp</code> und, wenn du über eine Anzeige kommst, <code>_fbc</code> (Laufzeit jeweils
              90 Tage). Inhalte unserer Formulare gehen nicht an Meta.
            </p>
            {/* Ergänzung: Ausnahme Aktionsseite (Entscheidung Dennis 27.10.2026) */}
            <p>
              <strong>Ausnahme:</strong> Auf unserer Aktionsseite /black-november/ wird das Meta-Pixel
              bereits beim Aufruf geladen, ohne dass wir vorher deine Einwilligung einholen. Es übermittelt
              dort an Meta: den Seitenaufruf, das Ansehen des Angebots, eine längere Beschäftigung mit der
              Seite (mindestens 15 Sekunden und die halbe Seite gescrollt) und den Klick auf den
              WhatsApp-Button zusammen mit dem zufälligen Aktionscode. Weil das Pixel dort mit den
              Standardeinstellungen von Meta läuft, kann Meta zusätzlich Klicks auf Schaltflächen und
              allgemeine Seiteninformationen automatisch erfassen. Meta setzt dabei die Cookies{" "}
              <code>_fbp</code> und gegebenenfalls <code>_fbc</code> (jeweils 90 Tage). Deine Auswahl im
              Cookie-Banner ändert daran auf der Aktionsseite nichts; sie entscheidet dort nur, ob wir
              diese Cookies zusätzlich in unsere Klickdaten übernehmen (siehe{" "}
              <a href="#klickdaten" className="underline">
                {ABSCHNITTE.klickdaten}
              </a>
              ). Wir stützen diese Verarbeitung auf unser berechtigtes Interesse, den Erfolg dieser
              zeitlich begrenzten Werbeaktion zu messen (Art. 6 Abs. 1 lit. f DSGVO). Du kannst jederzeit
              widersprechen (Art. 21 DSGVO), z. B. per E-Mail an <Mail an="gym" />.
            </p>
            <p>
              Zusätzlich übermitteln wir bestimmte Ereignisse serverseitig über die Conversions API direkt
              an Meta: den Aufruf von Aktionsseiten, den Klick auf den WhatsApp-Button sowie – bei Aktionen
              wie „Black November“ – die erfolgreiche Anmeldung über WhatsApp. Übermittelt werden dabei
              technische Daten wie IP-Adresse, Browser-Informationen, die Facebook-Klick-ID aus dem
              Anzeigenlink bzw. Meta-Cookie-Kennungen (sofern vorhanden), ein zufälliger Aktionscode sowie
              bei Anmeldungen über WhatsApp deine Mobilrufnummer ausschließlich in verschlüsselter
              (gehashter) Form. Meta gleicht diese Daten mit eigenen Nutzerkonten ab, um die Wirkung
              unserer Anzeigen zu messen. Rechtsgrundlage ist unser berechtigtes Interesse an der Messung
              und Optimierung unserer Werbung (Art. 6 Abs. 1 lit. f DSGVO). Du kannst dieser Verarbeitung
              jederzeit widersprechen (Art. 21 DSGVO), z. B. per E-Mail an <Mail an="gym" />.
            </p>
            <p>
              Für die Erhebung und Übermittlung der Daten an Meta sind wir gemeinsam mit Meta verantwortlich
              (Art. 26 DSGVO); die Vereinbarung ist unter{" "}
              <Extern href="https://www.facebook.com/legal/controller_addendum">
                facebook.com/legal/controller_addendum
              </Extern>{" "}
              abrufbar. Die weitere Verarbeitung erfolgt in alleiniger Verantwortung von Meta. Meta kann
              Daten auch in die USA übermitteln; Meta ist nach dem EU-US Data Privacy Framework
              zertifiziert. Weitere Informationen findest du in der Datenschutzrichtlinie von Meta unter{" "}
              <Extern href="https://www.facebook.com/privacy/policy">facebook.com/privacy/policy</Extern>.
            </p>
          </Abschnitt>

          <Abschnitt id="klickdaten">
            <p>
              Auf unserer Aktionsseite /black-november/ erzeugt Ihr Browser einen zufälligen Aktionscode
              (zum Beispiel BN-7K2Q), der beim Tippen auf den WhatsApp-Button in die vorbereitete Nachricht
              übernommen wird. Gleichzeitig sendet die Seite folgende Klickdaten an unseren Server: den
              Aktionscode, die Facebook-Klick-ID aus dem Anzeigenlink (fbclid), die aufgerufene Adresse
              einschließlich der Kampagnenparameter, die Position des angetippten Buttons und die
              Information, ob eine Marketing-Einwilligung vorliegt. Nur wenn Sie in Marketing eingewilligt
              haben, übernehmen wir zusätzlich die Meta-Cookies <code>_fbp</code> und <code>_fbc</code>.
              Unser Server ergänzt Ihre IP-Adresse, die Kennung Ihres Browsers (User-Agent) sowie Zeitpunkt
              und Anzahl der Klicks.
            </p>
            <p>
              Die Klickdaten liegen in einer Datenbank der {ANBIETER.upstash} in einem Rechenzentrum in
              Frankfurt am Main. Upstash ist für uns als Auftragsverarbeiter tätig (Art. 28 DSGVO) und
              stützt sich für etwaige Zugriffe aus den USA auf das EU-US Data Privacy Framework, hilfsweise
              auf Standardvertragsklauseln.
            </p>
            <p>
              Schreiben Sie uns anschließend per WhatsApp mit Ihrem Aktionscode und melden sich an, ruft
              unser Dienstleister SUPERBRAND.marketing die Klickdaten zu diesem Code ab (Facebook-Klick-ID,{" "}
              <code>_fbp</code>, IP-Adresse und User-Agent) und meldet die Anmeldung über die Conversions
              API an Meta (siehe{" "}
              <a href="#pixel" className="underline">
                {ABSCHNITTE.pixel}
              </a>
              ). So können wir die Anmeldung der Anzeige zuordnen, über die Sie zu uns gekommen sind.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, unser berechtigtes Interesse liegt in der
              Erfolgsmessung dieser Werbeaktion. Sie können jederzeit widersprechen, zum Beispiel per
              E-Mail an <Mail an="gym" />.
            </p>
            <p>
              Die Klickdaten werden 60 Tage nach dem letzten Klick automatisch gelöscht, spätestens am{" "}
              {RECHT.bnLoeschdatum}. Klickdaten aus der Zeit vor der Umstellung unserer Website auf den
              neuen Server haben wir mit unverändertem Inhalt und derselben Löschfrist übernommen.
            </p>
          </Abschnitt>

          {/* Abschnitt vom 20.10.2026, wörtlich; Ergänzung ist der letzte Absatz */}
          <Abschnitt id="auswertung">
            <p>
              Um den Erfolg einzelner Aktionen messen zu können, werden eingehende WhatsApp-Nachrichten
              automatisiert darauf geprüft, ob sie einen Aktionscode enthalten und ob im Anmeldeprozess
              eine Anschrift übermittelt wurde. Die Nachrichteninhalte werden dabei nicht gespeichert;
              gespeichert werden nur der Aktionscode, der Zeitpunkt der Anmeldung und deine Mobilrufnummer
              in gehashter Form. Die Auswertung erfolgt auf einem Server unseres Dienstleisters
              SUPERBRAND.marketing (Dennis Sasse, Wiehl), der für uns als Auftragsverarbeiter tätig ist.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Erfolgsmessung
              unserer Werbung). Die gespeicherten Daten werden nach Abschluss der jeweiligen Aktion
              gelöscht.
            </p>
            <p>Für die Aktion „Black November“ 2026 ist das spätestens der {RECHT.bnLoeschdatum}.</p>
          </Abschnitt>

          <Abschnitt id="instagramFeed">
            <p>
              Im Bereich „Aktuelles“ zeigen wir die neuesten Beiträge unseres Instagram-Kontos
              @functionalwiehl. Diese Beiträge ruft unser Server selbst über die Schnittstelle der{" "}
              {ANBIETER.meta} ab; dabei werden nur Daten unseres eigenen Kontos übertragen. Die
              Vorschaubilder speichern wir im Speicherdienst Vercel Blob, Link, Datum und Beschreibung der
              Beiträge in der Datenbank der {ANBIETER.upstash}, jeweils in der Region Frankfurt am Main.
            </p>
            <p>
              Beim Besuch unserer Website lädt Ihr Browser die Beiträge deshalb von unserem Hoster Vercel.
              Eine Verbindung zu Instagram oder Meta entsteht dabei nicht, und Meta setzt keine Cookies.
              Erst wenn Sie einen Beitrag oder unser Profil anklicken, wechseln Sie zu Instagram; dann gilt
              die Datenschutzrichtlinie von Instagram. Rechtsgrundlage für die Darstellung ist Art. 6 Abs.
              1 lit. f DSGVO, unser berechtigtes Interesse liegt in einer aktuellen Darstellung unseres
              Studios.
            </p>
          </Abschnitt>

          <Abschnitt id="facebook">
            <p>
              Zur Bewerbung unserer Produkte und Leistungen sowie zur Kommunikation mit Interessenten oder
              Kunden betreiben wir eine Firmenpräsenz auf der Plattform Facebook.
            </p>
            <p>
              Auf dieser Social-Media-Plattform sind wir gemeinsam mit der {ANBIETER.meta}, verantwortlich.
            </p>
            <p>
              Der Datenschutzbeauftragte von Facebook kann über ein Kontaktformular erreicht werden:{" "}
              <Extern href="https://www.facebook.com/help/contact/540977946302970" />
            </p>
            <p>
              Die gemeinsame Verantwortlichkeit haben wir in einer Vereinbarung bezüglich der jeweiligen
              Verpflichtungen im Sinne der DSGVO geregelt. Diese Vereinbarung, aus der sich die
              gegenseitigen Verpflichtungen ergeben, ist unter dem folgenden Link abrufbar:{" "}
              <Extern href="https://www.facebook.com/legal/terms/page_controller_addendum" />
            </p>
            <p>
              Rechtsgrundlage für die dadurch erfolgende und nachfolgend wiedergegebene Verarbeitung von
              personenbezogenen Daten ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse besteht
              an der Analyse, der Kommunikation sowie dem Absatz und der Bewerbung unserer Produkte und
              Leistungen.
            </p>
            <p>
              Rechtsgrundlage kann auch eine Einwilligung des Nutzers gemäß Art. 6 Abs. 1 lit. a DSGVO
              gegenüber dem Plattformbetreiber sein. Die Einwilligung hierzu kann der Nutzer nach Art. 7
              Abs. 3 DSGVO jederzeit durch eine Mitteilung an den Plattformbetreiber für die Zukunft
              widerrufen.
            </p>
            <p>
              Bei dem Aufruf unseres Onlineauftritts auf der Plattform Facebook werden von der Meta
              Platforms Ireland Limited als Betreiberin der Plattform in der EU Daten des Nutzers (z.B.
              persönliche Informationen, IP-Adresse etc.) verarbeitet.
            </p>
            <p>
              Diese Daten des Nutzers dienen zu statistischen Informationen über die Inanspruchnahme
              unserer Firmenpräsenz auf Facebook. Die Meta Platforms Ireland Limited nutzt diese Daten zu
              Marktforschungs- und Werbezwecken sowie zur Erstellung von Profilen der Nutzer. Anhand dieser
              Profile ist es der Meta Platforms Ireland Limited beispielsweise möglich, die Nutzer
              innerhalb und außerhalb von Facebook interessenbezogen zu bewerben. Ist der Nutzer zum
              Zeitpunkt des Aufrufes in seinem Account auf Facebook eingeloggt, kann die Meta Platforms
              Ireland Limited zudem die Daten mit dem jeweiligen Nutzerkonto verknüpfen.
            </p>
            <p>
              Im Falle einer Kontaktaufnahme des Nutzers über Facebook werden die bei dieser Gelegenheit
              eingegebenen personenbezogenen Daten des Nutzers zur Bearbeitung der Anfrage genutzt. Die
              Daten des Nutzers werden bei uns gelöscht, sofern die Anfrage des Nutzers abschließend
              beantwortet wurde und keine gesetzlichen Aufbewahrungspflichten, wie z.B. bei einer
              anschließenden Vertragsabwicklung, entgegenstehen.
            </p>
            <p>Zur Verarbeitung der Daten werden von der Meta Platforms Ireland Limited ggf. auch Cookies gesetzt.</p>
            <p>
              Sollte der Nutzer mit dieser Verarbeitung nicht einverstanden sein, so besteht die
              Möglichkeit, die Installation der Cookies durch eine entsprechende Einstellung des Browsers zu
              verhindern. Bereits gespeicherte Cookies können ebenfalls jederzeit gelöscht werden. Die
              Einstellungen hierzu sind vom jeweiligen Browser abhängig. Sollte der Nutzer die Installation
              der Cookies verhindern oder einschränken, kann dies dazu führen, dass nicht sämtliche
              Funktionen von Facebook vollumfänglich nutzbar sind.
            </p>
            <p>
              Näheres zu den Verarbeitungstätigkeiten, deren Unterbindung und zur Löschung der von Facebook
              verarbeiteten Daten finden sich in der Datenrichtlinie von Facebook:{" "}
              <Extern href="https://www.facebook.com/privacy/policy" />
            </p>
            <p>
              Es ist nicht ausgeschlossen, dass die Verarbeitung durch die Meta Platforms Ireland Limited
              auch über die Meta Platforms, Inc. in den USA erfolgt. Die Meta Platforms, Inc. ist nach dem
              EU-US Data Privacy Framework zertifiziert.
            </p>
          </Abschnitt>

          <Abschnitt id="instagram">
            <p>
              Zur Bewerbung unserer Produkte und Leistungen sowie zur Kommunikation mit Interessenten oder
              Kunden betreiben wir eine Firmenpräsenz auf der Plattform Instagram.
            </p>
            <p>
              Auf dieser Social-Media-Plattform sind wir gemeinsam mit der {ANBIETER.meta}, verantwortlich.
            </p>
            <p>
              Der Datenschutzbeauftragte von Instagram kann über ein Kontaktformular erreicht werden:{" "}
              <Extern href="https://www.facebook.com/help/contact/540977946302970" />
            </p>
            <p>
              Die gemeinsame Verantwortlichkeit haben wir in einer Vereinbarung bezüglich der jeweiligen
              Verpflichtungen im Sinne der DSGVO geregelt. Diese Vereinbarung, aus der sich die
              gegenseitigen Verpflichtungen ergeben, ist unter dem folgenden Link abrufbar:{" "}
              <Extern href="https://www.facebook.com/legal/terms/page_controller_addendum" />
            </p>
            <p>
              Rechtsgrundlage für die dadurch erfolgende und nachfolgend wiedergegebene Verarbeitung von
              personenbezogenen Daten ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse besteht
              an der Analyse, der Kommunikation sowie dem Absatz und der Bewerbung unserer Produkte und
              Leistungen.
            </p>
            <p>
              Rechtsgrundlage kann auch eine Einwilligung des Nutzers gemäß Art. 6 Abs. 1 lit. a DSGVO
              gegenüber dem Plattformbetreiber sein. Die Einwilligung hierzu kann der Nutzer nach Art. 7
              Abs. 3 DSGVO jederzeit durch eine Mitteilung an den Plattformbetreiber für die Zukunft
              widerrufen.
            </p>
            <p>
              Bei dem Aufruf unseres Onlineauftritts auf der Plattform Instagram werden von der Meta
              Platforms Ireland Limited als Betreiberin der Plattform in der EU Daten des Nutzers (z.B.
              persönliche Informationen, IP-Adresse etc.) verarbeitet.
            </p>
            <p>
              Diese Daten des Nutzers dienen zu statistischen Informationen über die Inanspruchnahme
              unserer Firmenpräsenz auf Instagram. Die Meta Platforms Ireland Limited nutzt diese Daten zu
              Marktforschungs- und Werbezwecken sowie zur Erstellung von Profilen der Nutzer. Anhand dieser
              Profile ist es der Meta Platforms Ireland Limited beispielsweise möglich, die Nutzer
              innerhalb und außerhalb von Instagram interessenbezogen zu bewerben. Ist der Nutzer zum
              Zeitpunkt des Aufrufes in seinem Account auf Instagram eingeloggt, kann die Meta Platforms
              Ireland Limited zudem die Daten mit dem jeweiligen Nutzerkonto verknüpfen.
            </p>
            <p>
              Im Falle einer Kontaktaufnahme des Nutzers über Instagram werden die bei dieser Gelegenheit
              eingegebenen personenbezogenen Daten des Nutzers zur Bearbeitung der Anfrage genutzt. Die
              Daten des Nutzers werden bei uns gelöscht, sofern die Anfrage des Nutzers abschließend
              beantwortet wurde und keine gesetzlichen Aufbewahrungspflichten, wie z.B. bei einer
              anschließenden Vertragsabwicklung, entgegenstehen.
            </p>
            <p>Zur Verarbeitung der Daten werden von der Meta Platforms Ireland Limited ggf. auch Cookies gesetzt.</p>
            <p>
              Sollte der Nutzer mit dieser Verarbeitung nicht einverstanden sein, so besteht die
              Möglichkeit, die Installation der Cookies durch eine entsprechende Einstellung des Browsers zu
              verhindern. Bereits gespeicherte Cookies können ebenfalls jederzeit gelöscht werden. Die
              Einstellungen hierzu sind vom jeweiligen Browser abhängig. Sollte der Nutzer die Installation
              der Cookies verhindern oder einschränken, kann dies dazu führen, dass nicht sämtliche
              Funktionen von Instagram vollumfänglich nutzbar sind.
            </p>
            <p>
              Näheres zu den Verarbeitungstätigkeiten, deren Unterbindung und zur Löschung der von
              Instagram verarbeiteten Daten finden sich in der Datenrichtlinie von Instagram:{" "}
              <Extern href="https://help.instagram.com/519522125107875" />
            </p>
            <p>
              Es ist nicht ausgeschlossen, dass die Verarbeitung durch die Meta Platforms Ireland Limited
              auch über die Meta Platforms, Inc. in den USA erfolgt. Die Meta Platforms, Inc. ist nach dem
              EU-US Data Privacy Framework zertifiziert.
            </p>
          </Abschnitt>

          <Abschnitt id="verlinkung">
            <p>
              Der Anbieter setzt auf der Website eine Verlinkung auf die nachstehend aufgeführten sozialen
              Netzwerke ein.
            </p>
            <p>
              Rechtsgrundlage ist hierbei Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse des
              Anbieters besteht an der Verbesserung der Nutzungsqualität der Website.
            </p>
            <p>
              Die Einbindung der Plugins erfolgt dabei über eine verlinkte Grafik. Erst durch einen Klick
              auf die entsprechende Grafik wird der Nutzer zu dem Dienst des jeweiligen sozialen Netzwerks
              weitergeleitet.
            </p>
            <p>
              Nach der Weiterleitung des Kunden werden durch das jeweilige Netzwerk Informationen über den
              Nutzer erfasst. Dies sind zunächst Daten wie IP-Adresse, Datum, Uhrzeit und besuchte Seite.
              Ist der Nutzer währenddessen in seinem Benutzerkonto des jeweiligen Netzwerks eingeloggt,
              kann der Netzwerk-Betreiber ggf. die gesammelten Informationen des konkreten Besuches des
              Nutzers dem persönlichen Account des Nutzers zuordnen. Interagiert der Nutzer über einen
              „Teilen“-Button des jeweiligen Netzwerks, können diese Informationen in dem persönlichen
              Benutzerkonto des Nutzers gespeichert und ggf. veröffentlicht werden. Will der Nutzer
              verhindern, dass die gesammelten Informationen unmittelbar seinem Benutzerkonto zugeordnet
              werden, muss sich der Nutzer vor dem Anklicken der Grafik ausloggen. Zudem besteht die
              Möglichkeit, das jeweilige Benutzerkonto entsprechend zu konfigurieren.
            </p>
            <p>Folgende soziale Netzwerke sind vom Anbieter verlinkt:</p>
            <ul className="space-y-3">
              <li>
                <strong>facebook</strong>
                <br />
                {ANBIETER.meta}.
                <br />
                Datenschutzerklärung: <Extern href="https://www.facebook.com/privacy/policy" />
              </li>
              <li>
                <strong>Instagram</strong>
                <br />
                {ANBIETER.meta}.
                <br />
                Datenschutzerklärung: <Extern href="https://help.instagram.com/519522125107875" />
              </li>
            </ul>
          </Abschnitt>
        </section>

        <p className="border-t border-border pt-6 text-sm text-muted-foreground">
          Grundlage dieser Datenschutzerklärung ist die{" "}
          <Extern href="https://www.xn--generator-datenschutzerklrung-pqc.de/">
            Muster-Datenschutzerklärung
          </Extern>{" "}
          der{" "}
          <Extern href="https://www.ratgeberrecht.eu/datenschutz/datenschutzerklaerung-generator-dsgvo.html">
            Anwaltskanzlei Weiß &amp; Partner
          </Extern>
          . Stand: {RECHT.stand}
        </p>
      </div>
    </>
  );
}
