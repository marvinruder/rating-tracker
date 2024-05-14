import type { MSCIESGRating, Stock } from "@rating-tracker/commons";
import { isMSCIESGRating } from "@rating-tracker/commons";
import type { Request } from "express";

import { updateStock } from "../db/tables/stockTable";
import DataProviderError from "../utils/DataProviderError";
import logger from "../utils/logger";

import type { Fetcher } from "./fetchHelper";
import { getAndParseHTML } from "./fetchHelper";

/**
 * Fetches data from MSCI.
 * @param req Request object
 * @param stock The stock to extract data for
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws a {@link DataProviderError} in case of a severe error
 */
const msciFetcher: Fetcher = async (req: Request, stock: Stock): Promise<void> => {
  let msciESGRating: MSCIESGRating = req.query.clear ? null : undefined;
  let msciTemperature: number = req.query.clear ? null : undefined;

  const document = await getAndParseHTML(
    "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool",
    {
      params: {
        p_p_id: "esgratingsprofile",
        p_p_lifecycle: 2,
        p_p_resource_id: "showEsgRatingsProfile",
        _esgratingsprofile_issuerId: stock.msciID,
      },
      headers: {
        referer:
          "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/" + stock.msciID,
      },
    },
    stock,
    "msci",
  );

  // Prepare an error message.
  let errorMessage = "";

  try {
    // Example: "esg-rating-circle-bbb"
    const esgClassName = document.getElementsByClassName("ratingdata-company-rating")[0].getAttribute("class");
    const msciESGRatingString = esgClassName.substring(esgClassName.lastIndexOf("-") + 1).toUpperCase();
    if (isMSCIESGRating(msciESGRatingString)) {
      msciESGRating = msciESGRatingString;
    } else {
      throw new TypeError(`Extracted MSCI ESG Rating “${msciESGRatingString}” is no valid MSCI ESG Rating.`);
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e}`);
    if (stock.msciESGRating !== null) {
      // If an MSCI ESG Rating is already stored in the database, but we cannot extract it from the page, we log
      // this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of MSCI ESG Rating failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract MSCI ESG Rating: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const msciTemperatureMatches = document
      .getElementsByClassName("implied-temp-rise-value")[0]
      .textContent // Example: "2.5°C"
      .match(/(\d+(\.\d+)?)/g);
    if (
      msciTemperatureMatches === null ||
      msciTemperatureMatches.length !== 1 ||
      Number.isNaN(+msciTemperatureMatches[0])
    )
      throw new TypeError("Extracted MSCI Implied Temperature Rise is no valid number.");
    msciTemperature = +msciTemperatureMatches[0];
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e}`);
    if (stock.msciTemperature !== null) {
      // If an MSCI Implied Temperature Rise is already stored in the database, but we cannot extract it from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of MSCI Implied Temperature Rise failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract MSCI Implied Temperature Rise: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, {
    msciLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
    msciESGRating,
    msciTemperature,
  });
  // An error occurred if and only if the error message contains a newline character.
  if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document] });
};

export default msciFetcher;
