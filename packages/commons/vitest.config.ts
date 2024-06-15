import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: ".vite",
  server: { ws: false },
  test: { coverage: { all: false, enabled: true, provider: "v8" }, poolOptions: { threads: { useAtomics: true } } },
});
