import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import exampleStocks from "../exampleStocks.js";
import {
  createStockWithoutReindexing,
  deleteStock,
  readAllStocks,
  indexStockRepository,
} from "../redis/repositories/stockRepository.js";
import { Industry } from "../enums/industry.js";
import { Country } from "../enums/country.js";
import { Size } from "../enums/size.js";
import { Style } from "../enums/style.js";
import { SortableAttribute } from "../types.js";

class StockController {
  async getList(req: Request, res: Response) {
    let stocks = (await readAllStocks()).map(
      (stockEntity) => new Stock(stockEntity)
    );

    // Filtering
    if (req.query.name) {
      stocks = stocks.filter((stock) =>
        stock.name
          .toLowerCase()
          .includes((req.query.name as string).toLowerCase())
      );
    }
    if (req.query.country) {
      const countries = req.query.country;
      if (typeof countries !== "string") {
        stocks = stocks.filter((stock) =>
          (countries as Country[]).includes(stock.country)
        );
      }
    }
    if (req.query.industry) {
      const industries = req.query.industry;
      if (typeof industries !== "string") {
        stocks = stocks.filter((stock) =>
          (industries as Industry[]).includes(stock.industry)
        );
      }
    }
    if (req.query.size) {
      const size = req.query.size;
      if (typeof size === "string") {
        stocks = stocks.filter((stock) => (size as Size) === stock.size);
      }
    }
    if (req.query.style) {
      const style = req.query.style;
      if (typeof style === "string") {
        stocks = stocks.filter((stock) => (style as Style) === stock.style);
      }
    }

    // Counting
    const length = stocks.length;

    // Sorting
    if (req.query.sortBy) {
      switch (req.query.sortBy as SortableAttribute) {
        case "name":
          stocks.sort((a, b) =>
            a.name.localeCompare(b.name, "en", { usage: "sort" })
          );
          break;
        case "size":
          stocks.sort(
            (a, b) =>
              [Size.Small, Size.Mid, Size.Large].indexOf(a.size) -
              [Size.Small, Size.Mid, Size.Large].indexOf(b.size)
          );
          break;
        case "style":
          stocks.sort(
            (a, b) =>
              [Style.Value, Style.Blend, Style.Growth].indexOf(a.style) -
              [Style.Value, Style.Blend, Style.Growth].indexOf(b.style)
          );
          break;
        case "starRating":
          stocks.sort((a, b) => (a.starRating ?? 0) - (b.starRating ?? 0));
          break;
        case "dividendYieldPercent":
          stocks.sort(
            (a, b) =>
              (a.dividendYieldPercent ?? 0) - (b.dividendYieldPercent ?? 0)
          );
          break;
        case "priceEarningRatio":
          stocks.sort(
            (a, b) => (a.priceEarningRatio ?? 0) - (b.priceEarningRatio ?? 0)
          );
          break;
      }
      if (String(req.query.sortDesc).toLowerCase() === "true") {
        stocks.reverse();
      }
    }

    // Pagination
    let offset: number = parseInt(req.query.offset as string);
    const count: number = parseInt(req.query.count as string);
    if (isNaN(offset)) {
      offset = 0;
    }
    stocks = stocks.slice(offset, isNaN(count) ? undefined : offset + count);

    return res.status(200).json({
      stocks: stocks,
      count: length,
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
