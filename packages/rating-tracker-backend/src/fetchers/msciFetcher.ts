// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
/* istanbul ignore file -- @preserve */
import { Request } from "express";
import { FetcherWorkspace } from "../controllers/FetchController.js";
import { getDriver, openPageAndWait, quitDriver, takeScreenshot } from "../utils/webdriver.js";
import logger, { PREFIX_SELENIUM } from "../utils/logger.js";
import { formatDistance } from "date-fns";
import { MSCIESGRating, Stock, isMSCIESGRating } from "rating-tracker-commons";
import { By, until } from "selenium-webdriver";
import chalk from "chalk";
import * as signal from "../signal/signal.js";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal.js";
import { readStock, updateStock } from "../db/tables/stockTable.js";
import APIError from "../utils/apiError.js";

/**
 * Fetches data from MSCI.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @throws an {@link APIError} in case of a severe error
 */
const msciFetcher = async (req: Request, stocks: FetcherWorkspace<Stock>): Promise<void> => {
  // Acquire a new session
  const driver = await getDriver(true, "eager");
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
      stock.msciLastFetch &&
      // We only fetch stocks that have not been fetched in the last 7 days.
      new Date().getTime() - stock.msciLastFetch.getTime() < 1000 * 60 * 60 * 24 * 7
    ) {
      logger.info(
        PREFIX_SELENIUM +
          `Stock ${stock.ticker}: Skipping MSCI fetch since last successful fetch was ${formatDistance(
            stock.msciLastFetch.getTime(),
            new Date().getTime(),
            { addSuffix: true }
          )}`
      );
      stocks.skipped.push(stock);
      continue;
    }
    let msciESGRating: MSCIESGRating = req.query.clear ? null : undefined;
    let msciTemperature: number = req.query.clear ? null : undefined;

    try {
      await driver.manage().deleteAllCookies(); // Delete all cookies since MSCI allows only 4 requests per session.
      const url =
        "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/" + stock.msciID;
      const driverHealthy = await openPageAndWait(driver, url);
      // When we were unable to open the page, we assume the driver is unhealthy and end.
      if (!driverHealthy) {
        // Have another driver attempt the fetch of the current stock
        stocks.queued.push(stock);
        break;
      }
      await driver.wait(
        until.elementsLocated(By.className("esg-expandable")),
        15000 // Wait for the page to load for a maximum of 15 seconds.
      );

      // Prepare an error message header containing the stock name and ticker.
      let errorMessage = `Error while fetching MSCI information for ${stock.name} (${stock.ticker}):`;

      try {
        // Example: "esg-rating-circle-bbb"
        const esgClassName = await driver.findElement(By.className("ratingdata-company-rating")).getAttribute("class");
        const msciESGRatingString = esgClassName.substring(esgClassName.lastIndexOf("-") + 1).toUpperCase();
        if (isMSCIESGRating(msciESGRatingString)) {
          msciESGRating = msciESGRatingString;
        } else {
          throw new TypeError(`Extracted MSCI ESG Rating “${msciESGRatingString}” is no valid MSCI ESG Rating.`);
        }
      } catch (e) {
        logger.warn(
          PREFIX_SELENIUM + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e}`)
        );
        if (stock.msciESGRating !== null) {
          // If an MSCI ESG Rating is already stored in the database, but we cannot extract it from the page, we log
          // this as an error and send a message.
          logger.error(
            PREFIX_SELENIUM +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of MSCI ESG Rating failed unexpectedly. ` +
                  `This incident will be reported.`
              )
          );
          errorMessage += `\n\tUnable to extract MSCI ESG Rating: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const msciTemperatureMatches = (
          await driver.findElement(By.className("implied-temp-rise-value")).getAttribute("outerText")
        ) // Example: "2.5°C"
          .match(/(\d+(\.\d+)?)/g);
        if (
          msciTemperatureMatches === null ||
          msciTemperatureMatches.length !== 1 ||
          Number.isNaN(+msciTemperatureMatches[0])
        ) {
          throw new TypeError(`Extracted MSCI Implied Temperature Rise is no valid number.`);
        }
        msciTemperature = +msciTemperatureMatches[0];
      } catch (e) {
        logger.warn(
          PREFIX_SELENIUM +
            chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e}`)
        );
        if (stock.msciTemperature !== null) {
          // If an MSCI Implied Temperature Rise is already stored in the database, but we cannot extract it from the
          // page, we log this as an error and send a message.
          logger.error(
            PREFIX_SELENIUM +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of MSCI Implied Temperature Rise failed unexpectedly. ` +
                  `This incident will be reported.`
              )
          );
          errorMessage += `\n\tUnable to extract MSCI Implied Temperature Rise: ${
            String(e.message).split(/[\n:{]/)[0]
          }`;
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
        // We take a screenshot and send a message.
        errorMessage += `\n${await takeScreenshot(driver, stock, "msci")}`;
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
          `Stock ${stock.ticker}: Unable to fetch MSCI information: ${String(e.message).split(/[\n:{]/)[0]}`
        );
      }
      logger.error(PREFIX_SELENIUM + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch MSCI information: ${e}`));
      await signal.sendMessage(
        SIGNAL_PREFIX_ERROR +
          `Stock ${stock.ticker}: Unable to fetch MSCI information: ${
            String(e.message).split(/[\n:{]/)[0]
          }\n${await takeScreenshot(driver, stock, "msci")}`,
        "fetchError"
      );
    }
    if (stocks.failed.length >= 5) {
      // If we have 5 errors, we stop fetching data, since something is probably wrong.
      if (stocks.queued.length) {
        // No other fetcher did this before
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Aborting fetching information from MSCI after ${stocks.successful.length} ` +
                `successful fetches and ${stocks.failed.length} failures. Will continue next time.`
            )
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from MSCI after ${stocks.successful.length} ` +
            `successful fetches and ${stocks.failed.length} failures. Will continue next time.`,
          "fetchError"
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

export default msciFetcher;
