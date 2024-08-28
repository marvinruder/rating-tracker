import assert from "node:assert";

import type { Stock } from "@rating-tracker/commons";

import type StockService from "../../stock/stock.service";
import DataProviderError from "../../utils/error/DataProviderError";
import ErrorHelper from "../../utils/error/errorHelper";
import Logger from "../../utils/logger";
import FetchService from "../fetch.service";

import IndividualFetcher from "./IndividualFetcher";

/**
 * This fetcher fetches data from LSEG Data & Analytics.
 */
class LSEGFetcher extends IndividualFetcher {
  constructor(private stockService: StockService) {
    super();
  }

  /**
   * Fetches data from LSEG Data & Analytics.
   * @param stock The stock to extract data for
   * @returns A {@link Promise} that resolves when the fetch is complete
   * @throws a {@link DataProviderError} in case of a severe error
   */
  fetch = async (stock: Stock): Promise<void> => {
    let lsegESGScore: number | undefined;
    let lsegEmissions: number | undefined;

    const json = await FetchService.getJSON("https://www.lseg.com/bin/esg/esgsearchresult", {
      params: { ricCode: stock.ric! },
    });

    if (Object.keys(json).length === 0)
      throw new DataProviderError("No LSEG information available.", { dataSources: [json] });

    if (
      "status" in json &&
      typeof json.status === "object" &&
      json.status !== null &&
      "limitExceeded" in json.status &&
      json.status.limitExceeded === true
    )
      // If the limit has been exceeded, we stop fetching data and throw an error.
      throw new DataProviderError("Limit exceeded.", { dataSources: [json] });

    // Prepare an error message.
    let errorMessage = "";

    try {
      assert(
        "esgScore" in json &&
          typeof json.esgScore === "object" &&
          json.esgScore !== null &&
          "TR.TRESG" in json.esgScore &&
          typeof json.esgScore["TR.TRESG"] === "object" &&
          json.esgScore["TR.TRESG"] !== null &&
          "score" in json.esgScore["TR.TRESG"],
        "LSEG ESG Score not found in JSON response.",
      );
      lsegESGScore = Number(json.esgScore["TR.TRESG"].score);
    } catch (e) {
      Logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract LSEG ESG Score: ${e}`);
      if (stock.lsegESGScore !== null) {
        // If a LSEG ESG Score is already stored in the database, but we cannot extract it from the JSON object, we log
        // this as an error and send a message.
        Logger.error(
          { prefix: "fetch", err: e },
          `Stock ${stock.ticker}: Extraction of LSEG ESG Score failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract LSEG ESG Score: ${ErrorHelper.getSummary(e)}`;
      }
    }

    try {
      assert(
        "esgScore" in json &&
          typeof json.esgScore === "object" &&
          json.esgScore !== null &&
          "TR.TRESGEmissions" in json.esgScore &&
          typeof json.esgScore["TR.TRESGEmissions"] === "object" &&
          json.esgScore["TR.TRESGEmissions"] !== null &&
          "score" in json.esgScore["TR.TRESGEmissions"],
        "LSEG Emissions Score not found in JSON response.",
      );
      lsegEmissions = Number(json.esgScore["TR.TRESGEmissions"].score);
    } catch (e) {
      Logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract LSEG Emissions: ${e}`);
      if (stock.lsegEmissions !== null) {
        // If a LSEG Emissions Rating is already stored in the database, but we cannot extract it from the
        // JSON object, we log this as an error and send a message.
        Logger.error(
          { prefix: "fetch", err: e },
          `Stock ${stock.ticker}: Extraction of LSEG Emissions failed unexpectedly. ` +
            "This incident will be reported.",
        );
        errorMessage += `\n\tUnable to extract LSEG Emissions: ${ErrorHelper.getSummary(e)}`;
      }
    }

    // Update the stock in the database.
    await this.stockService.update(stock.ticker, {
      lsegLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
      lsegESGScore,
      lsegEmissions,
    });
    // An error occurred if and only if the error message contains a newline character.
    if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [json] });
  };
}

export default LSEGFetcher;
