import Path from "node:path";
import URL from "node:url";
import FS from "node:fs";

export function resolve(specifier, context, next) {
  if (!specifier.startsWith(".") || !specifier.endsWith(".js")) {
    return next(specifier, context);
  }

  const parentURL = context.parentURL;
  if (!parentURL || !parentURL.startsWith("file:") || parentURL.includes("/.yarn/")) {
    return next(specifier, context);
  }

  const dirName = Path.dirname(URL.fileURLToPath(parentURL));
  const baseName = specifier.slice(0, -3);
  const path = Path.join(dirName, baseName);
  for (const extension of [".js", ".ts", ".tsx"]) {
    if (FS.existsSync(path + extension)) {
      return next(baseName + extension, context);
    }
  }

  return next(specifier, context);
}
