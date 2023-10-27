import { SP_PREMIUM_STOCK_ERROR_MESSAGE, Stock } from "@rating-tracker/commons";
import { Request } from "express";

import { readStock, updateStock } from "../db/tables/stockTable";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import * as signal from "../signal/signal";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";

import { captureFetchError, getAndParseHTML, type FetcherWorkspace, type HTMLFetcher } from "./fetchHelper";

/**
 * Fetches data from Standard & Poor’s.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {Document} document The fetched and parsed HTML document
 * @returns {boolean} Whether the driver is still healthy
 * @throws an {@link APIError} in case of a severe error
 */
const spFetcher: HTMLFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  document: Document,
): Promise<boolean> => {
  let spESGScore: number = req.query.clear ? null : undefined;

  document = await getAndParseHTML(`https://www.spglobal.com/esg/scores/results?cid=${stock.spID}`, stock, "sp");

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching S&P information for ${stock.name} (${stock.ticker}):`;

  try {
    const lockedContent = document.getElementsByClassName("lock__content");
    if (
      lockedContent.length > 0 &&
      lockedContent[0].textContent.includes(
        "This company's ESG Score and underlying data are available via our premium channels",
      )
    ) {
      // If the content is available for premium subscribers only, we throw an error.
      // Sadly, we are not a premium subscriber :(
      // We will still count this as a successful fetch
      await updateStock(stock.ticker, { spLastFetch: new Date() });
      throw new FetchError(SP_PREMIUM_STOCK_ERROR_MESSAGE);
    }
    spESGScore = +document.getElementsByClassName("scoreModule__score")[0].textContent;
  } catch (e) {
    logger.warn({ prefix: "selenium", err: e }, `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`);
    if (stock.spESGScore !== null || (req.query.ticker && e.message.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE))) {
      // If an S&P ESG Score is already stored in the database, but we cannot extract it from the page, we log this
      // as an error and send a message.
      // To show the designated premium stock error message, we check if the request was for a single stock and the
      // error message contains the premium stock error message, and handle the error in the same way.
      logger.error(
        { prefix: "selenium" },
        `Stock ${stock.ticker}: Extraction of S&P ESG Score failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract S&P ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, { spLastFetch: errorMessage.includes("\n") ? undefined : new Date(), spESGScore });
  if (errorMessage.includes("\n")) {
    // An error occurred if and only if the error message contains a newline character.
    // We capture the resource and send a message.
    errorMessage += `\n${await captureFetchError(stock, "sp", { document })}`;
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

export default spFetcher;
