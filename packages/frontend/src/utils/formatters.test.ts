import { OmitDynamicAttributesStock, optionalStockValuesNull } from "@rating-tracker/commons";
import { describe, expect, it } from "vitest";
import formatMarketCap from "./formatters";

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
