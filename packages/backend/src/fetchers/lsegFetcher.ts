import assert from "node:assert";

import type { Stock } from "@rating-tracker/commons";
import axios from "axios";
import type { Request } from "express";

import { readStock, updateStock } from "../db/tables/stockTable";
import * as signal from "../signal/signal";
import { SIGNAL_PREFIX_ERROR } from "../signal/signal";
import APIError from "../utils/APIError";
import FetchError from "../utils/FetchError";
import logger from "../utils/logger";

import type { JSONFetcher, FetcherWorkspace } from "./fetchHelper";
import { captureFetchError } from "./fetchHelper";

/**
 * Fetches data from LSEG Data & Analytics.
 *
 * @param {Request} req Request object
 * @param {FetcherWorkspace} stocks An object with the stocks to fetch and the stocks already fetched (successful or
 * with errors)
 * @param {Stock} stock The stock to extract data for
 * @param {string} json The fetched and parsed JSON
 * @returns {Promise<void>} A promise that resolves when the fetch is complete
 * @throws an {@link APIError} in case of a severe error
 */
const lsegFetcher: JSONFetcher = async (
  req: Request,
  stocks: FetcherWorkspace<Stock>,
  stock: Stock,
  json: Object,
): Promise<void> => {
  let lsegESGScore: number = req.query.clear ? null : undefined;
  let lsegEmissions: number = req.query.clear ? null : undefined;

  const url = `https://www.lseg.com/bin/esg/esgsearchresult?ricCode=${stock.ric}`;

  json = (await axios.get(url)).data;

  if (Object.keys(json).length === 0 && json.constructor === Object) {
    throw new APIError(502, "No LSEG information available.");
  }

  if (
    "status" in json &&
    typeof json.status === "object" &&
    "limitExceeded" in json.status &&
    json.status.limitExceeded === true
  ) {
    // If the limit has been exceeded, we stop fetching data and throw an error.
    throw new APIError(429, "Limit exceeded.");
  }

  // Prepare an error message header containing the stock name and ticker.
  let errorMessage = `Error while fetching LSEG information for stock ${stock.ticker}:`;

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
  if (errorMessage.includes("\n")) {
    // An error occurred if and only if the error message contains a newline character.
    errorMessage += `\n${await captureFetchError(stock, "lseg", { json })}`;
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
  json = undefined;
};

export default lsegFetcher;
