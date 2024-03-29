import type { Stock, MSCIESGRating, OmitDynamicAttributesStock } from "@rating-tracker/commons";
import { msciESGRatingArray } from "@rating-tracker/commons";

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
 * @throws an {@link APIError} if the stock does not exist.
 */
export const updateStock = async (ticker: string, newValues: Partial<Omit<Stock, "ticker">>, forceUpdate?: boolean) => {
  let k: keyof typeof newValues; // all keys of new values
  const stock = await readStock(ticker); // Read the stock from the database
  let signalMessage = `Updates for ${stock.name} (${ticker}):`;
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      if (stock[k] === undefined) {
        throw new APIError(400, `Invalid property ${k} for stock ${stock.ticker}.`);
      }
      if (newValues[k] === stock[k]) {
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
          const currency = newValues.currency ?? stock.currency ?? "";
          const lastClose = newValues.lastClose ?? stock.lastClose ?? 0;
          signalMessage += `\n\t${
            // larger is better
            (newValues[k] ?? 0) > (stock[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
          }Morningstar Fair Value changed from ${currency} ${stock[k] ?? 0} to ${currency} ${
            newValues[k] ?? 0
          } (last close ${currency} ${lastClose})`;
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
      where: {
        ticker: stock.ticker,
      },
      data: { ...newValues, ...dynamicStockAttributes({ ...stock, ...newValues }) },
    });
    logger.info({ prefix: "postgres", newValues }, `Updated stock ${ticker}`);
    // The message string contains a newline character if and only if a parameter changed for which we want to send a
    // message
    if (signalMessage.includes("\n")) {
      await signal.sendMessage(signalMessage, "stockUpdate", stock);
    }
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
  // Attempt to find a stock with the given ticker
  try {
    const existingStock = await client.stock.findUniqueOrThrow({ where: { ticker } });
    // If that worked, we can delete the existing stock
    await client.stock.delete({
      where: { ticker },
    });
    logger.info({ prefix: "postgres" }, `Deleted stock “${existingStock.name}” (ticker ${ticker}).`);
  } catch {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};
