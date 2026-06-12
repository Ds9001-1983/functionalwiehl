# TODO: Cutover-Plan (Prototyp → Live auf functional-wiehl.de)

**Status:** offen — Prototyp läuft auf Vercel-Domain mit globalem `noindex`
(X-Robots-Tag via `next.config.ts` + robots.ts). WordPress bleibt bis zum
Cutover live.

## Reihenfolge

1. **Freigaben einholen:** Texte aller Unterseiten + neue Datenschutzerklärung
   (Angebot: „Unterseiten-Texte gehen vor Veröffentlichung zur Freigabe").
2. **Vercel-Projekt:** Custom Domain functional-wiehl.de + www hinzufügen.
3. **Env setzen:** `NEXT_PUBLIC_ALLOW_INDEXING=true`, `NEXT_PUBLIC_SITE_URL=https://functional-wiehl.de` → Deploy.
4. **DNS umstellen** (A/CNAME auf Vercel). WordPress-Hosting NICHT sofort
   kündigen — siehe Punkt 7.
5. **Redirects prüfen:** `node scripts/check-redirects.mjs` gegen die Live-Domain
   (alle 20 Alt-URLs → 301 → 200).
6. **Google:** Search Console — neue Sitemap einreichen (`/sitemap.xml`);
   Google Business Profile — Website-URL prüfen, Feld „Früherer Name: INJOY
   Wiehl" pflegen (gehört zu Stufe 2 „Injoy-Konsolidierung").
7. **WP-Medien-URLs:** `wp-content/uploads/*` ist nach DNS-Umzug tot — in Meta-
   Anzeigen verlinkte Creatives und Google-Images-Treffer prüfen. Option:
   Übergangs-Redirects `/wp-content/uploads/:path*` auf neue Assets oder 410.
8. **Tracking-Cutover:** siehe docs/TODO-meta-capi.md (CAPI, Matomo, GA4 Key Events).
9. **WP stilllegen:** erst nach 2–4 Wochen stabilem Betrieb (Backup ziehen!).
   Achtung: wp-login.php war öffentlich erreichbar — bis zur Stilllegung
   mindestens Basic-Auth davorlegen.

## Verzeichnis-Konsolidierung (Stufe 2 des Angebots, außerhalb dieses Repos)

- [ ] Alte INJOY-Einträge in Verzeichnissen (Gelbe Seiten, 11880, Apple Maps,
      Bing Places, …) auf Functional Wiehl umziehen — NAP-Konsistenz
      (Wilhelm-Grümer-Weg 18, 51674 Wiehl, 02262/752717).
