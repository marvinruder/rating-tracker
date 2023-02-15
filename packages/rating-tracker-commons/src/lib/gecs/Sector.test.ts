import { getIndustryGroupsInSector, isSector } from "./Sector";
import { describe, expect, it } from "vitest";

describe("Sector", () => {
  it("is a sector", () => {
    expect(isSector("RealEstate")).toBe(true);
  });

  it("is not a sector", () => {
    expect(isSector("UnrealEstate")).toBe(false);
  });

  it("contains industry groups", () => {
    expect(getIndustryGroupsInSector("Technology")).toEqual(["Software", "Hardware", "Semiconductors"]);
  });
});
