import {
  dataProviderTTL,
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
import axios from "axios";
import { Request, Response } from "express";
import { DateTime } from "luxon";

import { readStocks, readStock, updateStock } from "../db/tables/stockTable";
import { fetchFromDataProvider } from "../fetchers/fetchHelper";
import { createResource, readResource } from "../redis/repositories/resourceRepository";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import APIError from "../utils/APIError";
import logger from "../utils/logger";
import Router from "../utils/router";

const URL_SUSTAINALYTICS = "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings" as const;

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
    await fetchFromDataProvider(req, res, "morningstar");
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
    await fetchFromDataProvider(req, res, "marketScreener");
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
    await fetchFromDataProvider(req, res, "msci");
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
    await fetchFromDataProvider(req, res, "refinitiv");
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
    await fetchFromDataProvider(req, res, "sp");
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
      [stockList] = await readStocks({
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
          { prefix: "fetch" },
          `Using cached Sustainalytics data because last fetch was ${DateTime.fromJSDate(
            sustainalyticsXMLResource.fetchDate,
          ).toRelative()}.`,
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
              if (line.includes('<a data-href="') || line.includes('<div class="col-2">')) {
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
              dataProviderTTL["sustainalytics"],
            );
            sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
          })
          .catch((e) => {
            throw e;
          });
      }
    } catch (e) {
      throw new APIError(502, "Unable to fetch Sustainalytics information", e);
    }

    const sustainalyticsXMLLines = sustainalyticsXMLResource.content.split("\n");

    for await (const stock of stockList) {
      let sustainalyticsESGRisk: number = req.query.clear ? null : undefined;

      try {
        // Look for the Sustainalytics ID in the XML lines.
        const sustainalyticsIDIndex = sustainalyticsXMLLines.findIndex(
          (line, index) =>
            line.startsWith(`<a data-href="/${stock.sustainalyticsID}`) &&
            sustainalyticsXMLLines[index + 1].startsWith('<div class="col-2">'),
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
          throw new TypeError("Extracted Sustainalytics ESG Risk is no valid number.");
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
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk`,
            e,
          );
        }
        logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e}`);
        if (stock.sustainalyticsESGRisk !== null) {
          // If a Sustainalytics ESG Risk is already stored in the database, but we cannot extract it from the page, we
          // log this as an error and send a message.
          logger.error(
            { prefix: "fetch", err: e },
            `Stock ${stock.ticker}: Extraction of Sustainalytics ESG Risk failed unexpectedly. ` +
              "This incident will be reported.",
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
          { prefix: "fetch" },
          `Aborting extracting information from Sustainalytics after ${successfulCount} successful extractions ` +
            `and ${errorCount} failures. Will continue next time.`,
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
