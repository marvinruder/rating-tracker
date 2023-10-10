import { Stock } from "@rating-tracker/commons";
import { formatDistance } from "date-fns";
import { Request } from "express";
import { By, until } from "selenium-webdriver";

import { FetcherWorkspace } from "../controllers/FetchController";
import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import APIError from "../utils/APIError";
import logger from "../utils/logger";
import { getDriver, openPageAndWait, quitDriver, takeScreenshot } from "../utils/webdriver";

const XPATH_ANALYST_COUNT =
  "//div[@class='card-content']/div/div/div[contains(text(), 'Number of Analysts')]/following-sibling::div" as const;
const XPATH_SPREAD_AVERAGE_TARGET =
  // eslint-disable-next-line max-len
  "//div[@class='card-content']/div/div/div[contains(text(), 'Spread / Average Target')]/following-sibling::div" as const;

/**
 * Fetches data from MarketScreener.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @throws an {@link APIError} in case of a severe error
 */
const marketScreenerFetcher = async (req: Request, stocks: FetcherWorkspace<Stock>): Promise<void> => {
  // Acquire a new session
  const driver = await getDriver(true);
  const sessionID = (await driver.getSession()).getId();

  // Work while stocks are in the queue
  while (stocks.queued.length) {
    // Get the first stock in the queue
    const stock = stocks.queued.shift();
    if (!stock) {
      // If the queue got empty in the meantime, we end.
      break;
    }
    if (
      !req.query.noSkip &&
      stock.marketScreenerLastFetch &&
      // We only fetch stocks that have not been fetched in the last 12 hours.
      new Date().getTime() - stock.marketScreenerLastFetch.getTime() < 1000 * 60 * 60 * 12
    ) {
      logger.info(
        { prefix: "selenium" },
        `Stock ${stock.ticker}: Skipping MarketScreener fetch because last fetch was ${formatDistance(
          stock.marketScreenerLastFetch.getTime(),
          new Date().getTime(),
          { addSuffix: true },
        )}`,
      );
      stocks.skipped.push(stock);
      continue;
    }
    let analystConsensus: number = req.query.clear ? null : undefined;
    let analystCount: number = req.query.clear ? null : undefined;
    let analystTargetPrice: number = req.query.clear ? null : undefined;

    try {
      const url = `https://www.marketscreener.com/quote/stock/${stock.marketScreenerID}/`;
      const driverHealthy = await openPageAndWait(driver, url);
      // When we were unable to open the page, we assume the driver is unhealthy and end.
      if (!driverHealthy) {
        // Have another driver attempt the fetch of the current stock
        stocks.queued.push(stock);
        break;
      }
      // Wait for most of the page to load for a maximum of 20 seconds.
      await driver.wait(until.elementLocated(By.className("pcontent")), 20000);

      // Prepare an error message header containing the stock name and ticker.
      let errorMessage = `Error while fetching MarketScreener data for stock ${stock.ticker}:`;

      try {
        // Wait for the div containing all relevant analyst-related information for a maximum of 10 seconds.
        const consensusTableDiv = await driver.wait(until.elementLocated(By.id("consensusDetail")), 10000);

        try {
          const analystConsensusMatches = (
            await consensusTableDiv.findElement(By.css('div[title^="Rate : "')).getAttribute("title")
          ) // Example: " Rate : 9.1 / 10"
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
          logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Analyst Consensus: ${e}`);
          if (stock.analystConsensus !== null) {
            // If an analyst consensus is already stored in the database, but we cannot extract it from the page, we
            // log this as an error and send a message.
            logger.error(
              { prefix: "selenium", err: e },

              `Stock ${stock.ticker}: Extraction of analyst consensus failed unexpectedly. ` +
                "This incident will be reported.",
            );
            errorMessage += `\n\tUnable to extract Analyst Consensus: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          analystCount = +(await consensusTableDiv.findElement(By.xpath(XPATH_ANALYST_COUNT)).getText());
        } catch (e) {
          logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Analyst Count: ${e}`);
          if (stock.analystCount !== null) {
            // If an analyst count is already stored in the database, but we cannot extract it from the page, we log
            // this as an error and send a message.
            logger.error(
              { prefix: "selenium", err: e },

              `Stock ${stock.ticker}: Extraction of analyst count failed unexpectedly. ` +
                "This incident will be reported.",
            );
            errorMessage += `\n\tUnable to extract Analyst Count: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          // We need the last close price to calculate the analyst target price.
          if (!stock.lastClose) {
            throw new Error("No Last Close price available to compare spread against.");
          }
          const analystTargetPriceText = await consensusTableDiv
            .findElement(By.xpath(XPATH_SPREAD_AVERAGE_TARGET))
            .getText();
          const analystTargetPriceMatches = analystTargetPriceText.replaceAll(",", ".").match(/(\-)?\d+(\.\d+)?/g);
          if (analystTargetPriceMatches === null) {
            throw new TypeError(
              `Extracted analyst target price is no valid number (no matches in “${analystTargetPriceText}”).`,
            );
          }
          if (analystTargetPriceMatches.length !== 1) {
            throw new TypeError(
              `Extracted analyst target price is no valid number (multiple matches in “${analystTargetPriceText}”).`,
            );
          }
          if (Number.isNaN(+analystTargetPriceMatches[0])) {
            throw new TypeError(
              `Extracted analyst target price is no valid number (not a number: “${analystTargetPriceText}”).`,
            );
          }
          analystTargetPrice = stock.lastClose * (+analystTargetPriceMatches[0] / 100 + 1);
        } catch (e) {
          logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Analyst Target Price: ${e}`);
          if (stock.analystTargetPrice !== null) {
            // If an analyst target price is already stored in the database, but we cannot extract it from the page,
            // we log this as an error and send a message.
            logger.error(
              { prefix: "selenium", err: e },

              `Stock ${stock.ticker}: Extraction of analyst target price failed unexpectedly. ` +
                "This incident will be reported.",
            );
            errorMessage += `\n\tUnable to extract Analyst Target Price: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: \n\tUnable to extract Analyst Information: ${e}`);
        if (stock.analystConsensus !== null || stock.analystCount !== null || stock.analystTargetPrice !== null) {
          // If any of the analyst-related information is already stored in the database, but we cannot extract it
          // from the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },

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
        // We take a screenshot and send a message.
        errorMessage += `\n${await takeScreenshot(driver, stock, "marketscreener")}`;
        await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
        stocks.failed.push(await readStock(stock.ticker));
      } else {
        stocks.successful.push(await readStock(stock.ticker));
      }
    } catch (e) {
      stocks.failed.push(stock);
      if (req.query.ticker) {
        // If this request was for a single stock, we shut down the driver and throw an error.
        await quitDriver(driver, sessionID);
        throw new APIError(
          502,
          `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${String(e.message).split(/[\n:{]/)[0]}`,
        );
      }
      logger.error({ prefix: "selenium", err: e }, `Stock ${stock.ticker}: Unable to fetch MarketScreener data`);
      await signal.sendMessage(
        SIGNAL_PREFIX_ERROR +
          `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${
            String(e.message).split(/[\n:{]/)[0]
          }\n${await takeScreenshot(driver, stock, "marketscreener")}`,
        "fetchError",
      );
    }
    if (stocks.failed.length >= 10) {
      // If we have 10 errors, we stop fetching data, since something is probably wrong.
      if (stocks.queued.length) {
        // No other fetcher did this before
        logger.error(
          { prefix: "selenium" },
          `Aborting fetching information from MarketScreener after ${stocks.successful.length} ` +
            `successful fetches and ${stocks.failed.length} failures. Will continue next time.`,
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from MarketScreener after ${stocks.successful.length} ` +
            `successful fetches and ${stocks.failed.length} failures. Will continue next time.`,
          "fetchError",
        );
        const skippedStocks = [...stocks.queued];
        stocks.queued.length = 0;
        skippedStocks.forEach((skippedStock) => stocks.skipped.push(skippedStock));
      }
      break;
    }
  }
  // The queue is now empty, we end the session.
  await quitDriver(driver, sessionID);
};

export default marketScreenerFetcher;
