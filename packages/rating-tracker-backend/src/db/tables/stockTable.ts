import APIError from "../../utils/apiError.js";
import chalk from "chalk";
import * as signal from "../../signal/signal.js";
import logger, { PREFIX_POSTGRES } from "../../utils/logger.js";
import { Stock, MSCIESGRating, msciESGRatingArray, OmitDynamicAttributesStock } from "rating-tracker-commons";
import client from "../client.js";
import { Prisma } from "../../../prisma/client";
import { addDynamicAttributesToStockData, dynamicStockAttributes } from "../../models/dynamicStockAttributes.js";

// Emojis showing whether a change is good or bad. Used in the Signal message.
const SIGNAL_PREFIX_BETTER = "🟢 ";
const SIGNAL_PREFIX_WORSE = "🔴 ";

/**
 * Strings for the parameters used in the Signal message
 */
const parameterPrettyNames = {
  analystConsensus: "Analyst Consensus",
  msciESGRating: "MSCI ESG Rating",
  refinitivESGScore: "Refinitiv ESG Score",
  refinitivEmissions: "Refinitiv Emissions Rating",
  spESGScore: "S&P ESG Score",
  sustainalyticsESGRisk: "Sustainalytics ESG Risk Score",
};

/**
 * Create a stock.
 *
 * @param {Stock} stock The stock to create.
 * @returns {boolean} Whether the stock was created.
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
      PREFIX_POSTGRES +
        chalk.yellowBright(`Skipping stock “${stock.name}” – existing already (ticker ${existingStock.ticker}).`)
    );
    return false;
  } catch {
    await client.stock.create({
      data: addDynamicAttributesToStockData(stock),
    });
    logger.info(PREFIX_POSTGRES + `Created stock “${stock.name}” with ticker ${stock.ticker}.`);
    return true;
  }
};

/**
 * Read a stock.
 *
 * @param {string} ticker The ticker of the stock.
 * @returns {Promise<Stock>} A promise that resolves to the stock.
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
 *
 * @param {Prisma.StockFindManyArgs} args An object with filtering, sorting and pagination options.
 * @returns {Promise<Stock[]>} A promise that resolves to a list of all stocks.
 */
export const readAllStocks = async (args?: Prisma.StockFindManyArgs): Promise<[Stock[], number]> => {
  return await client.$transaction([
    client.stock.findMany(args),
    client.stock.count({
      where: { ...args?.where },
    }),
  ]);
};

/**
 * Update a stock.
 *
 * @param {string} ticker The ticker of the stock.
 * @param {Partial<Omit<Stock, "ticker">>} newValues The new values for the stock.
 * @param {boolean} forceUpdate Whether new values are written into the database, even if they are equal to the stock’s
 * current values. Triggers computation of scores.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const updateStock = async (ticker: string, newValues: Partial<Omit<Stock, "ticker">>, forceUpdate?: boolean) => {
  let k: keyof typeof newValues; // all keys of new values
  const stock = await readStock(ticker); // Read the stock from the database
  let signalMessage = `Updates for ${stock.name} (${ticker}):`;
  logger.info(PREFIX_POSTGRES + `Updating stock ${ticker}…`);
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

      logger.info(
        PREFIX_POSTGRES +
          `    Property ${k} updated from ${
            // Format dates as ISO strings
            stock[k] instanceof Date ? (stock[k] as Date).toISOString() : stock[k]
          } to ${newValues[k] instanceof Date ? (newValues[k] as Date).toISOString() : newValues[k]}`
      );

      switch (k) {
        case "starRating":
          signalMessage += `\n\t${
            // larger is better
            (newValues[k] ?? 0) > (stock[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
          }Star Rating changed from ${
            // Use cute tiny star characters to show the star rating
            "★".repeat(stock[k] ?? 0) + "☆".repeat(5 - stock[k] ?? 0)
          } to ${"★".repeat(newValues[k] ?? 0) + "☆".repeat(5 - newValues[k] ?? 0)}`;
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
        case "refinitivESGScore":
        case "refinitivEmissions":
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
                  : /* istanbul ignore next -- @preserve */ // This never occurs with our test dataset
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
    // The message string contains a newline character if and only if a parameter changed for which we want to send a
    // message
    if (signalMessage.includes("\n")) {
      await signal.sendMessage(signalMessage, "stockUpdate");
    }
  } else {
    // No new data was provided
    logger.info(PREFIX_POSTGRES + `No updates for stock ${ticker}.`);
  }
};

/**
 * Delete a stock.
 *
 * @param {string} ticker The ticker of the stock to delete.
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
    logger.info(PREFIX_POSTGRES + `Deleted stock “${existingStock.name}” (ticker ${ticker}).`);
  } catch {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};
