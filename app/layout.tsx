import type { Metadata } from "next";
import { Archivo, Open_Sans } from "next/font/google";
import { A11yProvider } from "@/components/a11y/a11y-context";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { ConsentProvider } from "@/components/consent/consent-context";
import { PAGES, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Die Live-Site deklariert "Open Sans", lädt aber keinen Webfont —
// hier wird er via next/font self-gehostet (DSGVO-sauber, kein Google-Request).
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

// Display-Schrift für editoriale Headlines (h1/h2 + große Zahlen). Variable Font,
// ebenfalls self-gehostet via next/font (DSGVO-sauber). Open Sans bleibt Body-Font.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGES.home.title,
  description: PAGES.home.description,
  openGraph: {
    siteName: "Functional Wiehl",
    locale: "de_DE",
    type: "website",
  },
  // Meta-Domainverifizierung (Business Manager) – live identisch im <head>.
  // Steht im Root-Layout, damit auch die BN-Landingpage ohne Site-Layout sie erbt.
  verification: {
    other: { "facebook-domain-verification": "snffiuije1a574j1cpn13fi981px5k" },
  },
};

// FOUC-Schutz: setzt die Barrierefreiheits-Einstellungen aus localStorage,
// bevor der erste Paint passiert. Logik gespiegelt aus a11y-context.tsx → applyA11y.
const A11Y_INIT = `try{var s=JSON.parse(localStorage.getItem("fw_a11y")||"{}");var e=document.documentElement;e.classList.add("js");e.dataset.fontscale=String([0,1,2].includes(s.fontScale)?s.fontScale:0);e.classList.toggle("a11y-contrast",!!s.contrast);e.classList.toggle("a11y-reduce-motion",!!s.reduceMotion);e.classList.toggle("a11y-highlight-links",!!s.highlightLinks);}catch(_){}`;

/**
 * Root-Layout: nur Dokument, Schriften und Provider. Header, Footer, Sticky-Leiste,
 * FAB, Barrierefreiheits-Leiste, Analytics und JSON-LD liegen in app/(site)/layout.tsx,
 * damit die BN-Landingpage (app/black-november/) wie live ohne Site-Rahmen läuft.
 * Der Consent-Banner bleibt hier: LP und Footer-Widerruf brauchen den Provider.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${openSans.variable} ${archivo.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT }} />
      </head>
      <body className="antialiased">
        <A11yProvider>
          <ConsentProvider>
            {children}
            <ConsentBanner />
          </ConsentProvider>
        </A11yProvider>
      </body>
    </html>
  );
}
