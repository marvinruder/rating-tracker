import { describe, expect, it } from "vitest";

import { getSectorsInSuperSector, isSuperSector } from "./SuperSector";

describe.concurrent("Super Sector", () => {
  it("is a super sector", () => {
    expect(isSuperSector("Defensive")).toBeTruthy();
  });

  it("is not a super sector", () => {
    expect(isSuperSector("Offensive")).toBeFalsy();
  });

  it("contains sectors", () => {
    expect(getSectorsInSuperSector("Cyclical")).toEqual([
      "BasicMaterials",
      "ConsumerCyclical",
      "FinancialServices",
      "RealEstate",
    ]);
    expect(getSectorsInSuperSector("Defensive")).toEqual(["ConsumerDefensive", "Healthcare", "Utilities"]);
    expect(getSectorsInSuperSector("Sensitive")).toEqual([
      "CommunicationServices",
      "Energy",
      "Industrials",
      "Technology",
    ]);
  });
});
