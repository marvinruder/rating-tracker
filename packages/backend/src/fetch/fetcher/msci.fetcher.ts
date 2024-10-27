import type { MSCIESGRating, Stock } from "@rating-tracker/commons";
import { isMSCIESGRating } from "@rating-tracker/commons";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from MSCI.
 */
class MSCIFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  /**
   * Fetches data from MSCI.
   * @param stock The stock to extract data for
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stock: Stock): Promise<void> {
    let msciESGRating: MSCIESGRating | undefined;
    let msciTemperature: number | undefined;

    const document = await FetchService.getAndParseHTML(
      "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool",
      {
        params: {
          p_p_id: "esgratingsprofile",
          p_p_lifecycle: 2,
          p_p_resource_id: "showEsgRatingsProfile",
          _esgratingsprofile_issuerId: stock.msciID!,
        },
        headers: {
          // eslint-disable-next-line prettier/prettier
          referer: 
            `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${stock.msciID}`,
        },
      },
      stock,
      "msci",
    );

    // Prepare an error message.
    let errorMessage = "";

    try {
      // Example: "esg-rating-circle-bbb"
      const esgClassName = document.getElementsByClassName("ratingdata-company-rating")[0].getAttribute("class")!;
      const msciESGRatingString = esgClassName.substring(esgClassName.lastIndexOf("-") + 1).toUpperCase();
      if (isMSCIESGRating(msciESGRatingString)) {
        msciESGRating = msciESGRatingString;
      } else {
        throw new TypeError(`Extracted MSCI ESG Rating “${msciESGRatingString}” is no valid MSCI ESG Rating.`);
      }
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "msci",
          attribute: "msciESGRating",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.msciESGRating !== null) {
        // If an MSCI ESG Rating is already stored in the database, but we cannot extract it from the page, we log
        // this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "msci",
            attribute: "msciESGRating",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract MSCI ESG Rating: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const msciTemperatureMatches = document
        .getElementsByClassName("implied-temp-rise-value")[0]
        .textContent! // Example: "2.5°C"
        .match(/(\d+(\.\d+)?)/g);
      if (
        msciTemperatureMatches === null ||
        msciTemperatureMatches.length !== 1 ||
        Number.isNaN(+msciTemperatureMatches[0])
      )
        throw new TypeError("Extracted MSCI Implied Temperature Rise is no valid number.");
      msciTemperature = +msciTemperatureMatches[0];
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "msci",
          attribute: "msciTemperature",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.msciTemperature !== null) {
        // If an MSCI Implied Temperature Rise is already stored in the database, but we cannot extract it from the
        // page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "msci",
            attribute: "msciTemperature",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract MSCI Implied Temperature Rise: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
      msciLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
      msciESGRating,
      msciTemperature,
    });
    // An error occurred if and only if the error message contains a newline character.
    if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document] });
  }
}
export default MSCIFetcher;
