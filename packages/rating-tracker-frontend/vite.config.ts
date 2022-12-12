// import {
//   defineConfig as defineVitestConfig,
//   configDefaults as vitestConfigDefaults,
// } from "vitest/config";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { dependencies } from "./package.json";

const chunkList = ["@mui/icons-material", "@mui/lab", "@mui/material"];

function renderChunks(deps: Record<string, string>) {
  const chunks = {};
  Object.keys(deps).forEach((key) => {
    if (chunkList.includes(key)) chunks[key] = [key];
  });
  return chunks;
}

export default mergeConfig(
  defineViteConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            ...renderChunks(dependencies),
          },
        },
      },
    },
    cacheDir: ".vite",
    plugins: [
      react(),
      tsconfigPaths(),
      createHtmlPlugin({
        minify: true,
        entry:
          process.env.NODE_ENV === "development"
            ? "src/index.tsx"
            : "index.tsx",
        template: "src/index.html",
        inject: {
          data: {
            title:
              process.env.NODE_ENV === "development"
                ? "Development Preview – Rating Tracker"
                : "Rating Tracker",
            faviconPath:
              process.env.NODE_ENV === "development"
                ? "favicon-dev"
                : "favicon",
            reactDevTools:
              process.env.NODE_ENV === "development"
                ? '<script src="http://localhost:8097"></script>'
                : "",
          },
        },
        verbose: process.env.NODE_ENV === "development",
      }),
    ],
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
