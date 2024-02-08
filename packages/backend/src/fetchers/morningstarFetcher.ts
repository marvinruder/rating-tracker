import assert from "node:assert";

import type { Industry, Size, Style, Currency, Stock } from "@rating-tracker/commons";
import { isIndustry, isSize, isStyle, isCurrency } from "@rating-tracker/commons";
import type { Request } from "express";
import xpath from "xpath-ts2";

import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import DataProviderError from "../utils/DataProviderError";
import logger from "../utils/logger";

import type { HTMLFetcher, FetcherWorkspace, ParseResult } from "./fetchHelper";
import { captureDataProviderError, getAndParseHTML } from "./fetchHelper";

const XPATH_CONTENT = xpath.parse(
  "//*[@id='SnapshotBodyContent'][count(.//*[@id='IntradayPriceSummary']) > 0][count(.//*[@id='CompanyProfile']) > 0]",
);
const XPATH_INDUSTRY = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/..");
const XPATH_SIZE_STYLE = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/..");
const XPATH_DESCRIPTION = xpath.parse("//*/div[@id='CompanyProfile']/div[1][not(.//h3)]");
const XPATH_FAIR_VALUE = xpath.parse("//*/div[@id='FairValueEstimate']/span/datapoint");

const MAX_RETRIES = 10;

/**
 * Fetches data from Morningstar Italy.
 * @param req Request object
 * @param stocks An object with the stocks to fetch and the stocks already fetched (successful or with errors)
 * @param stock The stock to extract data for
 * @param parseResult The fetched and parsed HTML document and/or the error that occurred during parsing
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws an {@link APIError} in case of a severe error
 */
const morningstarFetcher: HTMLFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  parseResult: ParseResult,
): Promise<void> => {
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

  const url =
    `https://tools.morningstar.it/it/stockreport/default.aspx?Site=us&id=${stock.morningstarID}` +
    `&LanguageId=en-US&SecurityToken=${stock.morningstarID}]3]0]E0WWE$$ALL`;
  await getAndParseHTML(url, undefined, stock, "morningstar", parseResult);

  let attempts = 1;
  while (attempts > 0) {
    try {
      // Check for the presence of the div containing all relevant information.
      const contentDiv = XPATH_CONTENT.select1({ node: parseResult?.document, isHtml: true });
      assert(contentDiv, "Unable to find content div.");
      attempts = 0; // Page load succeeded.
    } catch (e) {
      // We probably stumbled upon a temporary 502 Bad Gateway or 429 Too Many Requests error, which persists for a
      // few minutes. We periodically retry to fetch the page.

      // Too many attempts failed, we throw the error occurred during parsing, or the last assertion error.
      if (++attempts > MAX_RETRIES) throw parseResult?.error ?? e;

      logger.warn(
        { prefix: "fetch" },
        `Unable to load Morningstar page for ${stock.name} (${stock.ticker}). ` +
          `Will retry (attempt ${attempts} of ${MAX_RETRIES})`,
      );
      // Load the page once again
      await getAndParseHTML(url, undefined, stock, "morningstar", parseResult);
    }
  }

  const { document } = parseResult;

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching Morningstar data for ${stock.name} (${stock.ticker}):`;

  try {
    const industryNode = XPATH_INDUSTRY.select1({ node: document, isHtml: true });
    assert(industryNode, "Unable to find Industry node.");
    const industryString = industryNode.textContent
      // Example: "Industry\nLumber & Wood Production" (the parser may remove the newline character though)
      .replace(/Industry\n?/, "") // Remove headline
      .replaceAll(/[^a-zA-Z0-9]/g, ""); // Remove all non-alphanumeric characters
    if (isIndustry(industryString)) {
      industry = industryString;
    } else {
      throw new TypeError(`Extracted industry “${industryString}” is no valid industry.`);
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract industry: ${e}`);
    if (stock.industry !== null) {
      // If an industry for the stock is already stored in the database, but we cannot extract it now from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of industry failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract industry: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const sizeAndStyleNode = XPATH_SIZE_STYLE.select1({ node: document, isHtml: true });
    assert(sizeAndStyleNode, "Unable to find Stock Style node.");
    const sizeAndStyle = sizeAndStyleNode.textContent
      // Example: "Stock Style\nLarge-Blend" (the parser may remove the newline character though)
      .replace(/Stock Style\n?/, "") // Remove headline
      .split("-");
    if (sizeAndStyle.length !== 2) throw new TypeError("No valid size and style available.");
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
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract size and style: ${e}`);
    if (stock.size !== null || stock.style !== null) {
      // If size or style for the stock are already stored in the database, but we cannot extract them now from
      // the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of size and style failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract size and style: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    // Remove all non-digit characters
    const starRatingString = document.getElementsByClassName("starsImg")[0].getAttribute("alt").replaceAll(/\D/g, "");
    if (starRatingString.length === 0 || Number.isNaN(+starRatingString))
      throw new TypeError("Extracted star rating is no valid number.");
    starRating = +starRatingString;
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract star rating: ${e}`);
    if (stock.starRating !== null) {
      // If a star rating for the stock is already stored in the database, but we cannot extract it now from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of star rating failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract star rating: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const dividendYieldPercentString = document.getElementById("Col0Yield").textContent;
    // Example: "2.1", or "-" if there is no dividend yield.
    if (dividendYieldPercentString === "-") {
      dividendYieldPercent = null;
    } else {
      if (dividendYieldPercentString.length === 0 || Number.isNaN(+dividendYieldPercentString))
        throw new TypeError("Extracted dividend yield is no valid number.");
      dividendYieldPercent = +dividendYieldPercentString;
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract dividend yield: ${e}`);
    if (stock.dividendYieldPercent !== null) {
      // If a dividend yield for the stock is already stored in the database, but we cannot extract it now from
      // the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of dividend yield failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract dividend yield: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const priceEarningRatioString = document.getElementById("Col0PE").textContent.replaceAll(",", "");
    // Example: "20.5", "1,000" for larger numbers, or "-" if there is no P/E.
    if (priceEarningRatioString === "-") {
      priceEarningRatio = null;
    } else {
      if (priceEarningRatioString.length === 0 || Number.isNaN(+priceEarningRatioString))
        throw new TypeError("Extracted price earning ratio is no valid number.");
      priceEarningRatio = +priceEarningRatioString;
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract price earning ratio: ${e}`);
    if (stock.priceEarningRatio !== null) {
      // If a price earning ratio for the stock is already stored in the database, but we cannot extract it now
      // from the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of price earning ratio failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract price earning ratio: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    let currencyString = document.getElementById("Col0PriceTime").textContent;
    // Example: "17:35:38 CET | EUR  Minimum 15 Minutes Delay."
    currencyString = currencyString.match(/\s+\|\s+([A-Z]{3})\s+/)[1];
    if (isCurrency(currencyString)) {
      currency = currencyString;
    } else {
      throw new TypeError(`Extracted currency code “${currencyString}” is no valid currency code.`);
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract currency: ${e}`);
    if (stock.currency !== null) {
      // If a currency for the stock is already stored in the database, but we cannot extract it now from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of currency failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract currency: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const lastCloseString = document.getElementById("Col0LastClose").textContent.replaceAll(",", "");
    // Example: "1,000.00", or "-" if there is no last close.
    if (lastCloseString === "-") {
      lastClose = null;
    } else {
      if (lastCloseString.length === 0 || Number.isNaN(+lastCloseString))
        throw new TypeError("Extracted last close is no valid number.");
      lastClose = +lastCloseString;
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract last close: ${e}`);
    if (stock.lastClose !== null) {
      // If a last close for the stock is already stored in the database, but we cannot extract it now from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of last close failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract last close: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const morningstarFairValueNode = XPATH_FAIR_VALUE.select1({ node: document, isHtml: true });
    assert(morningstarFairValueNode, "Unable to find Morningstar Fair Value node.");
    const morningstarFairValueString = morningstarFairValueNode.textContent
      // Example: "1,000.00 USD", or "-" if there is no Morningstar Fair Value.
      .split(/\s+/)[0]
      .replaceAll(",", "");
    if (morningstarFairValueString === "-") {
      morningstarFairValue = null;
    } else {
      if (morningstarFairValueString.length === 0 || Number.isNaN(+morningstarFairValueString))
        throw new TypeError("Extracted Morningstar Fair Value is no valid number.");
      morningstarFairValue = +morningstarFairValueString;
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Morningstar Fair Value: ${e}`);
    if (stock.morningstarFairValue !== null) {
      // If a Morningstar Fair Value for the stock is already stored in the database, but we cannot extract it
      // now from the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of Morningstar Fair Value failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract Morningstar Fair Value: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const marketCapText = document
      .getElementById("Col0MCap")
      .textContent // Example: "2,235.00Bil", or "-" if there is no market capitalization.
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
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract Market Capitalization: ${e}`);
    if (stock.marketCap !== null) {
      // If a market capitalization for the stock is already stored in the database, but we cannot extract it now
      // from the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of Market Capitalization failed unexpectedly. ` +
          "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract Market Capitalization: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const range52wStrings = document
      .getElementById("Col0WeekRange")
      .textContent // Example: "1,000.00 - 2,000.00", or "-" if there is no 52 week price range.
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
      )
        throw new TypeError("Extracted 52 week low or high is no valid number.");
      low52w = +range52wStrings[0];
      high52w = +range52wStrings[1];
    }
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract 52 week price range: ${e}`);
    if (stock.low52w !== null || stock.high52w !== null) {
      // If a 52 week price range for the stock is already stored in the database, but we cannot extract it now
      // from the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of 52 week price range failed unexpectedly. This incident will be reported.`,
      );
      errorMessage += `\n\tUnable to extract 52 week price range: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    const descriptionNode = XPATH_DESCRIPTION.select1({ node: document, isHtml: true });
    assert(descriptionNode, "Unable to find Description node.");
    description = descriptionNode.textContent;
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract description: ${e}`);
    if (stock.description !== null) {
      // If a description for the stock is already stored in the database, but we cannot extract it now from
      // the page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of description failed unexpectedly. This incident will be reported.`,
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
    // We capture the resource and send a message.
    errorMessage += `\n${await captureDataProviderError(stock, "morningstar", { document })}`;
    // If this request was for a single stock, we throw an error instead of sending a message, so that the error
    // message will be part of the response.
    if (req.query.ticker) throw new DataProviderError(errorMessage);

    await signal.sendMessage(SIGNAL_PREFIX_ERROR + errorMessage, "fetchError");
    stocks.failed.push(await readStock(stock.ticker));
  } else {
    stocks.successful.push(await readStock(stock.ticker));
  }
};

export default morningstarFetcher;
