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
    exampleStocks.map((stock) => [stock.ticker, new StockEntity(stockSchema, stock.ticker, { ...stock })])
  );
};

initStockRepository();

/**
 * Fetch a stock from the mock repository.
 *
 * @param {string} id The ID of the stock to fetch.
 * @returns {Promise<StockEntity>} A promise that resolves to the stock entity.
 */
export const fetch = (id: string): Promise<StockEntity> => {
  return Promise.resolve(stockRepository.get(id));
};

/**
 * Fetch all stocks from the mock repository.
 *
 * @returns {Promise<StockEntity[]>} A promise that resolves to a list of all stock entities.
 */
export const fetchAll = () => {
  return Promise.resolve([...stockRepository.values()]);
};

/**
 * Save a stock to the mock repository.
 *
 * @param {StockEntity} stockEntity The stock entity to save.
 * @returns {Promise<string>} A promise that resolves to the ID of the saved stock.
 */
export const save = (stockEntity: StockEntity): Promise<string> => {
  stockRepository.set(stockEntity.entityId, stockEntity);
  return Promise.resolve(stockEntity.entityId);
};

/**
 * Count the number of stocks in the mock repository.
 *
 * @returns {Promise<number>} A promise that resolves to the number of stocks in the mock repository.
 */
export const count = (): Promise<number> => {
  return Promise.resolve(stockRepository.size);
};

/**
 * Delete a stock from the mock repository.
 *
 * @param {string} id The ID of the stock to delete.
 */
export const remove = (id: string) => {
  stockRepository.delete(id);
};
