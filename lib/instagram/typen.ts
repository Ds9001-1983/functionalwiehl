import type { StaticImageData } from "next/image";

/** media_type der Instagram-Graph-API (Reels kommen als VIDEO) */
export type InstagramMedienTyp = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

/**
 * Ein Beitrag unter #aktuelles. Gemeinsamer Typ für den statischen Fallback
 * (content/instagram-fallback.ts) und den späteren API-Feed des Instagram-Pakets
 * (Bilder im Vercel Blob). Der Browser lädt nie direkt vom Meta-CDN.
 */
export type InstagramPost = {
  /** Media-ID der Graph-API */
  id: string;
  /** Link auf den Beitrag selbst, nicht aufs Profil */
  permalink: string;
  /** VIDEO (auch Reels) bekommt das Play-Symbol */
  typ: InstagramMedienTyp;
  /** timestamp der API, ISO 8601 */
  zeitpunkt: string;
  /** lokales Bild (Fallback) oder Blob-URL (Feed) */
  bild: StaticImageData | string;
  /** nur bei String-Bildern nötig, statische Imports bringen die Maße mit */
  breite?: number;
  hoehe?: number;
  alt: string;
};
