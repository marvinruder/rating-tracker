import APIError from "../../../lib/apiError.js";
import { Stock, StockEntity, stockSchema } from "../../../models/stock.js";
import { fetch, fetchAll, remove, save } from "./stockRepositoryBase.js";
import chalk from "chalk";
import * as signal from "../../../signal/signal.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";
import { MSCIESGRating, msciESGRatingArray } from "rating-tracker-commons";

// Emojis showing whether a change is good or bad. Used in the Signal message.
const SIGNAL_PREFIX_BETTER = "🟢 ";
const SIGNAL_PREFIX_WORSE = "🔴 ";

/**
 * Create a stock.
 *
 * @param {Stock} stock The stock to create.
 * @returns {boolean} Whether the stock was created.
 */
export const createStock = async (stock: Stock): Promise<boolean> => {
  const existingStock = await fetch(stock.ticker); // Attempt to fetch an existing stock with the same ticker
  if (existingStock && existingStock.name) {
    // If that worked, a stock with the same ticker already exists
    logger.warn(
      PREFIX_REDIS +
        chalk.yellowBright(`Skipping stock “${stock.name}” – existing already (entity ID ${existingStock.entityId}).`)
    );
    return false;
  } else {
    const stockEntity = new StockEntity(stockSchema, stock.ticker, {
      ...stock,
    });
    logger.info(PREFIX_REDIS + `Created stock “${stock.name}” with entity ID ${await save(stockEntity)}.`);
    return true;
  }
};

/**
 * Read a stock.
 *
 * @param {string} ticker The ticker of the stock.
 * @returns {Stock} The stock.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const readStock = async (ticker: string) => {
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    return new Stock(stockEntity);
  }
  throw new APIError(404, `Stock ${ticker} not found.`);
};

/**
 * Read all stocks.
 *
 * @returns {Stock[]} A list of all stocks.
 */
export const readAllStocks = () => {
  return fetchAll();
};

/**
 * Update a stock.
 *
 * @param {string} ticker The ticker of the stock.
 * @param {Partial<Omit<Stock, "ticker">>} newValues The new values for the stock.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const updateStock = async (ticker: string, newValues: Partial<Omit<Stock, "ticker">>) => {
  let k: keyof typeof newValues; // all keys of new values
  const stockEntity = await fetch(ticker); // Fetch the stock from Redis
  if (stockEntity && stockEntity.name) {
    let signalMessage = `Updates for ${stockEntity.name} (${ticker}):`;
    logger.info(PREFIX_REDIS + `Updating stock ${ticker}…`);
    let isNewData = false;
    // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
    for (k in newValues) {
      if (k in newValues && newValues[k] !== undefined) {
        if (newValues[k] !== stockEntity[k]) {
          // New data is different from old data
          isNewData = true;
          if (newValues[k] === null) {
            logger.info(PREFIX_REDIS + `    Property ${k} removed (was ${stockEntity[k]})`);
          } else {
            logger.info(
              PREFIX_REDIS +
                `    Property ${k} updated from ${
                  // Format dates as ISO strings
                  stockEntity[k] instanceof Date ? (stockEntity[k] as Date).toISOString() : stockEntity[k]
                } to ${newValues[k] instanceof Date ? (newValues[k] as Date).toISOString() : newValues[k]}`
            );
          }
          const parameterPrettyNames = {
            // Strings for the parameters used in the Signal message
            analystConsensus: "Analyst Consensus",
            msciESGRating: "MSCI ESG Rating",
            refinitivESGScore: "Refinitiv ESG Score",
            refinitivEmissions: "Refinitiv Emissions Rating",
            spESGScore: "S&P ESG Score",
            sustainalyticsESGRisk: "Sustainalytics ESG Risk Score",
          };
          switch (k) {
            case "starRating":
              signalMessage += `\n\t${
                // larger is better
                (newValues[k] ?? 0) > (stockEntity[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
              }Star Rating changed from ${
                // Use cute tiny star characters to show the star rating
                "★".repeat(stockEntity[k] ?? 0) + "☆".repeat(5 - stockEntity[k] ?? 0)
              } to ${"★".repeat(newValues[k] ?? 0) + "☆".repeat(5 - newValues[k] ?? 0)}`;
              break;
            case "morningstarFairValue":
              const currency = newValues.currency ?? stockEntity.currency ?? "";
              const lastClose = newValues.lastClose ?? stockEntity.lastClose ?? 0;
              signalMessage += `\n\t${
                // larger is better
                (newValues[k] ?? 0) > (stockEntity[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE
              }Morningstar Fair Value changed from ${currency} ${stockEntity[k] ?? 0} to ${currency} ${
                newValues[k] ?? 0
              } (last close ${currency} ${lastClose})`;
              break;
            case "msciTemperature":
              signalMessage += `\n\t${
                // smaller is better
                (newValues[k] ?? Number.MAX_VALUE) < (stockEntity[k] ?? Number.MAX_VALUE)
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE
              }MSCI Implied Temperature Rise changed from ${stockEntity[k] ?? "N/A"}°C to ${newValues[k] ?? "N/A"}°C`;
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
                    (newValues.msciESGRating
                      ? msciESGRatingArray.indexOf(newValues.msciESGRating)
                      : /* istanbul ignore next */ // This never occurs with our test dataset
                        7) <
                    (stockEntity.msciESGRating
                      ? msciESGRatingArray.indexOf(stockEntity.msciESGRating as MSCIESGRating)
                      : /* istanbul ignore next */ // This never occurs with our test dataset
                        7)
                      ? SIGNAL_PREFIX_BETTER
                      : SIGNAL_PREFIX_WORSE;
                  break;
                case "sustainalyticsESGRisk":
                  signalPrefix =
                    // smaller is better
                    (newValues.sustainalyticsESGRisk ?? Number.MAX_VALUE) <
                    (stockEntity.sustainalyticsESGRisk ?? Number.MAX_VALUE)
                      ? SIGNAL_PREFIX_BETTER
                      : SIGNAL_PREFIX_WORSE;
                  break;
                default:
                  signalPrefix =
                    // larger is better for all other parameters
                    (newValues[k] ?? 0) > (stockEntity[k] ?? 0) ? SIGNAL_PREFIX_BETTER : SIGNAL_PREFIX_WORSE;
                  break;
              }
              signalMessage += `\n\t${signalPrefix}${parameterPrettyNames[k]} changed from ${
                stockEntity[k] ?? "N/A"
              } to ${newValues[k] ?? "N/A"}`;
              break;
            default:
              break;
          }
          switch (k) {
            case "name":
            case "isin":
            case "country":
            case "industry":
            case "size":
            case "style":
            case "morningstarId":
            case "currency":
            case "marketScreenerId":
            case "msciId":
            case "msciESGRating":
            case "ric":
            case "sustainalyticsId":
            case "description":
              stockEntity[k] = newValues[k];
              break;
            case "morningstarLastFetch":
            case "marketScreenerLastFetch":
            case "msciLastFetch":
            case "refinitivLastFetch":
            // deepcode ignore DuplicateCaseBody: Reassignment must happen per type
            case "spLastFetch":
              stockEntity[k] = newValues[k];
              break;
            case "starRating":
            case "dividendYieldPercent":
            case "priceEarningRatio":
            case "lastClose":
            case "morningstarFairValue":
            case "marketCap":
            case "low52w":
            case "high52w":
            case "analystConsensus":
            case "analystCount":
            case "analystTargetPrice":
            case "msciTemperature":
            case "refinitivESGScore":
            case "refinitivEmissions":
            case "spId":
            case "spESGScore":
            // deepcode ignore DuplicateCaseBody: Reassignment must happen per type
            case "sustainalyticsESGRisk":
              stockEntity[k] = newValues[k];
              break;
            // default:
            //   stockEntity[k] = newValues[k];
            //   break;
          }
        }
      }
    }
    if (isNewData) {
      await save(stockEntity);
      // The message string contains a newline character if and only if a parameter changed for which we want to send a
      // message
      if (signalMessage.includes("\n")) {
        signal.sendMessage(signalMessage);
      }
    } else {
      // No new data was provided
      logger.info(PREFIX_REDIS + `No updates for stock ${ticker}.`);
    }
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

/**
 * Delete a stock from Redis.
 *
 * @param {string} ticker The ticker of the stock to delete.
 * @throws an {@link APIError} if the stock does not exist.
 */
export const deleteStock = async (ticker: string) => {
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    const name = new Stock(stockEntity).name;
    await remove(stockEntity.entityId);
    logger.info(PREFIX_REDIS + `Deleted stock “${name}” (ticker ${ticker}).`);
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};
