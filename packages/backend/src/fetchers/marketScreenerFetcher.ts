import assert from "node:assert";

import { Stock } from "@rating-tracker/commons";
import { Request } from "express";
import xpath from "xpath-ts2";

import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";

import { type FetcherWorkspace, captureFetchError, HTMLFetcher, getAndParseHTML } from "./fetchHelper";

const XPATH_ANALYST_COUNT = xpath.parse(
  "//div[@class='card-content']/div/div/div[contains(text(), 'Number of Analysts')]/following-sibling::div",
);
const XPATH_SPREAD_AVERAGE_TARGET = xpath.parse(
  "//div[@class='card-content']/div/div/div[contains(text(), 'Spread / Average Target')]/following-sibling::div",
);

/**
 * Fetches data from MarketScreener.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {Document} document The fetched and parsed HTML document
 * @returns {Promise<void>} A promise that resolves when the fetch is complete
 * @throws an {@link APIError} in case of a severe error
 */
const marketScreenerFetcher: HTMLFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  document: Document,
): Promise<void> => {
  let analystConsensus: number = req.query.clear ? null : undefined;
  let analystCount: number = req.query.clear ? null : undefined;
  let analystTargetPrice: number = req.query.clear ? null : undefined;

  document = await getAndParseHTML(
    `https://www.marketscreener.com/quote/stock/${stock.marketScreenerID}/`,
    undefined,
    stock,
    "marketScreener",
  );

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching MarketScreener data for stock ${stock.ticker}:`;

  try {
    // Check for the presence of the div containing all relevant analyst-related information.
    const consensusTableDiv = document.getElementById("consensusDetail");
    assert(consensusTableDiv, "Unable to find Analyst Consensus div.");

    try {
      const analystConsensusNode = document.getElementsByClassName("consensus-gauge")[0];
      assert(analystConsensusNode, "Unable to find Analyst Consensus node.");
      const analystConsensusMatches = analystConsensusNode
        .getAttribute("title") // Example: " Rate: 9.1 / 10"
        .match(/(\d+(\.\d+)?)/g); // Extract the first decimal number from the title.
      if (
        analystConsensusMatches === null ||
        analystConsensusMatches.length < 1 ||
        Number.isNaN(+analystConsensusMatches[0])
      ) {
        throw new TypeError("Extracted analyst consensus is no valid number.");
      }
      analystConsensus = +analystConsensusMatches[0];
    } catch (e) {
      logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Analyst Consensus: ${e}`);
      if (stock.analystConsensus !== null) {
        // If an analyst consensus is already stored in the database, but we cannot extract it from the page, we
        // log this as an error and send a message.
        logger.error(
          { prefix: "fetch", err: e },

          `Stock ${stock.ticker}: Extraction of analyst consensus failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract Analyst Consensus: ${String(e.message).split(/[\n:{]/)[0]}`;
      }
    }

    try {
      const analystCountNode = XPATH_ANALYST_COUNT.select1({ node: consensusTableDiv, isHtml: true });
      assert(analystCountNode, "Unable to find Analyst Count node.");
      analystCount = +analystCountNode.textContent;
    } catch (e) {
      logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Analyst Count: ${e}`);
      if (stock.analystCount !== null) {
        // If an analyst count is already stored in the database, but we cannot extract it from the page, we log
        // this as an error and send a message.
        logger.error(
          { prefix: "fetch", err: e },

          `Stock ${stock.ticker}: Extraction of analyst count failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract Analyst Count: ${String(e.message).split(/[\n:{]/)[0]}`;
      }
    }

    try {
      // We need the last close price to calculate the analyst target price.
      if (!stock.lastClose) {
        throw new FetchError("No Last Close price available to compare spread against.");
      }
      const analystTargetPriceNode = XPATH_SPREAD_AVERAGE_TARGET.select1({ node: consensusTableDiv, isHtml: true });
      assert(analystTargetPriceNode, "Unable to find Analyst Target Price node.");
      const analystTargetPriceMatches = analystTargetPriceNode.textContent
        .replaceAll(",", ".")
        .match(/(\-)?\d+(\.\d+)?/g);
      if (analystTargetPriceMatches === null) {
        throw new TypeError(
          `Extracted analyst target price is no valid number (no matches in “${analystTargetPriceNode.textContent}”).`,
        );
      }
      if (analystTargetPriceMatches.length !== 1) {
        throw new TypeError(
          "Extracted analyst target price is no valid number " +
            `(multiple matches in “${analystTargetPriceNode.textContent}”).`,
        );
      }
      if (Number.isNaN(+analystTargetPriceMatches[0])) {
        throw new TypeError(
          `Extracted analyst target price is no valid number (not a number: “${analystTargetPriceNode.textContent}”).`,
        );
      }
      analystTargetPrice = stock.lastClose * (+analystTargetPriceMatches[0] / 100 + 1);
    } catch (e) {
      logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Analyst Target Price: ${e}`);
      if (stock.analystTargetPrice !== null) {
        // If an analyst target price is already stored in the database, but we cannot extract it from the page,
        // we log this as an error and send a message.
        logger.error(
          { prefix: "fetch", err: e },

          `Stock ${stock.ticker}: Extraction of analyst target price failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract Analyst Target Price: ${String(e.message).split(/[\n:{]/)[0]}`;
      }
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: \n\tUnable to extract Analyst Information: ${e}`);
    if (stock.analystConsensus !== null || stock.analystCount !== null || stock.analystTargetPrice !== null) {
      // If any of the analyst-related information is already stored in the database, but we cannot extract it
      // from the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of analyst information failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract Analyst Information: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, {
    marketScreenerLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
    analystConsensus,
    analystCount,
    analystTargetPrice,
  });
  if (errorMessage.includes("\n")) {
    // An error occurred if and only if the error message contains a newline character.
    // We capture the resource and send a message.
    errorMessage += `\n${await captureFetchError(stock, "marketScreener", { document })}`;
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
};

export default marketScreenerFetcher;
