import { createLogger } from "vite";
import { defineConfig } from "vitest/config";

const customLogger = createLogger();
const customLoggerError = customLogger.error;
customLogger.error = (msg, options) => {
  // vitejs/vite#14328
  if (msg.includes("WebSocket server error: Port is already in use")) return;
  customLoggerError(msg, options);
};

export default defineConfig({
  customLogger,
  cacheDir: ".vite",
  test: { cache: { dir: ".vitest" }, coverage: { all: false, enabled: true, provider: "v8" } },
});
