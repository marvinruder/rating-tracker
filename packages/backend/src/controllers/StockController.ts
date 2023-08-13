import { Request, Response } from "express";
import { createResource, readResource } from "../redis/repositories/resourceRepository";
import { createStock, deleteStock, readAllStocks, updateStock, readStock } from "../db/tables/stockTable";
import {
  Country,
  GENERAL_ACCESS,
  Industry,
  isCountry,
  isIndustry,
  isMSCIESGRating,
  isSize,
  isSortableAttribute,
  isStyle,
  msciESGRatingArray,
  optionalStockValuesNull,
  Resource,
  stockComputeEndpointPath,
  stockEndpointPath,
  stockListEndpointPath,
  stockLogoEndpointPath,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import APIError from "../utils/apiError";
import axios from "axios";
import Router from "../utils/router";
import { Prisma } from "../../prisma/client/index";
import { readWatchlist } from "../db/tables/watchlistTable";

/**
 * This class is responsible for handling stock data.
 */
export class StockController {
  /**
   * Returns a list of stocks, which can be filtered, sorted and paginated.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockListEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getList(req: Request, res: Response) {
    const filters: Prisma.Enumerable<Prisma.StockWhereInput> = [];
    const stockFindManyArgs: Prisma.StockFindManyArgs = {
      where: {
        AND: filters,
      },
    };

    if (req.query.name) {
      filters.push({
        OR: [
          {
            ticker: {
              startsWith: (req.query.name as string).trim(),
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: (req.query.name as string).trim(),
              mode: "insensitive",
            },
          },
        ],
      });
    }

    if (req.query.country) {
      const countryParam = req.query.country;
      if (Array.isArray(countryParam)) {
        const countries: Country[] = [];
        countryParam.forEach((country) => isCountry(country) && countries.push(country));
        // Multiple countries can be specified, one of which must match to the stock’s country.
        filters.push({
          country: {
            in: countries,
          },
        });
      }
    }

    if (req.query.industry) {
      const industryParam = req.query.industry;
      if (Array.isArray(industryParam)) {
        const industries: Industry[] = [];
        industryParam.forEach((industry) => isIndustry(industry) && industries.push(industry));
        // Multiple industries can be specified, one of which must match to the stock’s industry.
        filters.push({
          industry: {
            in: industries,
          },
        });
      }
    }

    if (req.query.size) {
      const size = req.query.size;
      if (typeof size === "string" && isSize(size)) {
        filters.push({
          size: {
            equals: size,
          },
        });
      }
    }

    if (req.query.style) {
      const style = req.query.style;
      if (typeof style === "string" && isStyle(style)) {
        filters.push({
          style: {
            equals: style,
          },
        });
      }
    }

    if (req.query.starRatingMin !== undefined) {
      const starRatingMin = Number(req.query.starRatingMin);
      if (!Number.isNaN(starRatingMin)) {
        filters.push({
          starRating: {
            gte: starRatingMin,
          },
        });
      }
    }
    if (req.query.starRatingMax !== undefined) {
      const starRatingMax = Number(req.query.starRatingMax);
      if (!Number.isNaN(starRatingMax)) {
        filters.push({
          starRating: {
            lte: starRatingMax,
          },
        });
      }
    }

    if (req.query.dividendYieldPercentMin !== undefined) {
      const dividendYieldPercentMin = Number(req.query.dividendYieldPercentMin);
      if (!Number.isNaN(dividendYieldPercentMin)) {
        filters.push({
          dividendYieldPercent: {
            gte: dividendYieldPercentMin,
          },
        });
      }
    }
    if (req.query.dividendYieldPercentMax !== undefined) {
      const dividendYieldPercentMax = Number(req.query.dividendYieldPercentMax);
      if (!Number.isNaN(dividendYieldPercentMax)) {
        filters.push({
          dividendYieldPercent: {
            lte: dividendYieldPercentMax,
          },
        });
      }
    }

    if (req.query.priceEarningRatioMin !== undefined) {
      const priceEarningRatioMin = Number(req.query.priceEarningRatioMin);
      if (!Number.isNaN(priceEarningRatioMin)) {
        filters.push({
          priceEarningRatio: {
            gte: priceEarningRatioMin,
          },
        });
      }
    }
    if (req.query.priceEarningRatioMax !== undefined) {
      const priceEarningRatioMax = Number(req.query.priceEarningRatioMax);
      if (!Number.isNaN(priceEarningRatioMax)) {
        filters.push({
          priceEarningRatio: {
            lte: priceEarningRatioMax,
          },
        });
      }
    }

    if (req.query.morningstarFairValueDiffMin !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMin = Number(req.query.morningstarFairValueDiffMin);
      if (!Number.isNaN(morningstarFairValueDiffMin)) {
        filters.push({
          morningstarFairValuePercentageToLastClose: {
            gte: morningstarFairValueDiffMin,
          },
        });
      }
    }
    if (req.query.morningstarFairValueDiffMax !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMax = Number(req.query.morningstarFairValueDiffMax);
      if (!Number.isNaN(morningstarFairValueDiffMax)) {
        filters.push({
          morningstarFairValuePercentageToLastClose: {
            lte: morningstarFairValueDiffMax,
          },
        });
      }
    }

    if (req.query.analystConsensusMin !== undefined) {
      const analystConsensusMin = Number(req.query.analystConsensusMin);
      if (!Number.isNaN(analystConsensusMin)) {
        filters.push({
          analystConsensus: {
            gte: analystConsensusMin,
          },
        });
      }
    }
    if (req.query.analystConsensusMax !== undefined) {
      const analystConsensusMax = Number(req.query.analystConsensusMax);
      if (!Number.isNaN(analystConsensusMax)) {
        filters.push({
          analystConsensus: {
            lte: analystConsensusMax,
          },
        });
      }
    }

    if (req.query.analystCountMin !== undefined) {
      const analystCountMin = Number(req.query.analystCountMin);
      if (!Number.isNaN(analystCountMin)) {
        filters.push({
          analystCount: {
            gte: analystCountMin,
          },
        });
      }
    }
    if (req.query.analystCountMax !== undefined) {
      const analystCountMax = Number(req.query.analystCountMax);
      if (!Number.isNaN(analystCountMax)) {
        filters.push({
          analystCount: {
            lte: analystCountMax,
          },
        });
      }
    }

    if (req.query.analystTargetDiffMin !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMin = Number(req.query.analystTargetDiffMin);
      if (!Number.isNaN(analystTargetDiffMin)) {
        filters.push({
          analystTargetPricePercentageToLastClose: {
            gte: analystTargetDiffMin,
          },
        });
      }
    }
    if (req.query.analystTargetDiffMax !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMax = Number(req.query.analystTargetDiffMax);
      if (!Number.isNaN(analystTargetDiffMax)) {
        filters.push({
          analystTargetPricePercentageToLastClose: {
            lte: analystTargetDiffMax,
          },
        });
      }
    }

    let filteredMSCIESGRatingArray = [...msciESGRatingArray];
    if (req.query.msciESGRatingMin !== undefined) {
      const msciESGRatingMin = req.query.msciESGRatingMin as string;
      if (isMSCIESGRating(msciESGRatingMin)) {
        filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
          (msciESGRating) => msciESGRatingArray.indexOf(msciESGRating) >= msciESGRatingArray.indexOf(msciESGRatingMin),
        );
      }
    }
    if (req.query.msciESGRatingMax !== undefined) {
      const msciESGRatingMax = req.query.msciESGRatingMax as string;
      if (isMSCIESGRating(msciESGRatingMax)) {
        filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
          (msciESGRating) => msciESGRatingArray.indexOf(msciESGRating) <= msciESGRatingArray.indexOf(msciESGRatingMax),
        );
      }
    }
    if (msciESGRatingArray.some((msciESGRating) => !filteredMSCIESGRatingArray.includes(msciESGRating))) {
      filters.push({
        msciESGRating: {
          in: filteredMSCIESGRatingArray,
        },
      });
    }

    if (req.query.msciTemperatureMin !== undefined) {
      const msciTemperatureMin = Number(req.query.msciTemperatureMin);
      if (!Number.isNaN(msciTemperatureMin)) {
        filters.push({
          msciTemperature: {
            gte: msciTemperatureMin,
          },
        });
      }
    }
    if (req.query.msciTemperatureMax !== undefined) {
      const msciTemperatureMax = Number(req.query.msciTemperatureMax);
      if (!Number.isNaN(msciTemperatureMax)) {
        filters.push({
          msciTemperature: {
            lte: msciTemperatureMax,
          },
        });
      }
    }

    if (req.query.refinitivESGScoreMin !== undefined) {
      const refinitivESGScoreMin = Number(req.query.refinitivESGScoreMin);
      if (!Number.isNaN(refinitivESGScoreMin)) {
        filters.push({
          refinitivESGScore: {
            gte: refinitivESGScoreMin,
          },
        });
      }
    }
    if (req.query.refinitivESGScoreMax !== undefined) {
      const refinitivESGScoreMax = Number(req.query.refinitivESGScoreMax);
      if (!Number.isNaN(refinitivESGScoreMax)) {
        filters.push({
          refinitivESGScore: {
            lte: refinitivESGScoreMax,
          },
        });
      }
    }

    if (req.query.refinitivEmissionsMin !== undefined) {
      const refinitivEmissionsMin = Number(req.query.refinitivEmissionsMin);
      if (!Number.isNaN(refinitivEmissionsMin)) {
        filters.push({
          refinitivEmissions: {
            gte: refinitivEmissionsMin,
          },
        });
      }
    }
    if (req.query.refinitivEmissionsMax !== undefined) {
      const refinitivEmissionsMax = Number(req.query.refinitivEmissionsMax);
      if (!Number.isNaN(refinitivEmissionsMax)) {
        filters.push({
          refinitivEmissions: {
            lte: refinitivEmissionsMax,
          },
        });
      }
    }

    if (req.query.spESGScoreMin !== undefined) {
      const spESGScoreMin = Number(req.query.spESGScoreMin);
      if (!Number.isNaN(spESGScoreMin)) {
        filters.push({
          spESGScore: {
            gte: spESGScoreMin,
          },
        });
      }
    }
    if (req.query.spESGScoreMax !== undefined) {
      const spESGScoreMax = Number(req.query.spESGScoreMax);
      if (!Number.isNaN(spESGScoreMax)) {
        filters.push({
          spESGScore: {
            lte: spESGScoreMax,
          },
        });
      }
    }

    if (req.query.sustainalyticsESGRiskMin !== undefined) {
      const sustainalyticsESGRiskMin = Number(req.query.sustainalyticsESGRiskMin);
      if (!Number.isNaN(sustainalyticsESGRiskMin)) {
        filters.push({
          sustainalyticsESGRisk: {
            gte: sustainalyticsESGRiskMin,
          },
        });
      }
    }
    if (req.query.sustainalyticsESGRiskMax !== undefined) {
      const sustainalyticsESGRiskMax = Number(req.query.sustainalyticsESGRiskMax);
      if (!Number.isNaN(sustainalyticsESGRiskMax)) {
        filters.push({
          sustainalyticsESGRisk: {
            lte: sustainalyticsESGRiskMax,
          },
        });
      }
    }

    if (req.query.financialScoreMin !== undefined) {
      const financialScoreMin = Number(req.query.financialScoreMin);
      if (!Number.isNaN(financialScoreMin)) {
        filters.push({
          financialScore: {
            gte: 0.01 * financialScoreMin,
          },
        });
      }
    }
    if (req.query.financialScoreMax !== undefined) {
      const financialScoreMax = Number(req.query.financialScoreMax);
      if (!Number.isNaN(financialScoreMax)) {
        filters.push({
          financialScore: {
            lte: 0.01 * financialScoreMax,
          },
        });
      }
    }

    if (req.query.esgScoreMin !== undefined) {
      const esgScoreMin = Number(req.query.esgScoreMin);
      if (!Number.isNaN(esgScoreMin)) {
        filters.push({
          esgScore: {
            gte: 0.01 * esgScoreMin,
          },
        });
      }
    }
    if (req.query.esgScoreMax !== undefined) {
      const esgScoreMax = Number(req.query.esgScoreMax);
      if (!Number.isNaN(esgScoreMax)) {
        filters.push({
          esgScore: {
            lte: 0.01 * esgScoreMax,
          },
        });
      }
    }

    if (req.query.totalScoreMin !== undefined) {
      const totalScoreMin = Number(req.query.totalScoreMin);
      if (!Number.isNaN(totalScoreMin)) {
        filters.push({
          totalScore: {
            gte: 0.01 * totalScoreMin,
          },
        });
      }
    }
    if (req.query.totalScoreMax !== undefined) {
      const totalScoreMax = Number(req.query.totalScoreMax);
      if (!Number.isNaN(totalScoreMax)) {
        filters.push({
          totalScore: {
            lte: 0.01 * totalScoreMax,
          },
        });
      }
    }

    if (req.query.watchlist !== undefined) {
      const watchlistID = Number(req.query.watchlist);
      if (!Number.isNaN(watchlistID)) {
        // Check that the user has access to the watchlist
        await readWatchlist(Number(req.query.watchlist), res.locals.user.email);
        filters.push({
          watchlists: {
            some: {
              id: watchlistID,
              email: res.locals.user.email,
            },
          },
        });
      }
    }

    const sortBy = req.query.sortBy;
    if (sortBy && typeof sortBy === "string" && isSortableAttribute(sortBy)) {
      const sort = String(req.query.sortDesc).toLowerCase() === "true" ? "desc" : "asc";
      switch (sortBy) {
        case "ticker":
        case "name":
        case "financialScore":
        case "esgScore":
        case "totalScore":
          // No null values available
          stockFindManyArgs.orderBy = {
            [sortBy]: sort,
          };
          break;
        default:
          // If we sort by something, we do not care about stocks having a value of null there. We put them at the end.
          stockFindManyArgs.orderBy = {
            [sortBy]: { sort, nulls: "last" },
          };
          break;
      }
    }

    // Only return the subset (= page in list) of stocks requested by offset and count
    const skip: number = parseInt(req.query.offset as string);
    const take: number = parseInt(req.query.count as string);

    // If offset is not set, return the first page
    stockFindManyArgs.skip = Number.isNaN(skip) ? 0 : skip;
    // If count is not set, return all
    stockFindManyArgs.take = Number.isNaN(take) ? undefined : take;

    // Read all stocks from the database
    const [stocks, count] = await readAllStocks(stockFindManyArgs);

    // Respond with the list of stocks and the total count after filtering and before pagination
    res.status(200).json({ stocks, count }).end();
  }

  /**
   * (Re-)Computes dynamic attributes of all stocks.
   *
   * @param {Request} _ Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockComputeEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async compute(_: Request, res: Response) {
    const [stocks] = await readAllStocks();
    for await (const stock of stocks) {
      await updateStock(stock.ticker, {}, true);
    }
    res.status(204).end();
  }

  /**
   * Fetches the logo of a stock from Redis cache or TradeRepublic.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockLogoEndpointPath + "/*",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
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
            if (Number.isNaN(maxAge)) throw new TypeError();
            /* c8 ignore start */ // Difficult to test, since valid max-age is always returned
          } catch (e) {
            maxAge = 60 * 60 * 24;
          }
          /* c8 ignore stop */
          // Store the logo in the cache
          await createResource(
            {
              url,
              fetchDate: new Date(response.headers["date"]),
              content: response.data,
            },
            maxAge,
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
            60 * 60 * 24,
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
      }`,
    );
    res.status(200).send(logoResource.content).end();
  }

  /**
   * Reads a single stock from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockEndpointPath + "/*",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
    res
      .status(200)
      .json(await readStock(req.params[0]))
      .end();
  }

  /**
   * Creates a new stock in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} if a stock with the same ticker already exists
   */
  @Router({
    path: stockEndpointPath + "/*",
    method: "put",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
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
      if (await createStock({ ...optionalStockValuesNull, ticker, name, country, isin })) {
        res.status(201).end();
      } else {
        throw new APIError(409, "A stock with that ticker exists already.");
      }
    }
  }

  /**
   * Updates a stock in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockEndpointPath + "/*",
    method: "patch",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const ticker = req.params[0];
    const { name, isin, country, morningstarID, marketScreenerID, msciID, ric, sustainalyticsID } = req.query;
    const spID = req.query.spID === null ? "" : req.query.spID ? +req.query.spID : undefined;
    if (
      typeof ticker === "string" &&
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof isin === "string" || typeof isin === "undefined") &&
      ((typeof country === "string" && isCountry(country)) || typeof country === "undefined") &&
      (typeof morningstarID === "string" || typeof morningstarID === "undefined") &&
      (typeof marketScreenerID === "string" || typeof marketScreenerID === "undefined") &&
      (typeof msciID === "string" || typeof msciID === "undefined") &&
      (typeof ric === "string" || typeof ric === "undefined") &&
      ((typeof spID === "string" && spID === "") || typeof spID === "number" || typeof spID === "undefined") &&
      (typeof sustainalyticsID === "string" || typeof sustainalyticsID === "undefined")
    ) {
      // If a data provider ID is removed (i.e., set to an empty string), we remove all information available from that
      // data provider as well.
      await updateStock(ticker, {
        name,
        isin,
        country,
        morningstarID: morningstarID === "" ? null : morningstarID,
        industry: morningstarID === "" ? null : undefined,
        size: morningstarID === "" ? null : undefined,
        style: morningstarID === "" ? null : undefined,
        starRating: morningstarID === "" ? null : undefined,
        dividendYieldPercent: morningstarID === "" ? null : undefined,
        priceEarningRatio: morningstarID === "" ? null : undefined,
        currency: morningstarID === "" ? null : undefined,
        lastClose: morningstarID === "" ? null : undefined,
        morningstarFairValue: morningstarID === "" ? null : undefined,
        marketCap: morningstarID === "" ? null : undefined,
        low52w: morningstarID === "" ? null : undefined,
        high52w: morningstarID === "" ? null : undefined,
        description: morningstarID === "" ? null : undefined,
        marketScreenerID: marketScreenerID === "" ? null : marketScreenerID,
        analystConsensus: marketScreenerID === "" ? null : undefined,
        analystCount: marketScreenerID === "" ? null : undefined,
        analystTargetPrice: marketScreenerID === "" ? null : undefined,
        msciID: msciID === "" ? null : msciID,
        msciESGRating: msciID === "" ? null : undefined,
        msciTemperature: msciID === "" ? null : undefined,
        ric: ric === "" ? null : ric,
        refinitivESGScore: ric === "" ? null : undefined,
        refinitivEmissions: ric === "" ? null : undefined,
        spID: spID === "" ? null : spID,
        spESGScore: spID === "" ? null : undefined,
        sustainalyticsID: sustainalyticsID === "" ? null : sustainalyticsID,
        sustainalyticsESGRisk: sustainalyticsID === "" ? null : undefined,
      });
      res.status(204).end();
    }
  }

  /**
   * Deletes a stock from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: stockEndpointPath + "/*",
    method: "delete",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteStock(req.params[0]);
    res.status(204).end();
  }
}
