import { describe, expect, it } from "vitest";

import { isDataProvider, isBulkDataProvider, isHTMLDataProvider, isJSONDataProvider } from "./DataProvider";

describe("Data Provider", () => {
  it("is a data provider", () => {
    expect(isDataProvider("morningstar")).toBe(true);
    expect(isDataProvider("marketScreener")).toBe(true);
    expect(isDataProvider("msci")).toBe(true);
    expect(isDataProvider("lseg")).toBe(true);
    expect(isDataProvider("sp")).toBe(true);
    expect(isDataProvider("sustainalytics")).toBe(true);
  });

  it("is an HTML data provider", () => {
    expect(isHTMLDataProvider("morningstar")).toBe(true);
    expect(isHTMLDataProvider("marketScreener")).toBe(true);
    expect(isHTMLDataProvider("msci")).toBe(true);
    expect(isHTMLDataProvider("lseg")).toBe(false);
    expect(isHTMLDataProvider("sp")).toBe(true);
    expect(isHTMLDataProvider("sustainalytics")).toBe(false);
  });

  it("is a JSON data provider", () => {
    expect(isJSONDataProvider("morningstar")).toBe(false);
    expect(isJSONDataProvider("marketScreener")).toBe(false);
    expect(isJSONDataProvider("msci")).toBe(false);
    expect(isJSONDataProvider("lseg")).toBe(true);
    expect(isJSONDataProvider("sp")).toBe(false);
    expect(isJSONDataProvider("sustainalytics")).toBe(false);
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
