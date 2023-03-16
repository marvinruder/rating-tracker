import { beforeEach, describe, expect, it, vi } from "vitest";
import dotenv from "dotenv";

vi.mock("../../utils/logger");
vi.mock("../../signal/signalBase");

dotenv.config({
  path: "test/.env",
});

const { createStock, readStock, updateStock } = await import("./stockTable");
import { sentMessages } from "../../signal/__mocks__/signalBase";
import { optionalStockValuesNull, Stock } from "rating-tracker-commons";
import applyPostgresSeeds from "../../../test/seeds/postgres";
import applyRedisSeeds from "../../../test/seeds/redis";

beforeEach(async () => {
  await Promise.all([applyPostgresSeeds(), applyRedisSeeds()]);
});

describe("CRUD methods for single stock that are difficult to test otherwise", () => {
  it("updates a single stock", async () => {
    await createStock({
      ...optionalStockValuesNull,
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
      isin: "US123456789",
      country: "US",
    });

    const newValues: Partial<Omit<Stock, "ticker">> = {
      name: "Updated Stock",
      country: "CA",
      isin: "CA0123456789",
      industry: "LumberWoodProduction",
      size: "Mid",
      style: "Blend",
      morningstarID: "0P012345678",
      morningstarLastFetch: new Date(),
      starRating: 4,
      dividendYieldPercent: 3.61,
      priceEarningRatio: 17.42,
      currency: "CAD",
      lastClose: 123.45,
      morningstarFairValue: 160,
      marketCap: 67800000000,
      low52w: 101.23,
      high52w: 145.67,
      marketScreenerID: "NEW-STOCK-238712974",
      marketScreenerLastFetch: new Date(),
      analystConsensus: 2.5,
      analystCount: 5,
      analystTargetPrice: 150,
      msciID: "new-stock/IID000001238712974",
      msciLastFetch: new Date(),
      msciESGRating: "BB",
      msciTemperature: 2.1,
      ric: "NEWSTOCK.OQ",
      refinitivLastFetch: new Date(),
      refinitivESGScore: 74,
      refinitivEmissions: 23,
      spID: 4123456,
      spLastFetch: new Date(),
      spESGScore: 78,
      sustainalyticsID: "newstock/1238712974",
      sustainalyticsESGRisk: 31.2,
      description:
        "This is a long description of the stock, which is not used in the app. It is only used for testing purposes.",
    };

    await updateStock("NEWSTOCK", newValues);

    const slightlyWorseValues: Partial<Omit<Stock, "ticker">> = {
      starRating: 3,
      morningstarFairValue: 150,
      analystConsensus: 2.3,
      analystTargetPrice: 145,
      msciESGRating: "B",
      msciTemperature: 2.2,
      refinitivESGScore: 73,
      refinitivEmissions: 22,
      spESGScore: 77,
      sustainalyticsESGRisk: 31.5,
      dividendYieldPercent: null,
      morningstarLastFetch: new Date(),
      marketScreenerLastFetch: new Date(),
      msciLastFetch: new Date(),
      refinitivLastFetch: new Date(),
      spLastFetch: new Date(),
    };
    await updateStock("NEWSTOCK", slightlyWorseValues);
    const updatedStock = await readStock("NEWSTOCK");
    for (const k in newValues) {
      if (k in slightlyWorseValues) {
        expect(updatedStock[k]).toStrictEqual(slightlyWorseValues[k]);
      } else {
        expect(updatedStock[k]).toStrictEqual(newValues[k]);
      }
    }

    await updateStock("NEWSTOCK", newValues);

    expect(sentMessages[0].message).toMatch("🟢");
    expect(sentMessages[1].message).toMatch("🔴");
    expect(sentMessages[2].message).toMatch("🟢");
    expect(sentMessages[0].message).not.toMatch("🔴");
    expect(sentMessages[1].message).not.toMatch("🟢");
    expect(sentMessages[2].message).not.toMatch("🔴");

    for (const sentMessage of sentMessages) {
      expect(sentMessage.recipients).toHaveLength(1);
      expect(sentMessage.recipients[0]).toMatch("+234567890");
    }

    expect(updatedStock.ticker).toMatch("NEWSTOCK");
    expect(updatedStock.name).toMatch("Updated Stock");
  });

  it("cannot update a stock with an invalid property", async () => {
    await createStock({
      ...optionalStockValuesNull,
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
      isin: "US123456789",
      country: "US",
    });

    const invalidValues: any = {
      questionableProperty: "This is not a valid property",
    };
    await expect(updateStock("NEWSTOCK", invalidValues)).rejects.toThrow(
      "Invalid property questionableProperty for stock NEWSTOCK."
    );
  });
});
