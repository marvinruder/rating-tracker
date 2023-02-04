import { send } from "./signalBase.js";

/**
 * Send a message to the Signal recipients specified in the environment variables.
 *
 * @param {string} message The message to send.
 */
export const sendMessage = (message: string) => {
  // Only send the message if the Signal Client URL, sender and recipients are specified in the environment variables
  if (process.env.SIGNAL_URL && process.env.SIGNAL_SENDER && process.env.SIGNAL_RECIPIENT) {
    send(
      process.env.SIGNAL_URL,
      message,
      process.env.SIGNAL_SENDER,
      process.env.SIGNAL_RECIPIENT.split(" ") // Recipients in the environment variable are to be separated by spaces
    );
  }
};
