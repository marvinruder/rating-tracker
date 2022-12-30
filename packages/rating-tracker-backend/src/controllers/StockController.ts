import { Request, Response } from "express";
import { Stock } from "../models/stock.js";
import {
  createResource,
  readResource,
} from "../redis/repositories/resource/resourceRepository.js";
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
} from "rating-tracker-commons";
import APIError from "../lib/apiError.js";
import axios from "axios";

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
    if (req.query.starRatingMin !== undefined) {
      const starRatingMin = Number(req.query.starRatingMin);
      if (!isNaN(starRatingMin)) {
        stocks = stocks.filter(
          (stock) => (stock.starRating ?? -1) >= starRatingMin
        );
      }
    }
    if (req.query.starRatingMax !== undefined) {
      const starRatingMax = Number(req.query.starRatingMax);
      if (!isNaN(starRatingMax)) {
        stocks = stocks.filter(
          (stock) => (stock.starRating ?? -1) <= starRatingMax
        );
      }
    }
    if (req.query.dividendYieldPercentMin !== undefined) {
      const dividendYieldPercentMin = Number(req.query.dividendYieldPercentMin);
      if (!isNaN(dividendYieldPercentMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.dividendYieldPercent ?? -1) >= dividendYieldPercentMin
        );
      }
    }
    if (req.query.dividendYieldPercentMax !== undefined) {
      const dividendYieldPercentMax = Number(req.query.dividendYieldPercentMax);
      if (!isNaN(dividendYieldPercentMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.dividendYieldPercent ?? -1) <= dividendYieldPercentMax
        );
      }
    }
    if (req.query.priceEarningRatioMin !== undefined) {
      const priceEarningRatioMin = Number(req.query.priceEarningRatioMin);
      if (!isNaN(priceEarningRatioMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.priceEarningRatio ?? Number.MAX_VALUE) >=
            priceEarningRatioMin
        );
      }
    }
    if (req.query.priceEarningRatioMax !== undefined) {
      const priceEarningRatioMax = Number(req.query.priceEarningRatioMax);
      if (!isNaN(priceEarningRatioMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.priceEarningRatio ?? Number.MAX_VALUE) <=
            priceEarningRatioMax
        );
      }
    }
    if (req.query.morningstarFairValueDiffMin !== undefined) {
      const morningstarFairValueDiffMin = Number(
        req.query.morningstarFairValueDiffMin
      );
      if (!isNaN(morningstarFairValueDiffMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.morningstarFairValue && stock.lastClose
              ? stock.getPercentageToLastClose("morningstarFairValue")
              : Number.MAX_VALUE) >= morningstarFairValueDiffMin
        );
      }
    }
    if (req.query.morningstarFairValueDiffMax !== undefined) {
      const morningstarFairValueDiffMax = Number(
        req.query.morningstarFairValueDiffMax
      );
      if (!isNaN(morningstarFairValueDiffMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.morningstarFairValue && stock.lastClose
              ? stock.getPercentageToLastClose("morningstarFairValue")
              : Number.MAX_VALUE) <= morningstarFairValueDiffMax
        );
      }
    }
    if (req.query.analystConsensusMin !== undefined) {
      const analystConsensusMin = Number(req.query.analystConsensusMin);
      if (!isNaN(analystConsensusMin)) {
        stocks = stocks.filter(
          (stock) => (stock.analystConsensus ?? -1) >= analystConsensusMin
        );
      }
    }
    if (req.query.analystConsensusMax !== undefined) {
      const analystConsensusMax = Number(req.query.analystConsensusMax);
      if (!isNaN(analystConsensusMax)) {
        stocks = stocks.filter(
          (stock) => (stock.analystConsensus ?? -1) <= analystConsensusMax
        );
      }
    }
    if (req.query.analystCountMin !== undefined) {
      const analystCountMin = Number(req.query.analystCountMin);
      if (!isNaN(analystCountMin)) {
        stocks = stocks.filter(
          (stock) => (stock.analystCount ?? -1) >= analystCountMin
        );
      }
    }
    if (req.query.analystCountMax !== undefined) {
      const analystCountMax = Number(req.query.analystCountMax);
      if (!isNaN(analystCountMax)) {
        stocks = stocks.filter(
          (stock) => (stock.analystCount ?? -1) <= analystCountMax
        );
      }
    }
    if (req.query.analystTargetDiffMin !== undefined) {
      const analystTargetDiffMin = Number(req.query.analystTargetDiffMin);
      if (!isNaN(analystTargetDiffMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.analystTargetPrice && stock.lastClose
              ? stock.getPercentageToLastClose("analystTargetPrice")
              : Number.MAX_VALUE) >= analystTargetDiffMin
        );
      }
    }
    if (req.query.analystTargetDiffMax !== undefined) {
      const analystTargetDiffMax = Number(req.query.analystTargetDiffMax);
      if (!isNaN(analystTargetDiffMax)) {
        stocks = stocks.filter(
          (stock) =>
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
            (stock.msciESGRating
              ? msciESGRatingArray.indexOf(stock.msciESGRating)
              : 7) >= msciESGRatingArray.indexOf(msciESGRatingMin)
        );
      }
    }
    if (req.query.msciESGRatingMax !== undefined) {
      const msciESGRatingMax = req.query.msciESGRatingMax as string;
      if (isMSCIESGRating(msciESGRatingMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.msciESGRating
              ? msciESGRatingArray.indexOf(stock.msciESGRating)
              : 7) <= msciESGRatingArray.indexOf(msciESGRatingMax)
        );
      }
    }
    if (req.query.msciTemperatureMin !== undefined) {
      const msciTemperatureMin = Number(req.query.msciTemperatureMin);
      if (!isNaN(msciTemperatureMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.msciTemperature ?? Number.MAX_VALUE) >= msciTemperatureMin
        );
      }
    }
    if (req.query.msciTemperatureMax !== undefined) {
      const msciTemperatureMax = Number(req.query.msciTemperatureMax);
      if (!isNaN(msciTemperatureMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.msciTemperature ?? Number.MAX_VALUE) <= msciTemperatureMax
        );
      }
    }
    if (req.query.refinitivESGScoreMin !== undefined) {
      const refinitivESGScoreMin = Number(req.query.refinitivESGScoreMin);
      if (!isNaN(refinitivESGScoreMin)) {
        stocks = stocks.filter(
          (stock) => (stock.refinitivESGScore ?? -1) >= refinitivESGScoreMin
        );
      }
    }
    if (req.query.refinitivESGScoreMax !== undefined) {
      const refinitivESGScoreMax = Number(req.query.refinitivESGScoreMax);
      if (!isNaN(refinitivESGScoreMax)) {
        stocks = stocks.filter(
          (stock) => (stock.refinitivESGScore ?? -1) <= refinitivESGScoreMax
        );
      }
    }
    if (req.query.refinitivEmissionsMin !== undefined) {
      const refinitivEmissionsMin = Number(req.query.refinitivEmissionsMin);
      if (!isNaN(refinitivEmissionsMin)) {
        stocks = stocks.filter(
          (stock) => (stock.refinitivEmissions ?? -1) >= refinitivEmissionsMin
        );
      }
    }
    if (req.query.refinitivEmissionsMax !== undefined) {
      const refinitivEmissionsMax = Number(req.query.refinitivEmissionsMax);
      if (!isNaN(refinitivEmissionsMax)) {
        stocks = stocks.filter(
          (stock) => (stock.refinitivEmissions ?? -1) <= refinitivEmissionsMax
        );
      }
    }
    if (req.query.spESGScoreMin !== undefined) {
      const spESGScoreMin = Number(req.query.spESGScoreMin);
      if (!isNaN(spESGScoreMin)) {
        stocks = stocks.filter(
          (stock) => (stock.spESGScore ?? -1) >= spESGScoreMin
        );
      }
    }
    if (req.query.spESGScoreMax !== undefined) {
      const spESGScoreMax = Number(req.query.spESGScoreMax);
      if (!isNaN(spESGScoreMax)) {
        stocks = stocks.filter(
          (stock) => (stock.spESGScore ?? -1) <= spESGScoreMax
        );
      }
    }
    if (req.query.sustainalyticsESGRiskMin !== undefined) {
      const sustainalyticsESGRiskMin = Number(
        req.query.sustainalyticsESGRiskMin
      );
      if (!isNaN(sustainalyticsESGRiskMin)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE) >=
            sustainalyticsESGRiskMin
        );
      }
    }
    if (req.query.sustainalyticsESGRiskMax !== undefined) {
      const sustainalyticsESGRiskMax = Number(
        req.query.sustainalyticsESGRiskMax
      );
      if (!isNaN(sustainalyticsESGRiskMax)) {
        stocks = stocks.filter(
          (stock) =>
            (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE) <=
            sustainalyticsESGRiskMax
        );
      }
    }
    if (req.query.financialScoreMin !== undefined) {
      const financialScoreMin = Number(req.query.financialScoreMin);
      if (!isNaN(financialScoreMin)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getFinancialScore() >= financialScoreMin
        );
      }
    }
    if (req.query.financialScoreMax !== undefined) {
      const financialScoreMax = Number(req.query.financialScoreMax);
      if (!isNaN(financialScoreMax)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getFinancialScore() <= financialScoreMax
        );
      }
    }
    if (req.query.esgScoreMin !== undefined) {
      const esgScoreMin = Number(req.query.esgScoreMin);
      if (!isNaN(esgScoreMin)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getESGScore() >= esgScoreMin
        );
      }
    }
    if (req.query.esgScoreMax !== undefined) {
      const esgScoreMax = Number(req.query.esgScoreMax);
      if (!isNaN(esgScoreMax)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getESGScore() <= esgScoreMax
        );
      }
    }
    if (req.query.totalScoreMin !== undefined) {
      const totalScoreMin = Number(req.query.totalScoreMin);
      if (!isNaN(totalScoreMin)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getTotalScore() >= totalScoreMin
        );
      }
    }
    if (req.query.totalScoreMax !== undefined) {
      const totalScoreMax = Number(req.query.totalScoreMax);
      if (!isNaN(totalScoreMax)) {
        stocks = stocks.filter(
          (stock) => 100 * stock.getTotalScore() <= totalScoreMax
        );
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
          stocks.sort((a, b) => (a[sortBy] ?? -1) - (b[sortBy] ?? -1));
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
              (a[sortBy] && a.lastClose
                ? a.getPercentageToLastClose(sortBy)
                : /* istanbul ignore next */
                  Number.MAX_VALUE) -
              (b[sortBy] && b.lastClose
                ? b.getPercentageToLastClose(sortBy)
                : /* istanbul ignore next */
                  Number.MAX_VALUE)
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

  async getLogo(req: Request, res: Response) {
    const stock = await readStock(req.params[0]);
    let logoResource: Resource;
    const url = `https://assets.traderepublic.com/img/logos/${stock.isin}/${
      req.query.dark ? "dark" : "light"
    }.svg`;
    try {
      logoResource = await readResource(url);
    } catch (e) {
      await axios
        .get(url)
        .then(async (response) => {
          let maxAge: number;
          try {
            maxAge =
              +response.headers["cache-control"].match(/max-age=(\d+)/)[1];
            /* istanbul ignore next */
            if (isNaN(maxAge)) {
              throw new TypeError();
            }
          } catch (e) {
            /* istanbul ignore next */
            maxAge = 60 * 60 * 24;
          }
          await createResource(
            {
              url,
              fetchDate: new Date(response.headers["date"]),
              content: response.data,
            },
            maxAge
          );
          logoResource = await readResource(url);
        })
        .catch(async () => {
          await createResource(
            {
              url,
              fetchDate: new Date(),
              content: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`,
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
        (60 * 60 * 24 -
          (new Date().getTime() - logoResource.fetchDate.getTime()) / 1000) |
        0
      }`
    );
    return res.status(200).send(logoResource.content);
  }

  async get(req: Request, res: Response) {
    const stock = await readStock(req.params[0]);
    return res.status(200).json(stock);
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
      if (await createStock(new Stock({ ticker, name, country, isin }))) {
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
