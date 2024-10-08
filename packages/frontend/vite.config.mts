/* eslint-disable import/no-nodejs-modules */
import { execSync } from "node:child_process";
import fs from "node:fs";
import type { ServerOptions } from "node:https";

import react from "@vitejs/plugin-react";
import proxy from "http2-proxy";
import type { ViteDevServer } from "vite";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import wasm from "vite-plugin-wasm";
import { defineConfig as defineVitestConfig } from "vitest/config";

let https: ServerOptions | undefined;

try {
  https = { cert: fs.readFileSync("./certs/fullchain.pem"), key: fs.readFileSync("./certs/privkey.pem") };
} catch {}

const compressionOptions: Parameters<typeof viteCompression>[0] = {
  filter: /\.(js|mjs|json|css|html?|svg|wasm)$/i,
  threshold: 256,
  // Move the compressed `index.html`s to the root directory
  success: () => execSync("/bin/sh -c 'if [ -d dist/src ]; then mv dist/src/* dist; rmdir dist/src; fi'"),
};

export default mergeConfig(
  defineViteConfig({
    build: { sourcemap: true },
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
      viteCompression({ ...compressionOptions, algorithm: "gzip" }),
      viteCompression({ ...compressionOptions, algorithm: "brotliCompress" }),
    ],
    preview: { port: 443, strictPort: true },
    server: { host: true, https, port: 443, strictPort: true },
    worker: { format: "es", plugins: () => [wasm()] },
  }),
  defineVitestConfig({
    server: { ws: process.env.NODE_ENV === "test" ? false : undefined },
    test: {
      coverage: { all: false, enabled: true, provider: "v8", exclude: ["eslint.config.mjs"] },
      pool: "threads",
      poolOptions: { threads: { useAtomics: true } },
    },
  }),
);
