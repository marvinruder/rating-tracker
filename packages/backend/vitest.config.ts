import { defineConfig } from "vitest/config";

import dotenv from "dotenv";

dotenv.config({
  path: "test/.env", // Load test environment variables before connecting to database
});

export default defineConfig({
  test: {
    cache: {
      dir: ".vitest",
    },
    coverage: {
      enabled: true,
      provider: "v8",
      exclude: [
        "**/__mocks__/**",
        "prisma",
        "test",
        "src/controllers/FetchController.*",
        "src/fetchers/*",
        "src/utils/cron.*",
        "src/utils/logger.*",
        "src/utils/webdriver.*",
      ],
    },
    exclude: ["**/*.live.test.ts"],
    forceRerunTriggers: ["**/*.live.test.ts"],
    useAtomics: true,
    globals: true,
    clearMocks: true,
  },
});
