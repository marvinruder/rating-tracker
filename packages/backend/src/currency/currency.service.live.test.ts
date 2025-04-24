import type { Currency } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import DBService from "../db/db.service";
import ResourceService from "../resource/resource.service";

import CurrencyService from "./currency.service";

export const suiteName = "Currency Service";

export const tests: LiveTestSuite = [];

const dbService: DBService = new DBService();

const resourceService: ResourceService = new ResourceService(dbService);

const currencyService: CurrencyService = new CurrencyService(resourceService);

tests.push({
  testName: "[unsafe] converts currencies",
  testFunction: async () => {
    expect(await currencyService.convert("EUR", "USD", 87.5)).toBe(100);
    expect(await currencyService.convert("USD", "EUR", 100)).toBe(87.5);
    expect(await currencyService.convert("EUR", "GBP", 100)).toBeCloseTo(85.71, 2);
    expect(await currencyService.convert("EUR", "GBX", 100)).toBeCloseTo(8571, 0);

    // Converting from one currency to itself should return the same amount
    expect(await currencyService.convert("JPY", "JPY", 10)).toEqual(10);

    // Converting to an unknown currency should throw an error
    await expect(currencyService.convert("EUR", "XXX" as Currency, 100)).rejects.toThrowError(
      "No exchange rate available for currency “XXX”",
    );
    await expect(currencyService.convert("YYY" as Currency, "USD", 200)).rejects.toThrowError(
      "No exchange rate available for currency “YYY”",
    );

    // Check the currency resource
    const resource = await resourceService.read("https://latest.currency-api.pages.dev/v1/currencies/usd.json");
    // The resource should expire tomorrow at 02:00 UTC
    const expectedExpiryDate = new Date(Date.now() + 86400000).setUTCHours(2, 0, 0, 0);
    expect(resource.expiresAt.getTime()).toBe(expectedExpiryDate);
  },
});
