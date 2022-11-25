import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import exampleStocks from "../lib/exampleStocks.js";
import {
  createStockWithoutReindexing,
  deleteStock,
  readAllStocks,
  indexStockRepository,
  createStock,
} from "../redis/repositories/stock/stockRepository.js";
import {
  Country,
  Industry,
  isCountry,
  isIndustry,
  isSize,
  isStyle,
  sizeArray,
  SortableAttribute,
  styleArray,
} from "rating-tracker-commons";
import APIError from "../lib/apiError.js";

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
      const countryParam = req.query.country;
      if (Array.isArray(countryParam)) {
        const countries: Country[] = [];
        countryParam.forEach(
          (country) => isCountry(country) && countries.push(country)
        );
        stocks = stocks.filter((stock) => countries.includes(stock.country));
      }
    }
    if (req.query.industry) {
      const industryParam = req.query.industry;
      if (Array.isArray(industryParam)) {
        const industries: Industry[] = [];
        industryParam.forEach(
          (industry) => isIndustry(industry) && industries.push(industry)
        );
        stocks = stocks.filter((stock) => industries.includes(stock.industry));
      }
    }
    if (req.query.size) {
      const size = req.query.size;
      if (typeof size === "string" && isSize(size)) {
        stocks = stocks.filter((stock) => size === stock.size);
      }
    }
    if (req.query.style) {
      const style = req.query.style;
      if (typeof style === "string" && isStyle(style)) {
        stocks = stocks.filter((stock) => style === stock.style);
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
            (a, b) => sizeArray.indexOf(a.size) - sizeArray.indexOf(b.size)
          );
          break;
        case "style":
          stocks.sort(
            (a, b) => styleArray.indexOf(a.style) - styleArray.indexOf(b.style)
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

  async put(req: Request, res: Response) {
    const ticker = req.params[0];
    const { name, country } = req.query;
    if (
      typeof ticker === "string" &&
      typeof name === "string" &&
      typeof country === "string" &&
      isCountry(country)
    ) {
      if (await createStock({ ticker, name, country })) {
        return res.status(201).end();
      } else {
        throw new APIError(409, "A stock with that ticker exists already.");
      }
    }
  }

  async delete(req: Request, res: Response) {
    await deleteStock(req.params[0]);
    return res.status(204).end();
  }
}

export default new StockController();
