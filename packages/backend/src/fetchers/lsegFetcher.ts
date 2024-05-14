import assert from "node:assert";

import type { Stock } from "@rating-tracker/commons";
import type { Request } from "express";

import { updateStock } from "../db/tables/stockTable";
import DataProviderError from "../utils/DataProviderError";
import { performFetchRequest } from "../utils/fetchRequest";
import logger from "../utils/logger";

import type { Fetcher } from "./fetchHelper";

/**
 * Fetches data from LSEG Data & Analytics.
 * @param req Request object
 * @param stock The stock to extract data for
 * @returns A {@link Promise} that resolves when the fetch is complete
 * @throws a {@link DataProviderError} in case of a severe error
 */
const lsegFetcher: Fetcher = async (req: Request, stock: Stock): Promise<void> => {
  let lsegESGScore: number = req.query.clear ? null : undefined;
  let lsegEmissions: number = req.query.clear ? null : undefined;

  const json = (await performFetchRequest(`https://www.lseg.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`)).data;

  if (Object.keys(json).length === 0 && json.constructor === Object)
    throw new DataProviderError("No LSEG information available.", { dataSources: [json] });

  if (
    "status" in json &&
    typeof json.status === "object" &&
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
        "TR.TRESG" in json.esgScore &&
        typeof json.esgScore["TR.TRESG"] === "object" &&
        "score" in json.esgScore["TR.TRESG"],
      "LSEG ESG Score not found in JSON response.",
    );
    lsegESGScore = +json.esgScore["TR.TRESG"].score;
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract LSEG ESG Score: ${e}`);
    if (stock.lsegESGScore !== null) {
      // If a LSEG ESG Score is already stored in the database, but we cannot extract it from the page, we
      // log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of LSEG ESG Score failed unexpectedly. ` + "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract LSEG ESG Score: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  try {
    assert(
      "esgScore" in json &&
        typeof json.esgScore === "object" &&
        "TR.TRESGEmissions" in json.esgScore &&
        typeof json.esgScore["TR.TRESGEmissions"] === "object" &&
        "score" in json.esgScore["TR.TRESGEmissions"],
      "LSEG Emissions Score not found in JSON response.",
    );
    lsegEmissions = +json.esgScore["TR.TRESGEmissions"].score;
  } catch (e) {
    logger.warn({ prefix: "fetch" }, `Stock ${stock.ticker}: Unable to extract LSEG Emissions: ${e}`);
    if (stock.lsegEmissions !== null) {
      // If a LSEG Emissions Rating is already stored in the database, but we cannot extract it from the
      // page, we log this as an error and send a message.
      logger.error(
        { prefix: "fetch", err: e },
        `Stock ${stock.ticker}: Extraction of LSEG Emissions failed unexpectedly. ` + "This incident will be reported.",
      );
      errorMessage += `\n\tUnable to extract LSEG Emissions: ${String(e.message).split(/[\n:{]/)[0]}`;
    }
  }

  // Update the stock in the database.
  await updateStock(stock.ticker, {
    lsegLastFetch: errorMessage.includes("\n") ? undefined : new Date(),
    lsegESGScore,
    lsegEmissions,
  });
  // An error occurred if and only if the error message contains a newline character.
  if (errorMessage.includes("\n")) throw new DataProviderError(errorMessage, { dataSources: [json] });
};

export default lsegFetcher;
