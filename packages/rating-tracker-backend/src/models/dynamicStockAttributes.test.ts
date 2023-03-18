import { optionalStockValuesNull } from "rating-tracker-commons";
import { addDynamicAttributesToStockData, dynamicStockAttributes } from "./dynamicStockAttributes";

describe("Stock Scores", () => {
  it("has score when empty", () => {
    const emptyStock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(emptyStock.totalScore).toBe(0);
  });

  it("has scores of 0 when average", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 3,
      morningstarFairValue: 100,
      analystConsensus: 5,
      analystCount: 10,
      analystTargetPrice: 100,
      msciESGRating: "A",
      msciTemperature: 2.0,
      refinitivESGScore: 50,
      refinitivEmissions: 50,
      spESGScore: 50,
      sustainalyticsESGRisk: 20,
    });
    expect(stock.financialScore).toBe(0);
    expect(stock.esgScore).toBe(0);
    expect(stock.totalScore).toBe(0);
  });

  it("has scores of -1 when performing poor", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 1,
      morningstarFairValue: 25,
      analystConsensus: 0,
      analystCount: 10,
      analystTargetPrice: 20,
      msciESGRating: "CCC",
      msciTemperature: 4.0,
      refinitivESGScore: 0,
      refinitivEmissions: 0,
      spESGScore: 0,
      sustainalyticsESGRisk: 45,
    });
    expect(stock.financialScore).toBe(-1);
    expect(stock.esgScore).toBe(-1);
    expect(stock.totalScore).toBe(-1);
  });

  it("has scores of 1 when performing excellent", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
      lastClose: 100,
      starRating: 5,
      morningstarFairValue: 230,
      analystConsensus: 10,
      analystCount: 10,
      analystTargetPrice: 215,
      msciESGRating: "AAA",
      msciTemperature: 0.5,
      refinitivESGScore: 100,
      refinitivEmissions: 100,
      spESGScore: 100,
      sustainalyticsESGRisk: 0,
    });
    expect(stock.financialScore).toBe(1);
    expect(stock.esgScore).toBe(1);
    expect(stock.totalScore).toBe(1);
  });

  it("has defined scores for every possible star rating", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(stock.financialScore).toBe(0);

    stock.starRating = 1;
    expect(dynamicStockAttributes(stock).financialScore).toBe(-1 / 3);
    stock.starRating = 2;
    expect(dynamicStockAttributes(stock).financialScore).toBe(-1 / 6);
    stock.starRating = 3;
    expect(dynamicStockAttributes(stock).financialScore).toBe(0);
    stock.starRating = 4;
    expect(dynamicStockAttributes(stock).financialScore).toBe(1 / 6);
    stock.starRating = 5;
    expect(dynamicStockAttributes(stock).financialScore).toBe(1 / 3);
  });

  it("has defined scores for every possible MSCI ESG rating", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });
    expect(stock.esgScore).toBe(0);

    stock.msciESGRating = "AAA";
    expect(dynamicStockAttributes(stock).esgScore).toBe(0.25);
    stock.msciESGRating = "AA";
    expect(dynamicStockAttributes(stock).esgScore).toBe(0.125);
    stock.msciESGRating = "A";
    expect(dynamicStockAttributes(stock).esgScore).toBe(0);
    stock.msciESGRating = "BBB";
    expect(dynamicStockAttributes(stock).esgScore).toBe(-0.125);
    stock.msciESGRating = "BB";
    expect(dynamicStockAttributes(stock).esgScore).toBe(-0.25);
    stock.msciESGRating = "B";
    expect(dynamicStockAttributes(stock).esgScore).toBe(-0.375);
    stock.msciESGRating = "CCC";
    expect(dynamicStockAttributes(stock).esgScore).toBe(-0.5);
  });

  it("has financial score depending on analyst count", () => {
    const stock = addDynamicAttributesToStockData({
      ...optionalStockValuesNull,
      ticker: "EXAMPLE",
      name: "Example Inc.",
      isin: "US0000000000",
      country: "US",
    });

    stock.lastClose = 100;
    stock.analystTargetPrice = 200;
    stock.analystConsensus = 10;
    stock.analystCount = 10;
    expect(dynamicStockAttributes(stock).financialScore).toBe((2 / 3) * 1);

    stock.analystCount = 4;
    expect(dynamicStockAttributes(stock).financialScore).toBe((2 / 3) * 0.4);

    stock.analystCount = 0;
    expect(dynamicStockAttributes(stock).financialScore).toBe(0);
  });
});

describe("Stock Percentages", () => {
  it("has percentage to last close", () => {
    const stock = addDynamicAttributesToStockData({
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
    const stock = addDynamicAttributesToStockData({
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
