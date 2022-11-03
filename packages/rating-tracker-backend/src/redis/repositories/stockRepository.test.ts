import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../signal/signalBase",
  async () => await import("../../signal/__mocks__/signalBase")
);

jest.unstable_mockModule(
  "./stockRepositoryBase",
  async () => await import("./__mocks__/stockRepositoryBase")
);

const { createStock, readStock, updateStock, deleteStock } = await import(
  "./stockRepository"
);
import dotenv from "dotenv";
import { initMockRepository } from "./__mocks__/stockRepositoryBase";
import { Stock } from "../../models/stock";

dotenv.config({
  path: ".env.local",
});

beforeAll((done) => {
  initMockRepository();
  done();
});

afterAll((done) => {
  done();
});

describe("CRUD methods for single stock", () => {
  it("creates a single stock", async () => {
    await createStock({
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
    });
  });

  it("reads a single stock", async () => {
    const newStock = await readStock("NEWSTOCK");
    expect(newStock.ticker).toMatch("NEWSTOCK");
    expect(newStock.name).toMatch("New Stock");
  });

  it("updates a single stock", async () => {
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

  it("updates a single stock with no values", async () => {
    const oldStock = await readStock("NEWSTOCK");
    await updateStock("NEWSTOCK", {});
    const updatedStock = await readStock("NEWSTOCK");
    expect(String(updatedStock)).toBe(String(oldStock));
  });

  it("deletes a single stock", async () => {
    await deleteStock("NEWSTOCK");
    await expect(readStock("NEWSTOCK")).rejects.toThrow(
      "Stock NEWSTOCK not found."
    );
  });
});

describe("C method for conflicting stock", () => {
  it("attempts to create a conflicting stock", async () => {
    await createStock({
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
    });
    await createStock({
      ticker: "NEWSTOCK",
      name: "Updated Stock Inc.",
    });
    const newStock = await readStock("NEWSTOCK");
    expect(newStock.name).toMatch("New Stock");
  });
});

describe("RUD methods for non-existent stock", () => {
  it("attempts to read a non-existent stock", async () => {
    await expect(readStock("ANOTHERSTOCK")).rejects.toThrow(
      "Stock ANOTHERSTOCK not found."
    );
  });

  it("attempts to update a non-existent stock", async () => {
    await expect(updateStock("ANOTHERSTOCK", {})).rejects.toThrow(
      "Stock ANOTHERSTOCK not found."
    );
  });

  it("attempts to delete a non-existent stock", async () => {
    await expect(deleteStock("ANOTHERSTOCK")).rejects.toThrow(
      "Stock ANOTHERSTOCK not found."
    );
  });
});
