import {
  Industry,
  Size,
  Style,
  Currency,
  isIndustry,
  isSize,
  isStyle,
  isCurrency,
  Stock,
} from "@rating-tracker/commons";
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

const XPATH_INDUSTRY = "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.." as const;
const XPATH_SIZE_STYLE = "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/.." as const;
const XPATH_DESCRIPTION = "//*/div[@id='CompanyProfile']/div[1][not(.//h3)]" as const;

const MAX_RETRIES = 10;

/**
 * Fetches data from Morningstar Italy.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @throws an {@link APIError} in case of a severe error
 */
const morningstarFetcher = async (req: Request, stocks: FetcherWorkspace<Stock>): Promise<void> => {
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
      stock.morningstarLastFetch &&
      // We only fetch stocks that have not been fetched in the last 12 hours.
      new Date().getTime() - stock.morningstarLastFetch.getTime() < 1000 * 60 * 60 * 12
    ) {
      logger.info(
        { prefix: "selenium" },
        `Stock ${stock.ticker}: Skipping Morningstar fetch since last successful fetch was ${formatDistance(
          stock.morningstarLastFetch.getTime(),
          new Date().getTime(),
          { addSuffix: true },
        )}`,
      );
      stocks.skipped.push(stock);
      continue;
    }
    let industry: Industry = req.query.clear ? null : undefined;
    let size: Size = req.query.clear ? null : undefined;
    let style: Style = req.query.clear ? null : undefined;
    let starRating: number = req.query.clear ? null : undefined;
    let dividendYieldPercent: number = req.query.clear ? null : undefined;
    let priceEarningRatio: number = req.query.clear ? null : undefined;
    let currency: Currency = req.query.clear ? null : undefined;
    let lastClose: number = req.query.clear ? null : undefined;
    let morningstarFairValue: number = req.query.clear ? null : undefined;
    let marketCap: number = req.query.clear ? null : undefined;
    let low52w: number = req.query.clear ? null : undefined;
    let high52w: number = req.query.clear ? null : undefined;
    let description: string = req.query.clear ? null : undefined;

    try {
      const url =
        `https://tools.morningstar.it/it/stockreport/default.aspx?Site=us&id=${stock.morningstarID}` +
        `&LanguageId=en-US&SecurityToken=${stock.morningstarID}]3]0]E0WWE$$ALL`;
      const driverHealthy = await openPageAndWait(driver, url);
      // When we were unable to open the page, we assume the driver is unhealthy and end.
      if (!driverHealthy) {
        // Have another driver attempt the fetch of the current stock
        stocks.queued.push(stock);
        break;
      }

      let attempts = 1;
      while (attempts > 0) {
        try {
          await driver.wait(
            until.elementLocated(By.css("#SnapshotBodyContent:has(#IntradayPriceSummary):has(#CompanyProfile)")),
            30000, // Wait for the page to load for a maximum of 30 seconds.
          );
          attempts = 0; // Page load succeeded.
        } catch (e) {
          // We probably stumbled upon a temporary 502 Bad Gateway or 429 Too Many Requests error, which persists for a
          // few minutes. We periodically retry to fetch the page.
          if (++attempts > MAX_RETRIES) {
            throw e; // Too many attempts failed, we throw the last error.
          }
          logger.warn(
            { prefix: "selenium" },
            `Unable to load Morningstar page for ${stock.name} (${stock.ticker}). ` +
              `Will retry (attempt ${attempts} of ${MAX_RETRIES})`,
          );
          await openPageAndWait(driver, url); // Load the page once again
        }
      }

      // Prepare an error message header containing the stock name and ticker.
      let errorMessage = `Error while fetching Morningstar data for ${stock.name} (${stock.ticker}):`;

      try {
        const industryString = (await driver.findElement(By.xpath(XPATH_INDUSTRY)).getText())
          // Example: "Industry\nLumber & Wood Production"
          .replace("Industry\n", "") // Remove headline
          .replaceAll(/[^a-zA-Z0-9]/g, ""); // Remove all non-alphanumeric characters
        if (isIndustry(industryString)) {
          industry = industryString;
        } else {
          throw new TypeError(`Extracted industry “${industryString}” is no valid industry.`);
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract industry: ${e}`);
        if (stock.industry !== null) {
          // If an industry for the stock is already stored in the database, but we cannot extract it now from the
          // page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of industry failed unexpectedly. This incident will be reported.`,
          );
          errorMessage += `\n\tUnable to extract industry: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const sizeAndStyle = (await driver.findElement(By.xpath(XPATH_SIZE_STYLE)).getText())
          // Example: "Stock Style\nLarge-Blend"
          .replace("Stock Style\n", "") // Remove headline
          .split("-");
        if (sizeAndStyle.length !== 2) {
          throw new TypeError("No valid size and style available.");
        }
        if (isSize(sizeAndStyle[0])) {
          size = sizeAndStyle[0];
        } else {
          throw new TypeError(`Extracted size “${sizeAndStyle[0]}” is no valid size.`);
        }
        if (isStyle(sizeAndStyle[1])) {
          style = sizeAndStyle[1];
        } else {
          throw new TypeError(`Extracted style “${sizeAndStyle[1]}” is no valid style.`);
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract size and style: ${e}`);
        if (stock.size !== null || stock.style !== null) {
          // If size or style for the stock are already stored in the database, but we cannot extract them now from
          // the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of size and style failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract size and style: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const starRatingString = (await driver.findElement(By.className("starsImg")).getAttribute("alt")).replaceAll(
          /\D/g,
          "",
        ); // Remove all non-digit characters
        if (starRatingString.length === 0 || Number.isNaN(+starRatingString)) {
          throw new TypeError("Extracted star rating is no valid number.");
        }
        starRating = +starRatingString;
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract star rating: ${e}`);
        if (stock.starRating !== null) {
          // If a star rating for the stock is already stored in the database, but we cannot extract it now from the
          // page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of star rating failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract star rating: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const dividendYieldPercentString = await driver.findElement(By.id("Col0Yield")).getText();
        // Example: "2.1", or "-" if there is no dividend yield.
        if (dividendYieldPercentString === "-") {
          dividendYieldPercent = null;
        } else {
          if (dividendYieldPercentString.length === 0 || Number.isNaN(+dividendYieldPercentString)) {
            throw new TypeError("Extracted dividend yield is no valid number.");
          }
          dividendYieldPercent = +dividendYieldPercentString;
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract dividend yield: ${e}`);
        if (stock.dividendYieldPercent !== null) {
          // If a dividend yield for the stock is already stored in the database, but we cannot extract it now from
          // the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of dividend yield failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract dividend yield: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const priceEarningRatioString = (await driver.findElement(By.id("Col0PE")).getText()).replaceAll(",", "");
        // Example: "20.5", "1,000" for larger numbers, or "-" if there is no P/E.
        if (priceEarningRatioString === "-") {
          priceEarningRatio = null;
        } else {
          if (priceEarningRatioString.length === 0 || Number.isNaN(+priceEarningRatioString)) {
            throw new TypeError("Extracted price earning ratio is no valid number.");
          }
          priceEarningRatio = +priceEarningRatioString;
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e}`);
        if (stock.priceEarningRatio !== null) {
          // If a price earning ratio for the stock is already stored in the database, but we cannot extract it now
          // from the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of price earning ratio failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract price earning ratio: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        let currencyString = await driver.findElement(By.id("Col0PriceTime")).getText();
        // Example: "17:35:38 CET | EUR  Minimum 15 Minutes Delay."
        currencyString = currencyString.match(/\s+\|\s+([A-Z]{3})\s+/)[1];
        if (isCurrency(currencyString)) {
          currency = currencyString;
        } else {
          throw new TypeError(`Extracted currency code “${currencyString}” is no valid currency code.`);
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract currency: ${e}`);
        if (stock.currency !== null) {
          // If a currency for the stock is already stored in the database, but we cannot extract it now from the
          // page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of currency failed unexpectedly. This incident will be reported.`,
          );
          errorMessage += `\n\tUnable to extract currency: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const lastCloseString = (await driver.findElement(By.id("Col0LastClose")).getText()).replaceAll(",", "");
        // Example: "1,000.00", or "-" if there is no last close.
        if (lastCloseString === "-") {
          lastClose = null;
        } else {
          if (lastCloseString.length === 0 || Number.isNaN(+lastCloseString)) {
            throw new TypeError("Extracted last close is no valid number.");
          }
          lastClose = +lastCloseString;
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract last close: ${e}`);
        if (stock.lastClose !== null) {
          // If a last close for the stock is already stored in the database, but we cannot extract it now from the
          // page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of last close failed unexpectedly. This incident will be reported.`,
          );
          errorMessage += `\n\tUnable to extract last close: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        // Example: "1,000.00 USD", or "-" if there is no Morningstar Fair Value.
        const morningstarFairValueString = (
          await driver.findElement(By.css("#FairValueEstimate>span>datapoint")).getText()
        )
          .split(/\s+/)[0]
          .replaceAll(",", "");
        if (morningstarFairValueString === "-") {
          morningstarFairValue = null;
        } else {
          if (morningstarFairValueString.length === 0 || Number.isNaN(+morningstarFairValueString)) {
            throw new TypeError("Extracted Morningstar Fair Value is no valid number.");
          }
          morningstarFairValue = +morningstarFairValueString;
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e}`);
        if (stock.morningstarFairValue !== null) {
          // If a Morningstar Fair Value for the stock is already stored in the database, but we cannot extract it
          // now from the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of Morningstar Fair Value failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract Morningstar Fair Value: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const marketCapText = (await driver.findElement(By.id("Col0MCap")).getText())
          // Example: "2,235.00Bil", or "-" if there is no market capitalization.
          .replaceAll(",", "");
        if (marketCapText === "-") {
          marketCap = null;
        } else {
          if (marketCapText.includes("Bil")) {
            marketCap = Math.round(1e9 * +marketCapText.substring(0, marketCapText.indexOf("Bil")));
          } else if (marketCapText.includes("Mil")) {
            marketCap = Math.round(1e6 * +marketCapText.substring(0, marketCapText.indexOf("Mil")));
          } else {
            marketCap = +marketCapText;
          }
          if (!marketCapText.match(/\d+/) || Number.isNaN(marketCap)) {
            marketCap = req.query.clear ? null : undefined;
            throw new TypeError("Extracted market capitalization is no valid number.");
          }
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e}`);
        if (stock.marketCap !== null) {
          // If a market capitalization for the stock is already stored in the database, but we cannot extract it now
          // from the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of Market Capitalization failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract Market Capitalization: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        const range52wStrings = (await driver.findElement(By.id("Col0WeekRange")).getText())
          // Example: "1,000.00 - 2,000.00", or "-" if there is no 52 week price range.
          .replaceAll(",", "")
          .split(" - ");
        if (range52wStrings[0] === "-") {
          low52w = null;
          high52w = null;
        } else {
          if (
            range52wStrings.length !== 2 ||
            range52wStrings[0].length === 0 ||
            range52wStrings[1].length === 0 ||
            Number.isNaN(+range52wStrings[0]) ||
            Number.isNaN(+range52wStrings[1])
          ) {
            throw new TypeError("Extracted 52 week low or high is no valid number.");
          }
          low52w = +range52wStrings[0];
          high52w = +range52wStrings[1];
        }
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract 52 week price range: ${e}`);
        if (stock.low52w !== null || stock.high52w !== null) {
          // If a 52 week price range for the stock is already stored in the database, but we cannot extract it now
          // from the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of 52 week price range failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract 52 week price range: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      try {
        description = await driver.findElement(By.xpath(XPATH_DESCRIPTION)).getText();
      } catch (e) {
        logger.warn({ prefix: "selenium" }, `Stock ${stock.ticker}: Unable to extract description: ${e}`);
        if (stock.description !== null) {
          // If a description for the stock is already stored in the database, but we cannot extract it now from
          // the page, we log this as an error and send a message.
          logger.error(
            { prefix: "selenium", err: e },
            `Stock ${stock.ticker}: Extraction of description failed unexpectedly. ` +
              "This incident will be reported.",
          );
          errorMessage += `\n\tUnable to extract description: ${String(e.message).split(/[\n:{]/)[0]}`;
        }
      }

      // Update the stock in the database.
      await updateStock(stock.ticker, {
        industry,
        size,
        style,
        morningstarLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
        starRating,
        dividendYieldPercent,
        priceEarningRatio,
        currency,
        lastClose,
        morningstarFairValue,
        marketCap,
        low52w,
        high52w,
        description,
      });
      if (errorMessage.includes("\n")) {
        // An error occurred if and only if the error message contains a newline character.
        // We take a screenshot and send a message.
        errorMessage += `\n${await takeScreenshot(driver, stock, "morningstar")}`;
        await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
        stocks.failed.push(await readStock(stock.ticker));
      } else {
        stocks.successful.push(await readStock(stock.ticker));
      }
    } catch (e) {
      stocks.failed.push(stock);
      if (req.query.ticker) {
        // If the request was for a single stock, we shut down the driver and throw an error.
        await quitDriver(driver, sessionID);
        throw new APIError(
          502,
          `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${String(e.message).split(/[\n:{]/)[0]}`,
        );
      }
      logger.error({ prefix: "selenium", err: e }, `Stock ${stock.ticker}: Unable to fetch Morningstar data`);
      await signal.sendMessage(
        SIGNAL_PREFIX_ERROR +
          `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${
            String(e.message).split(/[\n:{]/)[0]
          }\n${await takeScreenshot(driver, stock, "morningstar")}`,
        "fetchError",
      );
    }
    if (stocks.failed.length >= 10) {
      // If we have 10 errors, we stop fetching data, since something is probably wrong.
      if (stocks.queued.length) {
        // No other fetcher did this before
        logger.error(
          { prefix: "selenium" },
          `Aborting fetching information from Morningstar after ${stocks.successful.length} ` +
            `successful fetches and ${stocks.failed.length} failures. Will continue next time.`,
        );
        await signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from Morningstar after ${stocks.successful.length} ` +
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

export default morningstarFetcher;
