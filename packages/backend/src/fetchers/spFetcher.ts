import { SP_PREMIUM_STOCK_ERROR_MESSAGE, Stock } from "@rating-tracker/commons";
import { Request } from "express";
import { By, WebDriver, until } from "selenium-webdriver";

import type { SeleniumFetcher } from "../controllers/FetchController";
import { FetcherWorkspace } from "../controllers/FetchController";
import { readStock, updateStock } from "../db/tables/stockTable";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import * as signal from "../signal/signal";
import logger from "../utils/logger";
import { openPageAndWait, takeScreenshot } from "../utils/webdriver";

/**
 * Fetches data from Standard & Poor’s.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {WebDriver} driver The WebDriver instance to use
 * @returns {boolean} Whether the driver is still healthy
 * @throws an {@link APIError} in case of a severe error
 */
const spFetcher: SeleniumFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  driver: WebDriver,
): Promise<boolean> => {
  let spESGScore: number = req.query.clear ? null : undefined;

  const url = `https://www.spglobal.com/esg/scores/results?cid=${stock.spID}`;
  const driverHealthy = await openPageAndWait(driver, url);
  // When we were unable to open the page, we assume the driver is unhealthy and end.
  if (!driverHealthy) {
    // Have another driver attempt the fetch of the current stock
    stocks.queued.push(stock);
    return false;
  }
  // Wait for the page to load for a maximum of 10 seconds.
  await driver.wait(until.elementLocated(By.css("div.panel-set__first-column:has(h1#company-name)")), 15000);

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching S&P information for ${stock.name} (${stock.ticker}):`;

  try {
    const lockedContent = await driver.findElements(By.className("lock__content"));
    if (
      lockedContent.length > 0 &&
      (await lockedContent[0].getText()).includes(
        "This company's ESG Score and underlying data are available via our premium channels",
      )
    ) {
      // If the content is available for premium subscribers only, we throw an error.
      // Sadly, we are not a premium subscriber :(
      // We will still count this as a successful fetch
      await updateStock(stock.ticker, { spLastFetch: new Date() });
      throw new Error(SP_PREMIUM_STOCK_ERROR_MESSAGE);
    }
    spESGScore = +(await driver.findElement(By.className("scoreModule__score")).getText());
  } catch (e) {
    logger.warn({ prefix: "selenium", err: e }, `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`);
    if (stock.spESGScore !== null) {
      // If an S&P ESG Score is already stored in the database, but we cannot extract it from the page, we log this
      // as an error and send a message.
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
    // We take a screenshot and send a message.
    errorMessage += `\n${await takeScreenshot(driver, stock, "sp")}`;
    await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
    stocks.failed.push(await readStock(stock.ticker));
  } else {
    stocks.successful.push(await readStock(stock.ticker));
  }
  return true;
};

export default spFetcher;
