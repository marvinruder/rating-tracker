/* istanbul ignore file */
import axios from "axios";
import chalk from "chalk";
import logger, { PREFIX_SIGNAL } from "../lib/logger.js";

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
        .split("\n")
        .forEach((line) => logger.error(line));
    });
};
