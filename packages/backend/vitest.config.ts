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
        "src/fetch",
        "src/types/*.d.ts",
        "src/utils/*-shim.ts",
        "src/utils/AgentFactory.ts",
        "src/utils/CronScheduler.ts",
        "src/utils/error/DataProviderError.ts",
        "src/utils/error/api/BadGatewayError.ts",
        "src/utils/error/api/InternalServerError.ts",
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
