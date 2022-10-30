import { StockEntity, stockSchema } from "../../../models/stock.js";
import exampleStocks from "../../../exampleStocks.js";

// export default import.meta.jest.createMockFromModule("stockRepository");

let stockRepository: Map<string, StockEntity>;

export const initMockRepository = () => {
  stockRepository = new Map<string, StockEntity>(
    exampleStocks.map((stock) => [
      stock.ticker,
      new StockEntity(stockSchema, stock.ticker, { ...stock }),
    ])
  );
};

initMockRepository();

export const index = () => {};

export const fetch = (id: string) => {
  return stockRepository.get(id);
};

export const fetchAll = () => {
  return [...stockRepository.values()];
};

export const save = (stockEntity: StockEntity) => {
  stockRepository.set(stockEntity.entityId, stockEntity);
  return stockEntity.entityId;
};

export const count = () => {
  return stockRepository.size;
};

export const remove = (id: string) => {
  stockRepository.delete(id);
};
