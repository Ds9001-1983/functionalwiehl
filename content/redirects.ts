/**
 * 301-Map für die 23 Alt-URLs der WordPress-Site (alle leben heute als
 * index-bare Orphan-Pages). Wird in next.config.ts eingespeist und beim
 * Domain-Umzug scharf — bis dahin versioniert und testbar.
 * /impressum/ und /datenschutz/ bleiben bestehen (kein Redirect).
 */
export const REDIRECTS: { source: string; destination: string }[] = [
  { source: "/home/", destination: "/" },
  { source: "/start/", destination: "/" },
  { source: "/wartung/", destination: "/" },
  { source: "/landingpage-v2/", destination: "/probetraining/" },
  { source: "/preise/", destination: "/#preise" },
  { source: "/studententarif/", destination: "/#preise" },
  { source: "/cardiotraining/", destination: "/training-und-kurse/#cardio" },
  { source: "/polar/", destination: "/training-und-kurse/#cardio" },
  { source: "/figur-muskeltraining/", destination: "/training-und-kurse/#krafttraining" },
  { source: "/muskelaufbau/", destination: "/training-und-kurse/#krafttraining" },
  { source: "/ruecken/", destination: "/training-und-kurse/#krafttraining" },
  { source: "/functional-training/", destination: "/training-und-kurse/#functional" },
  { source: "/group-fitness/", destination: "/kursplan/" },
  { source: "/fitness-app/", destination: "/kursplan/" },
  { source: "/gewichtsmanagement/", destination: "/training-und-kurse/#ernaehrung" },
  { source: "/abnehmen/", destination: "/training-und-kurse/#ernaehrung" },
  { source: "/koerpermasse/", destination: "/gesundheits-check/" },
  { source: "/best-ager/", destination: "/frauen-ab-50/" },
  { source: "/cookie-richtlinie-eu/", destination: "/datenschutz/" },
  // Offen: eigene AGB-Seite nötig? Bis zur Klärung → Impressum (docs/TODO-recht.md)
  { source: "/geschaeftsbedingungen/", destination: "/impressum/" },
];
