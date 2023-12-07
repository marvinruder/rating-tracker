import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { cache: { dir: ".vitest" }, coverage: { all: false, enabled: true, provider: "v8" } },
});
