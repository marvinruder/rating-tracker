import type { YahooStockStub } from "@rating-tracker/commons";
import { FetchError, isIndustry } from "@rating-tracker/commons";

import BadGatewayError from "../utils/error/api/BadGatewayError";
import TooManyRequestsError from "../utils/error/api/TooManyRequestsError";
import { performFetchRequest } from "../utils/fetchRequest";

/**
 * This service provides methods to interact with external APIs.
 */
class ProxyService {
  constructor() {}

  /**
   * The URL of the Yahoo Finance API.
   */
  #yahooFinanceAPIURL = "https://query1.finance.yahoo.com/v1/finance/search";

  /**
   * Fetches a response from the Yahoo Finance API search endpoint.
   * @param q The search query. Typically a ticker, a name or a similar identifier of a stock.
   * @returns A {@link Promise} that resolves to an array of stock stubs.
   */
  async fetchYahooFinanceSearch(q: string): Promise<YahooStockStub[]> {
    const yahooFinanceResponse = await performFetchRequest(this.#yahooFinanceAPIURL, {
      params: { q, newsCount: 0, listsCount: 0, enableLogoUrl: true },
    }).catch((e) => {
      /* c8 ignore start */ // No error response is mocked
      if (e instanceof FetchError && e.response.status === 429)
        throw new TooManyRequestsError("Too many requests were made to the Yahoo Finance API. Please try again later.");
      throw new BadGatewayError("The Yahoo Finance API is currently unavailable. Please try again later.", e);
      /* c8 ignore stop */
    });

    // Get quotes from response
    const { quotes } = yahooFinanceResponse.data;
    if (!quotes || !Array.isArray(quotes))
      throw new BadGatewayError("The Yahoo Finance API returned an invalid response.");

    // Filter by valid equities
    const equities = quotes.filter(
      (quote) => typeof quote === "object" && "symbol" in quote && "longname" in quote && quote.quoteType === "EQUITY",
    );

    // Fetch logos from valid URLs and create data URLs
    const logoDataURLs: Record<string, string> = {};
    await Promise.allSettled(
      equities
        .filter((equity) => "logoUrl" in equity && typeof equity.logoUrl === "string" && URL.canParse(equity.logoUrl))
        // deepcode ignore Ssrf: false positive (URL comes from Yahoo Finance API response, is validated)
        .map((equity) =>
          performFetchRequest(equity.logoUrl).then(async (response) => {
            const mimeType = response.headers.get("content-type");
            const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
            if (mimeType && base64) logoDataURLs[response.url] = `data:${mimeType};base64,${base64}`;
          }),
        ),
    );

    return equities.map((equity) => {
      const industry = "industry" in equity ? equity.industry.replaceAll(/[^a-zA-Z0-9]/g, "") : null;
      return {
        ticker: equity.symbol,
        name: equity.longname,
        logoUrl: "logoUrl" in equity && equity.logoUrl in logoDataURLs ? logoDataURLs[equity.logoUrl] : null,
        industry: isIndustry(industry) ? industry : null,
      };
    });
  }
}

export default ProxyService;
