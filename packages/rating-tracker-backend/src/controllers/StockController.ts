import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import exampleStocks from "../exampleStocks.js";
import {
  createStockWithoutReindexing,
  deleteStock,
  readAllStocks,
  indexStockRepository,
  readStockCount,
} from "../redis/repositories/stockRepository.js";

class StockController {
  async getList(req: Request, res: Response) {
    return res.status(200).json({
      stocks: (
        await readAllStocks(
          parseInt(req.query.offset as string),
          parseInt(req.query.count as string)
        )
      ).map((stockEntity) => new Stock(stockEntity)),
      count: await readStockCount(),
    });
  }

  async fillWithExampleData(res: Response) {
    for (const stock of exampleStocks) {
      await createStockWithoutReindexing(stock);
    }
    indexStockRepository();
    return res.status(201).end();
  }

  async delete(req: Request, res: Response) {
    await deleteStock(req.params[0]);
    return res.status(204).end();
  }
}

export default new StockController();
