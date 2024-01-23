import type { DataProvider } from "@rating-tracker/commons";
import { baseURL, dataProviderEndpoints, dataProviderName } from "@rating-tracker/commons";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";
import * as cron from "cron";

import { sendMessage, SIGNAL_PREFIX_ERROR } from "../signal/signal";

import type APIError from "./APIError";
import logger from "./logger";

/**
 * A record of options for each data provider.
 */
const dataProviderParams: Record<DataProvider, AxiosRequestConfig> = {
  morningstar: {
    params: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  },
  marketScreener: {
    params: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  },
  msci: {
    // Fetch data from MSCI with only two instances to avoid being rate-limited
    params: { concurrency: 2 },
  },
  lseg: {
    params: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  },
  sp: {
    params: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  },
  sustainalytics: {
    params: {},
  },
};

/**
 * Creates Cron jobs for regular fetching from data providers.
 *
 * @param {string} bypassAuthenticationForInternalRequestsToken A token that must be used in an authentication cookie
 * @param {string} autoFetchSchedule A cron-like schedule description.
 */
export default (bypassAuthenticationForInternalRequestsToken: string, autoFetchSchedule: string) => {
  new cron.CronJob(
    autoFetchSchedule,
    () => {
      void (async (): Promise<void> => {
        for await (const dataProvider of [
          "msci",
          "lseg",
          "sp",
          "sustainalytics",
          // Fetch data from Morningstar first
          "morningstar",
          // Fetch data from Marketscreener after Morningstar, so Market Screener can use the up-to-date Last Close
          // price to calculate the analyst target price properly
          "marketScreener",
        ]) {
          await axios
            .post(`http://localhost:${process.env.PORT}${baseURL}${dataProviderEndpoints[dataProvider]}`, undefined, {
              ...dataProviderParams[dataProvider],
              headers: {
                Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
              },
            })
            .catch(async (e: AxiosError<APIError>) => {
              if (e.response?.data?.message) e.message = e.response.data.message;
              logger.error(
                { prefix: "cron", err: e },
                `An error occurred during the ${dataProviderName[dataProvider]} Cron Job`,
              );
              await sendMessage(
                SIGNAL_PREFIX_ERROR +
                  `An error occurred during the ${dataProviderName[dataProvider]} Cron Job: ${
                    String(e.message).split(/[\n:{]/)[0]
                  }`,
                "fetchError",
              );
            });
        }
      })();
    },
    null,
    true,
  );

  // If we have an auto fetch schedule, log a message
  logger.info(
    { prefix: ["cron", "Auto Fetch activated"] },
    "This process will periodically fetch information from data providers for all known stocks.",
  );
};
