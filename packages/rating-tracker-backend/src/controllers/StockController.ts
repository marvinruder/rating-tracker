import { Request, Response } from "express";
import APIError from "src/apiError";
import exampleStocks from "src/exampleStocks";

class StockController {
  getList() {
    return exampleStocks.map((stock) => stock.ticker);
  }

  getDetails(req: Request, res: Response) {
    const stocks = exampleStocks.filter((stock) =>
      req.params[0].split(",").includes(stock.ticker)
    );
    req.params[0].split(",").forEach((ticker) => {
      if (!stocks.some((stock) => stock.ticker == ticker)) {
        throw new APIError(404, `Ticker ${ticker} not found.`);
      }
    });
    return res.status(200).json(stocks);
  }
}

export = new StockController();
