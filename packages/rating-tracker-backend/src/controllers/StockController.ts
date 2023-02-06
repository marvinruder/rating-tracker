import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import { createResource, readResource } from "../redis/repositories/resource/resourceRepository.js";
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
  isMSCIESGRating,
  isSize,
  isSortableAttribute,
  isStyle,
  msciESGRatingArray,
  Resource,
  sizeArray,
  styleArray,
  WRITE_STOCKS_ACCESS,
} from "rating-tracker-commons";
import APIError from "../lib/apiError.js";
import axios from "axios";

/**
 * This class is responsible for providing stock data.
 */
class StockController {
  /**
   * Returns a list of stocks, which can be filtered, sorted and paginated.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response containing the stock list and the total number of stocks after filtering, but before
   * pagination.
   */
  async getList(req: Request, res: Response) {
    // Read all stocks from Redis
    let stocks = await readAllStocks();

    // Filter the list of stocks
    if (req.query.name) {
      stocks = stocks.filter((stock) =>
        (stock.ticker + " " + stock.name).toLowerCase().includes((req.query.name as string).toLowerCase().trim())
      );
    }
    if (req.query.country) {
      const countryParam = req.query.country;
      if (Array.isArray(countryParam)) {
        // Multiple countries can be specified, one of which must match to the stock’s country.
        const countries: Country[] = [];
        countryParam.forEach((country) => isCountry(country) && countries.push(country));
        stocks = stocks.filter((stock) => countries.includes(stock.country));
      }
    }
    if (req.query.industry) {
      const industryParam = req.query.industry;
      if (Array.isArray(industryParam)) {
        // Multiple industries can be specified, one of which must match to the stock’s industry.
        const industries: Industry[] = [];
        industryParam.forEach((industry) => isIndustry(industry) && industries.push(industry));
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
    if (req.query.starRatingMin !== undefined) {
      const starRatingMin = Number(req.query.starRatingMin);
      if (!Number.isNaN(starRatingMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.starRating ?? -1) >= starRatingMin
        );
      }
    }
    if (req.query.starRatingMax !== undefined) {
      const starRatingMax = Number(req.query.starRatingMax);
      if (!Number.isNaN(starRatingMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.starRating ?? -1) <= starRatingMax
        );
      }
    }
    if (req.query.dividendYieldPercentMin !== undefined) {
      const dividendYieldPercentMin = Number(req.query.dividendYieldPercentMin);
      if (!Number.isNaN(dividendYieldPercentMin)) {
        stocks = stocks.filter(
          (stock) =>
            // larger is better – use -1 as default value
            (stock.dividendYieldPercent ?? -1) >= dividendYieldPercentMin
        );
      }
    }
    if (req.query.dividendYieldPercentMax !== undefined) {
      const dividendYieldPercentMax = Number(req.query.dividendYieldPercentMax);
      if (!Number.isNaN(dividendYieldPercentMax)) {
        stocks = stocks.filter(
          (stock) =>
            // larger is better – use -1 as default value
            (stock.dividendYieldPercent ?? -1) <= dividendYieldPercentMax
        );
      }
    }
    if (req.query.priceEarningRatioMin !== undefined) {
      const priceEarningRatioMin = Number(req.query.priceEarningRatioMin);
      if (!Number.isNaN(priceEarningRatioMin)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.priceEarningRatio ?? Number.MAX_VALUE) >= priceEarningRatioMin
        );
      }
    }
    if (req.query.priceEarningRatioMax !== undefined) {
      const priceEarningRatioMax = Number(req.query.priceEarningRatioMax);
      if (!Number.isNaN(priceEarningRatioMax)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.priceEarningRatio ?? Number.MAX_VALUE) <= priceEarningRatioMax
        );
      }
    }
    if (req.query.morningstarFairValueDiffMin !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMin = Number(req.query.morningstarFairValueDiffMin);
      if (!Number.isNaN(morningstarFairValueDiffMin)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.morningstarFairValue && stock.lastClose
              ? stock.getPercentageToLastClose("morningstarFairValue")
              : Number.MAX_VALUE) >= morningstarFairValueDiffMin
        );
      }
    }
    if (req.query.morningstarFairValueDiffMax !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMax = Number(req.query.morningstarFairValueDiffMax);
      if (!Number.isNaN(morningstarFairValueDiffMax)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.morningstarFairValue && stock.lastClose
              ? stock.getPercentageToLastClose("morningstarFairValue")
              : Number.MAX_VALUE) <= morningstarFairValueDiffMax
        );
      }
    }
    if (req.query.analystConsensusMin !== undefined) {
      const analystConsensusMin = Number(req.query.analystConsensusMin);
      if (!Number.isNaN(analystConsensusMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.analystConsensus ?? -1) >= analystConsensusMin
        );
      }
    }
    if (req.query.analystConsensusMax !== undefined) {
      const analystConsensusMax = Number(req.query.analystConsensusMax);
      if (!Number.isNaN(analystConsensusMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.analystConsensus ?? -1) <= analystConsensusMax
        );
      }
    }
    if (req.query.analystCountMin !== undefined) {
      const analystCountMin = Number(req.query.analystCountMin);
      if (!Number.isNaN(analystCountMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.analystCount ?? -1) >= analystCountMin
        );
      }
    }
    if (req.query.analystCountMax !== undefined) {
      const analystCountMax = Number(req.query.analystCountMax);
      if (!Number.isNaN(analystCountMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.analystCount ?? -1) <= analystCountMax
        );
      }
    }
    if (req.query.analystTargetDiffMin !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMin = Number(req.query.analystTargetDiffMin);
      if (!Number.isNaN(analystTargetDiffMin)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.analystTargetPrice && stock.lastClose
              ? stock.getPercentageToLastClose("analystTargetPrice")
              : Number.MAX_VALUE) >= analystTargetDiffMin
        );
      }
    }
    if (req.query.analystTargetDiffMax !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMax = Number(req.query.analystTargetDiffMax);
      if (!Number.isNaN(analystTargetDiffMax)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.analystTargetPrice && stock.lastClose
              ? stock.getPercentageToLastClose("analystTargetPrice")
              : Number.MAX_VALUE) <= analystTargetDiffMax
        );
      }
    }
    if (req.query.msciESGRatingMin !== undefined) {
      const msciESGRatingMin = req.query.msciESGRatingMin as string;
      if (isMSCIESGRating(msciESGRatingMin)) {
        stocks = stocks.filter(
          (stock) =>
            // Filter by index in array [AAA, ..., CCC]. Smaller is better – use largest number as default value
            (stock.msciESGRating ? msciESGRatingArray.indexOf(stock.msciESGRating) : 7) >=
            msciESGRatingArray.indexOf(msciESGRatingMin)
        );
      }
    }
    if (req.query.msciESGRatingMax !== undefined) {
      const msciESGRatingMax = req.query.msciESGRatingMax as string;
      if (isMSCIESGRating(msciESGRatingMax)) {
        stocks = stocks.filter(
          (stock) =>
            // Filter by index in array [AAA, ..., CCC]. Smaller is better – use largest number as default value
            (stock.msciESGRating ? msciESGRatingArray.indexOf(stock.msciESGRating) : 7) <=
            msciESGRatingArray.indexOf(msciESGRatingMax)
        );
      }
    }
    if (req.query.msciTemperatureMin !== undefined) {
      const msciTemperatureMin = Number(req.query.msciTemperatureMin);
      if (!Number.isNaN(msciTemperatureMin)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.msciTemperature ?? Number.MAX_VALUE) >= msciTemperatureMin
        );
      }
    }
    if (req.query.msciTemperatureMax !== undefined) {
      const msciTemperatureMax = Number(req.query.msciTemperatureMax);
      if (!Number.isNaN(msciTemperatureMax)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.msciTemperature ?? Number.MAX_VALUE) <= msciTemperatureMax
        );
      }
    }
    if (req.query.refinitivESGScoreMin !== undefined) {
      const refinitivESGScoreMin = Number(req.query.refinitivESGScoreMin);
      if (!Number.isNaN(refinitivESGScoreMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.refinitivESGScore ?? -1) >= refinitivESGScoreMin
        );
      }
    }
    if (req.query.refinitivESGScoreMax !== undefined) {
      const refinitivESGScoreMax = Number(req.query.refinitivESGScoreMax);
      if (!Number.isNaN(refinitivESGScoreMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.refinitivESGScore ?? -1) <= refinitivESGScoreMax
        );
      }
    }
    if (req.query.refinitivEmissionsMin !== undefined) {
      const refinitivEmissionsMin = Number(req.query.refinitivEmissionsMin);
      if (!Number.isNaN(refinitivEmissionsMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.refinitivEmissions ?? -1) >= refinitivEmissionsMin
        );
      }
    }
    if (req.query.refinitivEmissionsMax !== undefined) {
      const refinitivEmissionsMax = Number(req.query.refinitivEmissionsMax);
      if (!Number.isNaN(refinitivEmissionsMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.refinitivEmissions ?? -1) <= refinitivEmissionsMax
        );
      }
    }
    if (req.query.spESGScoreMin !== undefined) {
      const spESGScoreMin = Number(req.query.spESGScoreMin);
      if (!Number.isNaN(spESGScoreMin)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.spESGScore ?? -1) >= spESGScoreMin
        );
      }
    }
    if (req.query.spESGScoreMax !== undefined) {
      const spESGScoreMax = Number(req.query.spESGScoreMax);
      if (!Number.isNaN(spESGScoreMax)) {
        stocks = stocks.filter(
          // larger is better – use -1 as default value
          (stock) => (stock.spESGScore ?? -1) <= spESGScoreMax
        );
      }
    }
    if (req.query.sustainalyticsESGRiskMin !== undefined) {
      const sustainalyticsESGRiskMin = Number(req.query.sustainalyticsESGRiskMin);
      if (!Number.isNaN(sustainalyticsESGRiskMin)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE) >= sustainalyticsESGRiskMin
        );
      }
    }
    if (req.query.sustainalyticsESGRiskMax !== undefined) {
      const sustainalyticsESGRiskMax = Number(req.query.sustainalyticsESGRiskMax);
      if (!Number.isNaN(sustainalyticsESGRiskMax)) {
        stocks = stocks.filter(
          (stock) =>
            // smaller is better – use very large number as default value
            (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE) <= sustainalyticsESGRiskMax
        );
      }
    }
    if (req.query.financialScoreMin !== undefined) {
      const financialScoreMin = Number(req.query.financialScoreMin);
      if (!Number.isNaN(financialScoreMin)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getFinancialScore() >= financialScoreMin
        );
      }
    }
    if (req.query.financialScoreMax !== undefined) {
      const financialScoreMax = Number(req.query.financialScoreMax);
      if (!Number.isNaN(financialScoreMax)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getFinancialScore() <= financialScoreMax
        );
      }
    }
    if (req.query.esgScoreMin !== undefined) {
      const esgScoreMin = Number(req.query.esgScoreMin);
      if (!Number.isNaN(esgScoreMin)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getESGScore() >= esgScoreMin
        );
      }
    }
    if (req.query.esgScoreMax !== undefined) {
      const esgScoreMax = Number(req.query.esgScoreMax);
      if (!Number.isNaN(esgScoreMax)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getESGScore() <= esgScoreMax
        );
      }
    }
    if (req.query.totalScoreMin !== undefined) {
      const totalScoreMin = Number(req.query.totalScoreMin);
      if (!Number.isNaN(totalScoreMin)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getTotalScore() >= totalScoreMin
        );
      }
    }
    if (req.query.totalScoreMax !== undefined) {
      const totalScoreMax = Number(req.query.totalScoreMax);
      if (!Number.isNaN(totalScoreMax)) {
        stocks = stocks.filter(
          // score from function is between -1 and 1, filter input is between 0 and 100
          (stock) => 100 * stock.getTotalScore() <= totalScoreMax
        );
      }
    }

    // Count all remaining stocks
    const length = stocks.length;

    // Sort the list of remaining stocks
    const sortBy = req.query.sortBy;
    if (sortBy && typeof sortBy === "string" && isSortableAttribute(sortBy)) {
      switch (sortBy) {
        case "name":
          stocks.sort((a, b) => a.name.localeCompare(b.name, "en", { usage: "sort" }));
          break;
        case "size":
          stocks.sort(
            // Order: Small, Mid, Large
            (a, b) => sizeArray.indexOf(a.size) - sizeArray.indexOf(b.size)
          );
          break;
        case "style":
          stocks.sort(
            // Order: Value, Blend, Growth
            (a, b) => styleArray.indexOf(a.style) - styleArray.indexOf(b.style)
          );
          break;
        case "starRating":
        case "dividendYieldPercent":
        case "analystConsensus":
        case "refinitivESGScore":
        case "refinitivEmissions":
        case "spESGScore":
          // larger is better – use -1 as default value
          stocks.sort((a, b) => (a[sortBy] ?? -1) - (b[sortBy] ?? -1));
          break;
        case "priceEarningRatio":
        case "msciTemperature":
        case "sustainalyticsESGRisk":
          // smaller is better – use very large number as default value
          stocks.sort((a, b) => (a[sortBy] ?? Number.MAX_VALUE) - (b[sortBy] ?? Number.MAX_VALUE));
          break;
        case "morningstarFairValue":
        case "analystTargetPrice":
          // smaller is better – use very large number as default value
          stocks.sort(
            (a, b) =>
              (a[sortBy] && a.lastClose ? a.getPercentageToLastClose(sortBy) : Number.MAX_VALUE) -
              (b[sortBy] && b.lastClose ? b.getPercentageToLastClose(sortBy) : Number.MAX_VALUE)
          );
          break;
        case "52w":
          // sort by relative position of last close in 52W range
          stocks.sort(
            (a, b) =>
              (a.low52w && a.high52w && a.lastClose ? (a.lastClose - a.low52w) / (a.high52w - a.low52w) : 0) -
              (b.low52w && b.high52w && b.lastClose ? (b.lastClose - b.low52w) / (b.high52w - b.low52w) : 0)
          );
          break;
        case "msciESGRating":
          // Sort by index in array [AAA, ..., CCC]. Smaller is better – use largest number as default value
          stocks.sort(
            (a, b) =>
              (a.msciESGRating ? msciESGRatingArray.indexOf(a.msciESGRating) : 7) -
              (b.msciESGRating ? msciESGRatingArray.indexOf(b.msciESGRating) : 7)
          );
          break;
        case "financialScore":
          stocks.sort((a, b) => a.getFinancialScore() - b.getFinancialScore());
          break;
        case "esgScore":
          stocks.sort((a, b) => a.getESGScore() - b.getESGScore());
          break;
        case "totalScore":
          stocks.sort((a, b) => a.getTotalScore() - b.getTotalScore());
          break;
      }
      // We just sorted ascending. If descending is requested, simply reverse the list.
      if (String(req.query.sortDesc).toLowerCase() === "true") {
        stocks.reverse();
      }
    }

    // Only return the subset (= page in list) of stocks requested by offset and count
    let offset: number = parseInt(req.query.offset as string);
    const count: number = parseInt(req.query.count as string);
    if (Number.isNaN(offset)) {
      // If offset is not set, return the first page
      offset = 0;
    }
    stocks = stocks.slice(
      offset,
      // If count is not set, return all remaining stocks
      Number.isNaN(count) ? undefined : offset + count
    );

    // Respond with the list of stocks and the total count after filtering and before pagination
    return res.status(200).json({
      stocks: stocks,
      count: length,
    });
  }

  /**
   * Fetches the logo of a stock from Redis cache or TradeRepublic.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response with the logo of the stock
   */
  async getLogo(req: Request, res: Response) {
    const stock = await readStock(req.params[0]);
    let logoResource: Resource;
    const url = `https://assets.traderepublic.com/img/logos/${stock.isin}/${req.query.dark ? "dark" : "light"}.svg`;
    try {
      // Try to read the logo from Redis cache first.
      logoResource = await readResource(url);
    } catch (e) {
      // If the logo is not in the cache, fetch it from TradeRepublic and store it in the cache.
      await axios
        .get(url)
        .then(async (response) => {
          let maxAge: number;
          try {
            // Cache as long as TradeRepublic says using the max-age cache control directive
            maxAge = +response.headers["cache-control"].match(/max-age=(\d+)/)[1];
            /* istanbul ignore next */ // Difficult to test, since TradeRepublic always returns a valid max-age
            if (Number.isNaN(maxAge)) {
              throw new TypeError();
            }
          } catch (e) {
            /* istanbul ignore next */ // Difficult to test, since TradeRepublic always returns a valid max-age
            maxAge = 60 * 60 * 24;
          }
          // Store the logo in the cache
          await createResource(
            {
              url,
              fetchDate: new Date(response.headers["date"]),
              content: response.data,
            },
            maxAge
          );
          // Read the logo as a Resource object
          logoResource = await readResource(url);
        })
        .catch(async () => {
          // If the logo could not be fetched from TradeRepublic, use an empty SVG as a placeholder.
          await createResource(
            {
              url,
              fetchDate: new Date(),
              content:
                `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">` +
                `</svg>`,
            },
            60 * 60 * 24
          );
          logoResource = await readResource(url);
        });
    }
    res.set("Content-Type", "image/svg+xml");
    res.set(
      "Cache-Control",
      `max-age=${
        // Allow client-side caching as long as the logo is valid in the cache
        (60 * 60 * 24 - (new Date().getTime() - logoResource.fetchDate.getTime()) / 1000) | 0
      }`
    );
    return res.status(200).send(logoResource.content);
  }

  /**
   * Reads a single stock from Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response with the stock
   */
  async get(req: Request, res: Response) {
    const stock = await readStock(req.params[0]);
    return res.status(200).json(stock);
  }

  /**
   * Creates a new stock in Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a 201 response if the stock was created successfully
   * @throws an {@link APIError} if a stock with the same ticker already exists
   */
  async put(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessTo(WRITE_STOCKS_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to create stocks.");
    }
    const ticker = req.params[0];
    const { name, country, isin } = req.query;
    if (
      typeof ticker === "string" &&
      typeof name === "string" &&
      typeof country === "string" &&
      isCountry(country) &&
      typeof isin === "string"
    ) {
      if (await createStock(new Stock({ ticker, name, country, isin }))) {
        return res.status(201).end();
      } else {
        throw new APIError(409, "A stock with that ticker exists already.");
      }
    }
  }

  /**
   * Updates a stock in Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a 204 response if the stock was updated successfully
   */
  async patch(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessTo(WRITE_STOCKS_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to update stocks.");
    }
    const ticker = req.params[0];
    const { name, country, morningstarId, marketScreenerId, msciId, ric, spId, sustainalyticsId } = req.query;
    if (
      typeof ticker === "string" &&
      (typeof name === "string" || typeof name === "undefined") &&
      ((typeof country === "string" && isCountry(country)) || typeof country === "undefined") &&
      (typeof morningstarId === "string" || typeof morningstarId === "undefined") &&
      (typeof marketScreenerId === "string" || typeof marketScreenerId === "undefined") &&
      (typeof msciId === "string" || typeof msciId === "undefined") &&
      (typeof ric === "string" || typeof ric === "undefined") &&
      (typeof spId === "number" || typeof spId === "undefined") &&
      (typeof sustainalyticsId === "string" || typeof sustainalyticsId === "undefined")
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

  /**
   * Deletes a stock from Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a 204 response if the stock was deleted successfully
   */
  async delete(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessTo(WRITE_STOCKS_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to delete stocks.");
    }
    await deleteStock(req.params[0]);
    return res.status(204).end();
  }
}

export default new StockController();
