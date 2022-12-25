import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../lib/logger",
  async () => await import("../../../lib/__mocks__/logger")
);

jest.unstable_mockModule(
  "../../../signal/signalBase",
  async () => await import("../../../signal/__mocks__/signalBase")
);
jest.unstable_mockModule(
  "./stockRepositoryBase",
  async () => await import("./__mocks__/stockRepositoryBase")
);

const { createStock, readStock, updateStock } = await import(
  "./stockRepository"
);
import dotenv from "dotenv";
import { initStockRepository } from "./__mocks__/stockRepositoryBase";
import { sentMessages } from "../../../signal/__mocks__/signalBase";
import { Stock } from "../../../models/stock";

dotenv.config({
  path: ".env.local",
});

beforeAll((done) => {
  initStockRepository();
  done();
});

afterAll((done) => {
  done();
});

describe("CRUD methods for single stock that are difficult to test otherwise", () => {
  it("updates a single stock", async () => {
    await createStock(
      new Stock({
        ticker: "NEWSTOCK",
        name: "New Stock Inc.",
        isin: "US123456789",
        country: "US",
      })
    );

    const newValues: Partial<Omit<Stock, "ticker">> = {
      name: "Updated Stock",
      country: "CA",
      isin: "CA012345678",
      industry: "LumberWoodProduction",
      size: "Mid",
      style: "Blend",
      morningstarId: "0P012345678",
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
      marketScreenerId: "NEW-STOCK-238712974",
      marketScreenerLastFetch: new Date(),
      analystConsensus: 2.5,
      analystCount: 5,
      analystTargetPrice: 150,
      msciId: "new-stock/IID000001238712974",
      msciLastFetch: new Date(),
      msciESGRating: "BB",
      msciTemperature: 2.1,
      ric: "NEWSTOCK.OQ",
      refinitivLastFetch: new Date(),
      refinitivESGScore: 74,
      refinitivEmissions: 23,
      spId: 4123456,
      spLastFetch: new Date(),
      spESGScore: 78,
      sustainalyticsId: "newstock/1238712974",
      sustainalyticsESGRisk: 31.2,
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
    };
    await updateStock("NEWSTOCK", slightlyWorseValues);
    const updatedStock = await readStock("NEWSTOCK");
    let k: keyof typeof newValues;
    for (k in newValues) {
      if (slightlyWorseValues[k] === null) {
        expect(updatedStock[k]).not.toBeNull();
        expect(updatedStock[k]).toBeUndefined();
      } else {
        if (k in slightlyWorseValues) {
          expect(updatedStock[k]).toBe(slightlyWorseValues[k]);
        } else {
          expect(updatedStock[k]).toBe(newValues[k]);
        }
      }
    }

    await updateStock("NEWSTOCK", newValues);

    expect(sentMessages[0]).toMatch("🟢");
    expect(sentMessages[1]).toMatch("🔴");
    expect(sentMessages[2]).toMatch("🟢");
    expect(sentMessages[0]).not.toMatch("🔴");
    expect(sentMessages[1]).not.toMatch("🟢");
    expect(sentMessages[2]).not.toMatch("🔴");

    expect(updatedStock.ticker).toMatch("NEWSTOCK");
    expect(updatedStock.name).toMatch("Updated Stock");
  });
});
