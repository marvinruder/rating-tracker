import { StockEntity, stockSchema } from "../../../../models/stock.js";
import exampleStocks from "../../../../lib/exampleStocks.js";

let stockRepository: Map<string, StockEntity>;

export const initStockRepository = () => {
  stockRepository = new Map<string, StockEntity>(
    exampleStocks.map((stock) => [
      stock.ticker,
      new StockEntity(stockSchema, stock.ticker, { ...stock }),
    ])
  );
};

initStockRepository();

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
