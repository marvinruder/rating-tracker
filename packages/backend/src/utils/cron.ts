import http from "http";

import type { DataProvider } from "@rating-tracker/commons";
import {
  baseURL,
  dataProviderEndpoints,
  dataProviderName,
  createURLSearchParams,
  fetchAPIPath,
} from "@rating-tracker/commons";
import cron from "node-cron";

import { cleanupResources } from "../db/tables/resourceTable";
import { cleanupSessions } from "../db/tables/sessionTable";
import { sendMessage, SIGNAL_PREFIX_ERROR } from "../signal/signal";

import logger from "./logger";

/**
 * Performs an insecure HTTP request to the own server.
 * @param options The request options.
 * @returns A {@link Promise} that resolves to the response of the request.
 */
const performInternalRequest = (
  options: Omit<http.RequestOptions, "protocol" | "host" | "hostname" | "port">,
): Promise<http.IncomingMessage & { data: object | string }> =>
  new Promise((resolve, reject) =>
    http
      // deepcode ignore HttpToHttps: used for requests to `localhost` only
      .request(
        { ...options, hostname: "localhost", port: process.env.PORT },
        (res: http.IncomingMessage & { data: object | string }) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            res.data = res.headers["content-type"]?.match(/(\/|\+)json$/) ? JSON.parse(data) : data;
            resolve(res);
          });
        },
      )
      .on("error", reject)
      .end(),
  );

/**
 * A record of options for each data provider.
 */
const dataProviderParams: Record<DataProvider, Record<string, string>> = {
  yahoo: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  morningstar: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  marketScreener: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  // Fetch data from MSCI with only two instances to avoid being rate-limited
  msci: { concurrency: "2" },
  lseg: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  sp: { concurrency: process.env.MAX_FETCH_CONCURRENCY },
  sustainalytics: {},
};

/**
 * Creates Cron jobs for regular fetching from data providers.
 * @param bypassAuthenticationForInternalRequestsToken A token that must be used in an authentication cookie
 * @param autoFetchSchedule A cron-like schedule description.
 */
const setupCronJobs = (bypassAuthenticationForInternalRequestsToken: string, autoFetchSchedule: string) => {
  // Clean up resources and sessions every minute
  cron.schedule("* * * * *", () => void Promise.all([cleanupResources(), cleanupSessions()]), { runOnInit: true });

  // Fetch data from data providers if requested
  if (autoFetchSchedule) {
    cron.schedule(autoFetchSchedule, () => {
      void (async (): Promise<void> => {
        for await (const dataProvider of [
          "msci",
          "lseg",
          "sp",
          "sustainalytics",
          // Fetch data from Yahoo first
          "yahoo",
          "morningstar",
          // Fetch data from Marketscreener after Yahoo, so Market Screener can use the up-to-date Last Close price to
          // calculate the analyst target price properly
          "marketScreener",
        ]) {
          const urlSearchParams = createURLSearchParams(dataProviderParams[dataProvider]);
          await performInternalRequest({
            path:
              baseURL +
              fetchAPIPath +
              dataProviderEndpoints[dataProvider] +
              (urlSearchParams.toString() ? "?" + urlSearchParams : ""),
            method: "POST",
            headers: {
              Cookie: `bypassAuthenticationForInternalRequestsToken=${bypassAuthenticationForInternalRequestsToken};`,
            },
          })
            .then((res) => {
              if (res.statusCode < 200 || res.statusCode >= 300)
                throw new Error(
                  typeof res.data === "object" && "message" in res.data && typeof res.data.message === "string"
                    ? res.data.message
                    : typeof res.data === "string"
                      ? res.data
                      : `Request failed with status code ${res.statusCode}`,
                );
            })
            .catch(async (e: Error) => {
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
    });

    // If we have an auto fetch schedule, log a message
    logger.info(
      { prefix: ["cron", "Auto Fetch activated"] },
      "This process will periodically fetch information from data providers for all known stocks.",
    );
  }
};

export default setupCronJobs;
