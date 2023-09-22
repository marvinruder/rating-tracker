import { describe, expect, it } from "vitest";

import { isRegion, getCountriesInRegion } from "./Region";

describe("Region", () => {
  it("is a region", () => {
    expect(isRegion("Eurozone")).toBe(true);
  });

  it("is not a region", () => {
    expect(isRegion("Dollarzone")).toBe(false);
  });

  it("contains countries", () => {
    expect(getCountriesInRegion("Eurozone")).toEqual([
      "AX",
      "AT",
      "BE",
      "HR",
      "CY",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PT",
      "SK",
      "SI",
      "ES",
    ]);
  });
});
