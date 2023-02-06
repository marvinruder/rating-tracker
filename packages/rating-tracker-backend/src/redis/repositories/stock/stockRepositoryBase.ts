/* istanbul ignore file */ // This file is mocked since tests must not depend on a running Redis instance
import { StockEntity, stockSchema } from "../../../models/stock.js";
import client from "../../Client.js";

/**
 * The stock repository.
 */
export const stockRepository = client.fetchRepository(stockSchema);
await stockRepository.createIndex();

/**
 * Fetch a stock from the repository.
 *
 * @param {string} id The ID of the stock to fetch.
 * @returns {Promise<StockEntity>} A promise that resolves to the stock entity.
 */
export const fetch = (id: string): Promise<StockEntity> => {
  return stockRepository.fetch(id);
};

/**
 * Fetch all stocks from the repository.
 *
 * @returns {Promise<StockEntity[]>} A promise that resolves to a list of all stock entities.
 */
export const fetchAll = (): Promise<StockEntity[]> => {
  return stockRepository.search().return.all();
};

/**
 * Save a stock to the repository.
 *
 * @param {StockEntity} stockEntity The stock entity to save.
 * @returns {Promise<string>} A promise that resolves to the ID of the saved stock.
 */
export const save = (stockEntity: StockEntity): Promise<string> => {
  return stockRepository.save(stockEntity);
};

/**
 * Count the number of stocks in the repository.
 *
 * @returns {Promise<number>} A promise that resolves to the number of stocks in the repository.
 */
export const count = (): Promise<number> => {
  return stockRepository.search().count();
};

/**
 * Delete a stock from the repository.
 *
 * @param {string} id The ID of the stock to delete.
 */
export const remove = (id: string) => {
  stockRepository.remove(id);
};
