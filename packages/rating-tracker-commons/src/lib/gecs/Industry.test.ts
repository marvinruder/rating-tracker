import { isIndustry } from "./Industry";
import { describe, expect, it } from "vitest";

describe("Industry", () => {
  it("is an industry", () => {
    expect(isIndustry("SpecialtyChemicals")).toBe(true);
  });

  it("is not an industry", () => {
    expect(isIndustry("GeneralChemicals")).toBe(false);
  });
});
