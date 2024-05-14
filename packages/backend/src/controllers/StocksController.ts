import type { Country, Industry, Resource, WeightedStock, Stock } from "@rating-tracker/commons";
import {
  GENERAL_ACCESS,
  isCountry,
  isIndustry,
  isMSCIESGRating,
  isSize,
  isSortableAttribute,
  isStyle,
  msciESGRatingArray,
  optionalStockValuesNull,
  logoBackgroundAPIPath,
  stocksAPIPath,
  stockLogoEndpointSuffix,
  WRITE_STOCKS_ACCESS,
  DUMMY_SVG,
  isAnalystRating,
  analystRatingArray,
} from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import type { Prisma } from "../../prisma/client";
import { readStocksInPortfolio } from "../db/tables/portfolioTable";
import { createStock, deleteStock, readStocks, updateStock, readStock } from "../db/tables/stockTable";
import { readWatchlist } from "../db/tables/watchlistTable";
import * as portfolio from "../openapi/parameters/portfolio";
import * as stock from "../openapi/parameters/stock";
import * as watchlist from "../openapi/parameters/watchlist";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../openapi/responses/clientError";
import { badGateway } from "../openapi/responses/serverError";
import {
  created,
  noContent,
  okLogoBackground,
  okStock,
  okStockListWithCount,
  okSVG,
} from "../openapi/responses/success";
import { createResource, readResource, readResourceTTL } from "../redis/repositories/resourceRepository";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import { performFetchRequest } from "../utils/fetchRequest";

import SingletonController from "./SingletonController";

/**
 * This class is responsible for handling stock data.
 */
class StocksController extends SingletonController {
  path = stocksAPIPath;
  tags = ["Stocks API"];

  /**
   * Retrieves the logo of a stock from Redis cache or TradeRepublic.
   * @param ticker the ticker of the stock
   * @param dark whether to use the dark or light version of the logo
   * @returns the logo as a Resource object
   */
  #getLogoOfStock = async (ticker: string, dark: boolean): Promise<Resource> => {
    const stock = await readStock(ticker);
    let logoResource: Resource;
    const url = `https://assets.traderepublic.com/img/logos/${stock.isin}/${dark ? "dark" : "light"}.svg`;
    try {
      // Try to read the logo from Redis cache first.
      logoResource = await readResource(url);
    } catch (e) {
      // If the logo is not in the cache, fetch it from TradeRepublic and store it in the cache.
      await performFetchRequest(url)
        .then(async (response) => {
          let maxAge: number;
          try {
            // Cache as long as TradeRepublic says using the max-age cache control directive
            maxAge = +response.headers.get("Cache-Control").match(/max-age=(\d+)/)[1];
            if (Number.isNaN(maxAge)) throw new TypeError();
          } catch (_) {
            maxAge = 60 * 60 * 24;
          }
          // Store the logo in the cache
          await createResource(
            { url, fetchDate: new Date(response.headers.get("Date")), content: response.data },
            maxAge,
          );
          // Read the logo as a Resource object
          logoResource = await readResource(url);
        })
        .catch(async () => {
          // If the logo could not be fetched from TradeRepublic, use an empty SVG as a placeholder.
          await createResource(
            { url, fetchDate: new Date(), content: DUMMY_SVG },
            60 * 60, // Let’s try again after one hour
          );
          logoResource = await readResource(url);
        });
    }
    return logoResource;
  };

  /**
   * Returns a list of stocks, which can be filtered, sorted and paginated.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Get a list of stocks",
      description: "Returns a list of stocks, which can be filtered, sorted and paginated.",
      parameters: [
        stock.offset,
        stock.count,
        stock.sortBy,
        stock.sortDesc,
        stock.name,
        stock.isin,
        stock.country,
        stock.industry,
        stock.size,
        stock.style,
        stock.starRatingMin,
        stock.starRatingMax,
        stock.dividendYieldPercentMin,
        stock.dividendYieldPercentMax,
        stock.priceEarningRatioMin,
        stock.priceEarningRatioMax,
        stock.morningstarFairValueDiffMin,
        stock.morningstarFairValueDiffMax,
        stock.analystConsensusMin,
        stock.analystConsensusMax,
        stock.analystCountMin,
        stock.analystCountMax,
        stock.analystTargetDiffMin,
        stock.analystTargetDiffMax,
        stock.msciESGRatingMin,
        stock.msciESGRatingMax,
        stock.msciTemperatureMin,
        stock.msciTemperatureMax,
        stock.lsegESGScoreMin,
        stock.lsegESGScoreMax,
        stock.lsegEmissionsMin,
        stock.lsegEmissionsMax,
        stock.spESGScoreMin,
        stock.spESGScoreMax,
        stock.sustainalyticsESGRiskMin,
        stock.sustainalyticsESGRiskMax,
        stock.financialScoreMin,
        stock.financialScoreMax,
        stock.esgScoreMin,
        stock.esgScoreMax,
        stock.totalScoreMin,
        stock.totalScoreMax,
        { ...watchlist.id, name: "watchlist" },
        { ...portfolio.id, name: "portfolio" },
      ],
      responses: {
        "200": okStockListWithCount,
        "400": badRequest,
        "401": unauthorized,
        "403": forbidden,
      },
    },
    method: "get",
    path: "",
    accessRights: GENERAL_ACCESS,
  })
  getList: RequestHandler = async (req: Request, res: Response) => {
    const filters: Prisma.Enumerable<Prisma.StockWhereInput> = [];
    const stockFindManyArgs: Prisma.StockFindManyArgs = {
      where: { AND: filters },
    };

    if (req.query.name && typeof req.query.name === "string")
      filters.push({
        OR: [
          { isin: { equals: req.query.name.trim() } },
          { ticker: { startsWith: req.query.name.trim(), mode: "insensitive" } },
          { name: { contains: req.query.name.trim(), mode: "insensitive" } },
        ],
      });

    if (req.query.isin && typeof req.query.isin === "string") filters.push({ isin: { equals: req.query.isin.trim() } });

    if (req.query.country) {
      const countryParam = req.query.country;
      if (Array.isArray(countryParam)) {
        const countries: Country[] = [];
        countryParam.forEach(
          (country: unknown) => typeof country === "string" && isCountry(country) && countries.push(country),
        );
        // Multiple countries can be specified, one of which must match to the stock’s country.
        filters.push({ country: { in: countries } });
      }
    }

    if (req.query.industry) {
      const industryParam = req.query.industry;
      if (Array.isArray(industryParam)) {
        const industries: Industry[] = [];
        industryParam.forEach(
          (industry: unknown) => typeof industry === "string" && isIndustry(industry) && industries.push(industry),
        );
        // Multiple industries can be specified, one of which must match to the stock’s industry.
        filters.push({ industry: { in: industries } });
      }
    }

    if (req.query.size) {
      const size = req.query.size;
      if (typeof size === "string" && isSize(size)) filters.push({ size: { equals: size } });
    }

    if (req.query.style) {
      const style = req.query.style;
      if (typeof style === "string" && isStyle(style)) filters.push({ style: { equals: style } });
    }

    if (req.query.starRatingMin !== undefined) {
      const starRatingMin = Number(req.query.starRatingMin);
      if (!Number.isNaN(starRatingMin)) filters.push({ starRating: { gte: starRatingMin } });
    }
    if (req.query.starRatingMax !== undefined) {
      const starRatingMax = Number(req.query.starRatingMax);
      if (!Number.isNaN(starRatingMax)) filters.push({ starRating: { lte: starRatingMax } });
    }

    if (req.query.dividendYieldPercentMin !== undefined) {
      const dividendYieldPercentMin = Number(req.query.dividendYieldPercentMin);
      if (!Number.isNaN(dividendYieldPercentMin))
        filters.push({ dividendYieldPercent: { gte: dividendYieldPercentMin } });
    }
    if (req.query.dividendYieldPercentMax !== undefined) {
      const dividendYieldPercentMax = Number(req.query.dividendYieldPercentMax);
      if (!Number.isNaN(dividendYieldPercentMax))
        filters.push({ dividendYieldPercent: { lte: dividendYieldPercentMax } });
    }

    if (req.query.priceEarningRatioMin !== undefined) {
      const priceEarningRatioMin = Number(req.query.priceEarningRatioMin);
      if (!Number.isNaN(priceEarningRatioMin)) filters.push({ priceEarningRatio: { gte: priceEarningRatioMin } });
    }
    if (req.query.priceEarningRatioMax !== undefined) {
      const priceEarningRatioMax = Number(req.query.priceEarningRatioMax);
      if (!Number.isNaN(priceEarningRatioMax)) filters.push({ priceEarningRatio: { lte: priceEarningRatioMax } });
    }

    if (req.query.morningstarFairValueDiffMin !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMin = Number(req.query.morningstarFairValueDiffMin);
      if (!Number.isNaN(morningstarFairValueDiffMin))
        filters.push({ morningstarFairValuePercentageToLastClose: { gte: morningstarFairValueDiffMin } });
    }
    if (req.query.morningstarFairValueDiffMax !== undefined) {
      // Filter by percentage difference of fair value to last close
      const morningstarFairValueDiffMax = Number(req.query.morningstarFairValueDiffMax);
      if (!Number.isNaN(morningstarFairValueDiffMax))
        filters.push({ morningstarFairValuePercentageToLastClose: { lte: morningstarFairValueDiffMax } });
    }

    let analystConsensusArray = [...analystRatingArray];
    if (req.query.analystConsensusMin !== undefined && typeof req.query.analystConsensusMin === "string") {
      const analystConsensusMin = req.query.analystConsensusMin;
      if (isAnalystRating(analystConsensusMin))
        analystConsensusArray = analystConsensusArray.filter(
          (analystRating) =>
            analystRatingArray.indexOf(analystRating) >= analystRatingArray.indexOf(analystConsensusMin),
        );
    }
    if (req.query.analystConsensusMax !== undefined && typeof req.query.analystConsensusMax === "string") {
      const analystConsensusMax = req.query.analystConsensusMax;
      if (isAnalystRating(analystConsensusMax))
        analystConsensusArray = analystConsensusArray.filter(
          (analystRating) =>
            analystRatingArray.indexOf(analystRating) <= analystRatingArray.indexOf(analystConsensusMax),
        );
    }
    if (analystRatingArray.some((msciESGRating) => !analystConsensusArray.includes(msciESGRating)))
      filters.push({ analystConsensus: { in: analystConsensusArray } });

    if (req.query.analystCountMin !== undefined) {
      const analystCountMin = Number(req.query.analystCountMin);
      if (!Number.isNaN(analystCountMin)) filters.push({ analystCount: { gte: analystCountMin } });
    }
    if (req.query.analystCountMax !== undefined) {
      const analystCountMax = Number(req.query.analystCountMax);
      if (!Number.isNaN(analystCountMax)) filters.push({ analystCount: { lte: analystCountMax } });
    }

    if (req.query.analystTargetDiffMin !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMin = Number(req.query.analystTargetDiffMin);
      if (!Number.isNaN(analystTargetDiffMin))
        filters.push({ analystTargetPricePercentageToLastClose: { gte: analystTargetDiffMin } });
    }
    if (req.query.analystTargetDiffMax !== undefined) {
      // Filter by percentage difference of analyst target price to last close
      const analystTargetDiffMax = Number(req.query.analystTargetDiffMax);
      if (!Number.isNaN(analystTargetDiffMax))
        filters.push({ analystTargetPricePercentageToLastClose: { lte: analystTargetDiffMax } });
    }

    let filteredMSCIESGRatingArray = [...msciESGRatingArray];
    if (req.query.msciESGRatingMin !== undefined && typeof req.query.msciESGRatingMin === "string") {
      const msciESGRatingMin = req.query.msciESGRatingMin;
      if (isMSCIESGRating(msciESGRatingMin))
        filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
          (msciESGRating) => msciESGRatingArray.indexOf(msciESGRating) >= msciESGRatingArray.indexOf(msciESGRatingMin),
        );
    }
    if (req.query.msciESGRatingMax !== undefined && typeof req.query.msciESGRatingMax === "string") {
      const msciESGRatingMax = req.query.msciESGRatingMax;
      if (isMSCIESGRating(msciESGRatingMax))
        filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
          (msciESGRating) => msciESGRatingArray.indexOf(msciESGRating) <= msciESGRatingArray.indexOf(msciESGRatingMax),
        );
    }
    if (msciESGRatingArray.some((msciESGRating) => !filteredMSCIESGRatingArray.includes(msciESGRating)))
      filters.push({ msciESGRating: { in: filteredMSCIESGRatingArray } });

    if (req.query.msciTemperatureMin !== undefined) {
      const msciTemperatureMin = Number(req.query.msciTemperatureMin);
      if (!Number.isNaN(msciTemperatureMin)) filters.push({ msciTemperature: { gte: msciTemperatureMin } });
    }
    if (req.query.msciTemperatureMax !== undefined) {
      const msciTemperatureMax = Number(req.query.msciTemperatureMax);
      if (!Number.isNaN(msciTemperatureMax)) filters.push({ msciTemperature: { lte: msciTemperatureMax } });
    }

    if (req.query.lsegESGScoreMin !== undefined) {
      const lsegESGScoreMin = Number(req.query.lsegESGScoreMin);
      if (!Number.isNaN(lsegESGScoreMin)) filters.push({ lsegESGScore: { gte: lsegESGScoreMin } });
    }
    if (req.query.lsegESGScoreMax !== undefined) {
      const lsegESGScoreMax = Number(req.query.lsegESGScoreMax);
      if (!Number.isNaN(lsegESGScoreMax)) filters.push({ lsegESGScore: { lte: lsegESGScoreMax } });
    }

    if (req.query.lsegEmissionsMin !== undefined) {
      const lsegEmissionsMin = Number(req.query.lsegEmissionsMin);
      if (!Number.isNaN(lsegEmissionsMin)) filters.push({ lsegEmissions: { gte: lsegEmissionsMin } });
    }
    if (req.query.lsegEmissionsMax !== undefined) {
      const lsegEmissionsMax = Number(req.query.lsegEmissionsMax);
      if (!Number.isNaN(lsegEmissionsMax)) filters.push({ lsegEmissions: { lte: lsegEmissionsMax } });
    }

    if (req.query.spESGScoreMin !== undefined) {
      const spESGScoreMin = Number(req.query.spESGScoreMin);
      if (!Number.isNaN(spESGScoreMin)) filters.push({ spESGScore: { gte: spESGScoreMin } });
    }
    if (req.query.spESGScoreMax !== undefined) {
      const spESGScoreMax = Number(req.query.spESGScoreMax);
      if (!Number.isNaN(spESGScoreMax)) filters.push({ spESGScore: { lte: spESGScoreMax } });
    }

    if (req.query.sustainalyticsESGRiskMin !== undefined) {
      const sustainalyticsESGRiskMin = Number(req.query.sustainalyticsESGRiskMin);
      if (!Number.isNaN(sustainalyticsESGRiskMin))
        filters.push({ sustainalyticsESGRisk: { gte: sustainalyticsESGRiskMin } });
    }
    if (req.query.sustainalyticsESGRiskMax !== undefined) {
      const sustainalyticsESGRiskMax = Number(req.query.sustainalyticsESGRiskMax);
      if (!Number.isNaN(sustainalyticsESGRiskMax))
        filters.push({ sustainalyticsESGRisk: { lte: sustainalyticsESGRiskMax } });
    }

    if (req.query.financialScoreMin !== undefined) {
      const financialScoreMin = Number(req.query.financialScoreMin);
      if (!Number.isNaN(financialScoreMin)) filters.push({ financialScore: { gte: 0.01 * financialScoreMin } });
    }
    if (req.query.financialScoreMax !== undefined) {
      const financialScoreMax = Number(req.query.financialScoreMax);
      if (!Number.isNaN(financialScoreMax)) filters.push({ financialScore: { lte: 0.01 * financialScoreMax } });
    }

    if (req.query.esgScoreMin !== undefined) {
      const esgScoreMin = Number(req.query.esgScoreMin);
      if (!Number.isNaN(esgScoreMin)) filters.push({ esgScore: { gte: 0.01 * esgScoreMin } });
    }
    if (req.query.esgScoreMax !== undefined) {
      const esgScoreMax = Number(req.query.esgScoreMax);
      if (!Number.isNaN(esgScoreMax)) filters.push({ esgScore: { lte: 0.01 * esgScoreMax } });
    }

    if (req.query.totalScoreMin !== undefined) {
      const totalScoreMin = Number(req.query.totalScoreMin);
      if (!Number.isNaN(totalScoreMin)) filters.push({ totalScore: { gte: 0.01 * totalScoreMin } });
    }
    if (req.query.totalScoreMax !== undefined) {
      const totalScoreMax = Number(req.query.totalScoreMax);
      if (!Number.isNaN(totalScoreMax)) filters.push({ totalScore: { lte: 0.01 * totalScoreMax } });
    }

    if (req.query.watchlist !== undefined) {
      const watchlistID = Number(req.query.watchlist);
      if (!Number.isNaN(watchlistID)) {
        // Check that the user has access to the watchlist
        await readWatchlist(Number(req.query.watchlist), res.locals.user.email);
        filters.push({ watchlists: { some: { id: watchlistID, email: res.locals.user.email } } });
      }
    }

    let sortByAmount: Prisma.SortOrder | undefined;

    const sortBy = req.query.sortBy;
    if (sortBy && typeof sortBy === "string" && isSortableAttribute(sortBy)) {
      const sort = String(req.query.sortDesc).toLowerCase() === "true" ? "desc" : "asc";
      switch (sortBy) {
        case "amount":
          // The portfolio ID must be present
          if (req.query.portfolio === undefined) {
            throw new APIError(400, "Cannot sort by amount without specifying a portfolio.");
          }
          sortByAmount = sort;
          break;
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

    let stocks: Stock[] | WeightedStock[];
    let count: Number;

    // Read all stocks from the database
    if (req.query.portfolio !== undefined)
      // If a portfolio ID is specified, only return the stocks in that portfolio. This must be done by querying the
      // portfolio table, since the m:n relation between portfolios and stocks has additional attributes, which are
      // included in the WeightedStock type.
      [stocks, count] = await readStocksInPortfolio(
        Number(req.query.portfolio),
        res.locals.user.email,
        stockFindManyArgs,
        sortByAmount,
      );
    else [stocks, count] = await readStocks(stockFindManyArgs);

    // Respond with the list of stocks and the total count after filtering and before pagination
    res.status(200).json({ stocks, count }).end();
  };

  /**
   * (Re-)Computes dynamic attributes of all stocks.
   * @param _ Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "(Re-)Compute dynamic attributes of all stocks",
      description: "(Re-)Computes dynamic attributes of all stocks.",
      responses: { "204": noContent, "401": unauthorized },
    },
    method: "patch",
    path: "",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  compute: RequestHandler = async (_: Request, res: Response) => {
    const [stocks] = await readStocks();
    for await (const stock of stocks) {
      await updateStock(stock.ticker, {}, true);
    }
    res.status(204).end();
  };

  /**
   * Fetches the logo of a stock from the cache or TradeRepublic.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Get the logo of a stock",
      description: "Fetches the logo of a stock from the cache or TradeRepublic.",
      parameters: [
        { ...stock.ticker, in: "path", required: true },
        {
          in: "query",
          name: "dark",
          description: "Whether to return a logo for a dark background",
          schema: { type: "boolean", example: true },
        },
      ],
      responses: { "200": okSVG, "401": unauthorized, "404": notFound, "502": badGateway },
    },
    method: "get",
    path: "/{ticker}" + stockLogoEndpointSuffix,
    accessRights: GENERAL_ACCESS,
  })
  getLogo: RequestHandler = async (req: Request, res: Response) => {
    const logoResource = await this.#getLogoOfStock(req.params.ticker, String(req.query.dark) === "true");
    res.set("Content-Type", "image/svg+xml");
    res.set(
      "Cache-Control",
      `max-age=${
        // Allow client-side caching as long as the logo is valid in the cache
        await readResourceTTL(logoResource.url)
      }`,
    );
    res.status(200).send(logoResource.content).end();
  };

  /**
   * Fetches the logos of the highest rated stocks.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Logo Background API"],
      summary: "Get the logos of the highest rated stocks",
      description: "Fetches the logos of the highest rated stocks.",
      parameters: [
        {
          in: "query",
          name: "dark",
          description: "Whether to return logos for dark background",
          schema: { type: "boolean", example: true },
        },
        {
          in: "query",
          name: "count",
          description: "How many logos to return",
          schema: { type: "integer", example: 25 },
        },
      ],
      responses: { "200": okLogoBackground, "502": badGateway },
    },
    method: "get",
    path: logoBackgroundAPIPath,
    ignoreBasePath: true,
    accessRights: 0,
  })
  getLogoBackground: RequestHandler = async (req: Request, res: Response) => {
    const count = Math.min(50, Number(req.query.count) || 50);
    let logoBundleResource: Resource;
    const url = logoBackgroundAPIPath + (req.query.dark ? "_dark" : "_light") + count;
    try {
      // Try to read the logos from Redis cache first.
      logoBundleResource = await readResource(url);
    } catch (e) {
      // If the logos are not in the cache, fetch them one by one and store them in the cache as one bundled resource.
      const [stocks] = await readStocks({ orderBy: { totalScore: "desc" }, take: count });
      const logos: string[] = new Array(count).fill(DUMMY_SVG);
      await Promise.allSettled(
        stocks.map(async (stock, index) => {
          const { content } = await this.#getLogoOfStock(stock.ticker, String(req.query.dark) === "true");
          // We do not want the response to be too large, so we limit the size of the logos to 128 kB each.
          logos[index] = content.length > 128 * 1024 ? DUMMY_SVG : content;
        }),
      );
      await createResource(
        { url, fetchDate: new Date(), content: JSON.stringify(logos) },
        60 * 60 * 24 * 7, // Cache for one week
      );
      logoBundleResource = await readResource(url);
    }
    res.set(
      "Cache-Control",
      // Allow client-side caching as long as the logo bundle is valid in the cache
      `max-age=${await readResourceTTL(url)}`,
    );
    res.status(200).send(JSON.parse(logoBundleResource.content)).end();
  };

  /**
   * Reads a single stock from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Get a stock",
      description: "Reads a single stock from the database.",
      parameters: [{ ...stock.ticker, in: "path", required: true }],
      responses: { "200": okStock, "401": unauthorized, "404": notFound },
    },
    method: "get",
    path: "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    res
      .status(200)
      .json(await readStock(req.params.ticker))
      .end();
  };

  /**
   * Creates a new stock in the database.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if a stock with the same ticker already exists
   */
  @Endpoint({
    spec: {
      summary: "Create a new stock",
      description: "Creates a new stock in the database.",
      parameters: [
        { ...stock.ticker, in: "path", required: true },
        { ...stock.name, required: true },
        { ...stock.isin, required: true },
        { ...stock.country, required: true, schema: { $ref: "#/components/schemas/Country" } },
      ],
      responses: { "201": created, "401": unauthorized, "403": forbidden, "409": conflict },
    },
    method: "put",
    path: "/{ticker}",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  put: RequestHandler = async (req: Request, res: Response) => {
    const { ticker } = req.params;
    const { name, country, isin } = req.query;
    if (typeof name !== "string" || typeof country !== "string" || !isCountry(country) || typeof isin !== "string")
      throw new APIError(400, "Invalid query parameters.");
    if (await createStock({ ...optionalStockValuesNull, ticker, name, country, isin })) res.status(201).end();
    else throw new APIError(409, "A stock with that ticker exists already.");
  };

  /**
   * Updates a stock in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Update a stock",
      description: "Updates a stock in the database.",
      parameters: [
        { ...stock.ticker, in: "path", required: true },
        { ...stock.ticker, allowEmptyValue: true },
        stock.name,
        stock.isin,
        { ...stock.country, schema: { $ref: "#/components/schemas/Country" } },
        { ...stock.morningstarID, allowEmptyValue: true },
        { ...stock.marketScreenerID, allowEmptyValue: true },
        { ...stock.msciID, allowEmptyValue: true },
        { ...stock.ric, allowEmptyValue: true },
        { ...stock.spID, allowEmptyValue: true },
        { ...stock.sustainalyticsID, allowEmptyValue: true },
      ],
      responses: { "204": noContent, "400": badRequest, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "patch",
    path: "/{ticker}",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  patch: RequestHandler = async (req: Request, res: Response) => {
    const { ticker } = req.params;
    const { name, isin, country, morningstarID, marketScreenerID, msciID, ric, sustainalyticsID } = req.query;
    const newTicker = req.query.ticker;
    const spID = req.query.spID === null ? "" : req.query.spID ? Number(req.query.spID) : undefined;
    if (
      (typeof newTicker !== "string" && typeof newTicker !== "undefined") ||
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof isin !== "string" && typeof isin !== "undefined") ||
      ((typeof country !== "string" || !isCountry(country)) && typeof country !== "undefined") ||
      (typeof morningstarID !== "string" && typeof morningstarID !== "undefined") ||
      (typeof marketScreenerID !== "string" && typeof marketScreenerID !== "undefined") ||
      (typeof msciID !== "string" && typeof msciID !== "undefined") ||
      (typeof ric !== "string" && typeof ric !== "undefined") ||
      ((typeof spID !== "string" || spID !== "") &&
        (typeof spID !== "number" || Number.isNaN(spID)) &&
        typeof spID !== "undefined") ||
      (typeof sustainalyticsID !== "string" && typeof sustainalyticsID !== "undefined")
    )
      throw new APIError(400, "Invalid query parameters.");
    // If a data provider ID is removed (i.e., set to an empty string), we remove all information available from that
    // data provider as well.
    await updateStock(ticker, {
      ticker: newTicker,
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
      lsegESGScore: ric === "" ? null : undefined,
      lsegEmissions: ric === "" ? null : undefined,
      spID: spID === "" ? null : spID,
      spESGScore: spID === "" ? null : undefined,
      sustainalyticsID: sustainalyticsID === "" ? null : sustainalyticsID,
      sustainalyticsESGRisk: sustainalyticsID === "" ? null : undefined,
    });
    res.status(204).end();
  };

  /**
   * Deletes a stock from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Delete a stock",
      description: "Deletes a stock from the database.",
      parameters: [{ ...stock.ticker, in: "path", required: true }],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "delete",
    path: "/{ticker}",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    await deleteStock(req.params.ticker);
    res.status(204).end();
  };
}

export default new StocksController();
