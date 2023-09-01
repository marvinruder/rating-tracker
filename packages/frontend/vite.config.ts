import { defineConfig as defineVitestConfig } from "vitest/config";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";

const chunkList: string[] = ["@mui"];

const manualChunks = (id: string) => chunkList.find((chunk) => id.match(new RegExp(chunk)));

const fontCSS = fs.readFileSync("src/fonts.css", "utf8");
const switchSelectorCSS = fs.readFileSync("src/components/etc/SwitchSelector/switchSelector.css", "utf8");
const nprogressCSSPath = require.resolve("nprogress/nprogress.css");
const nprogressCSS = fs.readFileSync(nprogressCSSPath, "utf8");

export default mergeConfig(
  defineViteConfig({
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
    cacheDir: ".vite",
    plugins: [
      react(),
      tsconfigPaths(),
      createHtmlPlugin({
        minify: true,
        entry: process.env.NODE_ENV === "development" ? "/src/index.tsx" : "index.tsx",
        template: "src/index.html",
        inject: {
          data: {
            title: process.env.NODE_ENV === "development" ? "Development Preview – Rating Tracker" : "Rating Tracker",
            faviconPath: process.env.NODE_ENV === "development" ? "favicon-dev" : "favicon",
            reactDevTools:
              process.env.NODE_ENV === "development" ? '<script src="http://localhost:8097"></script>' : "",
            fontsCSS: `<style type="text/css">${fontCSS}</style>`,
            switchSelectorCSS: `<style type="text/css">${switchSelectorCSS}</style>`,
            nprogressCSS: `<style type="text/css">${nprogressCSS}</style>`,
          },
        },
        verbose: process.env.NODE_ENV === "development",
      }),
      topLevelAwait(),
      wasm(),
    ],
    worker: {
      format: "es",
      plugins: [wasm(), topLevelAwait()],
    },
  }),
  defineVitestConfig({
    test: {
      cache: { dir: ".vite/vitest" },
      coverage: {
        enabled: true,
        provider: "v8",
      },
    },
  }),
);
