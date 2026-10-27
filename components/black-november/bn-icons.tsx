/**
 * SVGs der BN-LP 1:1 aus bn.html: WhatsApp (Hero mit Hörer, Schritte/Abschluss nur Sprechblase)
 * und die vier Kartensymbole. Alle dekorativ (aria-hidden), der Text steht daneben.
 */

const WHATSAPP_BLASE =
  "M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2.1 7L3.2 29l6.4-1.8c2 1.1 4.2 1.6 6.4 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3z";
const WHATSAPP_VOLL =
  "M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2.1 7L3.2 29l6.4-1.8c2 1.1 4.2 1.6 6.4 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2 0-4-.6-5.7-1.6l-.4-.2-3.8 1 1-3.7-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.2 10 10 5.3 16 5.3S26.8 10 26.8 15.9 22 26.4 16 26.4zm5.9-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.8 8.8 0 0 1-2.6-1.6 9.6 9.6 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6.3-.5v-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.4 2.3 3.5 5.6 4.9c.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5s.3-1.3.2-1.5-.4-.2-.7-.4z";

export function BnWhatsAppIcon({ voll = false, className }: { voll?: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className}>
      <path fill="currentColor" d={voll ? WHATSAPP_VOLL : WHATSAPP_BLASE} />
    </svg>
  );
}

export type BnKartenIcon = "uhr" | "hantel" | "puls" | "person";

const KARTEN_PFADE: Record<BnKartenIcon, React.ReactNode> = {
  uhr: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  hantel: <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />,
  puls: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
};

export function BnKartenSymbol({ icon, className }: { icon: BnKartenIcon; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0b0b0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {KARTEN_PFADE[icon]}
    </svg>
  );
}
