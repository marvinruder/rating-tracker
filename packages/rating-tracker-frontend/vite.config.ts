// import {
//   defineConfig as defineVitestConfig,
//   configDefaults as vitestConfigDefaults,
// } from "vitest/config";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default mergeConfig(
  defineViteConfig({
    cacheDir: ".vite",
    plugins: [react(), tsconfigPaths()],
  }),
  {}
  // defineVitestConfig({
  //   test: {
  //     cache: { dir: ".vite/vitest" },
  //     coverage: {
  //       reporter: ["cobertura", "text"],
  //       exclude: [
  //         ...(vitestConfigDefaults.coverage.exclude
  //           ? vitestConfigDefaults.coverage.exclude
  //           : []),
  //         ".pnp.*",
  //       ],
  //     },
  //   },
  // })
);
