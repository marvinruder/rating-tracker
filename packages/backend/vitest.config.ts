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
        "prisma",
        "test",
        "src/controllers/FetchController.*",
        "src/fetchers/*",
        "src/utils/*-shim.*",
        "src/utils/cron.*",
        "src/utils/DataProviderError.*",
        "src/utils/fetchRequest.*",
        "src/utils/logger.*",
        "src/utils/logFormatterConfig.*",
      ],
    },
    exclude: ["**/*.live.test.ts"],
    forceRerunTriggers: ["**/*.live.test.ts"],
    poolOptions: { threads: { useAtomics: true } },
    globals: true,
    clearMocks: true,
  },
});
