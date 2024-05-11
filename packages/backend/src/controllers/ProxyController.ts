import type { FetchResponse } from "@rating-tracker/commons";
import {
  FetchError,
  GENERAL_ACCESS,
  isIndustry,
  proxyEndpointPath,
  yahooFinanceEndpointSuffix,
} from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { tooManyRequestsJSONError, unauthorized } from "../openapi/responses/clientError";
import { badGateway } from "../openapi/responses/serverError";
import { okYahooStockStubList } from "../openapi/responses/success";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import { performFetchRequest } from "../utils/fetchRequest";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for relaying requests to external APIs.
 */
class ProxyController extends Singleton {
  /**
   * Relays a request to the Yahoo Finance API.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if the API request is not successful
   */
  @Endpoint({
    spec: {
      tags: ["Proxy API"],
      operationId: "getYahooFinance",
      summary: "Access the Yahoo Finance API",
      description: "Relays a request to the Yahoo Finance API.",
      parameters: [
        {
          name: "q",
          in: "query",
          required: true,
          schema: { type: "string" },
          description:
            "The query to be sent to the Yahoo Finance API. " +
            "Can be a ticker, an ISIN, a name or a similar identifier of a stock.",
          example: "us0378331005",
        },
      ],
      responses: {
        "200": okYahooStockStubList,
        "401": unauthorized,
        "429": tooManyRequestsJSONError,
        "502": badGateway,
      },
    },
    method: "get",
    path: proxyEndpointPath + yahooFinanceEndpointSuffix,
    accessRights: GENERAL_ACCESS,
  })
  getYahooFinance: RequestHandler = async (req: Request, res: Response) => {
    const YAHOO_FINANCE_API_URL = "https://query1.finance.yahoo.com/v1/finance/search";

    const { q } = req.query;
    if (typeof q !== "string") throw new APIError(400, "Invalid query parameters.");
    const yahooFinanceResponse = await performFetchRequest(YAHOO_FINANCE_API_URL, {
      params: { q, newsCount: 0, listsCount: 0, enableLogoUrl: true },
    }).catch((e) => {
      /* c8 ignore start */ // No error response is mocked
      if (e instanceof FetchError && e.response.status === 429)
        throw new APIError(429, "Too many requests were made to the Yahoo Finance API. Please try again later.");
      throw new APIError(502, "The Yahoo Finance API is currently unavailable. Please try again later.", e);
      /* c8 ignore stop */
    });

    // Get quotes from response
    const { quotes } = yahooFinanceResponse.data;
    if (!quotes || !Array.isArray(quotes))
      throw new APIError(502, "The Yahoo Finance API returned an invalid response.");

    // Filter by valid equities
    const equities = quotes.filter(
      (quote) => typeof quote === "object" && "symbol" in quote && "longname" in quote && quote.quoteType === "EQUITY",
    );

    // Fetch logos from valid URLs and create data URLs
    const logoDataURLs: Record<string, string> = {};
    const logoResponseResults = (
      await Promise.allSettled<FetchResponse>(
        equities
          .filter((equity) => "logoUrl" in equity && typeof equity.logoUrl === "string" && URL.canParse(equity.logoUrl))
          .map((equity) => performFetchRequest(equity.logoUrl)),
      )
    ).filter((result): result is PromiseFulfilledResult<FetchResponse> => result.status === "fulfilled");
    for await (const result of logoResponseResults) {
      const response = result.value;
      const mimeType = response.headers.get("content-type");
      const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
      if (mimeType && base64) logoDataURLs[response.url] = `data:${mimeType};base64,${base64}`;
    }

    res
      .status(200)
      .json(
        equities.map((equity) => {
          const industry = "industry" in equity ? equity.industry.replaceAll(/[^a-zA-Z0-9]/g, "") : null;
          return {
            ticker: equity.symbol,
            name: equity.longname,
            logoUrl: "logoUrl" in equity && equity.logoUrl in logoDataURLs ? logoDataURLs[equity.logoUrl] : null,
            industry: isIndustry(industry) ? industry : null,
          };
        }),
      )
      .end();
  };
}

export default new ProxyController();
