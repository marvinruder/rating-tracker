import type { Stock, MSCIESGRating, OmitDynamicAttributesStock, AnalystRating } from "@rating-tracker/commons";
import { analystRatingArray, msciESGRatingArray } from "@rating-tracker/commons";

import type { Prisma } from "../../../prisma/client";
import { addDynamicAttributesToStockData, dynamicStockAttributes } from "../../models/dynamicStockAttributes";
import * as signal from "../../signal/signal";
import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

// Emojis showing whether a change is good or bad. Used in the Signal message.
const SIGNAL_PREFIX_BETTER = "🟢 ";
const SIGNAL_PREFIX_WORSE = "🔴 ";

/**
 * Strings for the parameters used in the Signal message
 */
const parameterPrettyNames = {
  analystConsensus: "Analyst Consensus",
  msciESGRating: "MSCI ESG Rating",
  lsegESGScore: "LSEG ESG Score",
  lsegEmissions: "LSEG Emissions Rating",
  spESGScore: "S&P ESG Score",
  sustainalyticsESGRisk: "Sustainalytics ESG Risk Score",
};

/**
 * Create a stock.
 * @param stock The stock to create.
 * @returns Whether the stock was created.
 */
export const createStock = async (stock: OmitDynamicAttributesStock): Promise<boolean> => {
  // Attempt to find an existing stock with the same ticker
  try {
    const existingStock = await client.stock.findUniqueOrThrow({
      where: {
        ticker: stock.ticker,
      },
    });
    // If that worked, a stock with the same ticker already exists
    logger.warn(
      { prefix: "postgres" },
      `Skipping stock “${stock.name}” – existing already (ticker ${existingStock.ticker}).`,
    );
    return false;
  } catch {
    await client.stock.create({
      data: addDynamicAttributesToStockData(stock),
    });
    logger.info({ prefix: "postgres" }, `Created stock “${stock.name}” with ticker ${stock.ticker}.`);
    return true;
  }
};

/**
 * Read a stock.
 * @param ticker The ticker of the stock.
 * @returns The stock.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const readStock = async (ticker: string): Promise<Stock> => {
  try {
    return await client.stock.findUniqueOrThrow({
      where: { ticker },
    });
  } catch {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

/**
 * Query multiple stocks as well as their count after filtering.
 * @param args An object with filtering, sorting and pagination options.
 * @returns A list of all stocks.
 */
export const readStocks = async (args?: Prisma.StockFindManyArgs): Promise<[Stock[], number]> => {
  return await client.$transaction([
    client.stock.findMany(args),
    client.stock.count({
      where: { ...args?.where },
    }),
  ]);
};

/**
 * Update a stock.
 * @param ticker The ticker of the stock.
 * @param newValues The new values for the stock.
 * @param forceUpdate Whether new values are written into the database, even if they are equal to the stock’s current
 *                    values. Triggers computation of scores.
 * @param skipMessage Whether not to send a Signal message.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const updateStock = async (
  ticker: string,
  newValues: Partial<Stock>,
  forceUpdate?: boolean,
  skipMessage?: boolean,
) => {
  let k: keyof typeof newValues; // all keys of new values
  const stock = await readStock(ticker); // Read the stock from the database
  let signalMessage = `Updates for ${stock.name} (${ticker}):`;
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      if (stock[k] === undefined) throw new APIError(400, `Invalid property ${k} for stock ${stock.ticker}.`);
      if (newValues[k] === stock[k]) {
        delete newValues[k];
        continue;
      }
      // Compare scalar arrays by iterating over them and comparing each element
      if (
        (k === "prices1y" || k === "prices1mo") &&
        Array.isArray(stock[k]) &&
        Array.isArray(newValues[k]) &&
        stock[k].length === newValues[k].length &&
        stock[k].every((value, index) => value === newValues[k][index])
      ) {
        delete newValues[k];
        continue;
      }
      // Compare records with known keys by iterating over them and comparing each value
      if (
        k === "analystRatings" &&
        typeof stock[k] === "object" &&
        stock[k] !== null &&
        typeof newValues[k] === "object" &&
        newValues[k] !== null &&
        analystRatingArray.every((rating) => stock[k][rating] === newValues[k][rating])
      ) {
        delete newValues[k];
        continue;
      }

      // New data is different from old data
      isNewData = true;

      switch (k) {
        case "starRating":
          signalMessage += `\n\t${
            // larger is better
            (newValues[k] ?? 0) > (stock[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
          }Star Rating changed from ${
            // Use cute tiny star characters to show the star rating
            "★".repeat(stock[k]) + "☆".repeat(5 - stock[k])
          } to ${"★".repeat(newValues[k]) + "☆".repeat(5 - newValues[k])}`;
          break;
        case "morningstarFairValue":
          const oldCurrency = stock.currency ?? "";
          const newCurrency = newValues.currency ?? oldCurrency;
          const lastClose = newValues.lastClose ?? stock.lastClose ?? "N/A";
          signalMessage += `\n\t${
            // larger is better
            (newValues[k] ?? 0) > (stock[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
          }Morningstar Fair Value changed from ${oldCurrency} ${stock[k] ?? "N/A"} to ${newCurrency} ${
            newValues[k] ?? "N/A"
          } (last close ${newCurrency} ${lastClose})`;
          break;
        case "msciTemperature":
          signalMessage += `\n\t${
            // smaller is better
            (newValues[k] ?? Number.MAX_VALUE) < (stock[k] ?? Number.MAX_VALUE)
              ? SIGNAL_PREFIX_BETTER
              : SIGNAL_PREFIX_WORSE
          }MSCI Implied Temperature Rise changed from ${stock[k] ?? "N/A"}\u2009℃ to ${newValues[k] ?? "N/A"}\u2009℃`;
          break;
        case "analystConsensus":
        case "msciESGRating":
        case "lsegESGScore":
        case "lsegEmissions":
        case "spESGScore":
        case "sustainalyticsESGRisk":
          let signalPrefix = "";
          switch (k) {
            case "analystConsensus":
              signalPrefix =
                // larger index in array [Sell, ..., Buy] is better
                (newValues.analystConsensus ? analystRatingArray.indexOf(newValues.analystConsensus) : -1) >
                (stock.analystConsensus
                  ? analystRatingArray.indexOf(stock.analystConsensus as AnalystRating)
                  : /* c8 ignore next */ // This never occurs with our test dataset
                    -1)
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE;
              break;
            case "msciESGRating":
              signalPrefix =
                // smaller index in array [AAA, ..., CCC] is better
                (newValues.msciESGRating ? msciESGRatingArray.indexOf(newValues.msciESGRating) : 7) <
                (stock.msciESGRating
                  ? msciESGRatingArray.indexOf(stock.msciESGRating as MSCIESGRating)
                  : /* c8 ignore next */ // This never occurs with our test dataset
                    7)
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE;
              break;
            case "sustainalyticsESGRisk":
              signalPrefix =
                // smaller is better
                (newValues.sustainalyticsESGRisk ?? Number.MAX_VALUE) <
                (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE)
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE;
              break;
            default:
              signalPrefix =
                // larger is better for all other parameters
                (newValues[k] ?? 0) > (stock[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE;
              break;
          }
          signalMessage += `\n\t${signalPrefix}${parameterPrettyNames[k]} changed from ${stock[k] ?? "N/A"} to ${
            newValues[k] ?? "N/A"
          }`;
          break;
        default:
          break;
      }
    } else {
      // If a value is undefined, i.e. has not been set in the fetch controller, we delete it from the object to not
      // overwrite existing values.
      delete newValues[k];
    }
  }
  if (isNewData || forceUpdate) {
    await client.stock.update({
      where: { ticker: stock.ticker },
      data: { ...newValues, ...dynamicStockAttributes({ ...stock, ...newValues }) },
    });
    logger.info({ prefix: "postgres", newValues }, `Updated stock ${ticker}`);
    // The message string contains a newline character if and only if a parameter changed for which we want to send a
    // message
    if (signalMessage.includes("\n") && !skipMessage) await signal.sendMessage(signalMessage, "stockUpdate", stock);
  } else {
    // No new data was provided
    logger.info({ prefix: "postgres" }, `No updates for stock ${ticker}.`);
  }
};

/**
 * Delete a stock.
 * @param ticker The ticker of the stock to delete.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const deleteStock = async (ticker: string) => {
  try {
    // Attempt to delete the stock with the given ticker
    await client.stock.delete({ where: { ticker } });
    logger.info({ prefix: "postgres" }, `Deleted stock ${ticker}.`);
  } catch {
    // If deletion failed, the stock does not exist
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};
