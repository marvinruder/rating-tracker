/* istanbul ignore file */
import { StockEntity, stockSchema } from "../../../models/stock.js";
import client from "../../Client.js";

export const stockRepository = client.fetchRepository(stockSchema);

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
