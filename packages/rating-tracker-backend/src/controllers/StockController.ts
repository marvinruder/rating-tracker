import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import exampleStocks from "../lib/exampleStocks.js";
import {
  createStock,
  deleteStock,
  readAllStocks,
  updateStock,
  readStock,
} from "../redis/repositories/stock/stockRepository.js";
import {
  Country,
  Industry,
  isCountry,
  isIndustry,
  isSize,
  isSortableAttribute,
  isStyle,
  msciESGRatingArray,
  sizeArray,
  styleArray,
} from "rating-tracker-commons";
import APIError from "../lib/apiError.js";

class StockController {
  async get(req: Request, res: Response) {
    const stock = await readStock(req.params[0]);
    return res.status(200).json(stock);
  }

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
    const sortBy = req.query.sortBy;
    if (sortBy && typeof sortBy === "string" && isSortableAttribute(sortBy)) {
      switch (sortBy) {
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
        case "dividendYieldPercent":
        case "analystConsensus":
        case "refinitivESGScore":
        case "refinitivEmissions":
        case "spESGScore":
          stocks.sort((a, b) => (a[sortBy] ?? 0) - (b[sortBy] ?? 0));
          break;
        case "priceEarningRatio":
        case "msciTemperature":
        case "sustainalyticsESGRisk":
          stocks.sort(
            (a, b) =>
              (a[sortBy] ?? Number.MAX_VALUE) - (b[sortBy] ?? Number.MAX_VALUE)
          );
          break;
        case "morningstarFairValue":
        case "analystTargetPrice":
          stocks.sort(
            (a, b) =>
              (a[sortBy] && a.lastClose ? a.lastClose / a[sortBy] : 0) -
              (b[sortBy] && b.lastClose ? b.lastClose / b[sortBy] : 0)
          );
          break;
        case "52w":
          stocks.sort(
            (a, b) =>
              (a.low52w && a.high52w && a.lastClose
                ? (a.lastClose - a.low52w) / (a.high52w - a.low52w)
                : /* istanbul ignore next */
                  0) -
              (b.low52w && b.high52w && b.lastClose
                ? (b.lastClose - b.low52w) / (b.high52w - b.low52w)
                : /* istanbul ignore next */
                  0)
          );
          break;
        case "msciESGRating":
          stocks.sort(
            (a, b) =>
              (a.msciESGRating
                ? msciESGRatingArray.indexOf(a.msciESGRating)
                : 7) -
              (b.msciESGRating
                ? msciESGRatingArray.indexOf(b.msciESGRating)
                : 7)
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
      await createStock(stock);
    }
    return res.status(201).end();
  }

  async put(req: Request, res: Response) {
    const ticker = req.params[0];
    const { name, country, isin } = req.query;
    if (
      typeof ticker === "string" &&
      typeof name === "string" &&
      typeof country === "string" &&
      isCountry(country) &&
      typeof isin === "string"
    ) {
      if (await createStock({ ticker, name, country, isin })) {
        return res.status(201).end();
      } else {
        throw new APIError(409, "A stock with that ticker exists already.");
      }
    }
  }

  async patch(req: Request, res: Response) {
    const ticker = req.params[0];
    const {
      name,
      country,
      morningstarId,
      marketScreenerId,
      msciId,
      ric,
      spId,
      sustainalyticsId,
    } = req.query;
    if (
      typeof ticker === "string" &&
      (typeof name === "string" || typeof name === "undefined") &&
      ((typeof country === "string" && isCountry(country)) ||
        typeof country === "undefined") &&
      (typeof morningstarId === "string" ||
        typeof morningstarId === "undefined") &&
      (typeof marketScreenerId === "string" ||
        typeof marketScreenerId === "undefined") &&
      (typeof msciId === "string" || typeof msciId === "undefined") &&
      (typeof ric === "string" || typeof ric === "undefined") &&
      (typeof spId === "number" || typeof spId === "undefined") &&
      (typeof sustainalyticsId === "string" ||
        typeof sustainalyticsId === "undefined")
    ) {
      await updateStock(ticker, {
        name,
        country,
        morningstarId,
        marketScreenerId,
        msciId,
        ric,
        spId,
        sustainalyticsId,
      });
      return res.status(204).end();
    }
  }

  async delete(req: Request, res: Response) {
    await deleteStock(req.params[0]);
    return res.status(204).end();
  }
}

export default new StockController();
