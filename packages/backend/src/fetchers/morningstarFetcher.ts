import assert from "node:assert";

import type { Industry, Size, Style, Stock } from "@rating-tracker/commons";
import { isIndustry, isSize, isStyle } from "@rating-tracker/commons";
import type { Request } from "express";
import xpath from "xpath-ts2";

import { updateStock } from "../db/tables/stockTable";
import DataProviderError from "../utils/DataProviderError";
import logger from "../utils/logger";

import type { Fetcher } from "./fetchHelper";
import { getAndParseHTML } from "./fetchHelper";

const XPATH_CONTENT = xpath.parse(
  "//*[@id='SnapshotBodyContent'][count(.//*[@id='IntradayPriceSummary']) > 0][count(.//*[@id='CompanyProfile']) > 0]",
);
const XPATH_INDUSTRY = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/..");
const XPATH_SIZE_STYLE = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/..");
const XPATH_DESCRIPTION = xpath.parse("//*/div[@id='CompanyProfile']/div[1][not(.//h3)]");
const XPATH_FAIR_VALUE = xpath.parse("//*/div[@id='FairValueEstimate']/span/datapoint");

/**
 * Fetches data from Morningstar Italy.
 * @param req Request object
 * @param stock The stock to extract data for
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws a {@link DataProviderError} in case of a severe error
 */
const morningstarFetcher: Fetcher = async (req: Request, stock: Stock): Promise<void> => {
  let industry: Industry = undefined;
  let size: Size = undefined;
  let style: Style = undefined;
  let starRating: number = undefined;
  let dividendYieldPercent: number = undefined;
  let priceEarningRatio: number = undefined;
  let morningstarFairValue: number = undefined;
  let marketCap: number = undefined;
  let description: string = undefined;

  const document = await getAndParseHTML(
    "https://tools.morningstar.it/it/stockreport/default.aspx",
    {
      params: {
        Site: "us",
        id: stock.morningstarID,
        LanguageId: "en-US",
        SecurityToken: `${stock.morningstarID}]3]0]E0WWE$$ALL`,
      },
    },
    stock,
    "morningstar",
  );

  try {
    // Check for the presence of the div containing all relevant information.
    const contentDiv = XPATH_CONTENT.select1({ node: document, isHtml: true });
    assert(contentDiv, "Unable to find content div.");
  } catch (e) {
    throw new DataProviderError("Unable to find content div.", { cause: e, dataSources: [document] });
  }

  // Prepare an error message.
  let errorMessage = "";

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
    // Check whether the currency matches the stock price currency first.
    let currencyString = document.getElementById("Col0PriceTime").textContent;
    // Example: "17:35:38 CET | EUR  Minimum 15 Minutes Delay."
    currencyString = currencyString.match(/\s+\|\s+([A-Z]{3})\s+/)[1];
    assert(
      currencyString === stock.currency,
      `Currency ${currencyString} does not match stock price currency ${stock.currency}.`,
    );

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
        marketCap = undefined;
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
    morningstarFairValue,
    marketCap,
    description,
  });
  // An error occurred if and only if the error message contains a newline character.
  if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [document] });
};

export default morningstarFetcher;
