import { describe, expect, it } from "vitest";

import { isMessageType } from "./MessageType";

describe.concurrent("Message Type", () => {
  it("is a message type", () => {
    expect(isMessageType("fetchError")).toBe(true);
  });

  it("is not a message type", () => {
    expect(isMessageType("fetchSuccess")).toBe(false);
  });
});
