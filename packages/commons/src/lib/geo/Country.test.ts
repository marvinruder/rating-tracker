import { describe, expect, it } from "vitest";

import { emojiFlag, isCountry } from "./Country";

describe("Country Codes", () => {
  it("is an ISO 3166-1 alpha-2 country code", () => {
    expect(isCountry("US")).toBe(true);
  });

  it("is not an ISO 3166-1 alpha-2 country code", () => {
    expect(isCountry("USA")).toBe(false);
  });
});

describe("Emoji Flags", () => {
  it("is a flag emoji", () => {
    expect(emojiFlag("US")).toBe("🇺🇸");
  });
});
