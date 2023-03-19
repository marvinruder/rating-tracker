import { defineConfig } from "vitest/config";

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
