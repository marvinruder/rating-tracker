import { MSCIESGRating, Stock, isMSCIESGRating } from "@rating-tracker/commons";
import { Request } from "express";

import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";

import { type FetcherWorkspace, captureFetchError, type HTMLFetcher, getAndParseHTML } from "./fetchHelper";

/**
 * Fetches data from MSCI.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {Document} document The fetched and parsed HTML document
 * @returns {boolean} always true, since no WebDriver status needs to be reported by this Fetcher.
 * @throws an {@link APIError} in case of a severe error
 */
const msciFetcher: HTMLFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  document: Document,
): Promise<boolean> => {
  let msciESGRating: MSCIESGRating = req.query.clear ? null : undefined;
  let msciTemperature: number = req.query.clear ? null : undefined;

  document = await getAndParseHTML(
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

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching MSCI information for ${stock.name} (${stock.ticker}):`;

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
    ) {
      throw new TypeError("Extracted MSCI Implied Temperature Rise is no valid number.");
    }
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
  if (errorMessage.includes("\n")) {
    // An error occurred if and only if the error message contains a newline character.
    // We capture the resource and send a message.
    errorMessage += `\n${await captureFetchError(stock, "msci", { document })}`;
    if (req.query.ticker) {
      // If this request was for a single stock, we throw an error instead of sending a message, so that the error
      // message will be part of the response.
      throw new FetchError(errorMessage);
    }
    await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
    stocks.failed.push(await readStock(stock.ticker));
  } else {
    stocks.successful.push(await readStock(stock.ticker));
  }
  document = undefined;
  return true;
};

export default msciFetcher;
