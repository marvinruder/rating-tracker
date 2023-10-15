import { Stock } from "@rating-tracker/commons";
import axios from "axios";
import { Request } from "express";

import { Fetcher, FetcherWorkspace } from "../controllers/FetchController";
import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import APIError from "../utils/APIError";
import logger from "../utils/logger";

/**
 * Fetches data from Refinitiv.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @returns {boolean} Whether the driver is still healthy
 * @throws an {@link APIError} in case of a severe error
 */
const refinitivFetcher: Fetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
): Promise<boolean> => {
  let refinitivESGScore: number = req.query.clear ? null : undefined;
  let refinitivEmissions: number = req.query.clear ? null : undefined;

  const url = `https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`;

  const refinitivJSON = (await axios.get(url)).data;

  if (Object.keys(refinitivJSON).length === 0 && refinitivJSON.constructor === Object) {
    throw new APIError(502, "No Refinitiv information available.");
  }

  if (refinitivJSON.status && refinitivJSON.status.limitExceeded === true) {
    // If the limit has been exceeded, we stop fetching data and throw an error.
    throw new APIError(429, "Limit exceeded.");
  }

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching Refinitiv information for stock ${stock.ticker}:`;

  try {
    refinitivESGScore = +refinitivJSON.esgScore["TR.TRESG"].score;
  } catch (e) {
    logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Refinitiv ESG Score: ${e}`);
    if (stock.refinitivESGScore !== null) {
      // If a Refinitiv ESG Score is already stored in the database, but we cannot extract it from the page, we
      // log this as an error and send a message.
      logger.error(
        { prefix: "selenium", err: e },
        `Stock ${stock.ticker}: Extraction of Refinitiv ESG Score failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract Refinitiv ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    refinitivEmissions = +refinitivJSON.esgScore["TR.TRESGEmissions"].score;
  } catch (e) {
    logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Refinitiv Emissions: ${e}`);
    if (stock.refinitivEmissions !== null) {
      // If a Refinitiv Emissions Rating is already stored in the database, but we cannot extract it from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "selenium", err: e },
        `Stock ${stock.ticker}: Extraction of Refinitiv Emissions failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract Refinitiv Emissions: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, {
    refinitivLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
    refinitivESGScore,
    refinitivEmissions,
  });
  if (errorMessage.includes("\n")) {
    // An error occurred if and only if the error message contains a newline character.
    errorMessage += `\nServer response: ${JSON.stringify(refinitivJSON)}`;
    await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
    stocks.failed.push(await readStock(stock.ticker));
  } else {
    stocks.successful.push(await readStock(stock.ticker));
  }
  return true;
};

export default refinitivFetcher;
