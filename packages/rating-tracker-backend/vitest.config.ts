import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    cache: {
      dir: ".vitest",
    },
    coverage: {
      provider: "istanbul",
      exclude: ["**/__mocks__/**"],
    },
  },
});
