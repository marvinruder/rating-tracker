// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
/* istanbul ignore file -- @preserve */
import { Request } from "express";
import { FetcherWorkspace } from "../controllers/FetchController.js";
import { getDriver, openPageAndWait, quitDriver, takeScreenshot } from "../utils/webdriver.js";
import logger, { PREFIX_SELENIUM } from "../utils/logger.js";
import { formatDistance } from "date-fns";
import { Stock } from "@rating-tracker/commons";
import { By, until } from "selenium-webdriver";
import chalk from "chalk";
import * as signal from "../signal/signal.js";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal.js";
import { readStock, updateStock } from "../db/tables/stockTable.js";
import APIError from "../utils/apiError.js";

/**
 * Fetches data from Standard & Poor’s.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @throws an {@link APIError} in case of a severe error
 */
const spFetcher = async (req: Request, stocks: FetcherWorkspace<Stock>): Promise<void> => {
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
      stock.spLastFetch &&
      // We only fetch stocks that have not been fetched in the last 7 days.
      new Date().getTime() - stock.spLastFetch.getTime() < 1000 * 60 * 60 * 24 * 7
    ) {
      logger.info(
        PREFIX_SELENIUM +
          `Stock ${stock.ticker}: Skipping S&P fetch because last fetch was ${formatDistance(
            stock.spLastFetch.getTime(),
            new Date().getTime(),
            { addSuffix: true }
          )}`
      );
      stocks.skipped.push(stock);
      continue;
    }
    let spESGScore: number = req.query.clear ? null : undefined;

    try {
      const url = `https://www.spglobal.com/esg/scores/results?cid=${stock.spID}`;
      const driverHealthy = await openPageAndWait(driver, url);
      // When we were unable to open the page, we assume the driver is unhealthy and end.
      if (!driverHealthy) {
        // Have another driver attempt the fetch of the current stock
        stocks.queued.push(stock);
        break;
      }
      // Wait for the page to load for a maximum of 10 seconds.
      await driver.wait(until.elementLocated(By.css("div.panel-set__first-column:has(h1#company-name)")), 15000);

      const lockedContent = await driver.findElements(By.className("lock__content"));
      if (
        lockedContent.length > 0 &&
        (await lockedContent[0].getText()).includes(
          "This company's ESG Score and underlying data are available via our premium channels"
        )
      ) {
        // If the content is available for premium subscribers only, we throw an error.
        // Sadly, we are not a premium subscriber :(
        throw new Error("This stock’s ESG Score is available for S&P Premium subscribers only.");
      }

      spESGScore = +(await driver.findElement(By.id("esg-score")).getText());

      // Update the stock in the database.
      await updateStock(stock.ticker, {
        spLastFetch: new Date(),
        spESGScore,
      });
      stocks.successful.push(await readStock(stock.ticker));
    } catch (e) {
      if (req.query.ticker) {
        // If this request was for a single stock, we shut down the driver and throw an error.
        await quitDriver(driver, sessionID);
        throw new APIError(
          502,
          `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`
        );
      }
      logger.warn(PREFIX_SELENIUM + chalk.yellowBright(`Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`));
      if (stock.spESGScore !== null) {
        // If an S&P ESG Score is already stored in the database, but we cannot extract it from the page, we log this
        // as an error and send a message.
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Stock ${stock.ticker}: Extraction of S&P ESG Score failed unexpectedly. ` +
                `This incident will be reported.`
            )
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${
              String(e.message).split(/[\n:{]/)[0]
            }\n${await takeScreenshot(driver, stock, "sp")}`,
          "fetchError"
        );
        stocks.failed.push(await readStock(stock.ticker));
      } else {
        stocks.successful.push(await readStock(stock.ticker));
      }
    }
    if (stocks.failed.length >= 10) {
      // If we have 10 errors, we stop fetching data, since something is probably wrong.
      if (stocks.queued.length) {
        // No other fetcher did this before
        logger.error(
          PREFIX_SELENIUM +
            chalk.redBright(
              `Aborting fetching information from S&P after ${stocks.successful.length} ` +
                `successful fetches and ${stocks.failed.length} failures. Will continue next time.`
            )
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from S&P after ${stocks.successful.length} ` +
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

export default spFetcher;
