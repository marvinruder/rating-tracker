import { describe, expect, it } from "vitest";

import { isAnalystRating } from "./AnalystRating";

describe.concurrent("Analyst Rating", () => {
  it("is an Analyst Rating value", () => {
    expect(isAnalystRating("Underperform")).toBe(true);
  });

  it("is not an Analyst Rating value", () => {
    expect(isAnalystRating("Overperform")).toBe(false);
  });
});
