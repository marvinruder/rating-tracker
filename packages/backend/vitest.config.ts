import { defineConfig } from "vitest/config";

import "./test/env";

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
        "src/utils/logFormatterConfig.*",
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
