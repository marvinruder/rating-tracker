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
    // TODO: try some concurrency where possible. Perhaps implement a mutex?
    singleThread: true,
  },
});
