import type { Resource, Stock } from "@rating-tracker/commons";
import {
  dataProviderTTL,
  fetchLSEGEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";
import { DateTime } from "luxon";

import { readStocks, readStock, updateStock } from "../db/tables/stockTable";
import { fetchFromDataProvider } from "../fetchers/fetchHelper";
import * as fetch from "../openapi/parameters/fetch";
import * as stock from "../openapi/parameters/stock";
import { unauthorized, forbidden, notFound, tooManyRequestsJSONError } from "../openapi/responses/clientError";
import { badGateway, internalServerError } from "../openapi/responses/serverError";
import { accepted, noContent, okStockList } from "../openapi/responses/success";
import { createResource, readResource } from "../redis/repositories/resourceRepository";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import { performFetchRequest } from "../utils/fetchRequest";
import logger from "../utils/logger";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for fetching data from external data providers.
 */
class FetchController extends Singleton {
  /**
   * Fetches information from Morningstar Italy web page.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchMorningstarData",
      summary: "Fetch data from Morningstar",
      description: "Fetches information from Morningstar Italy web page.",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.noSkip,
        fetch.clear,
        fetch.concurrency,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "502": badGateway,
      },
    },
    method: "post",
    path: fetchMorningstarEndpointPath,
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchMorningstarData: RequestHandler = async (req: Request, res: Response) => {
    await fetchFromDataProvider(req, res, "morningstar");
  };

  /**
   * Fetches information from MarketScreener web page.
   * @param req Request object.
   * @param res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchMarketScreenerData",
      summary: "Fetch data from MarketScreener",
      description: "Fetches information from Market Screener web page.",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.noSkip,
        fetch.clear,
        fetch.concurrency,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "502": badGateway,
      },
    },
    method: "post",
    path: fetchMarketScreenerEndpointPath,
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchMarketScreenerData: RequestHandler = async (req: Request, res: Response) => {
    await fetchFromDataProvider(req, res, "marketScreener");
  };

  /**
   * Fetches information from MSCI ESG Ratings & Climate Search Tool web page.
   * @param req Request object.
   * @param res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchMSCIData",
      summary: "Fetch data from MSCI",
      description: "Fetches information from MSCI ESG Ratings & Climate Search Tool web page",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.noSkip,
        fetch.clear,
        fetch.concurrency,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "502": badGateway,
      },
    },
    method: "post",
    path: fetchMSCIEndpointPath,
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchMSCIData: RequestHandler = async (req: Request, res: Response) => {
    await fetchFromDataProvider(req, res, "msci");
  };

  /**
   * Fetches information from LSEG Data & Analytics API.
   * @param req Request object.
   * @param res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchLSEGData",
      summary: "Fetch data from LSEG",
      description: "Fetches information from LSEG Data & Analytics API",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.noSkip,
        fetch.clear,
        fetch.concurrency,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "429": tooManyRequestsJSONError,
        "502": badGateway,
      },
    },
    path: fetchLSEGEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchLSEGData: RequestHandler = async (req: Request, res: Response) => {
    await fetchFromDataProvider(req, res, "lseg");
  };

  /**
   * Fetches information from Standard & Poor’s Global Sustainable1 ESG Scores web page.
   * @param req Request object.
   * @param res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchSPData",
      summary: "Fetch data from S&P",
      description: "Fetches information from Standard & Poor’s Global Sustainable1 ESG Scores web page.",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.noSkip,
        fetch.clear,
        fetch.concurrency,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "502": badGateway,
      },
    },
    method: "post",
    path: fetchSPEndpointPath,
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchSPData: RequestHandler = async (req: Request, res: Response) => {
    await fetchFromDataProvider(req, res, "sp");
  };

  /**
   * Fetches information from Morningstar Sustainalytics API.
   * @param req Request object.
   * @param res Response object.
   * @throws an {@link APIError} in case of a severe error
   */
  @Endpoint({
    spec: {
      tags: ["Fetch API"],
      operationId: "fetchSustainalyticsData",
      summary: "Fetch data from Sustainalytics",
      description: "Fetches information from Morningstar Sustainalytics API.",
      parameters: [
        {
          ...stock.ticker,
          description:
            "The ticker of a stock for which information is to be fetched. " +
            "If not present, all stocks known to the system will be used",
        },
        fetch.detach,
        fetch.clear,
      ],
      responses: {
        "200": okStockList,
        "202": accepted,
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "500": internalServerError,
        "502": badGateway,
      },
    },
    path: fetchSustainalyticsEndpointPath,
    method: "post",
    accessRights: GENERAL_ACCESS + WRITE_STOCKS_ACCESS,
  })
  fetchSustainalyticsData: RequestHandler = async (req: Request, res: Response) => {
    const URL_SUSTAINALYTICS = "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings" as const;

    let stockList: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker !== "string") throw new APIError(400, "Invalid query parameters.");
      stockList = [await readStock(ticker)];
      // If the only stock to use does not have a Sustainalytics ID, we throw an error.
      if (!stockList[0].sustainalyticsID) throw new APIError(404, `Stock ${ticker} does not have a Sustainalytics ID.`);
    } else {
      // When no specific stock is requested, we fetch all stocks from the database which have a Sustainalytics ID.
      [stockList] = await readStocks({ where: { sustainalyticsID: { not: null } } });
    }

    if (stockList.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      res.status(204).end();
      return;
    }
    // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
    if (req.query.detach) res.status(202).end();

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
        await performFetchRequest(URL_SUSTAINALYTICS, {
          // We use a large pageSize to fetch all at once.
          body: "page=1&pageSize=100000&resourcePackage=Sustainalytics",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "POST",
        })
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
                fetchDate: new Date(response.headers.get("Date")),
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
        // If the Sustainalytics ID is not found, we throw an error.
        if (sustainalyticsIDIndex === -1)
          throw new APIError(404, `Cannot find Sustainalytics ID ${stock.sustainalyticsID} in XML.`);

        const sustainalyticsESGRiskLine = sustainalyticsXMLLines[sustainalyticsIDIndex + 1];
        const sustainalyticsESGRiskMatches = sustainalyticsESGRiskLine // Example: <div class="col-2">25.2</div>
          .substring(sustainalyticsESGRiskLine.indexOf(">") + 1)
          .match(/(\d+(\.\d+)?)/g);

        if (
          sustainalyticsESGRiskMatches === null ||
          sustainalyticsESGRiskMatches.length < 1 ||
          Number.isNaN(+sustainalyticsESGRiskMatches[0])
        )
          throw new TypeError("Extracted Sustainalytics ESG Risk is no valid number.");
        sustainalyticsESGRisk = +sustainalyticsESGRiskMatches[0];

        // Update the stock in the database.
        await updateStock(stock.ticker, {
          sustainalyticsESGRisk,
        });
        updatedStocks.push(await readStock(stock.ticker));
        successfulCount += 1;
      } catch (e) {
        if (req.query.ticker)
          // If this request was for a single stock, we throw an error.
          throw new APIError(
            (e as APIError).status ?? 500,
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk`,
            e,
          );
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
    if (updatedStocks.length === 0) res.status(204).end();
    else res.status(200).json(updatedStocks).end();
  };
}

export default new FetchController();
