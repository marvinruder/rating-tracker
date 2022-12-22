import APIError from "../../../lib/apiError.js";
import { Stock, StockEntity, stockSchema } from "../../../models/stock.js";
import { fetch, fetchAll, remove, save } from "./stockRepositoryBase.js";
import chalk from "chalk";
import * as signal from "../../../signal/signal.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";
import { MSCIESGRating, msciESGRatingArray } from "rating-tracker-commons";

const SIGNAL_PREFIX_BETTER = "🟢 ";
const SIGNAL_PREFIX_WORSE = "🔴 ";

export const createStock = async (stock: Stock): Promise<boolean> => {
  const existingStock = await fetch(stock.ticker);
  if (existingStock && existingStock.name) {
    logger.warn(
      PREFIX_REDIS +
        chalk.yellowBright(
          `Skipping stock “${stock.name}” – existing already (entity ID ${existingStock.entityId}).`
        )
    );
    return false;
  } else {
    const stockEntity = new StockEntity(stockSchema, stock.ticker, {
      ...stock,
    });
    logger.info(
      PREFIX_REDIS +
        chalk.greenBright(
          `Created stock “${stock.name}” with entity ID ${await save(
            stockEntity
          )}.`
        )
    );
    return true;
  }
};

export const readStock = async (ticker: string) => {
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    return new Stock(stockEntity);
  }
  throw new APIError(404, `Stock ${ticker} not found.`);
};

export const readAllStocks = () => {
  return fetchAll();
};

export const updateStock = async (
  ticker: string,
  newValues: Partial<Omit<Stock, "ticker">>
) => {
  let k: keyof typeof newValues;
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    let signalMessage = `Updates for ${stockEntity.name} (${ticker}):`;
    logger.info(PREFIX_REDIS + chalk.greenBright(`Updating stock ${ticker}…`));
    let isNewData = false;
    for (k in newValues) {
      if (
        k in newValues &&
        newValues[k] !== undefined &&
        newValues[k] !== undefined
      ) {
        if (newValues[k] !== stockEntity[k]) {
          isNewData = true;
          logger.info(
            PREFIX_REDIS +
              chalk.greenBright(
                `    Property ${k} updated from ${stockEntity[k]} to ${newValues[k]}`
              )
          );
          const parameterPrettyNames = {
            analystConsensus: "Analyst Consensus",
            msciESGRating: "MSCI ESG Rating",
            refinitivESGScore: "Refinitiv ESG Score",
            refinitivEmissions: "Refinitiv Emissions Score",
            spESGScore: "S&P ESG Score",
            sustainalyticsESGRisk: "Sustainalytics ESG Risk Score",
          };
          switch (k) {
            case "starRating":
              signalMessage += `\n\t${
                newValues[k] ?? 0 > stockEntity[k] ?? 0
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE
              }Star Rating changed from ${
                "★".repeat(stockEntity[k] ?? 0) +
                "☆".repeat(5 - stockEntity[k] ?? 0)
              } to ${
                "★".repeat(newValues[k] ?? 0) +
                "☆".repeat(5 - newValues[k] ?? 0)
              }`;
              break;
            case "morningstarFairValue":
              const currency = newValues.currency ?? stockEntity.currency ?? "";
              const lastClose =
                newValues.lastClose ?? stockEntity.lastClose ?? 0;
              signalMessage += `\n\t${
                newValues[k] ?? 0 > stockEntity[k] ?? 0
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE
              }Morningstar Fair Value changed from ${currency} ${
                stockEntity[k] ?? 0
              } to ${currency} ${
                newValues[k] ?? 0
              } (last close ${currency} ${lastClose})`;
              break;
            case "msciTemperature":
              signalMessage += `\n\t${
                newValues[k] ?? 0 < stockEntity[k] ?? 0
                  ? SIGNAL_PREFIX_BETTER
                  : SIGNAL_PREFIX_WORSE
              }MSCI Implied Temperature Rise changed from ${
                stockEntity[k] ?? "N/A"
              }°C to ${newValues[k] ?? "N/A"}°C`;
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
                    (newValues.msciESGRating
                      ? msciESGRatingArray.indexOf(newValues.msciESGRating)
                      : 7) <
                    (stockEntity.msciESGRating
                      ? msciESGRatingArray.indexOf(
                          stockEntity.msciESGRating as MSCIESGRating
                        )
                      : 7)
                      ? SIGNAL_PREFIX_BETTER
                      : SIGNAL_PREFIX_WORSE;
                  break;
                case "sustainalyticsESGRisk":
                  signalPrefix =
                    (newValues.sustainalyticsESGRisk ?? Number.MAX_VALUE) <
                    (stockEntity.sustainalyticsESGRisk ?? Number.MAX_VALUE)
                      ? SIGNAL_PREFIX_BETTER
                      : SIGNAL_PREFIX_WORSE;
                  break;
                default:
                  signalPrefix =
                    newValues[k] ?? 0 > stockEntity[k] ?? 0
                      ? SIGNAL_PREFIX_BETTER
                      : SIGNAL_PREFIX_WORSE;
                  break;
              }
              signalMessage += `\n\t${signalPrefix}${
                parameterPrettyNames[k]
              } changed from ${stockEntity[k] ?? "N/A"} to ${
                newValues[k] ?? "N/A"
              }`;
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
              stockEntity[k] = newValues[k];
              break;
            case "morningstarLastFetch":
            case "marketScreenerLastFetch":
            case "msciLastFetch":
            case "refinitivLastFetch":
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
      if (signalMessage.includes("\n")) {
        signal.sendMessage(signalMessage);
      }
    } else {
      logger.info(PREFIX_REDIS + `No updates for stock ${ticker}.`);
    }
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const deleteStock = async (ticker: string) => {
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    const name = new Stock(stockEntity).name;
    await remove(stockEntity.entityId);
    logger.info(
      PREFIX_REDIS +
        chalk.greenBright(`Deleted stock “${name}” (ticker ${ticker}).`)
    );
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};
