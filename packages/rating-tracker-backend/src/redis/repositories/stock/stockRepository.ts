import APIError from "../../../lib/apiError.js";
import { Stock, StockEntity, stockSchema } from "../../../models/stock.js";
import { fetch, fetchAll, index, remove, save } from "./stockRepositoryBase.js";
import chalk from "chalk";
import {
  Country,
  Currency,
  Industry,
  MSCIESGRating,
  Size,
  Style,
} from "rating-tracker-commons";
import { sendMessage } from "../../../signal/signal.js";
import logger from "../../../lib/logger.js";

export const indexStockRepository = () => {
  index();
};

export const createStockWithoutReindexing = async (
  stock: Stock
): Promise<boolean> => {
  const existingStock = await fetch(stock.ticker);
  if (existingStock && existingStock.name) {
    logger.warn(
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
      chalk.greenBright(
        `Created stock “${stock.name}” with entity ID ${await save(
          stockEntity
        )}.`
      )
    );
    return true;
  }
};

export const createStock = async (stock: Stock): Promise<boolean> => {
  if (await createStockWithoutReindexing(stock)) {
    index();
    return true;
  }
  return false;
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

export const updateStockWithoutReindexing = async (
  ticker: string,
  newValues: Partial<Omit<Stock, "ticker">>
) => {
  let k: keyof typeof newValues;
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    let signalMessage = `Updates for ${stockEntity.name} (${ticker}):`;
    logger.info(chalk.greenBright(`Updating stock ${ticker}…`));
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
            chalk.greenBright(
              `    Property ${k} updated from ${stockEntity[k]} to ${newValues[k]}`
            )
          );
          switch (k) {
            case "starRating":
              signalMessage += `\n\tStar Rating changed from ${
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
              signalMessage += `\n\tMorningstar Fair Value changed from ${currency} ${
                stockEntity[k] ?? 0
              } to ${currency} ${
                newValues[k] ?? 0
              } (last close ${currency} ${lastClose})`;
              break;
            case "msciESGRating":
              signalMessage += `\n\tMSCI ESG Rating changed from ${
                stockEntity[k] ?? "N/A"
              } to ${newValues[k] ?? "N/A"}`;
              break;
            case "msciTemperature":
              signalMessage += `\n\tMSCI Implied Temperature Rise changed from ${
                stockEntity[k] ?? "N/A"
              }°C to ${newValues[k] ?? "N/A"}°C`;
              break;
            default:
              break;
          }
          switch (k) {
            case "name":
            case "country":
            case "industry":
            case "size":
            case "style":
            case "morningstarId":
            case "currency":
            case "msciId":
            case "msciESGRating":
              stockEntity[k] = newValues[k];
              break;
            case "morningstarLastFetch":
            case "msciLastFetch":
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
            case "msciTemperature":
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
        sendMessage(signalMessage);
      }
    } else {
      logger.info(chalk.grey(`No updates for stock ${ticker}.`));
    }
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const updateStock = async (
  ticker: string,
  newValues: {
    name?: string;
    country?: Country;
    industry?: Industry;
    size?: Size;
    style?: Style;
    morningstarId?: string;
    morningstarLastFetch?: Date;
    starRating?: number;
    dividendYieldPercent?: number;
    priceEarningRatio?: number;
    lastClose?: number;
    morningstarFairValue?: number;
    currency?: Currency;
    marketCap?: number;
    low52w?: number;
    high52w?: number;
    msciId?: string;
    msciLastFetch?: Date;
    msciESGRating?: MSCIESGRating;
    msciTemperature?: number;
  }
) => {
  await updateStockWithoutReindexing(ticker, newValues);
  index();
};

export const deleteStockWithoutReindexing = async (ticker: string) => {
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    const name = new Stock(stockEntity).name;
    await remove(stockEntity.entityId);
    logger.info(
      chalk.greenBright(`Deleted stock “${name}” (ticker ${ticker}).`)
    );
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const deleteStock = async (ticker: string) => {
  await deleteStockWithoutReindexing(ticker);
  index();
};
