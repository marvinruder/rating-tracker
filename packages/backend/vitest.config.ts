import { createLogger } from "vite";
import { defineConfig } from "vitest/config";

import "./test/env";

const customLogger = createLogger();
const customLoggerError = customLogger.error;
customLogger.error = (msg, options) => {
  // vitejs/vite#14328
  if (msg.includes("WebSocket server error: Port is already in use")) return;
  customLoggerError(msg, options);
};

export default defineConfig({
  customLogger,
  cacheDir: ".vite",
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
        "src/utils/webdriver.*",
      ],
    },
    exclude: ["**/*.live.test.ts"],
    forceRerunTriggers: ["**/*.live.test.ts"],
    poolOptions: { threads: { useAtomics: true } },
    globals: true,
    clearMocks: true,
  },
});
