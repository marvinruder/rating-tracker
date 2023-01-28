import { StockEntity, stockSchema } from "../../../../models/stock.js";
import exampleStocks from "../../../../lib/exampleStocks.js";

/**
 * A mock repository for testing purposes.
 */
let stockRepository: Map<string, StockEntity>;

/**
 * Initializes the mock repository with the {@link exampleStocks}.
 */
export const initStockRepository = () => {
  stockRepository = new Map<string, StockEntity>(
    exampleStocks.map((stock) => [
      stock.ticker,
      new StockEntity(stockSchema, stock.ticker, { ...stock }),
    ])
  );
};

initStockRepository();

/**
 * Fetch a stock from the mock repository.
 *
 * @param {string} id The ID of the stock to fetch.
 * @returns {StockEntity} The stock entity.
 */
export const fetch = (id: string) => {
  return stockRepository.get(id);
};

/**
 * Fetch all stocks from the mock repository.
 *
 * @returns {StockEntity[]} A list of all stock entities.
 */
export const fetchAll = () => {
  return [...stockRepository.values()];
};

/**
 * Save a stock to the mock repository.
 *
 * @param {StockEntity} stockEntity The stock entity to save.
 * @returns {string} The ID of the saved stock.
 */
export const save = (stockEntity: StockEntity) => {
  stockRepository.set(stockEntity.entityId, stockEntity);
  return stockEntity.entityId;
};

/**
 * Count the number of stocks in the mock repository.
 *
 * @returns {number} The number of stocks in the mock repository.
 */
export const count = () => {
  return stockRepository.size;
};

/**
 * Delete a stock from the mock repository.
 *
 * @param {string} id The ID of the stock to delete.
 * @returns {void}
 */
export const remove = (id: string) => {
  return stockRepository.delete(id);
};
