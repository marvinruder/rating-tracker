import { optionalStockValuesNull } from "@rating-tracker/commons";

import DynamicStockAttributeHelper from "./dynamicStockAttributes.helper";

describe.concurrent("Stock Scores", () => {
  it("has score when empty", () => {
    const emptyStock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(emptyStock.totalScore).toBe(0);
  });

  it("has scores of 0 when average", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 3,
      morningstarFairValue: 100,
      analystConsensus: "Hold",
      analystCount: 10,
      analystTargetPrice: 100,
      msciESGRating: "A",
      msciTemperature: 2.0,
      lsegESGScore: 50,
      lsegEmissions: 50,
      spESGScore: 50,
      sustainalyticsESGRisk: 20,
    });
    expect(stock.financialScore).toBe(0);
    expect(stock.esgScore).toBe(0);
    expect(stock.totalScore).toBe(0);
  });

  it("has scores of -1 when performing poor", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 1,
      morningstarFairValue: 25,
      analystConsensus: "Sell",
      analystCount: 10,
      analystTargetPrice: 20,
      msciESGRating: "CCC",
      msciTemperature: 4.0,
      lsegESGScore: 0,
      lsegEmissions: 0,
      spESGScore: 0,
      sustainalyticsESGRisk: 45,
    });
    expect(stock.financialScore).toBe(-1);
    expect(stock.esgScore).toBe(-1);
    expect(stock.totalScore).toBe(-1);
  });

  it("has scores of 1 when performing excellent", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 5,
      morningstarFairValue: 230,
      analystConsensus: "Buy",
      analystCount: 10,
      analystTargetPrice: 215,
      msciESGRating: "AAA",
      msciTemperature: 0.5,
      lsegESGScore: 100,
      lsegEmissions: 100,
      spESGScore: 100,
      sustainalyticsESGRisk: 0,
    });
    expect(stock.financialScore).toBe(1);
    expect(stock.esgScore).toBe(1);
    expect(stock.totalScore).toBe(1);
  });

  it("has defined scores for every possible star rating", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(stock.financialScore).toBe(0);

    stock.starRating = 1;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(-1 / 3);
    stock.starRating = 2;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(-1 / 6);
    stock.starRating = 3;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(0);
    stock.starRating = 4;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(1 / 6);
    stock.starRating = 5;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(1 / 3);
  });

  it("has defined scores for every possible MSCI ESG rating", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(stock.esgScore).toBe(0);

    stock.msciESGRating = "AAA";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(0.25);
    stock.msciESGRating = "AA";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(0.125);
    stock.msciESGRating = "A";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(0);
    stock.msciESGRating = "BBB";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(-0.125);
    stock.msciESGRating = "BB";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(-0.25);
    stock.msciESGRating = "B";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(-0.375);
    stock.msciESGRating = "CCC";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).esgScore).toBe(-0.5);
  });

  it("has defined scores for every possible Analyst Consensus", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(stock.esgScore).toBe(0);

    stock.analystCount = 10;
    stock.analystConsensus = "Buy";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(1 / 3);
    stock.analystConsensus = "Outperform";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(0.5 / 3);
    stock.analystConsensus = "Hold";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(0);
    stock.analystConsensus = "Underperform";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(-0.5 / 3);
    stock.analystConsensus = "Sell";
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(-1 / 3);
  });

  it("has financial score depending on analyst count", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });

    stock.lastClose = 100;
    stock.analystTargetPrice = 200;
    stock.analystConsensus = "Buy";
    stock.analystCount = 10;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe((2 / 3) * 1);

    stock.analystCount = 4;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe((2 / 3) * 0.4);

    stock.analystCount = 0;
    expect(DynamicStockAttributeHelper.dynamicStockAttributes(stock).financialScore).toBe(0);
  });
});

describe.concurrent("Stock Percentages", () => {
  it("has percentage to last close", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      morningstarFairValue: 200,
      analystTargetPrice: 50,
    });

    expect(stock.morningstarFairValuePercentageToLastClose).toBe(-50);
    expect(stock.analystTargetPricePercentageToLastClose).toBe(100);
  });

  it("has non-NaN percentage to last close even when dividing by zero", () => {
    const stock = DynamicStockAttributeHelper.addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      morningstarFairValue: 0,
    });
    expect(stock.morningstarFairValuePercentageToLastClose).not.toBeNaN();
  });
});
