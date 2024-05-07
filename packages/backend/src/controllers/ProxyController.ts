import {
  FetchError,
  GENERAL_ACCESS,
  isIndustry,
  proxyEndpointPath,
  yahooFinanceEndpointSuffix,
} from "@rating-tracker/commons";
import type { Request, Response } from "express";

import APIError from "../utils/APIError";
import { performFetchRequest } from "../utils/fetchRequest";
import Router from "../utils/router";

const YAHOO_FINANCE_API_URL = "https://query1.finance.yahoo.com/v1/finance/search";

/**
 * This class is responsible for relaying requests to external APIs.
 */
export class ProxyController {
  /**
   * Relays a request to the Yahoo Finance API.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if the API request is not successful
   */
  @Router({
    path: proxyEndpointPath + yahooFinanceEndpointSuffix,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getYahooFinance(req: Request, res: Response) {
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
    const { quotes } = yahooFinanceResponse.data;
    if (!quotes || !Array.isArray(quotes))
      throw new APIError(502, "The Yahoo Finance API returned an invalid response.");
    res
      .status(200)
      .json(
        quotes
          .filter(
            (quote) =>
              typeof quote === "object" && "symbol" in quote && "longname" in quote && quote.quoteType === "EQUITY",
          )
          .map((quote) => {
            const industry = "industry" in quote ? quote.industry.replaceAll(/[^a-zA-Z0-9]/g, "") : null;
            return {
              ticker: quote.symbol,
              name: quote.longname,
              logoUrl: "logoUrl" in quote ? quote.logoUrl : null,
              industry: isIndustry(industry) ? industry : null,
            };
          }),
      )
      .end();
  }
}
