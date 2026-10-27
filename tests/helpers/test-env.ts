/**
 * Env des Prod-Servers, gegen den die lokale Abnahme läuft (playwright.config.ts → webServer.env).
 * Tests importieren die Werte von hier (z. B. Basic Auth des Klickspeichers, CRON_SECRET),
 * statt sie zu duplizieren. Alles Testwerte – nie echte Zugangsdaten eintragen.
 *
 * Gesetzte Prozess-Env schlägt .env.local (auch leere Strings), deshalb stehen die
 * Upstash-, SMTP- und Instagram-Variablen hier bewusst leer: Die Abnahme erreicht
 * nie echtes Redis und verschickt nie echte Mails.
 */
export const TEST_ENV = {
  BN_CLICK_STORE: "memory",
  BN_CLICK_USER: "test",
  // mit Leerzeichen wie ein WP-App-Passwort (Basic Auth vergleicht ohne Leerzeichen)
  BN_CLICK_PASS: "abcd efgh ijkl",
  BN_CLICK_DELETE_AT: "2026-12-10T00:00:00+01:00",
  MAIL_TRANSPORT: "json",
  FORM_TO: "abnahme@example.invalid",
  ALERT_TO: "abnahme@example.invalid",
  CRON_SECRET: "abnahme-cron-secret-0123456789abcdef",
  RATE_LIMIT_SECRET: "abnahme-rate-limit-secret-0123456789",
  FORM_RATE_LIMIT: "1000",
  KV_REST_API_URL: "",
  KV_REST_API_TOKEN: "",
  KV_REST_API_READ_ONLY_TOKEN: "",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
  SMTP_HOST: "",
  SMTP_USER: "",
  SMTP_PASS: "",
  INSTAGRAM_TOKEN: "",
  BLOB_READ_WRITE_TOKEN: "",
  IG_BLOB_HOST: "",
} as const;

/** true, wenn Playwright den lokalen Prod-Server selbst startet (kein PW_BASE_URL). */
export const LOKALER_SERVER = !process.env.PW_BASE_URL;
