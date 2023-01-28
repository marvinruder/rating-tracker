/* istanbul ignore file */ // This file is not tested because tests must not depend on a running Signal Client instance
import axios from "axios";
import chalk from "chalk";
import logger, { PREFIX_SIGNAL } from "../lib/logger.js";

/**
 * Send a message to a list of recipients.
 *
 * @param {string} url The URL of the Signal Client instance.
 * @param {string} message The message to send.
 * @param {string} number The number from which to send the message.
 * @param {string[]} recipients The recipients to send the message to.
 */
export const send = (
  url: string,
  message: string,
  number: string,
  recipients: string[]
) => {
  axios
    .post(url + "/v2/send", {
      message: message,
      number: number,
      recipients: recipients,
    })
    .catch((error) => {
      (
        PREFIX_SIGNAL +
        chalk.redBright(
          `Failed to send the message below from ${number} to ${recipients}: ${error}\n${message}`
        )
      )
        .split("\n") // Show newlines in the log in a pretty way
        .forEach((line) => logger.error(line));
    });
};
