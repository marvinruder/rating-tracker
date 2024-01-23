import type { HTMLDataProvider, IndividualDataProvider, JSONDataProvider, Stock } from "@rating-tracker/commons";
import {
  dataProviderID,
  dataProviderLastFetch,
  dataProviderName,
  dataProviderTTL,
  isHTMLDataProvider,
  isJSONDataProvider,
  resourcesEndpointPath,
} from "@rating-tracker/commons";
import { DOMParser } from "@xmldom/xmldom";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { Request, Response } from "express";
// import { WebDriver } from "selenium-webdriver";
import { DateTime } from "luxon";

import { readStocks, readStock } from "../db/tables/stockTable";
import { createResource } from "../redis/repositories/resourceRepository";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import * as signal from "../signal/signal";
import APIError from "../utils/APIError";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";
// import { getDriver, quitDriver, takeScreenshot } from "../utils/webdriver";

import lsegFetcher from "./lsegFetcher";
import marketScreenerFetcher from "./marketScreenerFetcher";
import morningstarFetcher from "./morningstarFetcher";
import msciFetcher from "./msciFetcher";
import spFetcher from "./spFetcher";

/**
 * A shared object holding lists of stocks that multiple fetchers work on.
 */
export type FetcherWorkspace<T> = {
  queued: T[];
  skipped: T[];
  successful: T[];
  failed: T[];
};

// type Fetcher = HTMLFetcher | JSONFetcher; // | SeleniumFetcher;

export type JSONFetcher = (req: Request, stocks: FetcherWorkspace<Stock>, stock: Stock, json: Object) => Promise<void>;

export type HTMLFetcher = (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  document: Document,
) => Promise<void>;

// export type SeleniumFetcher = (
//   req: Request,
//   stocks: FetcherWorkspace<Stock>,
//   stock: Stock,
//   driver: WebDriver,
// ) => Promise<boolean>;

/**
 * An object holding the source of a fetcher. Only one of the properties is set.
 */
type FetcherSource = {
  /**
   * The JSON object fetched by a {@link JSONFetcher}.
   */
  json?: Object;
  /**
   * The HTML document fetched by a {@link HTMLFetcher}.
   */
  document?: Document;
  // /**
  //  * The WebDriver instance used by a {@link SeleniumFetcher}.
  //  */
  // driver?: WebDriver;
};

/**
 * Captures the fetched resource of a fetcher and stores it in Redis. Based on the fetcher type, the resource can either
 * be a {@link Document} or a {@link Object}.
 *
 * @param {Stock} stock the affected stock
 * @param {IndividualDataProvider} dataProvider the name of the data provider
 * @param {FetcherSource} source the source of the fetcher
 * @returns {Promise<string>} A string holding a general informational message and a URL to the screenshot
 */
export const captureFetchError = async (
  stock: Stock,
  dataProvider: IndividualDataProvider,
  source: FetcherSource,
): Promise<string> => {
  let resourceID: string = "";
  switch (true) {
    case isJSONDataProvider(dataProvider):
      resourceID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString()}.json`;
      if (
        // Only create the resource if we actually have a JSON object
        !source?.json ||
        // Create the JSON resource in Redis
        !(await createResource(
          {
            url: resourceID,
            fetchDate: new Date(),
            content: JSON.stringify(source.json),
          },
          60 * 60 * 48, // We only store the screenshot for 48 hours.
        ))
      )
        resourceID = ""; // If unsuccessful, clear the resource ID
      break;
    case isHTMLDataProvider(dataProvider):
      resourceID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString()}.html`;
      if (
        // Only create the resource if we actually have a valid HTML document
        !source?.document?.documentElement?.toString() ||
        // Create the HTML resource in Redis
        !(await createResource(
          {
            url: resourceID,
            fetchDate: new Date(),
            content: source.document.documentElement.toString(),
          },
          60 * 60 * 48, // We only store the screenshot for 48 hours.
        ))
      )
        resourceID = ""; // If unsuccessful, clear the resource ID
      break;
    // case isSeleniumDataProvider(dataProvider):
    //   resourceID = await takeScreenshot(source.driver, stock, dataProvider);
    //   break;
  }
  return resourceID
    ? `For additional information, see https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${
        process.env.DOMAIN
        // Ensure the user is logged in before accessing the resource API endpoint.
      }/login?redirect=${encodeURIComponent(`/api${resourcesEndpointPath}/${resourceID}`)}.`
    : "No additional information available.";
};

/**
 * A record of functions that extract data from a data provider.
 */
const dataProviderFetchers: Record<HTMLDataProvider, HTMLFetcher> & Record<JSONDataProvider, JSONFetcher> = {
  morningstar: morningstarFetcher,
  marketScreener: marketScreenerFetcher,
  msci: msciFetcher,
  lseg: lsegFetcher,
  sp: spFetcher,
};

/**
 * Creates an object containing the aggregated results of the fetch for logging.
 *
 * @param {FetcherWorkspace<unknown>} stocks The fetcher workspace.
 * @returns {object} An object containing the aggregated results of the fetch.
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
 *
 * @param {Request} req Request object
 * @returns {number} The number of fetchers to use.
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
 *
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {IndividualDataProvider} dataProvider The data provider to fetch from
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
    if (typeof ticker === "string") {
      stockList = [await readStock(ticker)];
      if (!stockList[0][dataProviderID[dataProvider]]) {
        // If the only stock to use does not have an ID for the data provider, we throw an error.
        throw new APIError(404, `Stock ${ticker} does not have a ${dataProviderID[dataProvider]}.`);
      }
    }
  } else {
    // When no specific stock is requested, we fetch all stocks from the database which have an ID for the data provider
    [stockList] = await readStocks({
      where: {
        [dataProviderID[dataProvider]]: {
          not: null,
        },
      },
      orderBy: {
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        [dataProviderLastFetch[dataProvider]]: "asc",
      },
    });
  }

  if (stockList.length === 0) {
    // If no stocks are left, we return a 204 No Content response.
    res.status(204).end();
    return;
  }
  if (req.query.detach) {
    // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
    res.status(202).end();
  }

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
        let document: Document;
        let json: Object;

        // let driver: WebDriver;
        // let sessionID: string;
        // if (seleniumDataProviders.includes(dataProvider)) {
        //   // Acquire a new session
        //   driver = await getDriver(true);
        //   sessionID = (await driver.getSession()).getId();
        // }

        // Work while stocks are in the queue
        while (stocks.queued.length) {
          // Get the first stock in the queue
          const stock = stocks.queued.shift();
          if (!stock) {
            // If the queue got empty in the meantime, we end.
            break;
          }
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
              } fetch since last successful fetch was ${DateTime.fromJSDate(
                stock[dataProviderLastFetch[dataProvider]],
              ).toRelative()}`,
            );
            stocks.skipped.push(stock);
            continue;
          }

          try {
            if (isHTMLDataProvider(dataProvider)) {
              await dataProviderFetchers[dataProvider](req, stocks, stock, document);
            } else if (isJSONDataProvider(dataProvider)) {
              await dataProviderFetchers[dataProvider](req, stocks, stock, json);
              // } else if (isSeleniumDataProvider(dataProvider)) {
              //   if (!(await (dataProviderFetchers[dataProvider] as SeleniumFetcher)(req, stocks, stock, driver)))
              //     break;
            }
          } catch (e) {
            stocks.failed.push(stock);
            if (req.query.ticker) {
              // // If the request was for a single stock, we shut down the driver and throw an error.
              // driver && (await quitDriver(driver, sessionID));
              throw new APIError(
                502,
                `Stock ${stock.ticker}: Unable to fetch ${dataProviderName[dataProvider]} data`,
                e,
              );
            }
            logger.error(
              { prefix: "fetch", err: e },
              `Stock ${stock.ticker}: Unable to fetch ${dataProviderName[dataProvider]} data`,
            );
            await signal.sendMessage(
              SIGNAL_PREFIX_ERROR +
                `Stock ${stock.ticker}: Unable to fetch ${dataProviderName[dataProvider]} data: ${
                  String(e.message).split(/[\n:{]/)[0]
                }\n${await captureFetchError(stock, dataProvider, { json, document /* driver */ })}`,
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
        // // The queue is now empty, we end the session.
        // driver && (await quitDriver(driver, sessionID));
      }),
    )
  ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
  logger.info(
    { prefix: "fetch", fetchCounts: countFetchResults(stocks) },
    `Done fetching stocks from ${dataProviderName[dataProvider]}.`,
  );

  // If stocks are still queued, something went wrong and we send an error response.
  if (stocks.queued.length) {
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
  }

  // If this request was for a single stock and an error occurred, we rethrow that error
  if (req.query.ticker && rejectedResult) {
    throw rejectedResult.reason;
  }

  if (!stocks.successful.length) {
    res.status(204).end();
  } else {
    res.status(200).json(stocks.successful).end();
  }
};

/**
 * Fetches an HTML document from a URL and parses it.
 *
 * @param {string} url The URL to fetch from
 * @param {AxiosRequestConfig} config The Axios request configuration
 * @param {Stock} stock The affected stock
 * @param {IndividualDataProvider} dataProvider The name of the data provider to fetch from
 * @returns {Document} The parsed HTML document
 */
// TODO: use in-place modification of the document and extract it from an AxiosError if possible
export const getAndParseHTML = async (
  url: string,
  config: AxiosRequestConfig,
  stock: Stock,
  dataProvider: IndividualDataProvider,
): Promise<Document> =>
  new DOMParser({
    errorHandler: {
      warning: () => undefined,
      error: () => undefined,
      fatalError: (e) => {
        logger.warn(
          { prefix: "fetch", err: e instanceof Error ? e : new FetchError(e) },
          `Stock ${stock.ticker}: Error while parsing ${dataProviderName[dataProvider]} information: ${e}`,
        );
      },
    },
  }).parseFromString(
    await axios
      .get(url, config)
      .then((res) => {
        // This patch is required for malformatted Morningstar pages
        const data = (res.data as string).replaceAll("</P>", "</p>");
        return data.trim().startsWith("<div")
          ? // This patch is required as the MSCI response does not contain a complete HTML page
            `<html><body>${data}</body></html>`
          : data;
      })
      .catch((e) => {
        throw e;
      }),
    "text/html",
  );
