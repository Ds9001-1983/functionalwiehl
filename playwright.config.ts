import { defineConfig, devices } from "@playwright/test";
import { TEST_ENV } from "./tests/helpers/test-env";

/**
 * Lokale Abnahme: Playwright baut und startet den Prod-Build (`next build && next start`)
 * auf PW_PORT (Standard 3100, je Worktree ein eigener Port) mit Test-Env (Memory-Store,
 * JSON-Mailtransport). Der eigene Build kostet nur Sekunden und verhindert, dass
 * `npm run test` allein einen veralteten Stand prüft.
 *
 * Mit PW_BASE_URL (Preview/Live) startet kein Server – dann nur lesende Tests
 * auswählen, z. B. `npm run test:live` (@live).
 */
const PORT = Number(process.env.PW_PORT ?? 3100);
const BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 14"] } }, // 79 % des Traffics
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npx next build && npx next start -p ${PORT}`,
        url: BASE_URL,
        // nie einen schon laufenden (Dev-)Server mit fremder Env testen
        reuseExistingServer: false,
        timeout: 180_000,
        env: { ...TEST_ENV, PORT: String(PORT) },
      },
});
