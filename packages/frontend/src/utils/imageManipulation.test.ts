/* eslint-disable import/no-nodejs-modules */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import "@vitest/web-worker";
import { describe, expect, it, vi } from "vitest";

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
      expect(message.data.result).toMatchSnapshot();
      workerHasSentResult = true;
    };
    await vi.waitUntil(() => workerHasSentResult, 4000);
  });

  it("handles errors correctly", async () => {
    let workerHasSentResult = false;
    const worker = new ConvertAvatarWorker();
    worker.postMessage("no file here");
    worker.onmessage = (message) => {
      expect(message.data.isError).toBeTruthy();
      expect(message.data.result).toBeUndefined();
      workerHasSentResult = true;
    };
    await vi.waitUntil(() => workerHasSentResult, 4000);
  });
});
