import "@vitest/web-worker";
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ConvertAvatarWorker from "./imageManipulation?worker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const favicon192Buffer = fs.readFileSync(
  path.join(__dirname, "..", "..", "public", "assets", "images", "favicon-dev", "favicon-192.png"),
);
const favicon192 = new File([favicon192Buffer], "favicon-192.png");

describe("Avatar Conversion", async () => {
  it("converts favicon-dev properly", async () => {
    let workerHasSentResult = false;
    const worker = new ConvertAvatarWorker();
    worker.postMessage(favicon192);
    worker.onmessage = (message) => {
      workerHasSentResult = true;
      expect(message.data.result).toMatchSnapshot();
    };
    while (!workerHasSentResult) await new Promise((resolve) => setTimeout(resolve, 10));
  }, 15000);

  it("handles errors correctly", async () => {
    let workerHasSentResult = false;
    const worker = new ConvertAvatarWorker();
    worker.postMessage("no file here");
    worker.onmessage = (message) => {
      workerHasSentResult = true;
      expect(message.data.isError).toBeTruthy();
      expect(message.data.result).toBeUndefined();
    };
    while (!workerHasSentResult) await new Promise((resolve) => setTimeout(resolve, 10));
  }, 15000);
});
