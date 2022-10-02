import APIError from "../../apiError.js";
import { Stock, stockSchema } from "../../models/stock.js";
import client from "../Client.js";
import chalk from "chalk";

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

// export const readStock = async (entityID: string) => {
//   return await readStocks([entityID]);
// };

// export const readStocks = async (entityIDs: string[]) => {
//   return (await stockRepository.fetch(entityIDs)).map((stockEntity) => {
//     const stock = new Stock(stockEntity);
//     if (stock.ticker) {
//       return stock;
//     }
//     throw new APIError(404, `Stock Entity ${stockEntity.entityId} not found.`);
//   });
// };

export const readAllStocks = async () => {
  return await stockRepository.search().return.all();
};

export const readStockCount = async () => {
  return await stockRepository.search().count();
};

export const deleteStockWithoutReindexing = async (entityID: string) => {
  const stockEntity = await stockRepository.fetch(entityID);
  const stock = new Stock(stockEntity);
  if (stock.ticker) {
    await stockRepository.remove(entityID);
    console.log(
      chalk.greenBright(
        `Deleted stock “${stock.name}” with entity ID ${entityID}.`
      )
    );
  } else {
    throw new APIError(404, `Stock Entity ${entityID} not found.`);
  }
};

export const deleteStock = async (entityID: string) => {
  await deleteStockWithoutReindexing(entityID);
  indexStockRepository();
};
