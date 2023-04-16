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
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchSustainalyticsEndpointPath}`, undefined, {
        params: { detach: "false" },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      // Fetch data from Morningstar first
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchMorningstarEndpointPath}`, undefined, {
        params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      // Fetch data from Marketscreener after Morningstar, so Market Screener can use the up-to-date Last Close price to
      // calculate the analyst target price properly
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchMarketScreenerEndpointPath}`, undefined, {
        params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchRefinitivEndpointPath}`, undefined, {
        params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchSPEndpointPath}`, undefined, {
        params: { detach: "false", concurrency: process.env.SELENIUM_MAX_CONCURRENCY },
        headers: {
          Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
        },
      });
      // Fetch data from MSCI with only two WebDrivers to avoid being banned
      await axios.post(`http://localhost:${process.env.PORT}/api${fetchMSCIEndpointPath}`, undefined, {
        params: { detach: "false", concurrency: 2 },
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
