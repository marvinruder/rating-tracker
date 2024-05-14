import { describe, expect, it } from "vitest";

import { isIndustry } from "./Industry";

describe.concurrent("Industry", () => {
  it("is an industry", () => {
    expect(isIndustry("SpecialtyChemicals")).toBe(true);
  });

  it("is not an industry", () => {
    expect(isIndustry("GeneralChemicals")).toBe(false);
  });
});
