/* eslint-disable import/no-nodejs-modules */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import type { OutgoingHttpHeaders } from "node:http";
import type { ServerOptions } from "node:https";

import type { ServerFeature } from "@rating-tracker/commons";
import react from "@vitejs/plugin-react";
import proxy from "http2-proxy";
import type { ViteDevServer } from "vite";
import { mergeConfig, defineConfig as defineViteConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { createHtmlPlugin } from "vite-plugin-html";
import wasm from "vite-plugin-wasm";
import { defineConfig as defineVitestConfig } from "vitest/config";

let https: ServerOptions | undefined;
let allowedHosts: string[] = [];
try {
  const cert = fs.readFileSync("./certs/fullchain.pem");
  https = { cert, key: fs.readFileSync("./certs/privkey.pem") };
  new crypto.X509Certificate(cert).subjectAltName
    ?.split(", ")
    .forEach((san) => san.startsWith("DNS:") && allowedHosts.push(san.slice(4).replace(/^\*/, "")));
} catch {}

export default mergeConfig(
  defineViteConfig({
    build: { sourcemap: true },
    cacheDir: ".vite",
    esbuild: { supported: { "top-level-await": true } },
    plugins: [
      (() => {
        const configure = (server: ViteDevServer) => {
          const features: ServerFeature[] = ["oidc", "email"];
          server.middlewares.use((req, res, next) => {
            if (!req.headers.cookie?.includes(`features=${features.join("~")}`))
              res.setHeader("Set-Cookie", `features=${features.join("~")}; SameSite=Strict; Secure`);
            if (req.url?.startsWith("/api"))
              void proxy.web(
                req,
                res,
                {
                  hostname: "localhost",
                  port: Number(process.env.PORT ?? 3001),
                  onReq: async (incomingMessage, options) => {
                    if (!options.headers) options.headers = {};
                    (options.headers as OutgoingHttpHeaders)["x-forwarded-for"] = incomingMessage.headers[
                      "x-forwarded-for"
                    ]
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
      compression({ include: /\.(js|mjs|json|css|html?|svg|wasm)$/i }),
      (() => ({
        apply: "build",
        enforce: "post",
        // Move the compressed `index.html`s to the root directory
        closeBundle: () => execSync("/bin/sh -c 'if [ -d dist/src ]; then mv dist/src/* dist; rmdir dist/src; fi'"),
      }))(),
    ],
    preview: { port: 443, strictPort: true },
    resolve: { conditions: ["mui-modern", "module", "browser", "development|production"] },
    server: { allowedHosts, host: true, https, port: 443, strictPort: true },
    worker: { format: "es", plugins: () => [wasm()] },
  }),
  defineVitestConfig({
    server: { ws: process.env.NODE_ENV === "test" ? false : undefined },
    test: {
      coverage: { all: false, enabled: true, provider: "v8", exclude: ["eslint.config.mjs"] },
      pool: "threads",
      poolOptions: { threads: { useAtomics: true } },
      unstubGlobals: true,
    },
  }),
);
