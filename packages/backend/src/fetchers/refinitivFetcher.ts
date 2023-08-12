// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
import { Request } from "express";
import { FetcherWorkspace } from "../controllers/FetchController.js";
// import { getDriver, openPageAndWait, quitDriver, takeScreenshot } from "../utils/webdriver.js";
import logger, { PREFIX_SELENIUM } from "../utils/logger.js";
import { formatDistance } from "date-fns";
import { Stock } from "@rating-tracker/commons";
// import { By, until } from "selenium-webdriver";
import chalk from "chalk";
import * as signal from "../signal/signal.js";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal.js";
import { readStock, updateStock } from "../db/tables/stockTable.js";
import APIError from "../utils/apiError.js";
import axios, { AxiosError } from "axios";

/**
 * Fetches data from Refinitiv.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @throws an {@link APIError} in case of a severe error
 */
const refinitivFetcher = async (req: Request, stocks: FetcherWorkspace<Stock>): Promise<void> => {
  // // Acquire a new session
  // const driver = await getDriver(true);
  // const sessionID = (await driver.getSession()).getId();

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
      stock.refinitivLastFetch &&
      // We only fetch stocks that have not been fetched in the last 7 days.
      new Date().getTime() - stock.refinitivLastFetch.getTime() < 1000 * 60 * 60 * 24 * 7
    ) {
      logger.info(
        PREFIX_SELENIUM +
          `Stock ${stock.ticker}: Skipping Refinitiv fetch because last fetch was ${formatDistance(
            stock.refinitivLastFetch.getTime(),
            new Date().getTime(),
            { addSuffix: true },
          )}`,
      );
      stocks.skipped.push(stock);
      continue;
    }
    let refinitivESGScore: number = req.query.clear ? null : undefined;
    let refinitivEmissions: number = req.query.clear ? null : undefined;

    try {
      // // Delete all cookies since Refinitiv allows only 100 requests per session.
      // await driver.manage().deleteAllCookies();
      const url = `https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`;
      // const driverHealthy = await openPageAndWait(driver, url);
      // // When we were unable to open the page, we assume the driver is unhealthy and end.
      // if (!driverHealthy) {
      //   // Have another driver attempt the fetch of the current stock
      //   stocks.queued.push(stock);
      //   break;
      // }
      // // Wait for the page to load for a maximum of 5 seconds.
      // await driver.wait(until.elementLocated(By.css("pre")), 5000);

      // // Extract the JSON content from the page.
      // const refinitivJSONText = await driver.findElement(By.css("pre")).getText();

      // if (refinitivJSONText === "{}") {
      //   throw new APIError(502, "No Refinitiv information available.");
      // }

      const refinitivJSON = (await axios.get(url)).data;

      if (Object.keys(refinitivJSON).length === 0 && refinitivJSON.constructor === Object) {
        throw new APIError(502, "No Refinitiv information available.");
      }

      // const refinitivJSON = JSON.parse(refinitivJSONText);

      if (refinitivJSON.status && refinitivJSON.status.limitExceeded === true) {
        // If the limit has been exceeded, we stop fetching data and throw an error.
        throw new APIError(429, "Limit exceeded.");
      }

      // Prepare an error message header containing the stock name and ticker.
      let errorMessage = `Error while fetching Refinitiv information for stock ${stock.ticker}:`;

      try {
        refinitivESGScore = +refinitivJSON.esgScore["TR.TRESG"].score;
      } catch (e) {
        logger.warn(
          PREFIX_SELENIUM + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Refinitiv ESG Score: ${e}`),
        );
        if (stock.refinitivESGScore !== null) {
          // If a Refinitiv ESG Score is already stored in the database, but we cannot extract it from the page, we
          // log this as an error and send a message.
          logger.error(
            PREFIX_SELENIUM +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of Refinitiv ESG Score failed unexpectedly. ` +
                  `This incident will be reported.`,
              ),
          );
          errorMessage += `\n\tUnable to extract Refinitiv ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        refinitivEmissions = +refinitivJSON.esgScore["TR.TRESGEmissions"].score;
      } catch (e) {
        logger.warn(
          PREFIX_SELENIUM + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Refinitiv Emissions: ${e}`),
        );
        if (stock.refinitivEmissions !== null) {
          // If a Refinitiv Emissions Rating is already stored in the database, but we cannot extract it from the
          // page, we log this as an error and send a message.
          logger.error(
            PREFIX_SELENIUM +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of Refinitiv Emissions failed unexpectedly. ` +
                  `This incident will be reported.`,
              ),
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
        // // We take a screenshot and send a message.
        // errorMessage += `\n${await takeScreenshot(driver, stock, "refinitiv")}`;
        errorMessage += `\nServer response: ${JSON.stringify(refinitivJSON)}`;
        await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
        stocks.failed.push(await readStock(stock.ticker));
      } else {
        stocks.successful.push(await readStock(stock.ticker));
      }
    } catch (e) {
      stocks.failed.push(stock);
      if (req.query.ticker) {
        // // If this request was for a single stock, we shut down the driver and throw an error.
        // await quitDriver(driver, sessionID);
        throw new APIError(
          (e as Error).message.includes("Limit exceeded") ? 429 : 502,
          `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${String(e.message).split(/[\n:{]/)[0]}`,
        );
      }
      if ((e as Error).message.includes("Limit exceeded")) {
        // If the limit has been exceeded, we stop fetching data and log an error.
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Aborting fetching information from Refinitiv after exceeding limit ` +
                `(${stocks.successful.length} successful fetches). Will continue next time.`,
            ),
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from Refinitiv after exceeding limit ` +
            `(${stocks.successful.length} successful fetches). Will continue next time.`,
          "fetchError",
        );
        break;
      }
      logger.error(
        PREFIX_SELENIUM + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${e}`),
      );
      await signal.sendMessage(
        SIGNAL_PREFIX_ERROR +
          `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${String(e.message).split(/[\n:{]/)[0]}\n` +
          (e instanceof AxiosError
            ? `Server response: ${
                e.response?.data ? JSON.stringify(e.response.data).substring(0, 1024) : e.response?.statusText
              }`
            : "Server response not available."),
        // }\n${await takeScreenshot(driver, stock, "refinitiv")}`,
        "fetchError",
      );
    }
    if (stocks.failed.length >= 10) {
      // If we have 10 errors, we stop fetching data, since something is probably wrong.
      if (stocks.queued.length) {
        // No other fetcher did this before
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Aborting fetching information from Refinitiv after ${stocks.successful.length} ` +
                `successful fetches and ${stocks.failed.length} failures. Will continue next time.`,
            ),
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from Refinitiv after ${stocks.successful.length} ` +
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
  // // The queue is now empty, we end the session.
  // await quitDriver(driver, sessionID);
};

export default refinitivFetcher;
