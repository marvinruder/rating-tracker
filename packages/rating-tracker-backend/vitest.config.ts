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
      provider: "istanbul",
      exclude: ["**/__mocks__/**", "prisma", "test"],
    },
    exclude: ["**/*.live.test.ts"],
    forceRerunTriggers: ["**/*.live.test.ts"],
    useAtomics: true,
    globals: true,
    clearMocks: true,
  },
});
