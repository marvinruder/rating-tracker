/* istanbul ignore file -- @preserve */ // We do not test Cron jobs
import * as cron from "cron";
import axios from "axios";
import {
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
} from "rating-tracker-commons";
import chalk from "chalk";
import logger from "./logger.js";

/**
 * Creates Cron jobs for regular fetching from data providers.
 *
 * @param {string} bypassAuthenticationForInternalRequestsToken A token that must be used in an authentication cookie
 * @param {string} autoFetchSchedule A cron-like schedule description.
 */
const setupCronJobs = (bypassAuthenticationForInternalRequestsToken: string, autoFetchSchedule: string) => {
  new cron.CronJob(
    autoFetchSchedule,
    async () => {
      // Fetch data from MSCI, Refinitiv, S&P and Sustainalytics in parallel and detach the processes
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchMSCIEndpointPath}`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchRefinitivEndpointPath}`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchSPEndpointPath}`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchSustainalyticsEndpointPath}`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      // Fetch data from Morningstar first
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchMorningstarEndpointPath}`, {
        params: { detach: "false" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      // Fetch data from Marketscreener after Morningstar, so Market Screener can use the up-to-date Last Close price to
      // calculate the analyst target price properly
      await axios.get(`http://localhost:${process.env.PORT}/api${fetchMarketScreenerEndpointPath}`, {
        params: { detach: "true" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
    },
    null,
    true
  );
  // If we have an auto fetch schedule, log a message
  logger.info(
    chalk.whiteBright.bgHex("#339933")(" \uf898 ") +
      chalk.bgGrey.hex("#339933")("") +
      chalk.whiteBright.bgGrey(` Auto Fetch activated `) +
      chalk.grey("") +
      chalk.green(" This instance will periodically fetch information from data providers for all known stocks.")
  );
  logger.info("");
};

export default setupCronJobs;
