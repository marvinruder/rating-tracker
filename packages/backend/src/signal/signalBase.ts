// This file is not tested because tests must not depend on a running Signal Client instance
import axios, { AxiosError } from "axios";
import chalk from "chalk";
import logger, { PREFIX_SIGNAL } from "../utils/logger.js";

/**
 * Checks if the Signal Client instance is reachable.
 *
 * @returns {Promise<string | void>} A promise that resolves when the Signal Client instance is reachable, or rejects
 * with an error if it is not.
 */
export const signalIsReadyOrUnused = (): Promise<string | void> =>
  process.env.SIGNAL_URL && process.env.SIGNAL_SENDER
    ? axios
        .get(`${process.env.SIGNAL_URL}/v1/health`, { timeout: 1000 })
        .then((res) => (res.status === 204 ? Promise.resolve() : Promise.reject(new Error("Signal is not ready"))))
        .catch((e) =>
          e instanceof AxiosError
            ? Promise.reject(new Error("Signal is not reachable: " + e.message))
            : Promise.reject(e),
        )
    : Promise.resolve("No Signal URL provided, skipping health check");

/**
 * Send a message to a list of recipients.
 *
 * @param {string} url The URL of the Signal Client instance.
 * @param {string} message The message to send.
 * @param {string} number The number from which to send the message.
 * @param {string[]} recipients The recipients to send the message to.
 */
export const send = (url: string, message: string, number: string, recipients: string[]) => {
  axios
    .post(url + "/v2/send", {
      message: message,
      number: number,
      recipients: recipients,
    })
    .catch((error) => {
      (
        PREFIX_SIGNAL +
        chalk.redBright(`Failed to send the message below from ${number} to ${recipients}: ${error}\n${message}`)
      )
        .split("\n") // Show newlines in the log in a pretty way
        .forEach((line) => logger.error(line));
    });
};
