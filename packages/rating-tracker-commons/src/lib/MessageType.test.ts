import { isMessageType } from "./MessageType";

describe("Message Type", () => {
  it("is a message type", () => {
    expect(isMessageType("fetchError")).toBe(true);
  });

  it("is not a message type", () => {
    expect(isMessageType("fetchSuccess")).toBe(false);
  });
});
