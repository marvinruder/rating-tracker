import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";

// Make `require`, `__filename`, and `__dirname` available globally
globalThis.require = createRequire(import.meta.url);
globalThis.__filename = url.fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(__filename);
