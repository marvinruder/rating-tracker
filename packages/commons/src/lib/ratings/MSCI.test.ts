import { describe, expect, it } from "vitest";

import { isMSCIESGRating } from "./MSCI";

describe.concurrent("MSCI ESG Rating", () => {
  it("is a rating", () => {
    expect(isMSCIESGRating("AAA")).toBe(true);
  });

  it("is not a rating", () => {
    expect(isMSCIESGRating("AAA+")).toBe(false);
  });
});
