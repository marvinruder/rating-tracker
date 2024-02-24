import react from "@vitejs/plugin-react";
import { mergeConfig, defineConfig as defineViteConfig, createLogger } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import wasm from "vite-plugin-wasm";
import { defineConfig as defineVitestConfig } from "vitest/config";

const customLogger = createLogger();
const customLoggerError = customLogger.error;
customLogger.error = (msg, options) => {
  // vitejs/vite#14328
  if (msg.includes("WebSocket server error: Port is already in use")) return;
  customLoggerError(msg, options);
};

export default mergeConfig(
  defineViteConfig({
    build: {
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
      },
      sourcemap: true,
    },
    cacheDir: ".vite",
    esbuild: { supported: { "top-level-await": true } },
    plugins: [
      react(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: "src/index.html",
        inject: {
          data: {
            title: process.env.NODE_ENV === "development" ? "Development Preview – " : "" + "Rating Tracker",
            faviconPath: "favicon" + process.env.NODE_ENV === "development" ? "-dev" : "",
          },
        },
        verbose: process.env.NODE_ENV === "development",
      }),
      wasm(),
    ],
    preview: { port: 5173 },
    server: { host: true },
    worker: { format: "es", plugins: () => [wasm()] },
  }),
  defineVitestConfig({
    customLogger,
    test: {
      cache: { dir: ".vite/vitest" },
      coverage: { all: false, enabled: true, provider: "v8", reporter: ["text", "html", "cobertura"] },
      reporters: ["default", "junit"],
      outputFile: "coverage/junit.xml",
    },
  }),
);
