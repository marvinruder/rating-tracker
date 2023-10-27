import { MSCIESGRating, Stock, isMSCIESGRating } from "@rating-tracker/commons";
import { Request } from "express";
import { By, WebDriver, until } from "selenium-webdriver";

import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";
import { openPageAndWait } from "../utils/webdriver";

import { type SeleniumFetcher, type FetcherWorkspace, captureFetchError } from "./fetchHelper";

/**
 * Fetches data from MSCI using a Selenium WebDriver.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {WebDriver} driver The WebDriver instance to use
 * @returns {boolean} Whether the driver is still healthy
 * @throws an {@link APIError} in case of a severe error
 */
const msciFetcher: SeleniumFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  driver: WebDriver,
): Promise<boolean> => {
  let msciESGRating: MSCIESGRating = req.query.clear ? null : undefined;
  let msciTemperature: number = req.query.clear ? null : undefined;

  await driver.manage().deleteAllCookies(); // Delete all cookies since MSCI allows only 4 requests per session.
  const url = "https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/" + stock.msciID;
  const driverHealthy = await openPageAndWait(driver, url);
  // When we were unable to open the page, we assume the driver is unhealthy and end.
  if (!driverHealthy) {
    // Have another driver attempt the fetch of the current stock
    stocks.queued.push(stock);
    return false;
  }
  await driver.wait(
    until.elementsLocated(By.className("esg-expandable")),
    15000, // Wait for the page to load for a maximum of 15 seconds.
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
    logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e}`);
    if (stock.msciESGRating !== null) {
      // If an MSCI ESG Rating is already stored in the database, but we cannot extract it from the page, we log
      // this as an error and send a message.
      logger.error(
        { prefix: "selenium", err: e },
        `Stock ${stock.ticker}: Extraction of MSCI ESG Rating failed unexpectedly. ` +
          "This incident will be reported.",
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
      throw new TypeError("Extracted MSCI Implied Temperature Rise is no valid number.");
    }
    msciTemperature = +msciTemperatureMatches[0];
  } catch (e) {
    logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e}`);
    if (stock.msciTemperature !== null) {
      // If an MSCI Implied Temperature Rise is already stored in the database, but we cannot extract it from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "selenium", err: e },
        `Stock ${stock.ticker}: Extraction of MSCI Implied Temperature Rise failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract MSCI Implied Temperature Rise: ${String(e.message).split(/[\n:{]/)[0]}`;
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
    // We capture the resource and send a message.
    errorMessage += `\n${await captureFetchError(stock, "msci", { driver })}`;
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
  return true;
};

export default msciFetcher;
