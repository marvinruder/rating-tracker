// This class is not tested because it is not possible to use it without a running Selenium WebDriver.
import { DataProvider, Stock } from "@rating-tracker/commons";
import axios, { AxiosError } from "axios";
import { Builder, Capabilities, WebDriver, until } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";

import { createResource } from "../redis/repositories/resourceRepository";

import APIError from "./APIError";
import logger from "./logger";

/**
 * A page load strategy to use by the WebDriver.
 */
type PageLoadStrategy = "normal" | "eager" | "none";

/**
 * Checks if the Selenium instance is reachable.
 *
 * @returns {Promise<void>} A promise that resolves when the Selenium instance is reachable, or rejects with an error if
 * it is not.
 */
export const seleniumIsReady = (): Promise<void> =>
  axios
    .get(`${process.env.SELENIUM_URL}/status`, { timeout: 1000 })
    .then((res) => (res.data.value.ready ? Promise.resolve() : Promise.reject(new Error("Selenium is not ready"))))
    .catch((e) =>
      e instanceof AxiosError
        ? Promise.reject(new Error("Selenium is not reachable: " + e.message))
        : Promise.reject(e),
    );

/**
 * Creates and returns a new WebDriver instance.
 *
 * @param {boolean} headless whether to run the browser in headless mode
 * @param {PageLoadStrategy} pageLoadStrategy whether to run the browser in headless mode
 * @returns {Promise<WebDriver>} The WebDriver instance
 * @throws an {@link APIError} if the WebDriver cannot be created
 */
export const getDriver = async (headless?: boolean, pageLoadStrategy?: PageLoadStrategy): Promise<WebDriver> => {
  // Wait up to 1 second randomly to avoid a not yet identified bottleneck
  await new Promise<void>((resolve) => setTimeout(() => resolve(), Math.random() * 1000));
  const url = process.env.SELENIUM_URL;
  const options = new chrome.Options().addArguments("--blink-settings=imagesEnabled=false"); // Do not load images
  headless && options.addArguments("--headless=new"); // In headless mode, the browser window is not shown.

  return await new Builder()
    .usingServer(url)
    .withCapabilities(
      new Capabilities()
        // Use Chrome as the browser.
        .setBrowserName("chrome")
        // Do not wait for all resources to load. This speeds up the page load.
        .setPageLoadStrategy(pageLoadStrategy ?? "none")
        // Silently dismiss all unexpected prompts
        .setAlertBehavior("dismiss"),
    )
    .setChromeOptions(options)
    .build()
    .then(async (driver) => {
      // Use `setSize(…)` after https://github.com/SeleniumHQ/selenium/issues/12243 is resolved.
      await driver.manage().window().setRect({ width: 1080, height: 7680 }); // convenient for screenshots of whole page
      return driver;
    })
    .catch((e) => {
      throw new APIError(502, "Unable to connect to Selenium WebDriver", e);
    });
};

/**
 * Let the WebDriver open a URL and wait until the URL is present and previous content is removed.
 *
 * @param {WebDriver} driver the WebDriver instance to shut down
 * @param {string } url the URL to open
 * @returns {Promise<boolean>} Whether the operation succeeded
 */
export const openPageAndWait = async (driver: WebDriver, url: string): Promise<boolean> => {
  try {
    await driver.get(url);
    await driver.wait(until.urlIs(url), 5000);
    return true;
  } catch (e) {
    logger.error({ prefix: "fetch", err: e }, `Unable to fetch from page ${url} (driver may be unhealthy)`);
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
 * @throws an {@link APIError} if the WebDriver cannot be shut down gracefully
 */
export const quitDriver = async (driver: WebDriver, sessionID?: string): Promise<void> => {
  try {
    await driver.quit();
  } catch (e) {
    logger.error({ prefix: "fetch", err: e }, "Unable to shut down Selenium WebDriver gracefully");
    if (sessionID) {
      logger.info({ prefix: "fetch" }, `Attempting forceful shutdown of stale session ${sessionID}.`);
      axios.delete(`${process.env.SELENIUM_URL}/session/${sessionID}`).catch((e) => {
        logger.error(
          { prefix: "fetch", err: e },
          `An error occurred while forcefully terminating session ${sessionID}`,
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
 * @param {DataProvider} dataProvider the name of the data provider
 * @returns {Promise<string>} A string holding the ID of the screenshot resource.
 */
export const takeScreenshot = async (driver: WebDriver, stock: Stock, dataProvider: DataProvider): Promise<string> => {
  const screenshotID = `error-${dataProvider}-${stock.ticker}-${new Date().getTime().toString()}.png`;
  try {
    const screenshot = await driver.takeScreenshot();
    await createResource(
      {
        url: screenshotID,
        fetchDate: new Date(),
        content: screenshot, // base64-encoded PNG image
      },
      60 * 60 * 48, // We only store the screenshot for 48 hours.
    );
    return screenshotID;
  } catch (e) {
    logger.warn({ prefix: "fetch", err: e }, `Unable to take screenshot “${screenshotID}”`);
    return "";
  }
};
