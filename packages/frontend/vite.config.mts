/* eslint-disable import/no-nodejs-modules */
import fs from "fs";

import react from "@vitejs/plugin-react";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import wasm from "vite-plugin-wasm";
import { defineConfig as defineVitestConfig } from "vitest/config";

const chunkList: string[] = ["@mui"];

const manualChunks = (id: string) => chunkList.find((chunk) => id.match(new RegExp(chunk)));

const fontCSS = fs.readFileSync("src/fonts.css", "utf8");

export default mergeConfig(
  defineViteConfig({
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        onLog(level, log, handler) {
          // vitejs/vite#15012
          if (
            log.message.includes(
              "Error when using sourcemap for reporting an error: Can't resolve original location of error.",
            )
          )
            return;
          handler(level, log);
        },
        output: {
          manualChunks,
        },
      },
      sourcemap: true,
    },
    cacheDir: ".vite",
    esbuild: {
      supported: {
        "top-level-await": true,
      },
    },
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: "src/index.html",
        inject: {
          data: {
            title: process.env.NODE_ENV === "development" ? "Development Preview – Rating Tracker" : "Rating Tracker",
            faviconPath: process.env.NODE_ENV === "development" ? "favicon-dev" : "favicon",
            reactDevTools:
              process.env.NODE_ENV === "development" ? '<script src="http://localhost:8097"></script>' : "",
            inlineCSS: '<style type="text/css">' + fontCSS + "</style>",
          },
        },
        verbose: process.env.NODE_ENV === "development",
      }),
      wasm(),
    ],
    worker: {
      format: "es",
      plugins: () => [wasm()],
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
