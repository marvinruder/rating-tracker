import assert from "node:assert";

import { currencyMinorUnits, isCurrency, type Currency, type Stock } from "@rating-tracker/commons";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from Yahoo Finance.
 */
class YahooFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  /**
   * Fetches data from Yahoo Finance.
   * @param stock The stock to extract data for
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stock: Stock): Promise<void> {
    let currency: Currency | undefined;
    let lastClose: number | undefined;
    let low52w: number | undefined;
    let high52w: number | undefined;
    let prices1y: number[] | undefined;
    let prices1mo: number[] | undefined;

    const json = await FetchService.getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}`, {
      params: { includePrePost: false, range: "1y", interval: "1d" },
    });

    if (
      !("chart" in json) ||
      typeof json.chart !== "object" ||
      json.chart === null ||
      !("result" in json.chart) ||
      !Array.isArray(json.chart.result) ||
      json.chart.result.length === 0 ||
      typeof json.chart.result[0] !== "object"
    )
      throw new DataProviderError("The server returned an invalid response.", { dataSources: [json] });

    if ("error" in json.chart && json.chart.error !== null)
      throw new DataProviderError(
        `The server reported an error when fetching prices${
          typeof json.chart.error === "object" && "description" in json.chart.error
            ? `: ${json.chart.error.description}`
            : ""
        }`,
        { dataSources: [json] },
      );

    // Prepare an error message.
    let errorMessage = "";

    try {
      assert(
        "meta" in json.chart.result[0] &&
          typeof json.chart.result[0].meta === "object" &&
          "currency" in json.chart.result[0].meta,
        "Currency not found in JSON response.",
      );
      const currencyValue = json.chart.result[0].meta.currency.replace("GBp", "GBX");
      if (isCurrency(currencyValue)) {
        currency = currencyValue;
      } else {
        throw new TypeError(`Extracted currency code “${currencyValue}” is no valid currency code.`);
      }
    } catch (e) {
      Logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract currency: ${e}`);
      if (stock.currency !== null) {
        // If a currency is already stored in the database, but we cannot extract it from the JSON object, we log this
        // as an error and send a message.
        Logger.error(
          { prefix: "fetch", err: e },
          `Stock ${stock.ticker}: Extraction of currency failed unexpectedly. ` + "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract currency: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      assert(isCurrency(currency), "Unable to process prices without a valid currency.");
      assert(
        "indicators" in json.chart.result[0] &&
          typeof json.chart.result[0].indicators === "object" &&
          "adjclose" in json.chart.result[0].indicators &&
          Array.isArray(json.chart.result[0].indicators.adjclose) &&
          json.chart.result[0].indicators.adjclose.length > 0 &&
          Array.isArray(json.chart.result[0].indicators.adjclose[0].adjclose) &&
          json.chart.result[0].indicators.adjclose[0].adjclose.length > 0,
        "Prices not found in JSON response.",
      );

      const adjclose: number[] = json.chart.result[0].indicators.adjclose[0].adjclose
        .filter((x: unknown) => typeof x === "number" && !Number.isNaN(x))
        // Remove unnecessary precision to reduce future response size:
        .map((x: number) => +x.toFixed(currencyMinorUnits[currency]));
      lastClose = adjclose.at(-1);
      low52w = Math.min(...adjclose);
      high52w = Math.max(...adjclose);

      // The last 30 days typically contain 22 business days.
      prices1mo = adjclose.slice(-22);
      // Take every 5th value (one per day in a business week), ending with the very last value in the array:
      prices1y = adjclose.reduce(
        (acc, val, i, arr) => ((arr.length - i) % 5 === 1 ? [...acc, val] : acc),
        [] as number[],
      );
    } catch (e) {
      Logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract prices: ${e}`);
      if (
        stock.lastClose !== null ||
        stock.low52w !== null ||
        stock.high52w !== null ||
        stock.prices1y?.length ||
        stock.prices1mo?.length
      ) {
        // If prices are already stored in the database, but we cannot extract them from the JSON object, we log this as
        // an error and send a message.
        Logger.error(
          { prefix: "fetch", err: e },
          `Stock ${stock.ticker}: Extraction of prices failed unexpectedly. ` + "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract prices: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
      yahooLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
      currency,
      lastClose,
      low52w,
      high52w,
      prices1y,
      prices1mo,
    });
    // An error occurred if and only if the error message contains a newline character.
    if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [json] });
  }
}
export default YahooFetcher;
