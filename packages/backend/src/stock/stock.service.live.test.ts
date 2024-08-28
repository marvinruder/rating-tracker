import type { Stock } from "@rating-tracker/commons";
import { optionalStockValuesNull } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import DBService from "../db/db.service";
import PortfolioService from "../portfolio/portfolio.service";
import ResourceService from "../resource/resource.service";
import SignalService from "../signal/signal.service";
import UserService from "../user/user.service";
import { sentMessages } from "../utils/__mocks__/fetchRequest";
import WatchlistService from "../watchlist/watchlist.service";

import StockService from "./stock.service";

export const suiteName = "Stock Table";

export const tests: LiveTestSuite = [];

const dbService: DBService = new DBService();

const portfolioService: PortfolioService = new PortfolioService(dbService);
const resourceService: ResourceService = new ResourceService(dbService);
const signalService: SignalService = new SignalService();
const watchlistService: WatchlistService = new WatchlistService(dbService);
const userService: UserService = new UserService(dbService, signalService);
const stockService: StockService = new StockService(
  dbService,
  portfolioService,
  resourceService,
  signalService,
  userService,
  watchlistService,
);

tests.push({
  testName: "[unsafe] updates a single stock",
  testFunction: async () => {
    await stockService.create({
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
      yahooLastFetch: new Date(),
      currency: "CAD",
      lastClose: 123.45,
      low52w: 101.23,
      high52w: 145.67,
      prices1y: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
      prices1mo: [120, 125, 130, 135, 140, 145],
      industry: "LumberWoodProduction",
      size: "Mid",
      style: "Blend",
      morningstarID: "0P012345678",
      morningstarLastFetch: new Date(),
      starRating: 4,
      dividendYieldPercent: 3.61,
      priceEarningRatio: 17.42,
      morningstarFairValue: 160,
      marketCap: 67800000000,
      marketScreenerID: "NEW-STOCK-238712974",
      marketScreenerLastFetch: new Date(),
      analystConsensus: "Hold",
      analystRatings: { Buy: 0, Underperform: 1, Hold: 3, Outperform: 1, Sell: 0 },
      analystCount: 5,
      analystTargetPrice: 150,
      msciID: "IID000001238712974",
      msciLastFetch: new Date(),
      msciESGRating: "B",
      msciTemperature: 2.1,
      ric: "NEWSTOCK.OQ",
      lsegLastFetch: new Date(),
      lsegESGScore: 74,
      lsegEmissions: 23,
      spID: 4123456,
      spLastFetch: new Date(),
      spESGScore: 78,
      sustainalyticsID: "newstock/1238712974",
      sustainalyticsESGRisk: 31.2,
      description:
        "This is a long description of the stock, which is not used in the app. It is only used for testing purposes.",
    };

    await stockService.update("NEWSTOCK", newValues);

    const slightlyWorseValues: Partial<Omit<Stock, "ticker">> = {
      starRating: 3,
      morningstarFairValue: 150,
      analystConsensus: "Underperform",
      analystTargetPrice: 145,
      msciESGRating: "CCC",
      msciTemperature: 2.2,
      lsegESGScore: 73,
      lsegEmissions: 22,
      spESGScore: 77,
      sustainalyticsESGRisk: 31.5,
      dividendYieldPercent: null,
      morningstarLastFetch: new Date(),
      marketScreenerLastFetch: new Date(),
      msciLastFetch: new Date(),
      lsegLastFetch: new Date(),
      spLastFetch: new Date(),
    };
    await stockService.update("NEWSTOCK", slightlyWorseValues);
    const updatedStock = await stockService.read("NEWSTOCK");
    let k: keyof typeof newValues;
    for (k in newValues) {
      if (k in slightlyWorseValues) {
        expect(updatedStock[k]).toStrictEqual(slightlyWorseValues[k]);
      } else {
        expect(updatedStock[k]).toStrictEqual(newValues[k]);
      }
    }

    await stockService.update("NEWSTOCK", newValues);

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
  },
});

tests.push({
  testName: "[unsafe] updating a single stock on a user’s subscribed-to watchlist sends a message to the user",
  testFunction: async () => {
    await stockService.update("AAPL", {
      starRating: 4,
    });

    for (const sentMessage of sentMessages) {
      expect(sentMessage.recipients).toHaveLength(2);
      expect(sentMessage.recipients).toContain("+123456789");
    }
  },
});

tests.push({
  testName: "[unsafe] cannot update a stock with an invalid property",
  testFunction: async () => {
    await stockService.create({
      ...optionalStockValuesNull,
      ticker: "NEWSTOCK",
      name: "New Stock Inc.",
      isin: "US123456789",
      country: "US",
    });

    const invalidValues: any = {
      questionableProperty: "This is not a valid property",
    };
    await expect(stockService.update("NEWSTOCK", invalidValues)).rejects.toThrow(
      "Invalid property questionableProperty for stock NEWSTOCK.",
    );
  },
});

tests.push({
  testName: "reads stocks fetchable from a given data provider",
  testFunction: async () => {
    let stocks = await stockService.readFetchable("yahoo");
    expect(stocks).toHaveLength(10);
    stocks = await stockService.readFetchable("msci");
    expect(stocks).toHaveLength(9);
  },
});
