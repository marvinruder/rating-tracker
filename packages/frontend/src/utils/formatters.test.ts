import { describe, expect, it } from "vitest";

import { formatMarketCap, formatPercentage } from "./formatters";

describe.concurrent("Market Capitalization Formatter", () => {
  it("formats trillions", () => {
    expect(formatMarketCap(1234000000000)).toBe("1.23 T");
  });

  it("formats billions", () => {
    expect(formatMarketCap(12340000000)).toBe("12.3 B");
  });

  it("formats millions", () => {
    expect(formatMarketCap(123400000)).toBe("123 M");
  });

  it("formats thousands", () => {
    expect(formatMarketCap(1234)).toBe("1.23 k");
  });

  it("formats other things", () => {
    expect(formatMarketCap(1.234)).toBe("1");
  });

  it("refuses to format when no valid market cap is given", () => {
    expect(formatMarketCap(null)).toBe("–");
  });
});

describe.concurrent("Percentage Formatter", () => {
  it("formats a simple percentage", () => {
    expect(formatPercentage(0.1234)).toBe("12.3 %");
  });

  it("formats a percentage with a given total amount", () => {
    expect(formatPercentage(3, { total: 4 })).toBe("75 %");
  });

  it("formats a percentage with a given precision", () => {
    expect(formatPercentage(0.1234, { precision: 2 })).toBe("12 %");
  });

  it("formats a percentage with a fixed number of digits after the decimal point", () => {
    expect(formatPercentage(0.1234, { fixed: 1 })).toBe("12.3 %");
  });

  it("formats a percentage with a “+” sign in front of positive numbers", () => {
    expect(formatPercentage(0.1234, { forceSign: true })).toBe("+12.3 %");
    expect(formatPercentage(-0.1234, { forceSign: true })).toBe("-12.3 %");
  });

  it("uses a fallback value if the given value is not a number", () => {
    expect(formatPercentage(NaN)).toBe("–");
    expect(formatPercentage(NaN, { fallbackString: "Oh no!" })).toBe("Oh no!");
  });
});
