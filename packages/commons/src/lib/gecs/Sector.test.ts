import { describe, expect, it } from "vitest";

import { getIndustryGroupsInSector, isSector } from "./Sector";

describe.concurrent("Sector", () => {
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
