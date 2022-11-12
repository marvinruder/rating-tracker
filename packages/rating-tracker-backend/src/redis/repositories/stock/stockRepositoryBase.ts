/* istanbul ignore file */
import { StockEntity, stockSchema } from "../../../models/stock.js";
import client from "../../Client.js";
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
  ) + "\n"
);

export const index = async () => {
  await stockRepository.createIndex();
  console.log(
    chalk.grey(
      `Stock Repository is now freshly indexed (${await stockRepository
        .search()
        .count()} stocks available).`
    ) + "\n"
  );
};

export const fetch = (id: string) => {
  return stockRepository.fetch(id);
};

export const fetchAll = () => {
  return stockRepository.search().return.all();
};

export const save = (stockEntity: StockEntity) => {
  return stockRepository.save(stockEntity);
};

export const count = () => {
  return stockRepository.search().count();
};

export const remove = (id: string) => {
  return stockRepository.remove(id);
};
