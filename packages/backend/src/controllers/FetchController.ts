// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
import { formatDistance } from "date-fns";
import { Request, Response } from "express";
import APIError from "../utils/apiError";
import chalk from "chalk";
import {
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
  GENERAL_ACCESS,
  Resource,
  Stock,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import { readAllStocks, readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import logger, { PREFIX_SELENIUM } from "../utils/logger";
import { createResource, readResource } from "../redis/repositories/resourceRepository";
import axios from "axios";
import dotenv from "dotenv";
import Router from "../utils/router";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import morningstarFetcher from "../fetchers/morningstarFetcher";
import marketScreenerFetcher from "../fetchers/marketScreenerFetcher";
import msciFetcher from "../fetchers/msciFetcher";
import refinitivFetcher from "../fetchers/refinitivFetcher";
import spFetcher from "../fetchers/spFetcher";

dotenv.config();

const URL_SUSTAINALYTICS = "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings" as const;

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
 * Determines the allowed number of fetchers that can work concurrently on fetching a list of stocks.
 *
 * @param {Request} req Request object
 * @returns {number} The number of fetchers to use.
 */
const determineConcurrency = (req: Request): number => {
  let concurrency: number = Number(req.query.concurrency ?? 1);
  if (Number.isNaN(concurrency) || !Number.isSafeInteger(concurrency) || concurrency < 1) {
    logger.warn(
      PREFIX_SELENIUM +
        chalk.yellowBright(`Invalid concurrency “${req.query.concurrency}” requested – using 1 fetcher only.`),
    );
    concurrency = 1;
  }
  if (concurrency > Number(process.env.SELENIUM_MAX_CONCURRENCY)) {
    logger.warn(
      PREFIX_SELENIUM +
        chalk.yellowBright(
          `Desired concurrency “${concurrency}” is larger than the server allows – ` +
            `using maximum value ${Number(process.env.SELENIUM_MAX_CONCURRENCY)} instead.`,
        ),
    );
    concurrency = Number(process.env.SELENIUM_MAX_CONCURRENCY);
  }
  return concurrency;
};

/**
 * This class is responsible for fetching data from external data providers.
 */
export class FetchController {
  /**
   * Fetches data from Morningstar Italy.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchMorningstarEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchMorningstarData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].morningstarID) {
          // If the only stock to use does not have a Morningstar ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a Morningstar ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a Morningstar ID.
      [stockList] = await readAllStocks({
        where: {
          morningstarID: {
            not: null,
          },
        },
        orderBy: {
          // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
          morningstarLastFetch: "asc",
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
      queued: [...stockList],
      skipped: [],
      successful: [],
      failed: [],
    };

    logger.info(PREFIX_SELENIUM + `Fetching ${stocks.queued.length} stocks from Morningstar.`);
    const rejectedResult = (
      await Promise.allSettled([...Array(determineConcurrency(req))].map(() => morningstarFetcher(req, stocks)))
    ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    logger.info(PREFIX_SELENIUM + `Done fetching stocks from Morningstar.`);
    stocks.successful.length && logger.info(PREFIX_SELENIUM + `  Successful: ${stocks.successful.length}`);
    stocks.failed.length && logger.info(PREFIX_SELENIUM + `  Failed: ${stocks.failed.length}`);
    stocks.skipped.length && logger.info(PREFIX_SELENIUM + `  Skipped: ${stocks.skipped.length}`);
    stocks.queued.length && logger.info(PREFIX_SELENIUM + `  Still queued: ${stocks.queued.length}`);

    // If stocks are still queued, something went wrong and we send an error response.
    if (stocks.queued.length) {
      // If fetchers threw an error, we rethrow the first one
      throw (
        rejectedResult?.reason ??
        new APIError(
          500,
          `Morningstar fetchers exited with stocks ${stocks.queued
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
  }

  /**
   * Fetches data from MarketScreener.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchMarketScreenerEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchMarketScreenerData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].marketScreenerID) {
          // If the only stock to use does not have a MarketScreener ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a MarketScreener ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a Market Screener ID.
      [stockList] = await readAllStocks({
        where: {
          marketScreenerID: {
            not: null,
          },
        },
        orderBy: {
          // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
          marketScreenerLastFetch: "asc",
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
      queued: [...stockList],
      skipped: [],
      successful: [],
      failed: [],
    };

    logger.info(PREFIX_SELENIUM + `Fetching ${stocks.queued.length} stocks from MarketScreener.`);
    const rejectedResult = (
      await Promise.allSettled([...Array(determineConcurrency(req))].map(() => marketScreenerFetcher(req, stocks)))
    ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    logger.info(PREFIX_SELENIUM + `Done fetching stocks from MarketScreener.`);
    stocks.successful.length && logger.info(PREFIX_SELENIUM + `  Successful: ${stocks.successful.length}`);
    stocks.failed.length && logger.info(PREFIX_SELENIUM + `  Failed: ${stocks.failed.length}`);
    stocks.skipped.length && logger.info(PREFIX_SELENIUM + `  Skipped: ${stocks.skipped.length}`);
    stocks.queued.length && logger.info(PREFIX_SELENIUM + `  Still queued: ${stocks.queued.length}`);

    // If stocks are still queued, something went wrong and we send an error response.
    if (stocks.queued.length) {
      // If fetchers threw an error, we rethrow the first one
      throw (
        rejectedResult?.reason ??
        new APIError(
          500,
          `MarketScreener fetchers exited with stocks ${stocks.queued
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
  }

  /**
   * Fetches data from MSCI.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchMSCIEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchMSCIData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].msciID) {
          // If the only stock to use does not have an MSCI ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have an MSCI ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have an MSCI ID.
      [stockList] = await readAllStocks({
        where: {
          msciID: {
            not: null,
          },
        },
        orderBy: {
          // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
          msciLastFetch: "asc",
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
      queued: [...stockList],
      skipped: [],
      successful: [],
      failed: [],
    };

    logger.info(PREFIX_SELENIUM + `Fetching ${stocks.queued.length} stocks from MSCI.`);
    const rejectedResult = (
      await Promise.allSettled([...Array(determineConcurrency(req))].map(() => msciFetcher(req, stocks)))
    ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    logger.info(PREFIX_SELENIUM + `Done fetching stocks from MSCI.`);
    stocks.successful.length && logger.info(PREFIX_SELENIUM + `  Successful: ${stocks.successful.length}`);
    stocks.failed.length && logger.info(PREFIX_SELENIUM + `  Failed: ${stocks.failed.length}`);
    stocks.skipped.length && logger.info(PREFIX_SELENIUM + `  Skipped: ${stocks.skipped.length}`);
    stocks.queued.length && logger.info(PREFIX_SELENIUM + `  Still queued: ${stocks.queued.length}`);

    // If stocks are still queued, something went wrong and we send an error response.
    if (stocks.queued.length) {
      // If fetchers threw an error, we rethrow the first one
      throw (
        rejectedResult?.reason ??
        new APIError(
          500,
          `MSCI fetchers exited with stocks ${stocks.queued.map((stock) => stock.ticker).join(", ")} still queued.`,
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
      res.status(200).json(stocks.successful);
    }
  }

  /**
   * Fetches data from Refinitiv.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchRefinitivEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchRefinitivData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].ric) {
          // If the only stock to use does not have a RIC, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a RIC.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a RIC.
      [stockList] = await readAllStocks({
        where: {
          ric: {
            not: null,
          },
        },
        orderBy: {
          // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
          refinitivLastFetch: "asc",
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
      queued: [...stockList],
      skipped: [],
      successful: [],
      failed: [],
    };

    logger.info(PREFIX_SELENIUM + `Fetching ${stocks.queued.length} stocks from Refinitiv.`);
    const rejectedResult = (
      await Promise.allSettled([...Array(determineConcurrency(req))].map(() => refinitivFetcher(req, stocks)))
    ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    logger.info(PREFIX_SELENIUM + `Done fetching stocks from Refinitiv.`);
    stocks.successful.length && logger.info(PREFIX_SELENIUM + `  Successful: ${stocks.successful.length}`);
    stocks.failed.length && logger.info(PREFIX_SELENIUM + `  Failed: ${stocks.failed.length}`);
    stocks.skipped.length && logger.info(PREFIX_SELENIUM + `  Skipped: ${stocks.skipped.length}`);
    stocks.queued.length && logger.info(PREFIX_SELENIUM + `  Still queued: ${stocks.queued.length}`);

    // If stocks are still queued, something went wrong and we send an error response.
    if (stocks.queued.length) {
      // If fetchers threw an error, we rethrow the first one
      throw (
        rejectedResult?.reason ??
        new APIError(
          500,
          `Refinitiv fetchers exited with stocks ${stocks.queued
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
  }

  /**
   * Fetches data from Standard & Poor’s.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchSPEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchSPData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].spID) {
          // If the only stock to use does not have an S&P ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have an S&P ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a Standard & Poor’s ID.
      [stockList] = await readAllStocks({
        where: {
          spID: {
            not: null,
          },
        },
        orderBy: {
          // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
          spLastFetch: "asc",
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
      queued: [...stockList],
      skipped: [],
      successful: [],
      failed: [],
    };

    logger.info(PREFIX_SELENIUM + `Fetching ${stocks.queued.length} stocks from S&P.`);
    const rejectedResult = (
      await Promise.allSettled([...Array(determineConcurrency(req))].map(() => spFetcher(req, stocks)))
    ).find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
    logger.info(PREFIX_SELENIUM + `Done fetching stocks from S&P.`);
    stocks.successful.length && logger.info(PREFIX_SELENIUM + `  Successful: ${stocks.successful.length}`);
    stocks.failed.length && logger.info(PREFIX_SELENIUM + `  Failed: ${stocks.failed.length}`);
    stocks.skipped.length && logger.info(PREFIX_SELENIUM + `  Skipped: ${stocks.skipped.length}`);
    stocks.queued.length && logger.info(PREFIX_SELENIUM + `  Still queued: ${stocks.queued.length}`);

    // If stocks are still queued, something went wrong and we send an error response.
    if (stocks.queued.length) {
      // If fetchers threw an error, we rethrow the first one
      throw (
        rejectedResult?.reason ??
        new APIError(
          500,
          `S&P fetchers exited with stocks ${stocks.queued.map((stock) => stock.ticker).join(", ")} still queued.`,
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
  }

  /**
   * Fetches data from Morningstar Sustainalytics.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Router({
    path: fetchSustainalyticsEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  async fetchSustainalyticsData(req: Request, res: Response) {
    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stockList = [await readStock(ticker)];
        if (!stockList[0].sustainalyticsID) {
          // If the only stock to use does not have a Sustainalytics ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a Sustainalytics ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a Sustainalytics ID.
      [stockList] = await readAllStocks({
        where: {
          sustainalyticsID: {
            not: null,
          },
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

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let sustainalyticsXMLResource: Resource;
    try {
      try {
        // We try to read the cached Sustainalytics data first.
        sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
        logger.info(
          PREFIX_SELENIUM +
            `Using cached Sustainalytics data because last fetch was ${formatDistance(
              sustainalyticsXMLResource.fetchDate,
              new Date().getTime(),
              { addSuffix: true },
            )}.`,
        );
      } catch (e) {
        // If the cached data is not available, we fetch it freshly from the web.
        await axios
          .post(
            URL_SUSTAINALYTICS,
            "page=1&pageSize=100000&resourcePackage=Sustainalytics", // Using a large pageSize to fetch all at once.
            {
              headers: { "Accept-Encoding": "gzip,deflate,compress" },
            },
          )
          .then(async (response) => {
            const sustainalyticsXMLLines: string[] = [];
            response.data.split("\n").forEach((line: string) => {
              // We only keep the lines that contain the data we need.
              if (line.includes(`<a data-href="`) || line.includes(`<div class="col-2">`)) {
                sustainalyticsXMLLines.push(line.trim());
              }
            });
            // We cache the data for 7 days.
            await createResource(
              {
                url: URL_SUSTAINALYTICS,
                fetchDate: new Date(response.headers["date"]),
                content: sustainalyticsXMLLines.join("\n"),
              },
              60 * 60 * 24 * 7,
            );
            sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
          })
          .catch((e) => {
            throw e;
          });
      }
    } catch (e) {
      throw new APIError(502, `Unable to fetch Sustainalytics information: ${String(e.message).split(/[\n:{]/)[0]}`);
    }

    const sustainalyticsXMLLines = sustainalyticsXMLResource.content.split("\n");

    for await (const stock of stockList) {
      let sustainalyticsESGRisk: number = req.query.clear ? null : undefined;

      try {
        // Look for the Sustainalytics ID in the XML lines.
        const sustainalyticsIDIndex = sustainalyticsXMLLines.findIndex(
          (line, index) =>
            line.startsWith(`<a data-href="/${stock.sustainalyticsID}`) &&
            sustainalyticsXMLLines[index + 1].startsWith(`<div class="col-2">`),
        );
        if (sustainalyticsIDIndex === -1) {
          // If the Sustainalytics ID is not found, we throw an error.
          throw new APIError(404, `Cannot find Sustainalytics ID ${stock.sustainalyticsID} in XML.`);
        }
        const sustainalyticsESGRiskLine = sustainalyticsXMLLines[sustainalyticsIDIndex + 1];
        const sustainalyticsESGRiskMatches = sustainalyticsESGRiskLine // Example: <div class="col-2">25.2</div>
          .substring(sustainalyticsESGRiskLine.indexOf(">") + 1)
          .match(/(\d+(\.\d+)?)/g);

        if (
          sustainalyticsESGRiskMatches === null ||
          sustainalyticsESGRiskMatches.length < 1 ||
          Number.isNaN(+sustainalyticsESGRiskMatches[0])
        ) {
          throw new TypeError(`Extracted Sustainalytics ESG Risk is no valid number.`);
        }
        sustainalyticsESGRisk = +sustainalyticsESGRiskMatches[0];

        // Update the stock in the database.
        await updateStock(stock.ticker, {
          sustainalyticsESGRisk,
        });
        updatedStocks.push(await readStock(stock.ticker));
        successfulCount += 1;
      } catch (e) {
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          throw new APIError(
            (e as APIError).status ?? 500,
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${String(e.message).split(/[\n:{]/)[0]}`,
          );
        }
        logger.warn(
          PREFIX_SELENIUM +
            chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e}`),
        );
        if (stock.sustainalyticsESGRisk !== null) {
          // If a Sustainalytics ESG Risk is already stored in the database, but we cannot extract it from the page, we
          // log this as an error and send a message.
          logger.error(
            PREFIX_SELENIUM +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of Sustainalytics ESG Risk failed unexpectedly. ` +
                  `This incident will be reported.`,
              ),
          );
          await signal.sendMessage(
            SIGNAL_PREFIX_ERROR +
              `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${
                String(e.message).split(/[\n:{]/)[0]
              }`,
            "fetchError",
          );
          errorCount += 1;
        } else {
          successfulCount += 1;
        }
      }
      if (errorCount >= 10) {
        // If we have 10 errors, we stop extracting data, since something is probably wrong.
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Aborting extracting information from Sustainalytics after ${successfulCount} successful extractions ` +
                `and ${errorCount} failures. Will continue next time.`,
            ),
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting extracting information from Sustainalytics after ${successfulCount} successful extractions ` +
            `and ${errorCount} failures. Will continue next time.`,
          "fetchError",
        );
        break;
      }
    }
    if (updatedStocks.length === 0) {
      res.status(204).end();
    } else {
      res.status(200).json(updatedStocks).end();
    }
  }
}
