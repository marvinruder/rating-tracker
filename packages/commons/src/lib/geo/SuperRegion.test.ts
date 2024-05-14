import { describe, expect, it } from "vitest";

import { isSuperRegion, getRegionsInSuperRegion, emojiGlobe } from "./SuperRegion";

describe.concurrent("Super Region", () => {
  it("is a super region", () => {
    expect(isSuperRegion("Americas")).toBe(true);
  });

  it("is not a super region", () => {
    expect(isSuperRegion("Europes")).toBe(false);
  });

  it("contains regions", () => {
    expect(getRegionsInSuperRegion("Americas")).toEqual(["NorthAmerica", "LatinAmerica"]);
  });
});

describe.concurrent("Emoji Globes", () => {
  it("is a globe emoji", () => {
    expect(emojiGlobe("EMEA")).toBe("🌍");
  });
});
