import { defineConfig } from "vitest/config";

export default defineConfig({ test: { cache: { dir: ".vitest" }, coverage: { enabled: true, provider: "v8" } } });
