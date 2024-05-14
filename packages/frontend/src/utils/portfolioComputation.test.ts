import type { OmitDynamicAttributesStock, Region, Size, Stock, WeightedStock } from "@rating-tracker/commons";
import { isRegion, isSize, optionalStockValuesNull, regionOfCountry } from "@rating-tracker/commons";
import { describe, expect, it } from "vitest";

import { computePortfolio } from "./portfolioComputation";

const stocks: OmitDynamicAttributesStock[] = [
  {
    ...optionalStockValuesNull,
    ticker: "a",
    name: "a",
    isin: "A",
    country: "US",
    size: "Small",
  },
  {
    ...optionalStockValuesNull,
    ticker: "b",
    name: "b",
    isin: "B",
    country: "DE",
    size: "Small",
  },
  {
    ...optionalStockValuesNull,
    ticker: "c",
    name: "c",
    isin: "C",
    country: "US",
    size: "Mid",
  },
  {
    ...optionalStockValuesNull,
    ticker: "d",
    name: "d",
    isin: "D",
    country: "US",
    size: "Large",
  },
  {
    ...optionalStockValuesNull,
    ticker: "e",
    name: "e",
    isin: "E",
    country: "DE",
    size: "Large",
  },
];

const constraints: Partial<Record<Region | Size, number>> = {
  NorthAmerica: 0.4,
  Eurozone: 0.6,
  Small: 0.2,
  Mid: 0.3,
  Large: 0.5,
};

const defaultOptions = {
  totalAmount: 100,
  tick: 1,
  minAmount: 5,
  proportionalRepresentationAlgorithm: "sainteLague" as const,
};

const validateResults = (
  result: {
    weightedStocks: WeightedStock[];
    rse: number;
  },
  options: {
    totalAmount: number;
    tick: number;
    minAmount: number;
  },
) => {
  // The sum of all amounts should be equal to the total amount
  expect(result.weightedStocks.reduce((sum, stock) => sum + stock.amount, 0)).toBe(options.totalAmount);

  // The constraints should be fulfilled
  Object.entries(constraints).forEach(([key, value]) => {
    expect(
      result.weightedStocks
        .filter((stock) => {
          switch (true) {
            case isRegion(key):
              return regionOfCountry[stock.country] === key;
            case isSize(key):
              return stock.size === key;
          }
        })
        .reduce((sum, stock) => sum + stock.amount, 0),
    ).toBe(options.totalAmount * value);
  });

  result.weightedStocks.forEach((stock) => {
    // The amount of each stock should be greater than or equal to the minimum amount
    expect(stock.amount).toBeGreaterThanOrEqual(options.minAmount);
    // The amount of each stock should be a multiple of the tick
    expect(stock.amount % options.tick).toBe(0);
  });

  // The RSE should be 0
  expect(result.rse).toBe(0);
};

describe.concurrent("Portfolio Computation", () => {
  it("computes weights for stocks fulfilling given constraints with Sainte-Laguë/Schepers algorithm", () => {
    const options = { ...defaultOptions, proportionalRepresentationAlgorithm: "sainteLague" as const };
    const result = computePortfolio(stocks as Stock[], constraints, options);

    validateResults(result, options);
  });

  it("computes weights for stocks fulfilling given constraints with Hare/Niemeyer algorithm", () => {
    const options = { ...defaultOptions, proportionalRepresentationAlgorithm: "hareNiemeyer" as const };
    const result = computePortfolio(stocks as Stock[], constraints, options);

    validateResults(result, options);
  });

  it("computes weights for stocks fulfilling given constraints without a minimum weight", () => {
    const options = { ...defaultOptions, minAmount: 0 };
    const result = computePortfolio(stocks as Stock[], constraints, options);

    validateResults(result, options);
  });
});
