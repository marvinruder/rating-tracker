// We do not test Cron jobs
import * as cron from "cron";
import axios, { AxiosError } from "axios";
import {
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
} from "@rating-tracker/commons";
import chalk from "chalk";
import logger, { PREFIX_CRON } from "./logger.js";
import { sendMessage } from "../signal/signal.js";

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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the MSCI Cron Job: ${e}`));
            await sendMessage(
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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the Refinitiv Cron Job: ${e}`));
            await sendMessage(
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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the S&P Cron Job: ${e}`));
            await sendMessage(
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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the Sustainalytics Cron Job: ${e}`));
            await sendMessage(
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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the Morningstar Cron Job: ${e}`));
            await sendMessage(
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
          .catch(async (e: AxiosError) => {
            logger.error(PREFIX_CRON + chalk.redBright(`An error occurred during the MarketScreener Cron Job: ${e}`));
            await sendMessage(
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
    chalk.whiteBright.bgHex("#339933")(" \uf898 ") +
      chalk.bgGrey.hex("#339933")("") +
      chalk.whiteBright.bgGrey(` Auto Fetch activated `) +
      chalk.grey("") +
      chalk.green(" This process will periodically fetch information from data providers for all known stocks."),
  );
  logger.info("");
};
