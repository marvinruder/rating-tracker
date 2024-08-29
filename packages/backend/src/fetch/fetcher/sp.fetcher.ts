import type { Stock } from "@rating-tracker/commons";
import { SP_PREMIUM_STOCK_ERROR_MESSAGE } from "@rating-tracker/commons";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from Standard & Poor’s.
 */
class SPFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  /**
   * Fetches data from Standard & Poor’s.
   * @param stock The stock to extract data for
   * @param options Options for the fetch
   * @param options.isStandalone Whether the fetch is for a single stock
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stock: Stock, options: { isStandalone: boolean }): Promise<void> {
    let spESGScore: number | undefined;

    const document = await FetchService.getAndParseHTML(
      "https://www.spglobal.com/esg/scores/results",
      { params: { cid: stock.spID! } },
      stock,
      "sp",
    );

    // Prepare an error message.
    let errorMessage = "";

    try {
      const lockedContent = document.getElementsByClassName("lock__content");
      if (
        lockedContent.length > 0 &&
        lockedContent[0].textContent!.includes(
          "This company's ESG Score and underlying data are available via our premium channels",
        )
      ) {
        // If the content is available for premium subscribers only, we throw an error.
        // Sadly, we are not a premium subscriber :(
        throw new DataProviderError(SP_PREMIUM_STOCK_ERROR_MESSAGE, { dataSources: [document] });
      }
      spESGScore = Number(document.getElementsByClassName("scoreModule__score")[0].textContent);
    } catch (e) {
      Logger.warn({ prefix: "fetch", err: e }, `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`);
      if (
        stock.spESGScore !== null ||
        (options.isStandalone && e instanceof Error && e.message.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE))
      ) {
        // If an S&P ESG Score is already stored in the database, but we cannot extract it from the page, we log this
        // as an error and send a message.
        // To show the designated premium stock error message, we check if the request was for a single stock and the
        // error message contains the premium stock error message, and handle the error in the same way.
        Logger.error(
          { prefix: "fetch" },
          `Stock ${stock.ticker}: Extraction of S&P ESG Score failed unexpectedly. This incident will be reported.`,
        );
        errorMessage += `\n\tUnable to extract S&P ESG Score: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
      spLastFetch:
        errorMessage.includes("\n") && !errorMessage.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE) ? undefined : new Date(),
      spESGScore,
    });
    // An error occurred if and only if the error message contains a newline character.
    if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document] });
  }
}
export default SPFetcher;
