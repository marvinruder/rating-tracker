import type {
  Stock,
  WeightedStock,
  Portfolio,
  SortableAttribute,
  StockFilter,
  User,
  Watchlist,
  AnalystRating,
  MSCIESGRating,
  DataProvider,
} from "@rating-tracker/commons";
import {
  analystRatingArray,
  dataProviderID,
  dataProviderLastFetch,
  dataProviderProperties,
  DUMMY_SVG,
  isIndividualDataProvider,
  logoBackgroundAPIPath,
  msciESGRatingArray,
} from "@rating-tracker/commons";

import { Prisma } from "../../prisma/client";
import type DBService from "../db/db.service";
import type PortfolioService from "../portfolio/portfolio.service";
import type ResourceService from "../resource/resource.service";
import type { ResourceWithExpire } from "../resource/resource.service";
import SignalService from "../signal/signal.service";
import type UserService from "../user/user.service";
import BadRequestError from "../utils/error/api/BadRequestError";
import NotFoundError from "../utils/error/api/NotFoundError";
import { performFetchRequest } from "../utils/fetchRequest";
import Logger from "../utils/logger";
import type WatchlistService from "../watchlist/watchlist.service";

import DynamicStockAttributeHelper from "./dynamicStockAttributes.helper";

/**
 * This service provides methods to interact with stock data.
 */
class StockService {
  constructor(
    dbService: DBService,
    private portfolioService: PortfolioService,
    private resourceService: ResourceService,
    private signalService: SignalService,
    private userService: UserService,
    private watchlistService: WatchlistService,
  ) {
    const { stock, $transaction } = dbService;
    this.db = { stock, $transaction };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "stock" | "$transaction">;

  /**
   * Strings for the parameters used in the Signal message
   */
  #parameterPrettyNames = {
    analystConsensus: "Analyst Consensus",
    msciESGRating: "MSCI ESG Rating",
    lsegESGScore: "LSEG ESG Score",
    lsegEmissions: "LSEG Emissions Rating",
    spESGScore: "S&P ESG Score",
    sustainalyticsESGRisk: "Sustainalytics ESG Risk Score",
  };

  /**
   * Create a stock.
   * @param stock The stock to create.
   * @returns Whether the stock was created.
   */
  async create(stock: Pick<Stock, "ticker" | "name" | "country" | "isin">): Promise<boolean> {
    // Attempt to find an existing stock with the same ticker
    try {
      const existingStock = await this.db.stock.findUniqueOrThrow({ where: { ticker: stock.ticker } });
      // If that worked, a stock with the same ticker already exists
      Logger.warn(
        { prefix: "postgres" },
        `Skipping stock “${stock.name}” – existing already (ticker ${existingStock.ticker}).`,
      );
      return false;
    } catch {
      await this.db.stock.create({ data: stock });
      Logger.info({ prefix: "postgres" }, `Created stock “${stock.name}” with ticker ${stock.ticker}.`);
      return true;
    }
  }
  /**
   * Read a stock.
   * @param ticker The ticker of the stock.
   * @returns The stock.
   * @throws an {@link APIError} if the stock does not exist.
   */
  async read(ticker: string): Promise<Stock> {
    try {
      return await this.db.stock.findUniqueOrThrow({ where: { ticker } });
    } catch {
      throw new NotFoundError(`Stock ${ticker} not found.`);
    }
  }

  /**
   * Returns a list of stocks, which can be filtered, sorted and paginated.
   * @param filter Filter parameters
   * @param sort Sorting parameters
   * @param sort.sortBy The attribute to sort by
   * @param sort.sortOrder Whether to sort in ascending or descending order
   * @param pagination Pagination parameters
   * @param pagination.offset The offset of the first stock to return
   * @param pagination.count The number of stocks to return
   * @returns A list of stocks with the total count of stocks
   */
  async readAll(
    filter: StockFilter & {
      q?: string;
      watchlist?: Watchlist["id"];
      portfolio?: Portfolio["id"];
      email?: User["email"];
    },
    sort: { sortBy?: SortableAttribute; sortOrder?: Prisma.SortOrder },
    pagination: { offset?: number; count?: number },
  ): Promise<{ stocks: Stock[] | WeightedStock[]; count: number }> {
    if (sort.sortBy && !sort.sortOrder) sort.sortOrder = "asc";
    const filters: Prisma.Enumerable<Prisma.StockWhereInput> = [];
    const stockFindManyArgs: Prisma.StockFindManyArgs = { where: { AND: filters } };

    if (filter.q !== undefined)
      filters.push({
        OR: [
          { isin: filter.q.trim() },
          { ticker: { startsWith: filter.q.trim(), mode: "insensitive" } },
          { name: { contains: filter.q.trim(), mode: "insensitive" } },
        ],
      });
    if (filter.countries !== undefined) filters.push({ country: { in: filter.countries } });
    if (filter.industries !== undefined) filters.push({ industry: { in: filter.industries } });
    if (filter.size !== undefined) filters.push({ size: filter.size });
    if (filter.style !== undefined) filters.push({ style: filter.style });
    if (filter.starRatingMin !== undefined) filters.push({ starRating: { gte: filter.starRatingMin } });
    if (filter.starRatingMax !== undefined) filters.push({ starRating: { lte: filter.starRatingMax } });
    if (filter.dividendYieldPercentMin !== undefined)
      filters.push({ dividendYieldPercent: { gte: filter.dividendYieldPercentMin } });
    if (filter.dividendYieldPercentMax !== undefined)
      filters.push({ dividendYieldPercent: { lte: filter.dividendYieldPercentMax } });
    if (filter.priceEarningRatioMin !== undefined)
      filters.push({ priceEarningRatio: { gte: filter.priceEarningRatioMin } });
    if (filter.priceEarningRatioMax !== undefined)
      filters.push({ priceEarningRatio: { lte: filter.priceEarningRatioMax } });
    if (filter.morningstarFairValueDiffMin !== undefined)
      filters.push({ morningstarFairValuePercentageToLastClose: { gte: filter.morningstarFairValueDiffMin } });
    if (filter.morningstarFairValueDiffMax !== undefined)
      filters.push({ morningstarFairValuePercentageToLastClose: { lte: filter.morningstarFairValueDiffMax } });
    let analystConsensusArray = [...analystRatingArray];
    if (filter.analystConsensusMin !== undefined)
      analystConsensusArray = analystConsensusArray.filter(
        (analystRating) =>
          analystRatingArray.indexOf(analystRating) >= analystRatingArray.indexOf(filter.analystConsensusMin!),
      );
    if (filter.analystConsensusMax !== undefined)
      analystConsensusArray = analystConsensusArray.filter(
        (analystRating) =>
          analystRatingArray.indexOf(analystRating) <= analystRatingArray.indexOf(filter.analystConsensusMax!),
      );
    if (analystConsensusArray.length < analystRatingArray.length)
      filters.push({ analystConsensus: { in: analystConsensusArray } });
    if (filter.analystCountMin !== undefined) filters.push({ analystCount: { gte: filter.analystCountMin } });
    if (filter.analystCountMax !== undefined) filters.push({ analystCount: { lte: filter.analystCountMax } });
    if (filter.analystTargetDiffMin !== undefined)
      filters.push({ analystTargetPricePercentageToLastClose: { gte: filter.analystTargetDiffMin } });
    if (filter.analystTargetDiffMax !== undefined)
      filters.push({ analystTargetPricePercentageToLastClose: { lte: filter.analystTargetDiffMax } });
    let filteredMSCIESGRatingArray = [...msciESGRatingArray];
    if (filter.msciESGRatingMin !== undefined)
      filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
        (msciESGRating) =>
          msciESGRatingArray.indexOf(msciESGRating) >= msciESGRatingArray.indexOf(filter.msciESGRatingMin!),
      );
    if (filter.msciESGRatingMax !== undefined)
      filteredMSCIESGRatingArray = filteredMSCIESGRatingArray.filter(
        (msciESGRating) =>
          msciESGRatingArray.indexOf(msciESGRating) <= msciESGRatingArray.indexOf(filter.msciESGRatingMax!),
      );
    if (filteredMSCIESGRatingArray.length < msciESGRatingArray.length)
      filters.push({ msciESGRating: { in: filteredMSCIESGRatingArray } });
    if (filter.msciTemperatureMin !== undefined) filters.push({ msciTemperature: { gte: filter.msciTemperatureMin } });
    if (filter.msciTemperatureMax !== undefined) filters.push({ msciTemperature: { lte: filter.msciTemperatureMax } });
    if (filter.lsegESGScoreMin !== undefined) filters.push({ lsegESGScore: { gte: filter.lsegESGScoreMin } });
    if (filter.lsegESGScoreMax !== undefined) filters.push({ lsegESGScore: { lte: filter.lsegESGScoreMax } });
    if (filter.lsegEmissionsMin !== undefined) filters.push({ lsegEmissions: { gte: filter.lsegEmissionsMin } });
    if (filter.lsegEmissionsMax !== undefined) filters.push({ lsegEmissions: { lte: filter.lsegEmissionsMax } });
    if (filter.spESGScoreMin !== undefined) filters.push({ spESGScore: { gte: filter.spESGScoreMin } });
    if (filter.spESGScoreMax !== undefined) filters.push({ spESGScore: { lte: filter.spESGScoreMax } });
    if (filter.sustainalyticsESGRiskMin !== undefined)
      filters.push({ sustainalyticsESGRisk: { gte: filter.sustainalyticsESGRiskMin } });
    if (filter.sustainalyticsESGRiskMax !== undefined)
      filters.push({ sustainalyticsESGRisk: { lte: filter.sustainalyticsESGRiskMax } });
    if (filter.financialScoreMin !== undefined) filters.push({ financialScore: { gte: filter.financialScoreMin } });
    if (filter.financialScoreMax !== undefined) filters.push({ financialScore: { lte: filter.financialScoreMax } });
    if (filter.esgScoreMin !== undefined) filters.push({ esgScore: { gte: filter.esgScoreMin } });
    if (filter.esgScoreMax !== undefined) filters.push({ esgScore: { lte: filter.esgScoreMax } });
    if (filter.totalScoreMin !== undefined) filters.push({ totalScore: { gte: filter.totalScoreMin } });
    if (filter.totalScoreMax !== undefined) filters.push({ totalScore: { lte: filter.totalScoreMax } });
    if (filter.watchlist !== undefined && filter.email !== undefined) {
      // Check that the user has access to the watchlist
      await this.watchlistService.read(filter.watchlist, filter.email);
      filters.push({ watchlists: { some: { id: filter.watchlist, email: filter.email } } });
    }

    let sortByAmount: Prisma.SortOrder | undefined;

    switch (sort.sortBy) {
      case undefined:
        break;
      case "amount":
        // The portfolio ID must be present
        if (!("portfolio" in filter && "email" in filter))
          throw new BadRequestError("Cannot sort by amount without specifying a portfolio.");
        sortByAmount = sort.sortOrder;
        break;
      case "ticker":
      case "name":
      case "financialScore":
      case "esgScore":
      case "totalScore":
        // No null values available
        stockFindManyArgs.orderBy = { [sort.sortBy]: sort.sortOrder };
        break;
      default:
        // If we sort by something, we do not care about stocks having a value of null there. We put them at the end.
        stockFindManyArgs.orderBy = { [sort.sortBy]: { sort: sort.sortOrder, nulls: "last" } };
        break;
    }

    stockFindManyArgs.skip = pagination.offset;
    stockFindManyArgs.take = pagination.count;

    let stocks: Stock[] | WeightedStock[];
    let count: number;

    // Read all stocks from the database
    if (filter.portfolio !== undefined && filter.email !== undefined) {
      // If a portfolio ID is specified, only return the stocks in that portfolio. This must be done by querying the
      // portfolio table, since the m:n relation between portfolios and stocks has additional attributes, which are
      // included in the WeightedStock type.
      [stocks, count] = await this.portfolioService.readStocks(
        filter.portfolio,
        filter.email,
        stockFindManyArgs,
        sortByAmount,
      );
    } else {
      [stocks, count] = await this.db.$transaction([
        this.db.stock.findMany(stockFindManyArgs),
        this.db.stock.count({
          where: { ...stockFindManyArgs?.where },
        }),
      ]);
    }

    return { stocks, count };
  }

  /**
   * Returns a list of stocks that can be fetched from a given data provider, sorted by the date last fetched.
   * @param dataProvider The data provider to fetch from
   * @returns A list of stocks that can be fetched from the data provider
   */
  async readFetchable(dataProvider: DataProvider): Promise<Stock[]> {
    return await this.db.stock.findMany({
      // The ticker must never be null, so we adjust the filter to exclude examplary ticker values in this case:
      where: {
        [dataProviderID[dataProvider]]: {
          not: dataProviderID[dataProvider] === "ticker" ? { startsWith: "\\_" } : null,
        },
      },
      // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
      orderBy: isIndividualDataProvider(dataProvider) ? { [dataProviderLastFetch[dataProvider]]: "asc" } : undefined,
    });
  }

  /**
   * Retrieves the logo of a stock from the database or TradeRepublic.
   * @param ticker The ticker of the stock.
   * @param variant Whether to use the dark or light version of the logo.
   * @returns The logo as a Resource object.
   */
  async readLogo(ticker: string, variant: "light" | "dark"): Promise<ResourceWithExpire> {
    const stock = await this.read(ticker);
    let logoResource: ResourceWithExpire;
    const url = `https://assets.traderepublic.com/img/logos/${stock.isin}/${variant}.svg`;
    try {
      // Try to read the logo from the database first.
      logoResource = await this.resourceService.read(url);
    } catch (e) {
      // If the logo is not in the database, fetch it from TradeRepublic and store it in the database.
      await performFetchRequest(url)
        .then(async (response) => {
          let maxAge: number;
          try {
            // Cache as long as TradeRepublic says using the max-age cache control directive
            maxAge = Number(response.headers.get("Cache-Control")!.match(/max-age=(\d+)/)![1]);
            if (Number.isNaN(maxAge)) throw new TypeError();
          } catch (_) {
            maxAge = 60 * 60 * 24;
          }
          // Store the logo for at least one week
          maxAge = Math.max(maxAge, 60 * 60 * 24 * 7);
          // Store the logo in the cache
          await this.resourceService.create(
            {
              uri: url,
              lastModifiedAt: new Date(response.headers.get("Date") ?? new Date(0)),
              content: response.data,
              contentType: response.headers.get("content-type") || "image/svg+xml",
            },
            maxAge,
          );
          // Read the logo as a Resource object
          logoResource = await this.resourceService.read(url);
        })
        .catch(async () => {
          // If the logo could not be fetched from TradeRepublic, use an empty SVG as a placeholder.
          await this.resourceService.create(
            { uri: url, lastModifiedAt: new Date(), content: Buffer.from(DUMMY_SVG), contentType: "image/svg+xml" },
            60 * 60, // Let’s try again after one hour
          );
          logoResource = await this.resourceService.read(url);
        });
    }
    return logoResource!;
  }

  /**
   * Retrieves the logos of multiple stocks from the database or TradeRepublic.
   * @param count The number of logos to retrieve.
   * @param variant Whether to use the dark or light version of the logos.
   * @returns The logos as a Resource object.
   */
  async readLogos(count: number, variant: "light" | "dark"): Promise<ResourceWithExpire> {
    let logosResource: ResourceWithExpire;
    const url = `${logoBackgroundAPIPath}-${variant}-${count}`;
    try {
      // Try to read the logos from the database first.
      logosResource = await this.resourceService.read(url);
    } catch (e) {
      // If the logos are not in the database, fetch them one by one and store them in the database as one bundled
      // resource.
      const { stocks } = await this.readAll({}, { sortBy: "totalScore", sortOrder: "desc" }, { count });
      const logos: string[] = new Array(count).fill(DUMMY_SVG);
      await Promise.allSettled(
        stocks.map(async (stock: Stock, index: number) => {
          const { content } = await this.readLogo(stock.ticker, variant);
          // We do not want the response to be too large, so we limit the size of the logos to 128 kB each.
          logos[index] = content.length > 128 * 1024 ? DUMMY_SVG : content.toString();
        }),
      );
      await this.resourceService.create(
        {
          uri: url,
          lastModifiedAt: new Date(),
          content: Buffer.from(JSON.stringify(logos)),
          contentType: "application/json; charset=utf-8",
        },
        60 * 60 * 24 * 7, // Cache for one week
      );
      logosResource = await this.resourceService.read(url);
    }
    return logosResource;
  }

  /**
   * Update a stock.
   * @param ticker The ticker of the stock.
   * @param newValues The new values for the stock.
   * @param forceUpdate Whether new values are written into the database, even if they are equal to the stock’s current
   *                    values. Triggers computation of scores.
   * @param skipMessage Whether not to send a Signal message.
   * @throws an {@link APIError} if the stock does not exist.
   */
  async update(ticker: string, newValues: Partial<Stock>, forceUpdate?: boolean, skipMessage?: boolean) {
    // If a data provider ID is removed (i.e., set to an empty string), we remove all information available from that
    // data provider as well.
    if (newValues.ticker?.startsWith("_"))
      newValues = {
        ...newValues,
        ...dataProviderProperties["yahoo"].reduce(
          (obj, key) => ({ ...obj, [key]: ["prices1y", "prices1mo"].includes(key) ? [] : null }),
          {},
        ),
      };
    if (newValues.morningstarID === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["morningstar"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };
    if (newValues.marketScreenerID === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["marketScreener"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };
    if (newValues.msciID === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["msci"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };
    if (newValues.ric === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["lseg"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };
    if (newValues.spID === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["sp"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };
    if (newValues.sustainalyticsID === null)
      newValues = {
        ...newValues,
        ...dataProviderProperties["sustainalytics"].reduce((obj, key) => ({ ...obj, [key]: null }), {}),
      };

    let k: keyof typeof newValues; // all keys of new values
    const stock = await this.read(ticker); // Read the stock from the database
    let signalMessage = `Updates for ${stock.name} (${ticker}):`;
    let isNewData = false;
    // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
    for (k in newValues) {
      if (newValues[k] !== undefined) {
        if (stock[k] === undefined) throw new BadRequestError(`Invalid property ${k} for stock ${stock.ticker}.`);
        if (newValues[k] === stock[k]) {
          delete newValues[k];
          continue;
        }
        // Compare scalar arrays by iterating over them and comparing each element
        if (
          (k === "prices1y" || k === "prices1mo") &&
          Array.isArray(stock[k]) &&
          Array.isArray(newValues[k]) &&
          stock[k]!.length === newValues[k]!.length &&
          stock[k]!.every((value, index) => value === (newValues[k] as unknown[])[index])
        ) {
          delete newValues[k];
          continue;
        }
        // Compare records with known keys by iterating over them and comparing each value
        if (
          k === "analystRatings" &&
          typeof stock[k] === "object" &&
          stock[k] !== null &&
          typeof newValues[k] === "object" &&
          newValues[k] !== null &&
          analystRatingArray.every(
            (rating) =>
              (stock[k] as Stock["analystRatings"])![rating] === (newValues[k] as Stock["analystRatings"])![rating],
          )
        ) {
          delete newValues[k];
          continue;
        }

        // New data is different from old data
        isNewData = true;

        switch (k) {
          case "starRating":
            signalMessage += `\n\t${
              // larger is better
              (newValues[k] ?? 0) > (stock[k] ?? 0) ? SignalService.PREFIX_BETTER : SignalService.PREFIX_WORSE
            }Star Rating changed from ${
              // Use cute tiny star characters to show the star rating
              "★".repeat(stock[k] ?? 0) + "☆".repeat(5 - (stock[k] ?? 0))
            } to ${"★".repeat(newValues[k] ?? 0) + "☆".repeat(5 - (newValues[k] ?? 0))}`;
            break;
          case "morningstarFairValue":
            const oldCurrency = stock.currency ?? "";
            const newCurrency = newValues.currency ?? oldCurrency;
            const lastClose = newValues.lastClose ?? stock.lastClose ?? "N/A";
            signalMessage += `\n\t${
              // larger is better
              (newValues[k] ?? 0) > (stock[k] ?? 0) ? SignalService.PREFIX_BETTER : SignalService.PREFIX_WORSE
            }Morningstar Fair Value changed from ${oldCurrency} ${stock[k] ?? "N/A"} to ${newCurrency} ${
              newValues[k] ?? "N/A"
            } (last close ${newCurrency} ${lastClose})`;
            break;
          case "msciTemperature":
            signalMessage += `\n\t${
              // smaller is better
              (newValues[k] ?? Number.MAX_VALUE) < (stock[k] ?? Number.MAX_VALUE)
                ? SignalService.PREFIX_BETTER
                : SignalService.PREFIX_WORSE
            }MSCI Implied Temperature Rise changed from ${stock[k] ?? "N/A"}\u2009℃ to ${newValues[k] ?? "N/A"}\u2009℃`;
            break;
          case "analystConsensus":
          case "msciESGRating":
          case "lsegESGScore":
          case "lsegEmissions":
          case "spESGScore":
          case "sustainalyticsESGRisk":
            let signalPrefix = "";
            switch (k) {
              case "analystConsensus":
                signalPrefix =
                  // larger index in array [Sell, ..., Buy] is better
                  (newValues.analystConsensus ? analystRatingArray.indexOf(newValues.analystConsensus) : -1) >
                  (stock.analystConsensus
                    ? analystRatingArray.indexOf(stock.analystConsensus as AnalystRating)
                    : /* c8 ignore next */ // This never occurs with our test dataset
                      -1)
                    ? SignalService.PREFIX_BETTER
                    : SignalService.PREFIX_WORSE;
                break;
              case "msciESGRating":
                signalPrefix =
                  // smaller index in array [AAA, ..., CCC] is better
                  (newValues.msciESGRating ? msciESGRatingArray.indexOf(newValues.msciESGRating) : 7) <
                  (stock.msciESGRating
                    ? msciESGRatingArray.indexOf(stock.msciESGRating as MSCIESGRating)
                    : /* c8 ignore next */ // This never occurs with our test dataset
                      7)
                    ? SignalService.PREFIX_BETTER
                    : SignalService.PREFIX_WORSE;
                break;
              case "sustainalyticsESGRisk":
                signalPrefix =
                  // smaller is better
                  (newValues.sustainalyticsESGRisk ?? Number.MAX_VALUE) <
                  (stock.sustainalyticsESGRisk ?? Number.MAX_VALUE)
                    ? SignalService.PREFIX_BETTER
                    : SignalService.PREFIX_WORSE;
                break;
              default:
                signalPrefix =
                  // larger is better for all other parameters
                  (newValues[k] ?? 0) > (stock[k] ?? 0) ? SignalService.PREFIX_BETTER : SignalService.PREFIX_WORSE;
                break;
            }
            signalMessage +=
              `\n\t${signalPrefix}${this.#parameterPrettyNames[k]} changed ` +
              `from ${stock[k] ?? "N/A"} to ${newValues[k] ?? "N/A"}`;
            break;
          default:
            break;
        }
      }
    }
    if (isNewData || forceUpdate) {
      await this.db.stock.update({
        where: { ticker: stock.ticker },
        data: {
          ...newValues,
          ...DynamicStockAttributeHelper.dynamicStockAttributes({ ...stock, ...newValues }),
          prices1y: newValues.prices1y === null ? [] : newValues.prices1y,
          prices1mo: newValues.prices1mo === null ? [] : newValues.prices1mo,
          analystRatings: newValues.analystRatings === null ? Prisma.DbNull : newValues.analystRatings,
        },
      });
      Logger.info({ prefix: "postgres", newValues }, `Updated stock ${ticker}`);
      // The message string contains a newline character if and only if a parameter changed for which we want to send a
      // message
      if (signalMessage.includes("\n") && !skipMessage)
        this.signalService.sendMessage(
          signalMessage,
          await this.userService.readMessageRecipients("stockUpdate", stock),
        );
    } else {
      // No new data was provided
      Logger.info({ prefix: "postgres" }, `No updates for stock ${ticker}.`);
    }
  }

  /**
   * (Re-)Computes dynamic attributes of all stocks.
   */
  async computeDynamicAttributes(): Promise<void> {
    const { stocks } = await this.readAll({}, {}, {});
    await Promise.all(stocks.map((stock: Stock) => this.update(stock.ticker, {}, true)));
  }

  /**
   * Delete a stock.
   * @param ticker The ticker of the stock to delete.
   * @throws an {@link APIError} if the stock does not exist.
   */
  async delete(ticker: string) {
    try {
      // Attempt to delete the stock with the given ticker
      await this.db.stock.delete({ where: { ticker } });
      Logger.info({ prefix: "postgres" }, `Deleted stock ${ticker}.`);
    } catch {
      // If deletion failed, the stock does not exist
      Logger.warn({ prefix: "postgres" }, `Stock ${ticker} does not exist.`);
    }
  }
}

export default StockService;
