/* istanbul ignore file */ // This file is mocked since tests must not depend on a running Redis instance
import { StockEntity, stockSchema } from "../../../models/stock.js";
import client from "../../Client.js";

/**
 * The stock repository.
 */
export const stockRepository = client.fetchRepository(stockSchema);

/**
 * Fetch a stock from the repository.
 *
 * @param {string} id The ID of the stock to fetch.
 * @return {StockEntity} The stock entity.
 */
export const fetch = (id: string) => {
  return stockRepository.fetch(id);
};

/**
 * Fetch all stocks from the repository.
 *
 * @return {StockEntity[]} A list of all stock entities.
 */
export const fetchAll = () => {
  return stockRepository.search().return.all();
};

/**
 * Save a stock to the repository.
 *
 * @param {StockEntity} stockEntity The stock entity to save.
 * @return {string} The ID of the saved stock.
 */
export const save = (stockEntity: StockEntity) => {
  return stockRepository.save(stockEntity);
};

/**
 * Count the number of stocks in the repository.
 *
 * @return {number} The number of stocks in the repository.
 */
export const count = () => {
  return stockRepository.search().count();
};

/**
 * Delete a stock from the repository.
 *
 * @param {string} id The ID of the stock to delete.
 * @return {void}
 */
export const remove = (id: string) => {
  return stockRepository.remove(id);
};
