import {
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
} from "@rating-tracker/commons";
import axios, { AxiosError } from "axios";
import * as cron from "cron";

import { sendMessage, SIGNAL_PREFIX_ERROR } from "../signal/signal";

import APIError from "./APIError";
import logger from "./logger";

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
        // Fetch data from MSCI with only two WebDrivers to avoid being banned
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchMSCIEndpointPath}`, undefined, {
            params: { detach: "false", concurrency: 2 },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the MSCI Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the MSCI Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchRefinitivEndpointPath}`, undefined, {
            params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the Refinitiv Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the Refinitiv Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchSPEndpointPath}`, undefined, {
            params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the S&P Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the S&P Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchSustainalyticsEndpointPath}`, undefined, {
            params: { detach: "false" },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the Sustainalytics Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the Sustainalytics Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
        // Fetch data from Morningstar first
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchMorningstarEndpointPath}`, undefined, {
            params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the Morningstar Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the Morningstar Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
        // Fetch data from Marketscreener after Morningstar, so Market Screener can use the up-to-date Last Close price
        // to calculate the analyst target price properly
        await axios
          .post(`http://localhost:${process.env.PORT}/api${fetchMarketScreenerEndpointPath}`, undefined, {
            params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
          .catch(async (e: AxiosError<APIError>) => {
            if (e.response?.data?.message) e.message = e.response.data.message;
            logger.error({ prefix: "cron", err: e }, "An error occurred during the MarketScreener Cron Job");
            await sendMessage(
              SIGNAL_PREFIX_ERROR +
                `An error occurred during the MarketScreener Cron Job: ${String(e.message).split(/[\n:{]/)[0]}`,
              "fetchError",
            );
          });
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
