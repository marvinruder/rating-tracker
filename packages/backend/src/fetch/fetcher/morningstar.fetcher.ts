import assert from "node:assert";

import type { Industry, Size, Style, Stock } from "@rating-tracker/commons";
import { isIndustry, isSize, isStyle } from "@rating-tracker/commons";
import xpath from "xpath-ts2";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from Morningstar Italy.
 */
class MorningstarFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  #xpathContent = xpath.parse(
    "//*[@id='SnapshotBodyContent'][count(.//*[@id='IntradayPriceSummary'])>0][count(.//*[@id='CompanyProfile'])>0]",
  );
  #xpathIndustry = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Industry')]/..");
  #xpathSizeStyle = xpath.parse("//*/div[@id='CompanyProfile']/div/h3[contains(text(), 'Stock Style')]/..");
  #xpathDescription = xpath.parse("//*/div[@id='CompanyProfile']/div[1][not(.//h3)]");
  #xpathFairValue = xpath.parse("//*/div[@id='FairValueEstimate']/span/datapoint");

  /**
   * Fetches data from Morningstar Italy.
   * @param stock The stock to extract data for
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  async fetch(stock: Stock): Promise<void> {
    let industry: Industry | undefined;
    let size: Size | undefined;
    let style: Style | undefined;
    let starRating: number | undefined;
    let dividendYieldPercent: number | null | undefined;
    let priceEarningRatio: number | null | undefined;
    let morningstarFairValue: number | null | undefined;
    let marketCap: number | null | undefined;
    let description: string | undefined;

    const document = await FetchService.getAndParseHTML(
      "https://tools.morningstar.it/it/stockreport/default.aspx",
      {
        params: {
          Site: "us",
          id: stock.morningstarID!,
          LanguageId: "en-US",
          SecurityToken: `${stock.morningstarID}]3]0]E0WWE$$ALL`,
        },
      },
      stock,
      "morningstar",
    );

    try {
      // Check for the presence of the div containing all relevant information.
      const contentDiv = this.#xpathContent.select1({ node: document, isHtml: true });
      assert(contentDiv, "Unable to find content div.");
    } catch (e) {
      throw new DataProviderError("Unable to find content div.", { cause: e, dataSources: [document] });
    }

    // Prepare an error message.
    let errorMessage = "";

    try {
      const industryNode = this.#xpathIndustry.select1({ node: document, isHtml: true });
      assert(industryNode && industryNode.textContent !== null, "Unable to find Industry node.");
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
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "industry",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.industry !== null) {
        // If an industry for the stock is already stored in the database, but we cannot extract it now from the
        // page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "industry",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract industry: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const sizeAndStyleNode = this.#xpathSizeStyle.select1({ node: document, isHtml: true });
      assert(sizeAndStyleNode && sizeAndStyleNode.textContent !== null, "Unable to find Stock Style node.");
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
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: ["size", "style"],
          reason: e?.toString(),
        },
        "Unable to extract attributes",
      );
      if (stock.size !== null || stock.style !== null) {
        // If size or style for the stock are already stored in the database, but we cannot extract them now from
        // the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: ["size", "style"],
            reason: e?.toString(),
          },
          "Extraction of attributes failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract size and style: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      // Remove all non-digit characters
      const starRatingString = document
        .getElementsByClassName("starsImg")[0]
        .getAttribute("alt")!
        .replaceAll(/\D/g, "");
      if (starRatingString.length === 0 || Number.isNaN(+starRatingString))
        throw new TypeError("Extracted star rating is no valid number.");
      starRating = +starRatingString;
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "starRating",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.starRating !== null) {
        // If a star rating for the stock is already stored in the database, but we cannot extract it now from the
        // page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "starRating",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract star rating: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const dividendYieldPercentString = document.getElementById("Col0Yield")!.textContent as string;
      // Example: "2.1", or "-" if there is no dividend yield.
      if (dividendYieldPercentString === "-") {
        dividendYieldPercent = null;
      } else {
        if (dividendYieldPercentString.length === 0 || Number.isNaN(+dividendYieldPercentString))
          throw new TypeError("Extracted dividend yield is no valid number.");
        dividendYieldPercent = +dividendYieldPercentString;
      }
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "dividendYieldPercent",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.dividendYieldPercent !== null) {
        // If a dividend yield for the stock is already stored in the database, but we cannot extract it now from
        // the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "dividendYieldPercent",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract dividend yield: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const priceEarningRatioString = document.getElementById("Col0PE")!.textContent!.replaceAll(",", "");
      // Example: "20.5", "1,000" for larger numbers, or "-" if there is no P/E.
      if (priceEarningRatioString === "-") {
        priceEarningRatio = null;
      } else {
        if (priceEarningRatioString.length === 0 || Number.isNaN(+priceEarningRatioString))
          throw new TypeError("Extracted price earning ratio is no valid number.");
        priceEarningRatio = +priceEarningRatioString;
      }
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "priceEarningRatio",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.priceEarningRatio !== null) {
        // If a price earning ratio for the stock is already stored in the database, but we cannot extract it now
        // from the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "priceEarningRatio",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract price earning ratio: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      // Check whether the currency matches the stock price currency first.
      let currencyString = document.getElementById("Col0PriceTime")!.textContent as string;
      // Example: "17:35:38 CET | EUR  Minimum 15 Minutes Delay."
      currencyString = currencyString.match(/\s+\|\s+([A-Z]{3})\s+/)![1];
      assert(
        currencyString === stock.currency,
        `Currency ${currencyString} does not match stock price currency ${stock.currency}.`,
      );

      const morningstarFairValueNode = this.#xpathFairValue.select1({ node: document, isHtml: true });
      assert(
        morningstarFairValueNode && morningstarFairValueNode.textContent !== null,
        "Unable to find Morningstar Fair Value node.",
      );
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
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "morningstarFairValue",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.morningstarFairValue !== null) {
        // If a Morningstar Fair Value for the stock is already stored in the database, but we cannot extract it
        // now from the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "morningstarFairValue",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract Morningstar Fair Value: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const marketCapText = document
        .getElementById("Col0MCap")!
        .textContent! // Example: "2,235.00Bil", or "-" if there is no market capitalization.
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
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "marketCap",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.marketCap !== null) {
        // If a market capitalization for the stock is already stored in the database, but we cannot extract it now
        // from the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "marketCap",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract Market Capitalization: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      const descriptionNode = this.#xpathDescription.select1({ node: document, isHtml: true });
      assert(descriptionNode && descriptionNode.textContent !== null, "Unable to find Description node.");
      description = descriptionNode.textContent;
    } catch (e) {
      Logger.warn(
        {
          component: "fetch",
          stock: stock.ticker,
          dataProvider: "morningstar",
          attribute: "description",
          reason: e?.toString(),
        },
        "Unable to extract attribute",
      );
      if (stock.description !== null) {
        // If a description for the stock is already stored in the database, but we cannot extract it now from
        // the page, we log this as an error and send a message.
        Logger.error(
          {
            component: "fetch",
            stock: stock.ticker,
            dataProvider: "morningstar",
            attribute: "description",
            reason: e?.toString(),
          },
          "Extraction of attribute failed unexpectedly",
        );
        errorMessage += `\n\tUnable to extract description: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
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
  }
}

export default MorningstarFetcher;
