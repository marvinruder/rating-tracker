import { isSuperRegion, getRegionsInSuperRegion } from "./SuperRegion";
import { describe, expect, it } from "vitest";

describe("Super Region", () => {
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
