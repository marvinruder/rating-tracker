// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
/* istanbul ignore file -- @preserve */
import { Builder, Capabilities, WebDriver, until } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";
import APIError from "./apiError.js";
import logger, { PREFIX_SELENIUM } from "./logger.js";
import chalk from "chalk";
import { Stock } from "rating-tracker-commons";
import { createResource } from "../redis/repositories/resourceRepository.js";
import axios from "axios";

/**
 * A page load strategy to use by the WebDriver.
 */
type PageLoadStrategy = "normal" | "eager" | "none";

/**
 * Creates and returns a new WebDriver instance.
 *
 * @param {boolean} headless whether to run the browser in headless mode
 * @param {PageLoadStrategy} pageLoadStrategy whether to run the browser in headless mode
 * @returns {Promise<WebDriver>} a Promise that resolves to a WebDriver instance
 * @throws an {@link APIError} if the WebDriver cannot be created
 */
export const getDriver = async (headless?: boolean, pageLoadStrategy?: PageLoadStrategy): Promise<WebDriver> => {
  // Wait up to 1 second randomly to avoid a not yet identified bottleneck
  await new Promise<void>((resolve) => setTimeout(() => resolve(), Math.random() * 1000));
  const url = process.env.SELENIUM_URL;
  const options = new chrome.Options()
    .addArguments("window-size=1080x3840") // convenient for screenshots
    .addArguments("--blink-settings=imagesEnabled=false"); // Do not load images
  headless && options.headless(); // In headless mode, the browser window is not shown.

  return await new Builder()
    .usingServer(url)
    .withCapabilities(
      new Capabilities()
        // Use Chrome as the browser.
        .setBrowserName("chrome")
        // Do not wait for all resources to load. This speeds up the page load.
        .setPageLoadStrategy(pageLoadStrategy ?? "none")
        // Silently dismiss all unexpected prompts
        .setAlertBehavior("dismiss")
    )
    .setChromeOptions(options)
    .build()
    .then((driver) => driver)
    .catch((e) => {
      throw new APIError(502, `Unable to connect to Selenium WebDriver: ${e.message}`);
    });
};

/**
 * Let the WebDriver open a URL and wait until the URL is present and previous content is removed.
 *
 * @param {WebDriver} driver the WebDriver instance to shut down
 * @param {string } url the URL to open
 * @returns {Promise<boolean>} a Promise resolving to the boolean success of the operation
 */
export const openPageAndWait = async (driver: WebDriver, url: string): Promise<boolean> => {
  try {
    await driver.get(url);
    await driver.wait(until.urlIs(url), 5000);
    return true;
  } catch (e) {
    logger.error(PREFIX_SELENIUM + chalk.redBright(`Unable to open page ${url} (driver may be unhealthy): ${e}`));
    return false;
  }
};

/**
 * Shuts down the given WebDriver instance gracefully, deallocating all associated resources.
 * If a graceful shutdown fails, a DELETE request is sent to Selenium requesting to terminate the stale session
 * forcefully.
 *
 * @param {WebDriver} driver the WebDriver instance to shut down
 * @param {string} sessionID the ID of the WebDriver session
 * @returns {Promise<void>} a Promise that resolves when the WebDriver has been shut down
 * @throws an {@link APIError} if the WebDriver cannot be shut down gracefully
 */
export const quitDriver = async (driver: WebDriver, sessionID?: string): Promise<void> => {
  try {
    await driver.quit();
  } catch (e) {
    logger.error(PREFIX_SELENIUM + chalk.redBright(`Unable to shut down Selenium WebDriver gracefully: ${e}`));
    if (sessionID) {
      logger.info(PREFIX_SELENIUM + `Attempting forceful shutdown of stale session ${sessionID}.`);
      axios.delete(`${process.env.SELENIUM_URL}/session/${sessionID}`).catch((e) => {
        logger.error(
          PREFIX_SELENIUM + chalk.redBright(`An error occurred while forcefully terminating session ${sessionID}: ${e}`)
        );
      });
    }
  }
};

/**
 * Creates a screenshot of the current page and stores it in Redis.
 *
 * @param {WebDriver} driver the WebDriver instance in use
 * @param {Stock} stock the affected stock
 * @param {string} dataProvider the name of the data provider
 * @returns {Promise<string>} a Promise that resolves to a string holding a general informational message and a URL to
 * the screenshot
 */
export const takeScreenshot = async (driver: WebDriver, stock: Stock, dataProvider: string): Promise<string> => {
  const screenshotID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString()}.png`;
  try {
    const screenshot = await driver.takeScreenshot();
    // deepcode ignore Ssrf: This is a custom function named `fetch()`, which does not perform a request
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
    logger.warn(PREFIX_SELENIUM + chalk.yellowBright(`Unable to take screenshot “${screenshotID}”: ${e}`));
    return "";
  }
};
