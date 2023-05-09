import { isMSCIESGRating } from "./MSCI";
import { describe, expect, it } from "vitest";

describe("MSCI ESG Rating", () => {
  it("is a rating", () => {
    expect(isMSCIESGRating("AAA")).toBe(true);
  });

  it("is not a rating", () => {
    expect(isMSCIESGRating("AAA+")).toBe(false);
  });
});
