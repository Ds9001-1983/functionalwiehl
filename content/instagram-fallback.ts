import type { InstagramPost } from "@/lib/instagram/typen";

import charityChallenge from "@/public/img/instagram/18104291903142822.jpg";
import communityRuns from "@/public/img/instagram/17902163454378405.jpg";
import communityRun3 from "@/public/img/instagram/18015705560750859.jpg";

/**
 * Statischer Fallback für #aktuelles: die 3 neuesten Reels der Live-Seite (Stand 27.10.2026,
 * Vorschaubilder aus den Smash-Balloon-Kopien in WordPress, 640 px). Gilt zum Go-live und
 * immer dann, wenn der API-Feed des Instagram-Pakets ausfällt. Neuere Beiträge kommen über
 * den Feed, nicht durch Pflege dieser Liste.
 */
export const INSTAGRAM_FALLBACK: InstagramPost[] = [
  {
    id: "18104291903142822",
    permalink: "https://www.instagram.com/reel/De-H9Dmx0Rl/",
    typ: "VIDEO",
    zeitpunkt: "2026-10-26T20:19:45+00:00",
    bild: charityChallenge,
    alt: "Charity Challenge am 5. und 6. Dezember im Functional Wiehl",
  },
  {
    id: "17902163454378405",
    permalink: "https://www.instagram.com/reel/DezWyEjozTx/",
    typ: "VIDEO",
    zeitpunkt: "2026-10-22T15:58:28+00:00",
    bild: communityRuns,
    alt: "Rückblick auf unsere Community Runs",
  },
  {
    id: "18015705560750859",
    permalink: "https://www.instagram.com/reel/DehrYSmRfmJ/",
    typ: "VIDEO",
    zeitpunkt: "2026-10-15T19:13:26+00:00",
    bild: communityRun3,
    alt: "3. Community Run am Samstag, 17.10.2026",
  },
];
