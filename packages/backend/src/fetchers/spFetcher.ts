import type { Stock } from "@rating-tracker/commons";
import { SP_PREMIUM_STOCK_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { Request } from "express";

import { updateStock } from "../db/tables/stockTable";
import DataProviderError from "../utils/DataProviderError";
import logger from "../utils/logger";

import type { Fetcher } from "./fetchHelper";
import { getAndParseHTML } from "./fetchHelper";

/**
 * Fetches data from Standard & Poor’s.
 * @param req Request object
 * @param stock The stock to extract data for
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws a {@link DataProviderError} in case of a severe error
 */
const spFetcher: Fetcher = async (req: Request, stock: Stock): Promise<void> => {
  let spESGScore: number = undefined;

  const document = await getAndParseHTML(
    "https://www.spglobal.com/esg/scores/results",
    { params: { cid: stock.spID } },
    stock,
    "sp",
  );

  // Prepare an error message.
  let errorMessage = "";

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
      throw new DataProviderError(SP_PREMIUM_STOCK_ERROR_MESSAGE, { dataSources: [document] });
    }
    spESGScore = +document.getElementsByClassName("scoreModule__score")[0].textContent;
  } catch (e) {
    logger.warn({ prefix: "fetch", err: e }, `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`);
    if (stock.spESGScore !== null || (req.query.ticker && e.message.includes(SP_PREMIUM_STOCK_ERROR_MESSAGE))) {
      // If an S&P ESG Score is already stored in the database, but we cannot extract it from the page, we log this
      // as an error and send a message.
      // To show the designated premium stock error message, we check if the request was for a single stock and the
      // error message contains the premium stock error message, and handle the error in the same way.
      logger.error(
        { prefix: "fetch" },
        `Stock ${stock.ticker}: Extraction of S&P ESG Score failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract S&P ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, { spLastFetch: errorMessage.includes("\n") ? undefined : new Date(), spESGScore });
  // An error occurred if and only if the error message contains a newline character.
  if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document] });
};

export default spFetcher;
