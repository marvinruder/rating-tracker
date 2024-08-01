import assert from "node:assert";

import { RecordMath, analystRatingArray, type Stock } from "@rating-tracker/commons";
import type { Request } from "express";
import xpath from "xpath-ts2";

import type { AnalystRating } from "../../prisma/client";
import { updateStock } from "../db/tables/stockTable";
import DataProviderError from "../utils/DataProviderError";
import logger from "../utils/logger";

import type { Fetcher } from "./fetchHelper";
import { getAndParseHTML, getJSON } from "./fetchHelper";

const XPATH_ANALYST_COUNT = xpath.parse(
  "//div[@class='card-content']/div/div/div[contains(text(), 'Number of Analysts')]/following-sibling::div",
);
const XPATH_AVERAGE_TARGET_PRICE = xpath.parse(
  "//div[@class='card-content']/div/div/div[contains(text(), 'Average target price')]/following-sibling::div",
);
const XPATH_SPREAD_AVERAGE_TARGET = xpath.parse(
  "//div[@class='card-content']/div/div/div[contains(text(), 'Spread / Average Target')]/following-sibling::div",
);

/**
 * Fetches data from MarketScreener.
 * @param req Request object
 * @param stock The stock to extract data for
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws a {@link DataProviderError} in case of a severe error
 */
const marketScreenerFetcher: Fetcher = async (req: Request, stock: Stock): Promise<void> => {
  let analystConsensus: AnalystRating = undefined;
  let analystRatings: Record<AnalystRating, number> = undefined;
  let analystCount: number = undefined;
  let analystTargetPrice: number = undefined;

  const codeZBMatches = stock.marketScreenerID.match(/-([0-9]+)$/);
  assert(codeZBMatches && !Number.isNaN(+codeZBMatches[1]), "Unable to extract ZB code from MarketScreener ID.");
  const codeZB = +codeZBMatches[1];

  const [document, json] = await Promise.all([
    getAndParseHTML(
      `https://www.marketscreener.com/quote/stock/${stock.marketScreenerID}/consensus`,
      {},
      stock,
      "marketScreener",
    ),
    getJSON("https://www.marketscreener.com/async/graph/af/cd", {
      params: {
        codeZB,
        h: 0,
      },
    }),
  ]);

  // Prepare an error message.
  let errorMessage = "";

  try {
    // Check for the presence of the div and JSON properties containing all relevant analyst-related information.
    const consensusTableDiv = document.getElementById("consensus-analysts");
    assert(consensusTableDiv, "Unable to find Analyst Consensus div.");
    assert(json.constructor === Object, "Unable to find Analyst Ratings.");
    assert("error" in json && json.error === false, "The server reported an error when fetching Analyst Ratings.");
    assert("data" in json && Array.isArray(json.data) && Array.isArray(json.data[0]), "No Analyst Ratings available.");

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
      try {
        // If the currency of the analyst target price matches the stock price currency, we can extract the target price
        // directly:
        const avgTargetPriceNode = XPATH_AVERAGE_TARGET_PRICE.select1({ node: consensusTableDiv, isHtml: true });
        assert(avgTargetPriceNode, "Unable to find Average Target Price node.");
        const avgTargetPriceMatches = avgTargetPriceNode.textContent
          .replaceAll(",", "")
          .match(/\s*(\d+(\.\d+)?)\s*([A-Z]{3})/);

        if (avgTargetPriceMatches === null || avgTargetPriceMatches.length < 4)
          throw new TypeError(
            `Extracted analyst target price is no valid price (no matches in “${avgTargetPriceNode.textContent}”).`,
          );
        if (avgTargetPriceMatches[3] !== stock.currency)
          throw new TypeError(
            `Currency ${avgTargetPriceMatches[3]} does not match stock price currency ${stock.currency}.`,
          );
        if (Number.isNaN(+avgTargetPriceMatches[1]))
          throw new TypeError(
            `Extracted analyst target price is no valid number (not a number: “${avgTargetPriceMatches[1]}”).`,
          );

        analystTargetPrice = +avgTargetPriceMatches[1];
      } catch (e) {
        // If the currency of the analyst target price does not match the stock price currency, we need to calculate the
        // target price based on the percentage difference from the last close price.

        logger.warn(
          { prefix: "fetch" },
          `Stock ${stock.ticker}: Unable to extract Analyst Target Price directly (attempting fallback): ${e}`,
        );

        // We need the last close price to calculate the analyst target price.
        if (!stock.lastClose)
          throw new DataProviderError("No Last Close price available to compare spread against.", {
            dataSources: [document, json],
          });

        const spreadAvgTargetNode = XPATH_SPREAD_AVERAGE_TARGET.select1({ node: consensusTableDiv, isHtml: true });
        assert(spreadAvgTargetNode, "Unable to find Analyst Target Price node.");
        const spreadAvgTargetMatches = spreadAvgTargetNode.textContent.replaceAll(",", "").match(/(\-)?\d+(\.\d+)?/);

        if (spreadAvgTargetMatches === null)
          throw new TypeError(
            `Extracted analyst target price is no valid number (no matches in “${spreadAvgTargetNode.textContent}”).`,
          );
        if (Number.isNaN(+spreadAvgTargetMatches[0]))
          throw new TypeError(
            `Extracted analyst target price is no valid number (not a number: “${spreadAvgTargetNode.textContent}”).`,
          );

        analystTargetPrice = stock.lastClose * (+spreadAvgTargetMatches[0] / 100 + 1);
      }
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

    try {
      analystRatings = Object.fromEntries<number>(
        analystRatingArray.map((analystRating) => {
          const ratingObject = (json.data[0] as { name: string; y: number }[]).find(
            (obj) => obj.name === analystRating.toUpperCase(),
          );
          if (!ratingObject || !("y" in ratingObject))
            throw new TypeError(`Analyst Rating “${analystRating}” not found in Analyst Rating response.`);
          return [analystRating, ratingObject.y];
        }),
      ) as Record<AnalystRating, number>;
      analystConsensus = RecordMath.mean(analystRatings);
    } catch (e) {
      logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Analyst Ratings: ${e}`);
      if (stock.analystConsensus !== null || stock.analystRatings !== null) {
        // If an analyst consensus or analyst ratings are already stored in the database, but we cannot extract them
        // from the JSON object, we log this as an error and send a message.
        logger.error(
          { prefix: "fetch", err: e },
          `Stock ${stock.ticker}: Extraction of analyst ratings failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract Analyst Ratings: ${String(e.message).split(/[\n:{]/)[0]}`;
      }
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: \n\tUnable to extract Analyst Information: ${e}`);
    if (
      stock.analystConsensus !== null ||
      stock.analystCount !== null ||
      stock.analystTargetPrice !== null ||
      stock.analystRatings !== null
    ) {
      // If any of the analyst-related information is already stored in the database, but we cannot extract it
      // from the page or the JSON object, we log this as an error and send a message.
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
    analystCount,
    analystTargetPrice,
    analystConsensus,
    analystRatings,
  });
  // An error occurred if and only if the error message contains a newline character.
  if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document, json] });
};

export default marketScreenerFetcher;
