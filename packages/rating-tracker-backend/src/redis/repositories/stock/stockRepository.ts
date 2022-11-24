import APIError from "../../../lib/apiError.js";
import { Stock, StockEntity, stockSchema } from "../../../models/stock.js";
import { fetch, fetchAll, index, remove, save } from "./stockRepositoryBase.js";
import chalk from "chalk";
import { Country, Industry, Size, Style } from "rating-tracker-commons";
import { sendMessage } from "../../../signal/signal.js";

export const indexStockRepository = () => {
  index();
};

export const createStockWithoutReindexing = async (stock: Stock) => {
  const existingStock = await fetch(stock.ticker);
  if (existingStock && existingStock.name) {
    console.warn(
      chalk.yellowBright(
        `Skipping stock “${stock.name}” – existing already (entity ID ${existingStock.entityId}).`
      )
    );
  } else {
    const stockEntity = new StockEntity(stockSchema, stock.ticker, {
      ...stock,
    });
    console.log(
      chalk.greenBright(
        `Created stock “${stock.name}” with entity ID ${await save(
          stockEntity
        )}.`
      )
    );
  }
};

export const createStock = async (stock: Stock) => {
  await createStockWithoutReindexing(stock);
  index();
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
  newValues: Omit<Stock, "ticker" | "name">
) => {
  let k: keyof typeof newValues;
  const stockEntity = await fetch(ticker);
  if (stockEntity && stockEntity.name) {
    let signalMessage = `Updates for ${stockEntity.name} (${ticker}):`;
    console.log(chalk.greenBright(`Updating stock ${ticker}…`));
    let isNewData = false;
    for (k in newValues) {
      if (k in newValues && newValues[k]) {
        if (newValues[k] !== stockEntity[k]) {
          isNewData = true;
          console.log(
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
            // case "dividendYieldPercent":
            //   signalMessage += `\n\tDividend Yield changed from ${
            //     stockEntity[k] ?? 0
            //   } % to ${newValues[k] ?? 0} %`;
            //   break;
            // case "priceEarningRatio":
            //   signalMessage += `\n\tPrice/Earning ratio changed from ${
            //     stockEntity[k] ?? 0
            //   } to ${newValues[k] ?? 0}`;
            //   break;
            default:
              break;
          }
          switch (k) {
            case "country":
            case "industry":
            case "size":
            case "style":
            case "morningstarId":
              stockEntity[k] = newValues[k];
              break;
            case "morningstarLastFetch":
              stockEntity[k] = newValues[k];
              break;
            case "starRating":
            case "dividendYieldPercent":
            case "priceEarningRatio":
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
      console.log(chalk.grey(`No updates for stock ${ticker}.`));
    }
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const updateStock = async (
  ticker: string,
  newValues: {
    country?: Country;
    industry?: Industry;
    size?: Size;
    style?: Style;
    morningstarId?: string;
    morningstarLastFetch?: Date;
    starRating?: number;
    dividendYieldPercent?: number;
    priceEarningRatio?: number;
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
    console.log(
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
