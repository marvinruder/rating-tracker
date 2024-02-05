import type { FetchResponse } from "@rating-tracker/commons";
import { FetchError } from "@rating-tracker/commons";

import { performFetchRequest } from "../utils/fetchRequest";
import logger from "../utils/logger";

/**
 * Checks if the Signal Client instance is reachable.
 *
 * @returns {Promise<string | void>} A promise that resolves when the Signal Client instance is reachable, or rejects
 * with an error if it is not.
 */
export const signalIsReadyOrUnused = (): Promise<string | void> =>
  process.env.SIGNAL_URL && process.env.SIGNAL_SENDER
    ? Promise.race([
        // Request all registered accounts from the Signal Client instance
        performFetchRequest(`${process.env.SIGNAL_URL}/v1/accounts`),
        // We accept a larger timeout here because the Signal Client JVM might be slow to start
        new Promise((_, reject) => setTimeout(() => reject(new Error("Signal is not reachable")), 5000)),
      ])
        .then(
          (res: FetchResponse<string[]>) =>
            /* c8 ignore start */ // We do not receive a 2XX answer during tests
            // Check if our configured Signal sender is registered
            res.ok && res.data.includes(process.env.SIGNAL_SENDER)
              ? Promise.resolve()
              : Promise.reject(new Error("Signal is not ready")),
          /* c8 ignore stop */
        )
        .catch((e) =>
          Promise.reject(
            e.message === "Signal is not ready"
              ? /* c8 ignore next */ e // We do not receive this passthrough error during tests, see above.
              : new Error("Signal is not reachable" + (e instanceof FetchError ? ": " + e.response.statusText : "")),
          ),
        )
    : /* c8 ignore next */ Promise.resolve("Signal is not configured on this instance.");

// This function is mocked because tests must not depend on a running Signal Client instance
/* c8 ignore start */
/**
 * Send a message to a list of recipients.
 *
 * @param {string} url The URL of the Signal Client instance.
 * @param {string} message The message to send.
 * @param {string} number The number from which to send the message.
 * @param {string[]} recipients The recipients to send the message to.
 */
export const send = (url: string, message: string, number: string, recipients: string[]) => {
  performFetchRequest(url + "/v2/send", { body: { message, number, recipients }, method: "POST" }).catch((e) => {
    if (e.response?.data?.error) e.message = e.response.data.error;
    logger.error(
      { prefix: "signal", err: e, signalMessage: { number, recipients, message } },
      "Failed to send Signal message",
    );
  });
};
/* c8 ignore stop */
