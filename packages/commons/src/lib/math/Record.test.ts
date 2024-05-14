import { describe, expect, it } from "vitest";

import type { AnalystRating } from "../ratings/AnalystRating";

import { RecordMath } from "./Record";

const analystRatingValues: Record<AnalystRating, number> = {
  Sell: 1,
  Underperform: 1,
  Hold: 12,
  Outperform: 8,
  Buy: 20,
};

describe.concurrent("Record Math", () => {
  it("computes the sum of a record", () => {
    expect(RecordMath.sum(analystRatingValues)).toBe(42);
  });

  it("computes the sum of a small record", () => {
    expect(RecordMath.sum({ a: 1 })).toBe(1);
  });

  it("computes the sum of a record with zeroes", () => {
    expect(RecordMath.sum({ a: 0, b: 0, c: 0 })).toBe(0);
  });

  it("computes the sum of an empty record", () => {
    expect(RecordMath.sum({})).toBe(0);
  });

  it("computes the mean of a record", () => {
    expect(RecordMath.mean(analystRatingValues)).toBe("Outperform");
  });

  it("computes the mean of a small record", () => {
    expect(RecordMath.mean({ a: 1 })).toBe("a");
  });

  it("computes the mean of a record with zeroes", () => {
    expect(RecordMath.mean({ a: 0, b: 0, c: 0 })).toBeUndefined();
  });

  it("computes the mean of an empty record", () => {
    expect(RecordMath.mean({})).toBeUndefined();
  });
});
