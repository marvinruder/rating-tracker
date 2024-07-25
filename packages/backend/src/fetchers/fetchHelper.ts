import type { FetchRequestOptions, IndividualDataProvider, Stock } from "@rating-tracker/commons";
import {
  FetchError,
  dataProviderID,
  dataProviderLastFetch,
  dataProviderName,
  dataProviderProperties,
  dataProviderTTL,
  resourcesAPIPath,
} from "@rating-tracker/commons";
import { DOMParser } from "@xmldom/xmldom";
import type { Request, Response } from "express";

import { createResource } from "../db/tables/resourceTable";
import { readStocks, readStock, updateStock } from "../db/tables/stockTable";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import * as signal from "../signal/signal";
import APIError from "../utils/APIError";
import DataProviderError from "../utils/DataProviderError";
import { performFetchRequest } from "../utils/fetchRequest";
import logger from "../utils/logger";
import { timeDiffToNow } from "../utils/time";

import lsegFetcher from "./lsegFetcher";
import marketScreenerFetcher from "./marketScreenerFetcher";
import morningstarFetcher from "./morningstarFetcher";
import msciFetcher from "./msciFetcher";
import spFetcher from "./spFetcher";
import yahooFetcher from "./yahooFetcher";

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
 * A function fetching information from a data provider for a single stock.
 * @param req Request object
 * @param stock The stock to fetch information for
 * @returns a Promise that resolves after the fetch is completed successfully
 * @throws a {@link DataProviderError} in case of a severe error
 */
export type Fetcher = (req: Request, stock: Stock) => Promise<void>;

/**
 * Captures the fetched resource of a fetcher in case of an error and stores it in the database. Based on the fetcher
 * type, the resource can either be a {@link Document} or a {@link Object}.
 * @param stock the affected stock
 * @param dataProvider the name of the data provider
 * @param e The error that occurred during fetching, holding fetched resources if available
 * @returns A string holding a general informational message and a URL to the screenshot
 */
export const captureDataProviderError = async (
  stock: Stock,
  dataProvider: IndividualDataProvider,
  e: DataProviderError,
): Promise<string> => {
  const resourceIDs: string[] = [];

  for await (const dataSource of e.dataSources ?? []) {
    if (!dataSource) continue;
    switch (true) {
      case "documentElement" in dataSource && dataSource.documentElement?.toString().length > 0: {
        // HTML documents
        const resourceID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString(16)}.html`;
        await createResource(
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
        await createResource(
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
            `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${
              process.env.DOMAIN
              // Ensure the user is logged in before accessing the resource API endpoint.
            }/login?redirect=${encodeURIComponent(`/api${resourcesAPIPath}/${encodeURIComponent(resourceID)}`)}`,
        )
        .join(", ")}.`
    : "No additional information available.";
};

/**
 * A record of functions that extract data from a data provider.
 */
const dataProviderFetchers: Record<IndividualDataProvider, Fetcher> = {
  yahoo: yahooFetcher,
  morningstar: morningstarFetcher,
  marketScreener: marketScreenerFetcher,
  msci: msciFetcher,
  lseg: lsegFetcher,
  sp: spFetcher,
};

/**
 * Creates an object containing the aggregated results of the fetch for logging.
 * @param stocks The fetcher workspace.
 * @returns An object containing the aggregated results of the fetch.
 */
const countFetchResults = (
  stocks: FetcherWorkspace<unknown>,
): Partial<Record<keyof FetcherWorkspace<unknown>, number>> =>
  Object.entries(stocks).reduce(
    (obj, [key, value]) => (value.length ? Object.assign(obj, { [key]: value.length }) : obj),
    {},
  );

/**
 * Determines the allowed number of fetchers that can work concurrently on fetching a list of stocks.
 * @param req Request object
 * @returns The number of fetchers to use.
 */
const determineConcurrency = (req: Request): number => {
  let concurrency: number = Number(req.query.concurrency ?? 1);
  if (Number.isNaN(concurrency) || !Number.isSafeInteger(concurrency) || concurrency < 1) {
    logger.warn(
      { prefix: "fetch" },
      `Invalid concurrency “${req.query.concurrency}” requested – using 1 fetcher only.`,
    );
    concurrency = 1;
  }
  if (concurrency > Number(process.env.MAX_FETCH_CONCURRENCY)) {
    logger.warn(
      { prefix: "fetch" },
      `Desired concurrency “${concurrency}” is larger than the server allows – ` +
        `using maximum value ${Number(process.env.MAX_FETCH_CONCURRENCY)} instead.`,
    );
    concurrency = Number(process.env.MAX_FETCH_CONCURRENCY);
  }
  return concurrency;
};

/**
 * Fetches data from a data provider.
 * @param req Request object
 * @param res Response object
 * @param dataProvider The data provider to fetch from
 * @throws an {@link APIError} in case of a severe error
 */
export const fetchFromDataProvider = async (
  req: Request,
  res: Response,
  dataProvider: IndividualDataProvider,
): Promise<void> => {
  let stockList: Stock[];

  if (req.query.ticker) {
    // A single stock is requested.
    const ticker = req.query.ticker;
    if (typeof ticker !== "string") throw new APIError(400, "Invalid query parameters.");
    stockList = [await readStock(ticker)];
    if (
      !stockList[0][dataProviderID[dataProvider]] ||
      (dataProviderID[dataProvider] === "ticker" && ticker.startsWith("_"))
    )
      // If the only stock to use does not have a valid ID for the data provider, we throw an error.
      throw new APIError(404, `Stock ${ticker} does not have a valid ${dataProviderID[dataProvider]}.`);
  } else {
    // When no specific stock is requested, we fetch all stocks from the database which have an ID for the data provider
    [stockList] = await readStocks({
      // The ticker must never be null, so we adjust the filter to exclude examplary ticker values in this case:
      ...(dataProviderID[dataProvider] === "ticker"
        ? { where: { [dataProviderID[dataProvider]]: { not: { startsWith: "\\_" } } } }
        : { where: { [dataProviderID[dataProvider]]: { not: null } } }),
      // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
      orderBy: { [dataProviderLastFetch[dataProvider]]: "asc" },
    });
  }

  if (stockList.length === 0) {
    // If no stocks are left, we return a 204 No Content response.
    res.status(204).end();
    return;
  }
  // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
  if (req.query.detach) res.status(202).end();

  const stocks: FetcherWorkspace<Stock> = {
    successful: [],
    failed: [],
    skipped: [],
    queued: [...stockList],
  };

  logger.info({ prefix: "fetch" }, `Fetching ${stocks.queued.length} stocks from ${dataProviderName[dataProvider]}.`);
  const rejectedResult = (
    await Promise.allSettled(
      [...Array(determineConcurrency(req))].map(async () => {
        // Work while stocks are in the queue
        while (stocks.queued.length) {
          // Get the first stock in the queue
          let stock = stocks.queued.shift();
          // If the queue got empty in the meantime, we end.
          if (!stock) break;

          if (
            !req.query.noSkip &&
            stock[dataProviderLastFetch[dataProvider]] &&
            // We only fetch stocks that have not been fetched within the TTL of the data provider.
            new Date().getTime() - stock[dataProviderLastFetch[dataProvider]].getTime() <
              1000 * dataProviderTTL[dataProvider]
          ) {
            logger.info(
              { prefix: "fetch" },
              `Stock ${stock.ticker}: Skipping ${
                dataProviderName[dataProvider]
              } fetch since last successful fetch was ${timeDiffToNow(stock[dataProviderLastFetch[dataProvider]])}`,
            );
            stocks.skipped.push(stock);
            continue;
          }

          try {
            if (req.query.clear) {
              await updateStock(
                stock.ticker,
                dataProviderProperties[dataProvider].reduce(
                  (obj, key) => ({ ...obj, [key]: ["prices1y", "prices1mo"].includes(key) ? [] : null }),
                  {},
                ),
                undefined,
                true,
              );
              stock = await readStock(stock.ticker);
            }
            await dataProviderFetchers[dataProvider](req, stock);
            stocks.successful.push(await readStock(stock.ticker));
          } catch (e) {
            stocks.failed.push(await readStock(stock.ticker));
            if (req.query.ticker)
              throw new APIError(
                502,
                `Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data`,
                e,
              );
            logger.error(
              { prefix: "fetch", err: e },
              `Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data`,
            );
            await signal.sendMessage(
              SIGNAL_PREFIX_ERROR +
                `Stock ${stock.ticker}: Error while fetching ${dataProviderName[dataProvider]} data: ` +
                e.message +
                (e instanceof DataProviderError ? "\n" + (await captureDataProviderError(stock, dataProvider, e)) : ""),
              "fetchError",
            );
          }
          if (stocks.failed.length >= 10) {
            // If we have 10 errors, we stop fetching data, since something is probably wrong.
            if (stocks.queued.length) {
              // No other fetcher did this before
              logger.error(
                { prefix: "fetch" },
                `Aborting fetching information from ${dataProviderName[dataProvider]} after ` +
                  `${stocks.successful.length} successful fetches and ${stocks.failed.length} failures. ` +
                  "Will continue next time.",
              );
              await signal.sendMessage(
                SIGNAL_PREFIX_ERROR +
                  `Aborting fetching information from ${dataProviderName[dataProvider]} after ` +
                  `${stocks.successful.length} successful fetches and ${stocks.failed.length} failures. ` +
                  "Will continue next time.",
                "fetchError",
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
  logger.info(
    { prefix: "fetch", fetchCounts: countFetchResults(stocks) },
    `Done fetching stocks from ${dataProviderName[dataProvider]}.`,
  );

  // If stocks are still queued, something went wrong and we send an error response.
  if (stocks.queued.length)
    // If fetchers threw an error, we rethrow the first one
    throw (
      rejectedResult?.reason ??
      new APIError(
        500,
        `${dataProviderName[dataProvider]} fetchers exited with stocks ${stocks.queued
          .map((stock) => stock.ticker)
          .join(", ")} still queued.`,
      )
    );

  // If this request was for a single stock and an error occurred, we rethrow that error
  if (req.query.ticker && rejectedResult) throw rejectedResult.reason;

  if (!stocks.successful.length) res.status(204).end();
  else res.status(200).json(stocks.successful).end();
};

/**
 * Apply data-provider-specific patches to the HTML document.
 * @param html The HTML document to patch
 * @returns The patched HTML document
 */
const patchHTML = (html: string): string => {
  // This patch is required for malformatted Morningstar pages
  html = html.replaceAll("</P>", "</p>");
  return html.trim().startsWith("<div")
    ? // This patch is required as the MSCI response does not contain a complete HTML page
      `<html><body>${html}</body></html>`
    : html;
};

/**
 * Fetches an HTML document from a URL and parses it.
 * @param url The URL to fetch from
 * @param config The fetch request options
 * @param stock The affected stock
 * @param dataProvider The name of the data provider to fetch from
 * @returns The parsed HTML document
 */
export const getAndParseHTML = async (
  url: string,
  config: FetchRequestOptions,
  stock: Stock,
  dataProvider: IndividualDataProvider,
): Promise<Document> => {
  let error: Error;
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
    .then((res) => patchHTML(res.data))
    .catch((e) => {
      // If the status code indicates a non-successful fetch, we try to parse the response nonetheless
      if (e instanceof FetchError) {
        error = e;
        return patchHTML(e.response.data);
      }
      throw e;
    });
  const parser = new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: () => undefined,
      fatalError: (e) => {
        logger.warn(
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
};

/**
 * Fetches a JSON object from a URL.
 * @param url The URL to fetch from
 * @param config The fetch request options
 * @returns The JSON object
 */
export const getJSON = async (url: string, config: FetchRequestOptions): Promise<Object> => {
  let error: Error;
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
};
