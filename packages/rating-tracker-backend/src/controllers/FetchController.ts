// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
/* istanbul ignore file */
import { formatDistance } from "date-fns";
import { Request, Response } from "express";
import { Builder, By, Capabilities, until, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import APIError from "../lib/apiError.js";
import { Stock } from "../models/stock.js";
import chalk from "chalk";
import {
  Currency,
  Industry,
  isCurrency,
  isIndustry,
  isSize,
  isStyle,
  MSCIESGRating,
  Resource,
  Size,
  Style,
  WRITE_STOCKS,
} from "rating-tracker-commons";
import { readAllStocks, readStock, updateStock } from "../redis/repositories/stock/stockRepository.js";
import * as signal from "../signal/signal.js";
import logger, { PREFIX_CHROME } from "../lib/logger.js";
import { createResource, readResource } from "../redis/repositories/resource/resourceRepository.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const SIGNAL_PREFIX_ERROR = "⚠️ ";
const SIGNAL_PREFIX_INFO = "ℹ️ ";

const XPATH_INDUSTRY = "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/.." as const;
const XPATH_SIZE_STYLE = "//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/.." as const;
const XPATH_STAR_RATING = "//*/img[@class='starsImg']" as const;
const XPATH_MORNINGSTAR_FAIR_VALUE = "//*/datapoint[@id='FairValueEstimate']" as const;
const XPATH_DESCRIPTION = "//*/div[@id='CompanyProfile']/div[1][not(.//h3)]" as const;

const XPATH_CONSENSUS_DIV = "//*/div[@class='tabTitleLeftWhite']/b[contains(text(), 'Consensus')]/../../../.." as const;
const XPATH_CONSENSUS_NOTE = "//div/table/tbody/tr/td/div/div[starts-with(@title, 'Note : ')]" as const;
const XPATH_ANALYST_COUNT =
  "//div/table/tbody/tr/td[contains(text(), 'Number of Analysts')]/following-sibling::td" as const;
const XPATH_SPREAD_AVERAGE_TARGET =
  "//div/table/tbody/tr/td[contains(text(), 'Spread / Average Target')]/following-sibling::td" as const;

const XPATH_SP_PANEL = "//*/div[@class='panel-set__first-column']/h2[@id='company-name']/.." as const;

const URL_SUSTAINALYTICS = "https://www.sustainalytics.com/sustapi/companyratings/getcompanyratings";

/**
 * This class is responsible for fetching data from external data providers.
 */
class FetchController {
  /**
   * Creates and returns a new WebDriver instance.
   *
   * @param {boolean} headless whether to run the browser in headless mode
   * @returns {Promise<WebDriver>} a Promise that resolves to a WebDriver instance
   * @throws an {@link APIError} if the WebDriver cannot be created
   */
  async getDriver(headless?: boolean) {
    const url = process.env.SELENIUM_URL;
    const options = new Options().addArguments("window-size=1080x3840"); // convenient for screenshots
    headless && options.headless(); // In headless mode, the browser window is not shown.

    return await new Builder()
      .usingServer(url)
      .withCapabilities(
        new Capabilities()
          // Use Chrome as the browser.
          .setBrowserName("chrome")
          // Do not wait for all resources to load. This speeds up the page load.
          .setPageLoadStrategy("eager")
      )
      .setChromeOptions(options)
      .build()
      .then((driver) => driver)
      .catch((e) => {
        throw new APIError(502, `Unable to connect to Selenium WebDriver: ${e.message}`);
      });
  }

  /**
   * Shuts down the given WebDriver instance gracefully, deallocating all associated resources.
   *
   * @param {WebDriver} driver the WebDriver instance to shut down
   * @returns {Promise<void>} a Promise that resolves when the WebDriver has been shut down
   * @throws an {@link APIError} if the WebDriver cannot be shut down gracefully
   */
  async quitDriver(driver: WebDriver) {
    try {
      await driver.quit();
    } catch (e) {
      logger.warn(PREFIX_CHROME + chalk.yellowBright(`Unable to shut down Selenium WebDriver gracefully: ${e}`));
    }
  }

  /**
   * Creates a screenshot of the current page and stores it in Redis.
   *
   * @param {WebDriver} driver the WebDriver instance in use
   * @param {Stock} stock the affected stock
   * @param {string} dataProvider the name of the data provider
   * @returns {Promise<string>} a Promise that resolves to a string holding a general informational message and a URL to
   * the screenshot
   */
  async takeScreenshot(driver: WebDriver, stock: Stock, dataProvider: string): Promise<string> {
    const screenshotID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString()}.png`;
    try {
      const screenshot = await driver.takeScreenshot();
      await createResource(
        {
          url: screenshotID,
          fetchDate: new Date(),
          content: screenshot, // base64-encoded PNG image
        },
        60 * 60 * 24 // We only store the screenshot for 24 hours.
      );
      return `For additional information, see https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${
        process.env.DOMAIN
      }/api/resource/${screenshotID}.`;
    } catch (e) {
      logger.warn(PREFIX_CHROME + chalk.yellowBright(`Unable to take screenshot “${screenshotID}”: ${e}`));
      return "";
    }
  }

  /**
   * Fetches data from Morningstar UK.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchMorningstarData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].morningstarId) {
          // If the only stock to use does not have a Morningstar ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a Morningstar ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks
      .filter((stock) => stock.morningstarId) // Only stocks with a Morningstar ID are considered.
      .sort(
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        (a, b) => (a.morningstarLastFetch ?? new Date(0)).getTime() - (b.morningstarLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    const driver = await this.getDriver(true);
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.morningstarLastFetch &&
        // We only fetch stocks that have not been fetched in the last 12 hours.
        new Date().getTime() - stock.morningstarLastFetch.getTime() < 1000 * 60 * 60 * 12
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${stock.ticker}: Skipping Morningstar fetch since last successful fetch was ${formatDistance(
              stock.morningstarLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let industry: Industry;
      let size: Size;
      let style: Style;
      let starRating: number;
      let dividendYieldPercent: number;
      let priceEarningRatio: number;
      let currency: Currency;
      let lastClose: number;
      let morningstarFairValue: number;
      let marketCap: number;
      let low52w: number;
      let high52w: number;
      let description: string;

      try {
        await driver.get(
          `https://tools.morningstar.co.uk/uk/stockreport/default.aspx?Site=us&id=${stock.morningstarId}` +
            `&LanguageId=en-US&SecurityToken=${stock.morningstarId}]3]0]E0WWE$$ALL`
        );
        await driver.wait(
          until.elementLocated(By.id("SnapshotContent")),
          15000 // Wait for the page to load for a maximum of 15 seconds.
        );

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
          logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract industry: ${e}`));
          if (stock.industry !== undefined) {
            // If an industry for the stock is already stored in Redis, but we cannot extract it now from the page, we
            // log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of industry failed unexpectedly. This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract industry: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          const sizeAndStyle = (await driver.findElement(By.xpath(XPATH_SIZE_STYLE)).getText())
            // Example: "Stock Style\nLarge-Blend"
            .replace("Stock Style\n", "") // Remove headline
            .split("-");
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
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract size and style: ${e}`)
          );
          if (stock.size !== undefined || stock.style !== undefined) {
            // If size or style for the stock are already stored in Redis, but we cannot extract them now from the page,
            // we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of size and style failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract size and style: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          const starRatingString = (
            await driver.findElement(By.xpath(XPATH_STAR_RATING)).getAttribute("alt")
          ).replaceAll(/\D/g, ""); // Remove all non-digit characters
          if (starRatingString.length === 0 || Number.isNaN(+starRatingString)) {
            throw new TypeError(`Extracted star rating is no valid number.`);
          }
          starRating = +starRatingString;
        } catch (e) {
          logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract star rating: ${e}`));
          if (stock.starRating !== undefined) {
            // If a star rating for the stock is already stored in Redis, but we cannot extract it now from the page, we
            // log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of star rating failed unexpectedly. ` +
                    `This incident will be reported.`
                )
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
              throw new TypeError(`Extracted dividend yield is no valid number.`);
            }
            dividendYieldPercent = +dividendYieldPercentString;
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract dividend yield: ${e}`)
          );
          if (stock.dividendYieldPercent !== undefined) {
            // If a dividend yield for the stock is already stored in Redis, but we cannot extract it now from the page,
            // we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of dividend yield failed unexpectedly. ` +
                    `This incident will be reported.`
                )
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
              throw new TypeError(`Extracted price earning ratio is no valid number.`);
            }
            priceEarningRatio = +priceEarningRatioString;
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract price earning ratio: ${e}`)
          );
          if (stock.priceEarningRatio !== undefined) {
            // If a price earning ratio for the stock is already stored in Redis, but we cannot extract it now from the
            // page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of price earning ratio failed unexpectedly. ` +
                    `This incident will be reported.`
                )
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
          logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract currency: ${e}`));
          if (stock.currency !== undefined) {
            // If a currency for the stock is already stored in Redis, but we cannot extract it now from the page, we
            // log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of currency failed unexpectedly. This incident will be reported.`
                )
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
              throw new TypeError(`Extracted last close is no valid number.`);
            }
            lastClose = +lastCloseString;
          }
        } catch (e) {
          logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract last close: ${e}`));
          if (stock.lastClose !== undefined) {
            // If a last close for the stock is already stored in Redis, but we cannot extract it now from the page, we
            // log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of last close failed unexpectedly. This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract last close: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          const morningstarFairValueString = (
            await driver.findElement(By.xpath(XPATH_MORNINGSTAR_FAIR_VALUE)).getText()
          ) // Example: "1,000.00 USD", or "-" if there is no Morningstar Fair Value.
            .split(/\s+/)[0]
            .replaceAll(",", "");
          if (morningstarFairValueString === "-") {
            morningstarFairValue = null;
          } else {
            if (morningstarFairValueString.length === 0 || Number.isNaN(+morningstarFairValueString)) {
              throw new TypeError(`Extracted Morningstar Fair Value is no valid number.`);
            }
            morningstarFairValue = +morningstarFairValueString;
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e}`)
          );
          if (stock.morningstarFairValue !== undefined) {
            // If a Morningstar Fair Value for the stock is already stored in Redis, but we cannot extract it now from
            // the page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of Morningstar Fair Value failed unexpectedly. ` +
                    `This incident will be reported.`
                )
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
              marketCap = undefined;
              throw new TypeError(`Extracted market capitalization is no valid number.`);
            }
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e}`)
          );
          if (stock.marketCap !== undefined) {
            // If a market capitalization for the stock is already stored in Redis, but we cannot extract it now from
            // the page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of Market Capitalization failed unexpectedly. ` +
                    `This incident will be reported.`
                )
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
              range52wStrings[0].length === 0 ||
              range52wStrings[1].length === 0 ||
              Number.isNaN(+range52wStrings[0]) ||
              Number.isNaN(+range52wStrings[1])
            ) {
              throw new TypeError(`Extracted 52 week low or high is no valid number.`);
            }
            low52w = +range52wStrings[0];
            high52w = +range52wStrings[1];
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract 52 week price range: ${e}`)
          );
          if (stock.low52w !== undefined || stock.high52w !== undefined) {
            // If a 52 week price range for the stock is already stored in Redis, but we cannot extract it now from
            // the page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of 52 week price range failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract 52 week price range: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          description = await driver.findElement(By.xpath(XPATH_DESCRIPTION)).getText();
        } catch (e) {
          logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract description: ${e}`));
          if (stock.description !== undefined) {
            // If a description for the stock is already stored in Redis, but we cannot extract it now from
            // the page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of description failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract description: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        if (errorMessage.includes("\n")) {
          // An error occurred if and only if the error message contains a newline character.
          // We take a screenshot and send a message.
          errorMessage += `\n${await this.takeScreenshot(driver, stock, "morningstar")}`;
          signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
        // Update the stock in Redis.
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
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        errorCount += 1;
        consecutiveErrorCount += 1;
        if (req.query.ticker) {
          // If the request was for a single stock, we shut down the driver and throw an error.
          await this.quitDriver(driver);
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        logger.error(PREFIX_CHROME + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch Morningstar data: ${e}`));
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Stock ${stock.ticker}: Unable to fetch Morningstar data: ${
              String(e.message).split(/[\n:{]/)[0]
            }\n${await this.takeScreenshot(driver, stock, "morningstar")}`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
      }
      if (consecutiveErrorCount >= 5) {
        // If we have 5 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting fetching information from Morningstar after ${consecutiveErrorCount} consecutive failures, ` +
                `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from Morningstar after ${consecutiveErrorCount} consecutive failures, ` +
            `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
        );
        break;
      }
    }
    await this.quitDriver(driver);
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  /**
   * Fetches data from MarketScreener.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchMarketScreenerData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].marketScreenerId) {
          // If the only stock to use does not have a MarketScreener ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a MarketScreener ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks
      .filter((stock) => stock.marketScreenerId) // Only stocks with a MarketScreener ID are considered.
      .sort(
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        (a, b) =>
          (a.marketScreenerLastFetch ?? new Date(0)).getTime() - (b.marketScreenerLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    const driver = await this.getDriver(true);
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.marketScreenerLastFetch &&
        // We only fetch stocks that have not been fetched in the last 12 hours.
        new Date().getTime() - stock.marketScreenerLastFetch.getTime() < 1000 * 60 * 60 * 12
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${stock.ticker}: Skipping MarketScreener fetch because last fetch was ${formatDistance(
              stock.marketScreenerLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let analystConsensus: number;
      let analystCount: number;
      let analystTargetPrice: number;

      try {
        await driver.get(`https://www.marketscreener.com/quote/stock/${stock.marketScreenerId}/`);
        // Wait for the page to load for a maximum of 5 seconds.
        await driver.wait(until.elementLocated(By.id("zbCenter")), 5000);

        // Prepare an error message header containing the stock name and ticker.
        let errorMessage = `Error while fetching MarketScreener data for stock ${stock.ticker}:`;

        try {
          // Locate the div containing all relevant analyst-related information.
          const consensusTableDiv = await driver.findElement(By.xpath(XPATH_CONSENSUS_DIV));

          try {
            analystConsensus = +(
              await (await consensusTableDiv.findElement(By.xpath(XPATH_CONSENSUS_NOTE))).getAttribute("title")
            ) // Example: " Note : 9.1 / 10"
              .match(/(\d+(\.\d+)?)/g)[0]; // Extract the first decimal number from the title.
          } catch (e) {
            logger.warn(
              PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Analyst Consensus: ${e}`)
            );
            if (stock.analystConsensus !== undefined) {
              // If an analyst consensus is already stored in Redis, but we cannot extract it from the page, we log
              // this as an error and send a message.
              logger.error(
                PREFIX_CHROME +
                  chalk.redBright(
                    `Stock ${stock.ticker}: Extraction of analyst consensus failed unexpectedly. ` +
                      `This incident will be reported.`
                  )
              );
              errorMessage += `\n\tUnable to extract Analyst Consensus: ${String(e.message).split(/[\n:{]/)[0]}`;
            }
          }

          try {
            analystCount = +(await (await consensusTableDiv.findElement(By.xpath(XPATH_ANALYST_COUNT))).getText());
          } catch (e) {
            logger.warn(
              PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Analyst Count: ${e}`)
            );
            if (stock.analystCount !== undefined) {
              // If an analyst count is already stored in Redis, but we cannot extract it from the page, we log
              // this as an error and send a message.
              logger.error(
                PREFIX_CHROME +
                  chalk.redBright(
                    `Stock ${stock.ticker}: Extraction of analyst count failed unexpectedly. ` +
                      `This incident will be reported.`
                  )
              );
              errorMessage += `\n\tUnable to extract Analyst Count: ${String(e.message).split(/[\n:{]/)[0]}`;
            }
          }

          try {
            // We need the last close price to calculate the analyst target price.
            if (!stock.lastClose) {
              throw new Error("No Last Close price available to compare spread against.");
            }
            analystTargetPrice =
              stock.lastClose *
              (+(await (await consensusTableDiv.findElement(By.xpath(XPATH_SPREAD_AVERAGE_TARGET))).getText())
                .replaceAll(",", ".")
                .match(/(\-)?\d+(\.\d+)?/g)[0] /
                100 +
                1);
          } catch (e) {
            logger.warn(
              PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Analyst Target Price: ${e}`)
            );
            if (stock.analystTargetPrice !== undefined) {
              // If an analyst target price is already stored in Redis, but we cannot extract it from the page, we log
              // this as an error and send a message.
              logger.error(
                PREFIX_CHROME +
                  chalk.redBright(
                    `Stock ${stock.ticker}: Extraction of analyst target price failed unexpectedly. ` +
                      `This incident will be reported.`
                  )
              );
              errorMessage += `\n\tUnable to extract Analyst Target Price: ${String(e.message).split(/[\n:{]/)[0]}`;
            }
          }
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: \n\tUnable to extract Analyst Information: ${e}`)
          );
          if (
            stock.analystConsensus !== undefined ||
            stock.analystCount !== undefined ||
            stock.analystTargetPrice !== undefined
          ) {
            // If any of the analyst-related information is already stored in Redis, but we cannot extract it from the
            // page, we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of analyst information failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract Analyst Information: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        if (errorMessage.includes("\n")) {
          // An error occurred if and only if the error message contains a newline character.
          // We take a screenshot and send a message.
          errorMessage += `\n${await this.takeScreenshot(driver, stock, "marketscreener")}`;
          signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
        // Update the stock in Redis.
        await updateStock(stock.ticker, {
          marketScreenerLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
          analystConsensus,
          analystCount,
          analystTargetPrice,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        errorCount += 1;
        consecutiveErrorCount += 1;
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          await this.quitDriver(driver);
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        logger.error(
          PREFIX_CHROME + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${e}`)
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Stock ${stock.ticker}: Unable to fetch MarketScreener data: ${
              String(e.message).split(/[\n:{]/)[0]
            }\n${await this.takeScreenshot(driver, stock, "marketscreener")}`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
      }
      if (consecutiveErrorCount >= 5) {
        // If we have 5 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting fetching information from MarketScreener after ${consecutiveErrorCount} consecutive failures,` +
                ` ${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from MarketScreener after ${consecutiveErrorCount} consecutive failures, ` +
            `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
        );
        break;
      }
    }
    await this.quitDriver(driver);
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  /**
   * Fetches data from MSCI.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchMSCIData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].msciId) {
          // If the only stock to use does not have an MSCI ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have an MSCI ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks
      .filter((stock) => stock.msciId) // Only stocks with an MSCI ID are considered.
      .sort(
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        (a, b) => (a.msciLastFetch ?? new Date(0)).getTime() - (b.msciLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    const driver = await this.getDriver();
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.msciLastFetch &&
        // We only fetch stocks that have not been fetched in the last 14 days.
        new Date().getTime() - stock.msciLastFetch.getTime() < 1000 * 60 * 60 * 24 * 14
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${stock.ticker}: Skipping MSCI fetch since last successful fetch was ${formatDistance(
              stock.msciLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      if (successfulCount >= 50) {
        // If we have fetched 50 stocks successfully, we stop fetching data to avoid rate limiting.
        logger.info(
          PREFIX_CHROME +
            chalk.greenBright(
              `Successfully fetched MSCI information for ${successfulCount} stocks (${errorCount} errors). ` +
                `Pausing now to avoid rate limiting. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_INFO +
            `Successfully fetched MSCI information for ${successfulCount} stocks (${errorCount} errors). ` +
            `Pausing now to avoid rate limiting. Will continue next time.`
        );
        break;
      }
      let msciESGRating: MSCIESGRating;
      let msciTemperature: number;

      try {
        await driver.manage().deleteAllCookies(); // Delete all cookies since MSCI allows only 4 requests per session.
        if (successfulCount > 0 || errorCount > 0) {
          // Wait 15 seconds between requests to avoid rate limiting.
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
        await driver.get(
          `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/${stock.msciId}`
        );
        await driver.wait(
          until.elementsLocated(By.className("esg-expandable")),
          10000 // Wait for the page to load for a maximum of 10 seconds.
        );

        // Prepare an error message header containing the stock name and ticker.
        let errorMessage = `Error while fetching MSCI information for ${stock.name} (${stock.ticker}):`;

        try {
          const esgClassName = await driver
            .findElement(By.className("ratingdata-company-rating"))
            .getAttribute("class"); // Example: "esg-rating-circle-bbb"
          msciESGRating = esgClassName.substring(esgClassName.lastIndexOf("-") + 1).toUpperCase() as MSCIESGRating;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract MSCI ESG Rating: ${e}`)
          );
          if (stock.msciESGRating !== undefined) {
            // If an MSCI ESG Rating is already stored in Redis, but we cannot extract it from the page, we log this as
            // an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of MSCI ESG Rating failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract MSCI ESG Rating: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          msciTemperature = +(
            await driver.findElement(By.className("implied-temp-rise-value")).getAttribute("outerText")
          ) // Example: "2.5°C"
            .match(/(\d+(\.\d+)?)/g)[0];
        } catch (e) {
          logger.warn(
            PREFIX_CHROME +
              chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract MSCI Implied Temperature Rise: ${e}`)
          );
          if (stock.msciTemperature !== undefined) {
            // If an MSCI Implied Temperature Rise is already stored in Redis, but we cannot extract it from the page,
            // we log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
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

        if (errorMessage.includes("\n")) {
          // An error occurred if and only if the error message contains a newline character.
          // We take a screenshot and send a message.
          errorMessage += `\n${await this.takeScreenshot(driver, stock, "msci")}`;
          signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
        // Update the stock in Redis.
        await updateStock(stock.ticker, {
          msciLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
          msciESGRating,
          msciTemperature,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        errorCount += 1;
        consecutiveErrorCount += 1;
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          await this.quitDriver(driver);
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch MSCI information: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        logger.error(PREFIX_CHROME + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch MSCI information: ${e}`));
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Stock ${stock.ticker}: Unable to fetch MSCI information: ${
              String(e.message).split(/[\n:{]/)[0]
            }\n${await this.takeScreenshot(driver, stock, "msci")}`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
      }
      if (consecutiveErrorCount >= 10) {
        // If we have 10 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting fetching information from MSCI after ${consecutiveErrorCount} consecutive failures, ` +
                `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from MSCI after ${consecutiveErrorCount} consecutive failures, ` +
            `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
        );
        break;
      }
    }
    await this.quitDriver(driver);
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  /**
   * Fetches data from Refinitiv.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchRefinitivData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].ric) {
          // If the only stock to use does not have a RIC, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a RIC.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks
      .filter((stock) => stock.ric) // Only stocks with a RIC are considered.
      .sort(
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        (a, b) => (a.refinitivLastFetch ?? new Date(0)).getTime() - (b.refinitivLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    const driver = await this.getDriver(true);
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.refinitivLastFetch &&
        // We only fetch stocks that have not been fetched in the last 7 days.
        new Date().getTime() - stock.refinitivLastFetch.getTime() < 1000 * 60 * 60 * 24 * 7
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${stock.ticker}: Skipping Refinitiv fetch because last fetch was ${formatDistance(
              stock.refinitivLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let refinitivESGScore: number;
      let refinitivEmissions: number;

      try {
        // Delete all cookies since Refinitiv allows only 100 requests per session.
        await driver.manage().deleteAllCookies();
        await driver.get(`https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`);
        // Wait for the page to load for a maximum of 5 seconds.
        await driver.wait(until.elementLocated(By.css("pre")), 5000);

        // Extract the JSON content from the page.
        const refinitivJSON = JSON.parse(await (await driver.findElement(By.css("pre"))).getText());

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
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Refinitiv ESG Score: ${e}`)
          );
          if (stock.refinitivESGScore !== undefined) {
            // If a Refinitiv ESG Score is already stored in Redis, but we cannot extract it from the page, we log this
            // as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of Refinitiv ESG Score failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract Refinitiv ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        try {
          refinitivEmissions = +refinitivJSON.esgScore["TR.TRESGEmissions"].score;
        } catch (e) {
          logger.warn(
            PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Refinitiv Emissions: ${e}`)
          );
          if (stock.refinitivEmissions !== undefined) {
            // If a Refinitiv Emissions Rating is already stored in Redis, but we cannot extract it from the page, we
            // log this as an error and send a message.
            logger.error(
              PREFIX_CHROME +
                chalk.redBright(
                  `Stock ${stock.ticker}: Extraction of Refinitiv Emissions failed unexpectedly. ` +
                    `This incident will be reported.`
                )
            );
            errorMessage += `\n\tUnable to extract Refinitiv Emissions: ${String(e.message).split(/[\n:{]/)[0]}`;
          }
        }

        if (errorMessage.includes("\n")) {
          // An error occurred if and only if the error message contains a newline character.
          // We take a screenshot and send a message.
          errorMessage += `\n${await this.takeScreenshot(driver, stock, "refinitiv")}`;
          signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
        // Update the stock in Redis.
        await updateStock(stock.ticker, {
          refinitivLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
          refinitivESGScore,
          refinitivEmissions,
        });
        updatedStocks.push(await readStock(stock.ticker));
      } catch (e) {
        errorCount += 1;
        consecutiveErrorCount += 1;
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          await this.quitDriver(driver);
          throw new APIError(
            (e as Error).message.includes("Limit exceeded") ? 429 : 502,
            `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        if ((e as Error).message.includes("Limit exceeded")) {
          // If the limit has been exceeded, we stop fetching data and log an error.
          logger.error(
            PREFIX_CHROME +
              chalk.redBright(
                `Aborting fetching information from Refinitiv after exceeding limit ` +
                  `(${successfulCount} successful fetches). Will continue next time.`
              )
          );
          signal.sendMessage(
            SIGNAL_PREFIX_ERROR +
              `Aborting fetching information from Refinitiv after exceeding limit ` +
              `(${successfulCount} successful fetches). Will continue next time.`
          );
          break;
        }
        logger.error(
          PREFIX_CHROME + chalk.redBright(`Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${e}`)
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Stock ${stock.ticker}: Unable to fetch Refinitiv information: ${
              String(e.message).split(/[\n:{]/)[0]
            }\n${await this.takeScreenshot(driver, stock, "refinitiv")}`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
      }
      if (consecutiveErrorCount >= 5) {
        // If we have 5 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting fetching information from Refinitiv after ${consecutiveErrorCount} consecutive failures, ` +
                `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from Refinitiv after ${consecutiveErrorCount} consecutive failures, ` +
            `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
        );
        break;
      }
    }
    await this.quitDriver(driver);
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  /**
   * Fetches data from Standard & Poor’s.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchSPData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].spId) {
          // If the only stock to use does not have an S&P ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have an S&P ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks
      .filter((stock) => stock.spId) // Only stocks with an S&P ID are considered.
      .sort(
        // Sort stocks by last fetch date, so that we fetch the oldest stocks first.
        (a, b) => (a.spLastFetch ?? new Date(0)).getTime() - (b.spLastFetch ?? new Date(0)).getTime()
      );
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    const driver = await this.getDriver(true);
    for await (const stock of stocks) {
      if (
        !req.query.noSkip &&
        stock.spLastFetch &&
        // We only fetch stocks that have not been fetched in the last 7 days.
        new Date().getTime() - stock.spLastFetch.getTime() < 1000 * 60 * 60 * 24 * 7
      ) {
        logger.info(
          PREFIX_CHROME +
            `Stock ${stock.ticker}: Skipping S&P fetch because last fetch was ${formatDistance(
              stock.spLastFetch.getTime(),
              new Date().getTime(),
              { addSuffix: true }
            )}`
        );
        continue;
      }
      let spESGScore: number;

      try {
        await driver.get(`https://www.spglobal.com/esg/scores/results?cid=${stock.spId}`);
        // Wait for the page to load for a maximum of 5 seconds.
        await driver.wait(until.elementLocated(By.xpath(XPATH_SP_PANEL)), 5000);

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

        spESGScore = +(await (await driver.findElement(By.id("esg-score"))).getText());

        // Update the stock in Redis.
        await updateStock(stock.ticker, {
          spLastFetch: new Date(),
          spESGScore,
        });
        updatedStocks.push(await readStock(stock.ticker));
        successfulCount += 1;
        consecutiveErrorCount = 0;
      } catch (e) {
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          await this.quitDriver(driver);
          throw new APIError(
            502,
            `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        logger.warn(PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${e}`));
        if (stock.spESGScore !== undefined) {
          // If an S&P ESG Score is already stored in Redis, but we cannot extract it from the page, we log this as an
          // error and send a message.
          logger.error(
            PREFIX_CHROME +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of S&P ESG Score failed unexpectedly. ` +
                  `This incident will be reported.`
              )
          );
          signal.sendMessage(
            SIGNAL_PREFIX_ERROR +
              `Stock ${stock.ticker}: Unable to fetch S&P ESG Score: ${
                String(e.message).split(/[\n:{]/)[0]
              }\n${await this.takeScreenshot(driver, stock, "sp")}`
          );
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Cool down for 3 seconds.
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
      }
      if (consecutiveErrorCount >= 5) {
        // If we have 5 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting fetching information from S&P after ${consecutiveErrorCount} consecutive failures, ` +
                `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting fetching information from S&P after ${consecutiveErrorCount} consecutive failures, ` +
            `${successfulCount} successful fetches and ${errorCount} total failures. Will continue next time.`
        );
        break;
      }
    }
    await this.quitDriver(driver);
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }

  /**
   * Fetches data from Morningstar Sustainalytics.
   *
   * @param {Request} req Request object.
   * @param {Response} res Response object.
   * @returns {Promise<Response>} a Promise that resolves to a Response object when the request has been processed
   * @throws an {@link APIError} in case of a severe error
   */
  async fetchSustainalyticsData(req: Request, res: Response) {
    if (!(res.locals.user?.hasAccessRight(WRITE_STOCKS) || res.locals.userIsCron)) {
      throw new APIError(
        403,
        "This user account does not have the necessary access rights to fetch data from providers."
      );
    }
    let stocks: Stock[];

    if (req.query.ticker) {
      // A single stock is requested.
      const ticker = req.query.ticker;
      if (typeof ticker === "string") {
        stocks = [await readStock(ticker)];
        if (!stocks[0].sustainalyticsId) {
          // If the only stock to use does not have a Sustainalytics ID, we throw an error.
          throw new APIError(404, `Stock ${ticker} does not have a Sustainalytics ID.`);
        }
      }
    } else {
      // When no specific stock is requested, we fetch all stocks from Redis.
      stocks = (await readAllStocks()).map((stockEntity) => new Stock(stockEntity));
    }

    stocks = stocks.filter((stock) => stock.sustainalyticsId); // Only stocks with a Sustainalytics ID are considered.
    if (stocks.length === 0) {
      // If no stocks are left, we return a 204 No Content response.
      return res.status(204).end();
    }
    if (req.query.detach) {
      // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
      res.sendStatus(202);
    }

    const updatedStocks: Stock[] = [];
    let successfulCount = 0;
    let errorCount = 0;
    let consecutiveErrorCount = 0;
    let sustainalyticsXMLResource: Resource;
    try {
      try {
        // We try to read the cached Sustainalytics data first.
        sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
        logger.info(
          PREFIX_CHROME +
            `Using cached Sustainalytics data because last fetch was ${formatDistance(
              sustainalyticsXMLResource.fetchDate,
              new Date().getTime(),
              { addSuffix: true }
            )}.`
        );
      } catch (e) {
        // If the cached data is not available, we fetch it freshly from the web.
        await axios
          .post(
            URL_SUSTAINALYTICS,
            "page=1&pageSize=100000&resourcePackage=Sustainalytics", // Using a large pageSize to fetch all at once.
            {
              headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
          )
          .then(async (response) => {
            const sustainalyticsXMLLines: string[] = [];
            response.data.split("\n").forEach((line) => {
              // We only keep the lines that contain the data we need.
              if (line.includes(`<a data-href="`) || line.includes(`<div class="col-2">`)) {
                sustainalyticsXMLLines.push(line.trim());
              }
            });
            // We cache the data for 7 days.
            await createResource(
              {
                url: URL_SUSTAINALYTICS,
                fetchDate: new Date(response.headers["date"]),
                content: sustainalyticsXMLLines.join("\n"),
              },
              60 * 60 * 24 * 7
            );
            sustainalyticsXMLResource = await readResource(URL_SUSTAINALYTICS);
          })
          .catch((e) => {
            throw e;
          });
      }
    } catch (e) {
      throw new APIError(502, `Unable to fetch Sustainalytics information: ${String(e.message).split(/[\n:{]/)[0]}`);
    }

    const sustainalyticsXMLLines = sustainalyticsXMLResource.content.split("\n");

    for await (const stock of stocks) {
      let sustainalyticsESGRisk: number;

      try {
        // Look for the Sustainalytics ID in the XML lines.
        const sustainalyticsIdIndex = sustainalyticsXMLLines.findIndex(
          (line, index) =>
            line.startsWith(`<a data-href="/${stock.sustainalyticsId}`) &&
            sustainalyticsXMLLines[index + 1].startsWith(`<div class="col-2">`)
        );
        if (sustainalyticsIdIndex === -1) {
          // If the Sustainalytics ID is not found, we throw an error.
          throw new APIError(404, `Cannot find Sustainalytics ID ${stock.sustainalyticsId} in XML.`);
        }
        const sustainalyticsESGRiskLine = sustainalyticsXMLLines[sustainalyticsIdIndex + 1];
        sustainalyticsESGRisk = +sustainalyticsESGRiskLine // Example: <div class="col-2">25.2</div>
          .substring(sustainalyticsESGRiskLine.indexOf(">") + 1)
          .match(/(\d+(\.\d+)?)/g)[0];

        // Update the stock in Redis.
        await updateStock(stock.ticker, {
          sustainalyticsESGRisk,
        });
        updatedStocks.push(await readStock(stock.ticker));
        successfulCount += 1;
        consecutiveErrorCount = 0;
      } catch (e) {
        if (req.query.ticker) {
          // If this request was for a single stock, we shut down the driver and throw an error.
          throw new APIError(
            (e as APIError).status ?? 500,
            `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${String(e.message).split(/[\n:{]/)[0]}`
          );
        }
        logger.warn(
          PREFIX_CHROME + chalk.yellowBright(`Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${e}`)
        );
        if (stock.sustainalyticsESGRisk !== undefined) {
          // If a Sustainalytics ESG Risk is already stored in Redis, but we cannot extract it from the page, we log
          // this as an error and send a message.
          logger.error(
            PREFIX_CHROME +
              chalk.redBright(
                `Stock ${stock.ticker}: Extraction of Sustainalytics ESG Risk failed unexpectedly. ` +
                  `This incident will be reported.`
              )
          );
          signal.sendMessage(
            SIGNAL_PREFIX_ERROR +
              `Stock ${stock.ticker}: Unable to extract Sustainalytics ESG Risk: ${
                String(e.message).split(/[\n:{]/)[0]
              }`
          );
          errorCount += 1;
          consecutiveErrorCount += 1;
        } else {
          successfulCount += 1;
          consecutiveErrorCount = 0;
        }
      }
      if (consecutiveErrorCount >= 10) {
        // If we have 10 consecutive errors, we stop fetching data, since something is probably wrong.
        logger.error(
          PREFIX_CHROME +
            chalk.redBright(
              `Aborting extracting information from Sustainalytics after ${consecutiveErrorCount} ` +
                `consecutive failures, ${successfulCount} successful fetches and ${errorCount} total failures. ` +
                `Will continue next time.`
            )
        );
        signal.sendMessage(
          SIGNAL_PREFIX_ERROR +
            `Aborting extracting information from Sustainalytics after ${consecutiveErrorCount} ` +
            `consecutive failures, ${successfulCount} successful fetches and ${errorCount} total failures. ` +
            `Will continue next time.`
        );
        break;
      }
    }
    if (updatedStocks.length === 0) {
      return res.status(204).end();
    } else {
      return res.status(200).json(updatedStocks);
    }
  }
}

export default new FetchController();
