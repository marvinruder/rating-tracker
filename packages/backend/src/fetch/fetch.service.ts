import type { DataProvider, FetchRequestOptions, IndividualDataProvider, Stock } from "@rating-tracker/commons";
import {
  FetchError,
  dataProviderID,
  dataProviderLastFetch,
  dataProviderName,
  dataProviderProperties,
  dataProviderTTL,
  isIndividualDataProvider,
  resourcesAPIPath,
} from "@rating-tracker/commons";
import { DOMParser } from "@xmldom/xmldom";

import type ResourceService from "../resource/resource.service";
import SignalService from "../signal/signal.service";
import type StockService from "../stock/stock.service";
import type UserService from "../user/user.service";
import BadGatewayError from "../utils/error/api/BadGatewayError";
import InternalServerError from "../utils/error/api/InternalServerError";
import NotFoundError from "../utils/error/api/NotFoundError";
import DataProviderError from "../utils/error/DataProviderError";
import { performFetchRequest } from "../utils/fetchRequest";
import Logger from "../utils/logger";
import TimeUtils from "../utils/time";

import BulkFetcher from "./fetcher/BulkFetcher";
import IndividualFetcher from "./fetcher/IndividualFetcher";
import LSEGFetcher from "./fetcher/lseg.fetcher";
import MarketScreenerFetcher from "./fetcher/marketScreener.fetcher";
import MorningstarFetcher from "./fetcher/morningstar.fetcher";
import MSCIFetcher from "./fetcher/msci.fetcher";
import SPFetcher from "./fetcher/sp.fetcher";
import SustainalyticsFetcher from "./fetcher/sustainalytics.fetcher";
import YahooFetcher from "./fetcher/yahoo.fetcher";

/**
 * A shared object holding lists of stocks that multiple fetchers work on.
 */
export type FetcherWorkspace<T> = {
  queued: T[];
  skipped: T[];
  successful: T[];
  failed: T[];
};

/**
 * Options to configure a fetch job.
 */
export type FetchOptions = {
  /**
   * The ticker of the stock to fetch. If unset, all stocks known to the system will be used.
   */
  ticker?: string;
  /**
   * If set, the fetcher will not skip stocks that have been fetched recently.
   */
  noSkip?: boolean;
  /**
   * If set, the fetcher will clear the data of the stock before fetching.
   */
  clear?: boolean;
  /**
   * The requested number of fetchers to use concurrently.
   */
  concurrency?: number;
};

/**
 * This service provides methods for fetching data from external data providers.
 */
class FetchService {
  constructor(
    private resourceService: ResourceService,
    private signalService: SignalService,
    private stockService: StockService,
    private userService: UserService,
  ) {
    this.#dataProviderFetchers = {
      yahoo: new YahooFetcher(stockService),
      morningstar: new MorningstarFetcher(stockService),
      marketScreener: new MarketScreenerFetcher(stockService),
      msci: new MSCIFetcher(stockService),
      lseg: new LSEGFetcher(stockService),
      sp: new SPFetcher(stockService),
      sustainalytics: new SustainalyticsFetcher(resourceService, signalService, stockService, userService),
    };
  }

  /**
   * A record of functions that extract data from a data provider.
   */
  #dataProviderFetchers: Record<DataProvider, BulkFetcher | IndividualFetcher>;

  /**
   * Creates an object containing the aggregated results of the fetch for logging.
   * @param stocks The fetcher workspace.
   * @returns An object containing the aggregated results of the fetch.
   */
  #countFetchResults(stocks: FetcherWorkspace<unknown>): Partial<Record<keyof FetcherWorkspace<unknown>, number>> {
    return Object.entries(stocks).reduce(
      (obj, [key, value]) => (value.length ? Object.assign(obj, { [key]: value.length }) : obj),
      {},
    );
  }

  /**
   * Apply data-provider-specific patches to the HTML document.
   * @param html The HTML document to patch
   * @returns The patched HTML document
   */
  static #patchHTML(html: string): string {
    // This patch is required for malformatted Morningstar pages
    html = html.replaceAll("</P>", "</p>");
    return html.trim().startsWith("<div")
      ? // This patch is required as the MSCI response does not contain a complete HTML page
        `<html><body>${html}</body></html>`
      : html;
  }

  /**
   * Captures the fetched resource of a fetcher in case of an error and stores it in the database. Based on the fetcher
   * type, the resource can either be a {@link Document} or a {@link Object}.
   * @param stock the affected stock
   * @param dataProvider the name of the data provider
   * @param e The error that occurred during fetching, holding fetched resources if available
   * @returns A string holding a general informational message and a URL to the screenshot
   */
  async captureDataProviderError(stock: Stock, dataProvider: DataProvider, e: DataProviderError): Promise<string> {
    const resourceIDs: string[] = [];

    for await (const dataSource of e.dataSources ?? []) {
      if (!dataSource) continue;
      switch (true) {
        case "documentElement" in dataSource && dataSource.documentElement?.toString().length > 0: {
          // HTML documents
          const resourceID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString(16)}.html`;
          await this.resourceService.create(
            {
              uri: resourceID,
              lastModifiedAt: new Date(),
              content: Buffer.from(dataSource.documentElement.toString()),
              contentType: "text/html; charset=utf-8",
            },
            60 * 60 * 48, // We only store the resource for 48 hours.
          );
          resourceIDs.push(resourceID);
          break;
        }
        default: {
          // All other objects (usually parsed from JSON)
          const resourceID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString(16)}.json`;
          await this.resourceService.create(
            {
              uri: resourceID,
              lastModifiedAt: new Date(),
              content: Buffer.from(JSON.stringify(dataSource)),
              contentType: "application/json; charset=utf-8",
            },
            60 * 60 * 48, // We only store the resource for 48 hours.
          );
          resourceIDs.push(resourceID);
          break;
        }
      }
    }
    return resourceIDs.length
      ? `For additional information, see ${resourceIDs
          .map(
            (resourceID) =>
              `https://${process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.` : ""}${
                process.env.DOMAIN
                // Ensure the user is logged in before accessing the resource API endpoint.
              }/login?redirect=${encodeURIComponent(`/api${resourcesAPIPath}/${encodeURIComponent(resourceID)}`)}`,
          )
          .join(", ")}.`
      : "No additional information available.";
  }

  /**
   * Fetches data from a data provider.
   * @param dataProvider The data provider to fetch from
   * @param options Options for the fetch
   * @returns An array of the stocks that were fetched
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchFromDataProvider(dataProvider: DataProvider, options: FetchOptions): Promise<Stock[]> {
    let stockList: Stock[];

    if (options.ticker) {
      // A single stock is requested.
      const { ticker } = options;
      stockList = [await this.stockService.read(ticker)];
      if (
        !stockList[0][dataProviderID[dataProvider]] ||
        (dataProviderID[dataProvider] === "ticker" && ticker.startsWith("_"))
      )
        // If the only stock to use does not have a valid ID for the data provider, we throw an error.
        throw new NotFoundError(`Stock ${ticker} does not have a valid ${dataProviderID[dataProvider]}.`);
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have an ID for the provider
      stockList = await this.stockService.readFetchable(dataProvider);
    }

    // If no stocks are left, we return an empty array.
    if (stockList.length === 0) return [];

    const stocks: FetcherWorkspace<Stock> = {
      successful: [],
      failed: [],
      skipped: [],
      queued: [...stockList],
    };
    const fetcher = this.#dataProviderFetchers[dataProvider];

    if (fetcher instanceof IndividualFetcher && isIndividualDataProvider(dataProvider)) {
      Logger.info(
        { prefix: "fetch" },
        `Fetching ${stocks.queued.length} stocks from ${dataProviderName[dataProvider]}.`,
      );
      const rejectedResult = (
        await Promise.allSettled(
          [...Array(options.concurrency ?? process.env.MAX_FETCH_CONCURRENCY)].map(async () => {
            // Work while stocks are in the queue
            while (stocks.queued.length) {
              // Get the first stock in the queue
              let stock = stocks.queued.shift();
              // If the queue got empty in the meantime, we end.
              if (!stock) break;

              if (
                !options.noSkip &&
                stock[dataProviderLastFetch[dataProvider]] &&
                // We only fetch stocks that have not been fetched within the TTL of the data provider.
                new Date().getTime() - (stock[dataProviderLastFetch[dataProvider]] ?? new Date(0)).getTime() <
                  1000 * dataProviderTTL[dataProvider]
              ) {
                Logger.info(
                  { prefix: "fetch" },
                  `Stock ${stock.ticker}: Skipping ${
                    dataProviderName[dataProvider]
                  } fetch since last successful fetch was ${TimeUtils.diffToNow(
                    stock[dataProviderLastFetch[dataProvider]],
                  )}`,
                );
                stocks.skipped.push(stock);
                continue;
              }

              try {
                if (options.clear) {
                  await this.stockService.update(
                    stock.ticker,
                    dataProviderProperties[dataProvider].reduce(
                      (obj, key) => ({ ...obj, [key]: ["prices1y", "prices1mo"].includes(key) ? [] : null }),
                      {},
                    ),
                    undefined,
                    true,
                  );
                  stock = await this.stockService.read(stock.ticker);
                }
                await fetcher.fetch(stock, {
                  isStandalone: options.ticker !== undefined,
                });
                stocks.successful.push(await this.stockService.read(stock.ticker));
              } catch (e) {
                stocks.failed.push(await this.stockService.read(stock.ticker));
                if (options.ticker)
                  throw new BadGatewayError(
                    `Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data`,
                    e instanceof Error ? e : undefined,
                  );
                Logger.error(
                  { prefix: "fetch", err: e },
                  `Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data`,
                );
                this.signalService.sendMessage(
                  `${
                    SignalService.ERROR_PREFIX
                  }Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data: ${
                    e instanceof Error ? e.message : String(e)
                  }${
                    e instanceof DataProviderError
                      ? `\n${await this.captureDataProviderError(stock, dataProvider, e)}`
                      : ""
                  }`,
                  await this.userService.readMessageRecipients("fetchError"),
                );
              }
              if (stocks.failed.length >= 10) {
                // If we have 10 errors, we stop fetching data, since something is probably wrong.
                if (stocks.queued.length) {
                  // No other fetcher did this before
                  Logger.error(
                    { prefix: "fetch" },
                    `Aborting fetching information from ${dataProviderName[dataProvider]} after ` +
                      `${stocks.successful.length} successful fetches and ${stocks.failed.length} failures. ` +
                      "Will continue next time.",
                  );
                  this.signalService.sendMessage(
                    `${
                      SignalService.ERROR_PREFIX
                    }Aborting fetching information from ${dataProviderName[dataProvider]} after ` +
                      `${stocks.successful.length} successful fetches and ${stocks.failed.length} failures. ` +
                      "Will continue next time.",
                    await this.userService.readMessageRecipients("fetchError"),
                  );
                  const skippedStocks = [...stocks.queued];
                  stocks.queued.length = 0;
                  skippedStocks.forEach((skippedStock) => stocks.skipped.push(skippedStock));
                }
                break;
              }
            }
          }),
        )
      ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
      Logger.info(
        { prefix: "fetch", fetchCounts: this.#countFetchResults(stocks) },
        `Done fetching stocks from ${dataProviderName[dataProvider]}.`,
      );

      // If stocks are still queued, something went wrong and we send an error response.
      if (stocks.queued.length)
        // If fetchers threw an error, we rethrow the first one
        throw (
          rejectedResult?.reason ??
          new InternalServerError(
            `${dataProviderName[dataProvider]} fetchers exited with stocks ${stocks.queued
              .map((stock) => stock.ticker)
              .join(", ")} still queued.`,
          )
        );

      // If this request was for a single stock and an error occurred, we rethrow that error
      if (options.ticker && rejectedResult) throw rejectedResult.reason;
    } else if (fetcher instanceof BulkFetcher) {
      await fetcher.fetch(stocks, { isStandalone: options.ticker !== undefined, clear: options.clear });
      Logger.info(
        { prefix: "fetch", fetchCounts: this.#countFetchResults(stocks) },
        `Done fetching stocks from ${dataProviderName[dataProvider]}.`,
      );
    }

    return stocks.successful;
  }

  /**
   * Fetches an HTML document from a URL and parses it.
   * @param url The URL to fetch from
   * @param config The fetch request options
   * @param stock The affected stock
   * @param dataProvider The name of the data provider to fetch from
   * @returns The parsed HTML document
   */
  static async getAndParseHTML(
    url: string,
    config: FetchRequestOptions,
    stock: Stock,
    dataProvider: IndividualDataProvider,
  ): Promise<Document> {
    let error: Error | undefined;
    // Fetch the response
    const responseData = await performFetchRequest(url, {
      ...config,
      headers: {
        ...config?.headers,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
      },
    })
      .then((res) => this.#patchHTML(res.data))
      .catch((e) => {
        // If the status code indicates a non-successful fetch, we try to parse the response nonetheless
        if (e instanceof FetchError) {
          error = e;
          return this.#patchHTML(e.response.data);
        }
        throw e;
      });
    const parser = new DOMParser({
      errorHandler: {
        warning: () => undefined,
        error: () => undefined,
        fatalError: (e) => {
          Logger.warn(
            { prefix: "fetch", err: e instanceof Error ? e : new DataProviderError(e) },
            `Stock ${stock.ticker}: Error while parsing ${dataProviderName[dataProvider]} information: ${e}`,
          );
        },
      },
    });
    const document = parser.parseFromString(responseData, "text/html");
    if (error)
      throw new DataProviderError(`Error while fetching HTML page: ${error.message}`, {
        cause: error,
        dataSources: [document],
      });
    return document;
  }

  /**
   * Fetches a JSON object from a URL.
   * @param url The URL to fetch from
   * @param config The fetch request options
   * @returns The JSON object
   */
  static async getJSON(url: string, config: FetchRequestOptions): Promise<Object> {
    let error: Error | undefined;
    // Fetch the response
    const responseData = await performFetchRequest(url, {
      ...config,
      headers: {
        ...config?.headers,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/124.0.0.0 Safari/537.36",
        Connection: "close",
      },
    })
      .then((res) => res.data)
      .catch((e) => {
        // If the status code indicates a non-successful fetch, we try to parse the response nonetheless
        if (e instanceof FetchError) {
          error = e;
          return e.response.data;
        }
        throw e;
      });
    if (!error && responseData.constructor !== Object) error = new TypeError("Response is not JSON.");
    if (error)
      throw new DataProviderError(`Error while fetching JSON object: ${error.message}`, {
        cause: error,
        dataSources: [responseData],
      });
    return responseData;
  }
}

export default FetchService;