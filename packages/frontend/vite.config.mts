// eslint-disable-next-line import/no-nodejs-modules
import fs from "node:fs";
// eslint-disable-next-line import/no-nodejs-modules
import type { ServerOptions } from "node:https";

import react from "@vitejs/plugin-react";
import proxy from "http2-proxy";
import type { ViteDevServer } from "vite";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import wasm from "vite-plugin-wasm";
import { defineConfig as defineVitestConfig } from "vitest/config";

let https: ServerOptions | undefined;

try {
  https = { cert: fs.readFileSync("./certs/fullchain.pem"), key: fs.readFileSync("./certs/privkey.pem") };
} catch {}

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
      (() => {
        const configure = (server: ViteDevServer) => {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith("/api"))
              void proxy.web(
                req,
                res,
                {
                  hostname: "localhost",
                  port: Number(process.env.PORT ?? 3001),
                  onReq: async (incomingMessage, options) => {
                    if (!options.headers) options.headers = {};
                    options.headers["X-Forwarded-For"] = incomingMessage.headers["x-forwarded-for"]
                      ? `${incomingMessage.headers["x-forwarded-for"]}, ${incomingMessage.socket.remoteAddress}`
                      : incomingMessage.socket.remoteAddress;
                  },
                  proxyTimeout: 3600000,
                },
                (err) => err && next(err),
              );
            else next();
          });
        };
        return {
          enforce: "pre",
          configureServer: configure,
          configurePreviewServer: configure,
        };
      })(),
      react(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: "src/index.html",
        inject: {
          data: {
            title: `${process.env.NODE_ENV === "development" ? "Development Preview – " : ""}Rating Tracker`,
            faviconPath: `favicon${process.env.NODE_ENV === "development" ? "-dev" : ""}`,
          },
        },
        verbose: process.env.NODE_ENV === "development",
      }),
      wasm(),
    ],
    preview: { port: 443, strictPort: true },
    server: { host: true, https, port: 443, strictPort: true },
    worker: { format: "es", plugins: () => [wasm()] },
  }),
  defineVitestConfig({
    server: { ws: process.env.NODE_ENV === "test" ? false : undefined },
    test: {
      coverage: { all: false, enabled: true, provider: "v8" },
      pool: "threads",
      poolOptions: { threads: { useAtomics: true } },
    },
  }),
);
