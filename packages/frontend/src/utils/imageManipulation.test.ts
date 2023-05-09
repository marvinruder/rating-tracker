// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { convertAvatar } from "./imageManipulation";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const favicon192Buffer = fs.readFileSync(
  path.join(__dirname, "..", "..", "public", "assets", "images", "favicon-dev", "favicon-192.png")
);
const favicon192 = new File([favicon192Buffer], "favicon-192.png");

describe("Avatar Conversion", () => {
  it("runs in a browser environment", () => {
    expect(typeof window).not.toBe("undefined");
  });

  it("converts favicon-dev properly", async () => {
    expect(await convertAvatar(favicon192)).toMatch(/AFABQAUAFABQAUAFABQAUAFABQAUAf\/Z$/);
  });
});
