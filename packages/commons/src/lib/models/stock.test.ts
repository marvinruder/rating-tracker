import { describe, expect, it } from "vitest";

import type { Stock, WeightedStock } from "./stock";
import { optionalStockValuesNull, parseStock, parseWeightedStock } from "./stock";

const stock: Stock = {
  ...optionalStockValuesNull,
  ticker: "AAPL",
  name: "Apple Inc",
  country: "US",
  isin: "US0378331005",
  financialScore: 0,
  esgScore: 0,
  totalScore: 0,
  positionIn52w: null,
  morningstarFairValuePercentageToLastClose: null,
  analystTargetPricePercentageToLastClose: null,
  yahooLastFetch: new Date(),
};

const weightedStock: WeightedStock = { ...stock, amount: 100 };

describe.concurrent("Stock mapper", () => {
  it("maps a Stock from JSON", () => {
    const stockFromJSON = JSON.parse(JSON.stringify(stock));
    expect(typeof stockFromJSON.yahooLastFetch).toBe("string");
    const parsedStock = parseStock(stockFromJSON);
    expect(parsedStock.yahooLastFetch instanceof Date).toBeTruthy();
  });

  it("maps a Weighted Stock frmo JSON", () => {
    const weightedStockFromJSON = JSON.parse(JSON.stringify(weightedStock));
    expect(typeof weightedStockFromJSON.yahooLastFetch).toBe("string");
    const parsedWeightedStock = parseWeightedStock(weightedStockFromJSON);
    expect(parsedWeightedStock.yahooLastFetch instanceof Date).toBeTruthy();
  });
});
