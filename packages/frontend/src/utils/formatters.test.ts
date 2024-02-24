import type { OmitDynamicAttributesStock } from "@rating-tracker/commons";
import { optionalStockValuesNull } from "@rating-tracker/commons";
import { describe, expect, it } from "vitest";

import { formatMarketCap, formatPercentage } from "./formatters";

const stock: OmitDynamicAttributesStock = {
  ...optionalStockValuesNull,
  ticker: "EXAMPLE",
  name: "Example Inc.",
  isin: "US0000000000",
  country: "US",
};

describe("Market Capitalization Formatter", () => {
  it("formats trillions", () => {
    stock.marketCap = 1234000000000;
    expect(formatMarketCap(stock)).toBe("1.23 T");
  });

  it("formats billions", () => {
    stock.marketCap = 12340000000;
    expect(formatMarketCap(stock)).toBe("12.3 B");
  });

  it("formats millions", () => {
    stock.marketCap = 123400000;
    expect(formatMarketCap(stock)).toBe("123 M");
  });

  it("formats thousands", () => {
    stock.marketCap = 1234;
    expect(formatMarketCap(stock)).toBe("1.23 k");
  });

  it("formats other things", () => {
    stock.marketCap = 1.234;
    expect(formatMarketCap(stock)).toBe("1");
  });
});

describe("Percentage Formatter", () => {
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
