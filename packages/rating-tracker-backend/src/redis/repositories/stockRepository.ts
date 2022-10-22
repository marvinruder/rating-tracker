import APIError from "../../apiError.js";
import { Stock, stockSchema } from "../../models/stock.js";
import client from "../Client.js";
import chalk from "chalk";
import { Country, Industry, Size, Style } from "../../types.js";

console.log(
  chalk.grey(
    "Using Stock Repository for the first time, fetching and indexing."
  )
);
export const stockRepository = client.fetchRepository(stockSchema);
await stockRepository.createIndex();
console.log(
  chalk.grey(
    `Stock Repository is now fetched and indexed (${await stockRepository
      .search()
      .count()} stocks available).`
  )
);

export const indexStockRepository = async () => {
  await stockRepository.createIndex();
  console.log(
    chalk.grey(
      `Stock Repository is now freshly indexed (${await stockRepository
        .search()
        .count()} stocks available).`
    )
  );
};

export const createStockWithoutReindexing = async (stock: Stock) => {
  let entityID;
  try {
    entityID = await stockRepository
      .search()
      .where("ticker")
      .equals(stock.ticker)
      .firstId();
  } catch (e) {
    entityID = undefined;
  }
  if (entityID) {
    console.warn(
      chalk.yellowBright(
        `Skipping stock “${stock.name}” – existing already (entity ID ${entityID}).`
      )
    );
  } else {
    console.log(
      chalk.greenBright(
        `Created stock “${stock.name}” with entity ID ${
          (await stockRepository.createAndSave(Stock.toJSON(stock))).entityId
        }.`
      )
    );
  }
};

export const createStock = async (stock: Stock) => {
  await createStockWithoutReindexing(stock);
  indexStockRepository();
};

export const readStock = async (ticker: string) => {
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    return new Stock(stockEntity);
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const readAllStocks = async () => {
  return await stockRepository.search().return.all();
};

export const readStockCount = async () => {
  return await stockRepository.search().count();
};

export const updateStockWithoutReindexing = async (
  ticker: string,
  updatedValues: {
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
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    console.log(chalk.greenBright(`Updating stock ${ticker}…`));
    let isNewData = false;
    if (
      updatedValues.country &&
      updatedValues.country !== stockEntity.country
    ) {
      isNewData = true;
      stockEntity.country = updatedValues.country;
      console.log(chalk.greenBright(`    Country: ${updatedValues.country}`));
    }
    if (
      updatedValues.industry &&
      updatedValues.industry !== stockEntity.industry
    ) {
      isNewData = true;
      stockEntity.industry = updatedValues.industry;
      console.log(chalk.greenBright(`    Industry: ${updatedValues.industry}`));
    }
    if (updatedValues.size && updatedValues.size !== stockEntity.size) {
      isNewData = true;
      stockEntity.size = updatedValues.size;
      console.log(chalk.greenBright(`    Size: ${updatedValues.size}`));
    }
    if (updatedValues.style && updatedValues.style !== stockEntity.style) {
      isNewData = true;
      stockEntity.style = updatedValues.style;
      console.log(chalk.greenBright(`    Style: ${updatedValues.style}`));
    }
    if (
      updatedValues.morningstarId &&
      updatedValues.morningstarId !== stockEntity.morningstarId
    ) {
      isNewData = true;
      stockEntity.morningstarId = updatedValues.morningstarId;
      console.log(
        chalk.greenBright(`    Morningstar ID: ${updatedValues.morningstarId}`)
      );
    }
    if (
      updatedValues.morningstarLastFetch &&
      updatedValues.morningstarLastFetch !== stockEntity.morningstarLastFetch
    ) {
      isNewData = true;
      stockEntity.morningstarLastFetch = updatedValues.morningstarLastFetch;
      console.log(
        chalk.greenBright(
          `    Last successful fetch of Morningstar data: ${updatedValues.morningstarLastFetch}`
        )
      );
    }
    if (
      updatedValues.starRating &&
      updatedValues.starRating !== stockEntity.starRating
    ) {
      isNewData = true;
      stockEntity.starRating = updatedValues.starRating;
      console.log(
        chalk.greenBright(`    Star Rating: ${updatedValues.starRating}`)
      );
    }
    if (
      updatedValues.dividendYieldPercent &&
      updatedValues.dividendYieldPercent !== stockEntity.dividendYieldPercent
    ) {
      isNewData = true;
      stockEntity.dividendYieldPercent = updatedValues.dividendYieldPercent;
      console.log(
        chalk.greenBright(
          `    Dividend Yield (%): ${updatedValues.dividendYieldPercent}`
        )
      );
    }
    if (
      updatedValues.priceEarningRatio &&
      updatedValues.priceEarningRatio !== stockEntity.priceEarningRatio
    ) {
      isNewData = true;
      stockEntity.priceEarningRatio = updatedValues.priceEarningRatio;
      console.log(
        chalk.greenBright(
          `    Price Earning Ratio: ${updatedValues.priceEarningRatio}`
        )
      );
    }
    if (isNewData) {
      await stockRepository.save(stockEntity);
    } else {
      console.log(chalk.grey(`No updates for stock ${ticker}.`));
    }
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const updateStock = async (
  ticker: string,
  updatedValues: {
    country?: Country;
    industry?: Industry;
    size?: Size;
    style?: Style;
    morningstarId?: string;
    starRating?: number;
    dividendYieldPercent?: number;
    priceEarningRatio?: number;
  }
) => {
  await updateStockWithoutReindexing(ticker, updatedValues);
  indexStockRepository();
};

export const deleteStockWithoutReindexing = async (ticker: string) => {
  const stockEntity = await stockRepository
    .search()
    .where("ticker")
    .equals(ticker)
    .first();
  if (stockEntity) {
    const name = new Stock(stockEntity).name;
    await stockRepository.remove(stockEntity.entityId);
    console.log(
      chalk.greenBright(`Deleted stock “${name}” (ticker ${ticker}).`)
    );
  } else {
    throw new APIError(404, `Stock ${ticker} not found.`);
  }
};

export const deleteStock = async (ticker: string) => {
  await deleteStockWithoutReindexing(ticker);
  indexStockRepository();
};
