import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../signal/signalBase",
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
    await createStock({
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
    });

    const newValues: Omit<Stock, "ticker" | "name"> = {
      country: "CA",
      industry: "LumberWoodProduction",
      size: "Mid",
      style: "Blend",
      morningstarId: "CA012345678",
      morningstarLastFetch: new Date(),
      starRating: 4,
      dividendYieldPercent: 3.61,
      priceEarningRatio: 17.42,
    };

    await updateStock("NEWSTOCK", newValues);
    const updatedStock = await readStock("NEWSTOCK");
    let k: keyof typeof newValues;
    for (k in newValues) {
      if (k in newValues) {
        expect(updatedStock[k]).toBe(newValues[k]);
      }
    }

    expect(updatedStock.ticker).toMatch("NEWSTOCK");
    expect(updatedStock.name).toMatch("New Stock");
  });
});
