import assert from "node:assert";

import type { AnalystRating, Stock } from "@rating-tracker/commons";
import { RecordMath, analystRatingArray } from "@rating-tracker/commons";
import xpath from "xpath-ts2";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from MarketScreener.
 */
class MarketScreenerFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  #xpathAnalystCount = xpath.parse(
    "//div[@class='card-content']/div/div/div[contains(text(), 'Number of Analysts')]/following-sibling::div",
  );
  #xpathAverageTargetPrice = xpath.parse(
    "//div[@class='card-content']/div/div/div[contains(text(), 'Average target price')]/following-sibling::div",
  );
  #xpathSpreadAverageTarget = xpath.parse(
    "//div[@class='card-content']/div/div/div[contains(text(), 'Spread / Average Target')]/following-sibling::div",
  );

  /**
   * Fetches data from MarketScreener.
   * @param stock The stock to extract data for
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stock: Stock): Promise<void> {
    let analystConsensus: AnalystRating | undefined;
    let analystRatings: Record<AnalystRating, number> | undefined;
    let analystCount: number | undefined;
    let analystTargetPrice: number | undefined;

    const codeZBMatches = stock.marketScreenerID!.match(/-([0-9]+)$/);
    assert(codeZBMatches && !Number.isNaN(+codeZBMatches[1]), "Unable to extract ZB code from MarketScreener ID.");
    const codeZB = +codeZBMatches[1];

    const [document, json] = await Promise.all([
      FetchService.getAndParseHTML(
        `https://www.marketscreener.com/quote/stock/${stock.marketScreenerID}/consensus`,
        {},
        stock,
        "marketScreener",
      ),
      FetchService.getJSON("https://www.marketscreener.com/async/graph/af/cd", { params: { codeZB, h: 0 } }),
    ]);

    // Prepare an error message.
    let errorMessage = "";

    try {
      // Check for the presence of the div and JSON properties containing all relevant analyst-related information.
      const consensusTableDiv = document.getElementById("consensus-analysts");
      assert(consensusTableDiv, "Unable to find Analyst Consensus div.");
      assert(json.constructor === Object, "Unable to find Analyst Ratings.");
      assert("error" in json && json.error === false, "The server reported an error when fetching Analyst Ratings.");
      assert(
        "data" in json && Array.isArray(json.data) && Array.isArray(json.data[0]),
        "No Analyst Ratings available.",
      );

      try {
        const analystCountNode = this.#xpathAnalystCount.select1({ node: consensusTableDiv, isHtml: true });
        assert(analystCountNode, "Unable to find Analyst Count node.");
        analystCount = Number(analystCountNode.textContent);
      } catch (e) {
        Logger.warn(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "marketScreener",
            attribute: "analystCount",
            reason: e?.toString(),
          },
          "Unable to extract attribute",
        );
        if (stock.analystCount !== null) {
          // If an analyst count is already stored in the database, but we cannot extract it from the page, we log
          // this as an error and send a message.
          Logger.error(
            {
              component: "fetch",
              stock: stock.ticker,
              dataProvider: "marketScreener",
              attribute: "analystCount",
              reason: e?.toString(),
            },
            "Extraction of attribute failed unexpectedly",
          );
          errorMessage += `\n\tUnable to extract Analyst Count: ${ErrorHelper.getSummary(e)}`;
        }
      }

      try {
        try {
          // If the currency of the analyst target price matches the stock price currency, we can extract the target
          // price directly:
          const avgTargetPriceNode = this.#xpathAverageTargetPrice.select1({ node: consensusTableDiv, isHtml: true });
          assert(
            avgTargetPriceNode && avgTargetPriceNode.textContent !== null,
            "Unable to find Average Target Price node.",
          );
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
          // If the currency of the analyst target price does not match the stock price currency, we need to calculate
          // the target price based on the percentage difference from the last close price.

          Logger.warn(
            {
              component: "fetch",
              stock: stock.ticker,
              dataProvider: "marketScreener",
              attribute: "analystTargetPrice",
              reason: e?.toString(),
            },
            "Unable to extract attribute, attempting fallback",
          );

          // We need the last close price to calculate the analyst target price.
          if (!stock.lastClose)
            throw new DataProviderError("No Last Close price available to compare spread against.", {
              dataSources: [document, json],
            });

          const spreadAvgTargetNode = this.#xpathSpreadAverageTarget.select1({ node: consensusTableDiv, isHtml: true });
          assert(
            spreadAvgTargetNode && spreadAvgTargetNode.textContent !== null,
            "Unable to find Analyst Target Price node.",
          );
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
        Logger.warn(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "marketScreener",
            attribute: "analystTargetPrice",
            reason: e?.toString(),
          },
          "Unable to extract attribute",
        );
        if (stock.analystTargetPrice !== null) {
          // If an analyst target price is already stored in the database, but we cannot extract it from the page,
          // we log this as an error and send a message.
          Logger.error(
            {
              component: "fetch",
              stock: stock.ticker,
              dataProvider: "marketScreener",
              attribute: "analystTargetPrice",
              reason: e?.toString(),
            },
            "Extraction of attribute failed unexpectedly",
          );
          errorMessage += `\n\tUnable to extract Analyst Target Price: ${ErrorHelper.getSummary(e)}`;
        }
      }

      try {
        analystRatings = Object.fromEntries<number>(
          analystRatingArray.map((analystRating) => {
            const ratingObject = ((json.data as unknown[])[0] as { name: string; y: number }[]).find(
              (obj) => obj.name === analystRating.toUpperCase(),
            );
            if (!ratingObject || !("y" in ratingObject))
              throw new TypeError(`Analyst Rating “${analystRating}” not found in Analyst Rating response.`);
            return [analystRating, ratingObject.y];
          }),
        ) as Record<AnalystRating, number>;
        analystConsensus = RecordMath.mean(analystRatings);
      } catch (e) {
        Logger.warn(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "marketScreener",
            attribute: "analystRatings",
            reason: e?.toString(),
          },
          "Unable to extract attribute",
        );
        if (stock.analystConsensus !== null || stock.analystRatings !== null) {
          // If an analyst consensus or analyst ratings are already stored in the database, but we cannot extract them
          // from the JSON object, we log this as an error and send a message.
          Logger.error(
            {
              component: "fetch",
              stock: stock.ticker,
              dataProvider: "marketScreener",
              attribute: "analystRatings",
              reason: e?.toString(),
            },
            "Extraction of attribute failed unexpectedly",
          );
          errorMessage += `\n\tUnable to extract Analyst Ratings: ${ErrorHelper.getSummary(e)}`;
        }
      }
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "marketScreener",
          reason: e?.toString(),
        },
        "Unable to extract analyst information",
      );
      if (
        stock.analystConsensus !== null ||
        stock.analystCount !== null ||
        stock.analystTargetPrice !== null ||
        stock.analystRatings !== null
      ) {
        // If any of the analyst-related information is already stored in the database, but we cannot extract it
        // from the page or the JSON object, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "marketScreener",
            reason: e?.toString(),
          },
          "Extraction of analyst information failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract Analyst Information: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
      marketScreenerLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
      analystCount,
      analystTargetPrice,
      analystConsensus,
      analystRatings,
    });
    // An error occurred if and only if the error message contains a newline character.
    if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document, json] });
  }
}

export default MarketScreenerFetcher;
