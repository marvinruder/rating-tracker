import { describe, expect, it } from "vitest";

import type { Portfolio } from "./portfolio";
import {
  getAnalystRatingDistribution,
  getCountrySunburstData,
  getEstimateValue,
  getIndustrySunburstData,
  getPercentageToTotalAmount,
  getSunburstDatumName,
  getTotalAmount,
  getWeightedAverage,
  getWeightedAverageMSCIESGRating,
  getWeightedMeanAnalystConsensus,
  getWeightedStylebox,
  stripPrefixFromSunburstID,
} from "./portfolio";
import { optionalStockValuesNull } from "./stock";

const portfolio: Portfolio = {
  id: 0,
  currency: "EUR",
  name: "Test Portfolio",
  stocks: [
    {
      ...optionalStockValuesNull,
      financialScore: 0,
      esgScore: 0,
      totalScore: 0,
      lastClose: 360,
      morningstarFairValue: 320,
      morningstarFairValuePercentageToLastClose: 12.5,
      analystTargetPricePercentageToLastClose: null,
      analystRatings: { Sell: 0, Underperform: 3, Hold: 5, Outperform: 12, Buy: 42 },
      analystCount: 62,
      positionIn52w: null,
      ticker: "META",
      name: "Meta Platforms Inc A",
      isin: "US30303M1027",
      country: "US",
      industry: "InternetContentInformation",
      amount: 300,
      dividendYieldPercent: 0,
      msciESGRating: "CCC",
      size: "Large",
      style: "Growth",
    },
    {
      ...optionalStockValuesNull,
      financialScore: 0,
      esgScore: 0,
      totalScore: 0,
      lastClose: 112,
      morningstarFairValue: 140,
      morningstarFairValuePercentageToLastClose: -25,
      analystTargetPricePercentageToLastClose: null,
      analystRatings: { Sell: 0, Underperform: 0, Hold: 1, Outperform: 10, Buy: 20 },
      analystCount: 31,
      positionIn52w: null,
      ticker: "TSM",
      name: "Taiwan Semiconductor Manufacturing Co Ltd",
      isin: "US8740391003",
      country: "TW",
      industry: "Semiconductors",
      amount: 200,
      dividendYieldPercent: 2,
      msciESGRating: "AAA",
      sustainalyticsESGRisk: 10,
      size: "Large",
      style: "Growth",
    },
    {
      ...optionalStockValuesNull,
      financialScore: 0,
      esgScore: 0,
      totalScore: 0,
      lastClose: 40,
      morningstarFairValue: 50,
      morningstarFairValuePercentageToLastClose: -20,
      analystTargetPrice: 50,
      analystTargetPricePercentageToLastClose: -20,
      analystRatings: { Sell: 0, Underperform: 2, Hold: 9, Outperform: 5, Buy: 7 },
      analystCount: 23,
      positionIn52w: null,
      ticker: "NEM",
      name: "Newmont Corp",
      isin: "US6516391066",
      country: "US",
      industry: "Gold",
      amount: 100,
      dividendYieldPercent: 4,
      msciESGRating: "A",
      sustainalyticsESGRisk: 20,
      size: "Mid",
      style: "Value",
    },
  ],
};

const portfolioWithEmptyStocks: Portfolio = {
  ...portfolio,
  stocks: [
    {
      ...optionalStockValuesNull,
      financialScore: 0,
      esgScore: 0,
      totalScore: 0,
      morningstarFairValuePercentageToLastClose: null,
      analystTargetPricePercentageToLastClose: null,
      positionIn52w: null,
      amount: 0,
      ticker: "NULL",
      name: "Null Inc",
      isin: "US0000000000",
      country: "US",
    },
  ],
};

describe.concurrent("Portfolio Statistics", () => {
  it("calculates the total amount", () => {
    expect(getTotalAmount(portfolio)).toBe(600);
    expect(getTotalAmount(portfolioWithEmptyStocks)).toBe(0);
  });

  it("calculates the weighted average of a numeric attribute", () => {
    expect(getWeightedAverage(portfolio, "dividendYieldPercent")).toBeCloseTo((2 * 200) / 600 + (4 * 100) / 600);
    expect(getWeightedAverage(portfolio, "totalScore")).toBe(0);
    expect(getWeightedAverage(portfolio, "sustainalyticsESGRisk")).toBeCloseTo(40 / 3);

    expect(getWeightedAverage(portfolio, "spESGScore")).toBe(null);
    expect(getWeightedAverage(portfolioWithEmptyStocks, "dividendYieldPercent")).toBe(null);
  });

  it("calculates the portfolio’s estimate value", () => {
    expect(getEstimateValue(portfolio, "morningstarFairValue")).toBeCloseTo(
      (300 * 320) / 360 + (200 * 140) / 112 + (100 * 50) / 40,
    );
    expect(getEstimateValue(portfolio, "analystTargetPrice")).toBeCloseTo(600 + ((50 - 40) / 40) * 100);
    expect(getPercentageToTotalAmount(portfolio, "analystTargetPrice")).toBeCloseTo(
      100 * (600 / (600 + ((50 - 40) / 40) * 100) - 1),
    );

    expect(getEstimateValue(portfolioWithEmptyStocks, "morningstarFairValue")).toBe(null);
    expect(getPercentageToTotalAmount(portfolioWithEmptyStocks, "morningstarFairValue")).toBe(null);
  });

  it("calculates the weighted Analyst Ratings", () => {
    expect(getAnalystRatingDistribution(portfolio)).toEqual({
      Sell: 0,
      Underperform: (3 * 300) / (600 * 62) + (2 * 100) / (600 * 23),
      Hold: (5 * 300) / (600 * 62) + (1 * 200) / (600 * 31) + (9 * 100) / (600 * 23),
      Outperform: (12 * 300) / (600 * 62) + (10 * 200) / (600 * 31) + (5 * 100) / (600 * 23),
      Buy: (42 * 300) / (600 * 62) + (20 * 200) / (600 * 31) + (7 * 100) / (600 * 23),
    });
    expect(getWeightedMeanAnalystConsensus(portfolio)).toBe("Buy");

    expect(getAnalystRatingDistribution(portfolioWithEmptyStocks)).toEqual(null);
    expect(getWeightedMeanAnalystConsensus(portfolioWithEmptyStocks)).toBe(null);
  });

  it("calculates the weighted average of the MSCI ESG Rating", () => {
    expect(getWeightedAverageMSCIESGRating(portfolio)).toBe("BBB");

    expect(getWeightedAverageMSCIESGRating(portfolioWithEmptyStocks)).toBe(null);
  });

  it("calculates the weighted values for the stylebox", () => {
    const styleboxValues = getWeightedStylebox(portfolio);
    expect(styleboxValues["Large-Growth"]).toBeCloseTo(500 / 600);
    expect(styleboxValues["Mid-Value"]).toBeCloseTo(100 / 600);
    expect(styleboxValues["Small-Value"]).toBe(0);
    expect(styleboxValues["Small-Blend"]).toBe(0);
    expect(styleboxValues["Small-Growth"]).toBe(0);
    expect(styleboxValues["Mid-Blend"]).toBe(0);
    expect(styleboxValues["Mid-Growth"]).toBe(0);
    expect(styleboxValues["Large-Value"]).toBe(0);
    expect(styleboxValues["Large-Blend"]).toBe(0);
  });
});

describe.concurrent("Portfolio Chart Data", () => {
  it("calculates the region sunburst data", () => {
    expect(getCountrySunburstData(portfolio)).toEqual({
      id: "root",
      name: "All Countries",
      children: [
        {
          id: "Americas",
          name: "The Americas",
          children: [
            {
              id: "NorthAmerica",
              name: "North America",
              children: [
                {
                  id: "US",
                  name: "United States",
                  value: 400,
                },
              ],
            },
          ],
        },
        {
          id: "Asia",
          name: "Greater Asia",
          children: [
            {
              id: "AsiaDeveloped",
              name: "Asia Developed",
              children: [
                {
                  id: "TW",
                  name: "Republic of China (Taiwan)",
                  value: 200,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("calculates the industry sunburst data", () => {
    expect(getIndustrySunburstData(portfolio)).toEqual({
      id: "root",
      name: "All Industries",
      children: [
        {
          id: "SuperSectorCyclical",
          name: "Cyclical",
          children: [
            {
              id: "SectorBasicMaterials",
              name: "Basic Materials",
              children: [
                {
                  id: "IndustryGroupMetalsMining",
                  name: "Metals & Mining",
                  children: [
                    {
                      id: "IndustryGold",
                      name: "Gold",
                      value: 100,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "SuperSectorSensitive",
          name: "Sensitive",
          children: [
            {
              id: "SectorCommunicationServices",
              name: "Communication Services",
              children: [
                {
                  id: "IndustryGroupInteractiveMedia",
                  name: "Interactive Media",
                  children: [
                    {
                      id: "IndustryInternetContentInformation",
                      name: "Internet Content & Information",
                      value: 300,
                    },
                  ],
                },
              ],
            },
            {
              id: "SectorTechnology",
              name: "Technology",
              children: [
                {
                  id: "IndustryGroupSemiconductors",
                  name: "Semiconductors",
                  children: [
                    {
                      id: "IndustrySemiconductors",
                      name: "Semiconductors",
                      value: 200,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("strips the prefix from a sunburst data ID", () => {
    expect(stripPrefixFromSunburstID("SuperSectorSensitive")).toBe("Sensitive");
    expect(stripPrefixFromSunburstID("SectorTechnology")).toBe("Technology");
    expect(stripPrefixFromSunburstID("IndustryGroupHardware")).toBe("Hardware");
    expect(stripPrefixFromSunburstID("IndustryConsumerElectronics")).toBe("ConsumerElectronics");
    expect(stripPrefixFromSunburstID("root")).toBeUndefined();
  });

  it("provides a name for a sunburst data ID", () => {
    // Industry sectors
    expect(getSunburstDatumName("SuperSectorSensitive")).toBe("Sensitive");
    expect(getSunburstDatumName("SectorTechnology")).toBe("Technology");
    expect(getSunburstDatumName("IndustryGroupHardware")).toBe("Hardware");
    expect(getSunburstDatumName("IndustryConsumerElectronics")).toBe("Consumer Electronics");

    // Regions
    expect(getSunburstDatumName("Americas")).toBe("The Americas");
    expect(getSunburstDatumName("NorthAmerica")).toBe("North America");
    expect(getSunburstDatumName("US")).toBe("United States");

    // Unknown IDs are passed through
    expect(getSunburstDatumName("root")).toBe("root");
  });
});
