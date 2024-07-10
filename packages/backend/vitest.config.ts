import { defineConfig } from "vitest/config";

import "./test/env";

export default defineConfig({
  cacheDir: ".vite",
  esbuild: { target: `node${process.versions.node}` },
  server: { ws: false },
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      exclude: [
        "**/__mocks__/**",
        "dist",
        "prisma",
        "test",
        "src/controllers/FetchController.ts",
        "src/fetchers",
        "src/utils/*-shim.ts",
        "src/utils/cron.ts",
        "src/utils/DataProviderError.ts",
        "src/utils/fetchRequest.ts",
        "src/utils/logger.ts",
        "src/utils/logFormatterConfig.ts",
        "vitest.config.ts",
      ],
    },
    exclude: ["**/*.live.test.ts"],
    forceRerunTriggers: ["**/*.live.test.ts"],
    pool: "threads",
    poolOptions: { threads: { useAtomics: true } },
    globals: true,
    clearMocks: true,
  },
});
