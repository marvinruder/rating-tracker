import { describe, expect, it } from "vitest";

import { isDataProvider, isBulkDataProvider, isIndividualDataProvider } from "./DataProvider";

describe.concurrent("Data Provider", () => {
  it("is a data provider", () => {
    expect(isDataProvider("morningstar")).toBe(true);
    expect(isDataProvider("marketScreener")).toBe(true);
    expect(isDataProvider("msci")).toBe(true);
    expect(isDataProvider("lseg")).toBe(true);
    expect(isDataProvider("sp")).toBe(true);
    expect(isDataProvider("sustainalytics")).toBe(true);
  });

  it("is an individual data provider", () => {
    expect(isIndividualDataProvider("morningstar")).toBe(true);
    expect(isIndividualDataProvider("marketScreener")).toBe(true);
    expect(isIndividualDataProvider("msci")).toBe(true);
    expect(isIndividualDataProvider("lseg")).toBe(true);
    expect(isIndividualDataProvider("sp")).toBe(true);
    expect(isIndividualDataProvider("sustainalytics")).toBe(false);
  });

  it("is a bulk data provider", () => {
    expect(isBulkDataProvider("morningstar")).toBe(false);
    expect(isBulkDataProvider("marketScreener")).toBe(false);
    expect(isBulkDataProvider("msci")).toBe(false);
    expect(isBulkDataProvider("lseg")).toBe(false);
    expect(isBulkDataProvider("sp")).toBe(false);
    expect(isBulkDataProvider("sustainalytics")).toBe(true);
  });

  it("is not a data provider", () => {
    expect(isDataProvider("google")).toBe(false);
  });
});
