/* eslint-disable import/no-nodejs-modules */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "@vitest/web-worker";
import { assert, describe, expect, it, vi } from "vitest";

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
    worker.onmessage = (message: MessageEvent<{ result: Uint8Array } | { error: Error }>) => {
      assert("result" in message.data);
      assert(!("error" in message.data));
      expect(Buffer.from(message.data.result).toString("base64")).toMatchSnapshot();
      workerHasSentResult = true;
    };
    await vi.waitUntil(() => workerHasSentResult, 16000);
  }, 16000);

  it("handles error correctly – no file", async () => {
    let workerHasSentResult = false;
    const worker = new ConvertAvatarWorker();
    worker.postMessage("no file here");
    worker.onmessage = (message: MessageEvent<{ result: Uint8Array } | { error: Error }>) => {
      assert(!("result" in message.data));
      assert("error" in message.data);
      expect(message.data.error).toBeInstanceOf(Error);
      workerHasSentResult = true;
    };
    await vi.waitUntil(() => workerHasSentResult, 8000);
  }, 8000);

  it("handles error correctly – empty file", async () => {
    let workerHasSentResult = false;
    const worker = new ConvertAvatarWorker();
    worker.postMessage(new File([], "empty file"));
    worker.onmessage = (message: MessageEvent<{ result: Uint8Array } | { error: Error }>) => {
      assert(!("result" in message.data));
      assert("error" in message.data);
      expect(message.data.error).toBeInstanceOf(Error);
      workerHasSentResult = true;
    };
    await vi.waitUntil(() => workerHasSentResult, 8000);
  }, 8000);
});
