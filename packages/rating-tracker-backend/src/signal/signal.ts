import { send } from "./signalBase.js";

export const sendMessage = (message: string) => {
  if (
    process.env.SIGNAL_URL &&
    process.env.SIGNAL_SENDER &&
    process.env.SIGNAL_RECIPIENT
  ) {
    send(
      process.env.SIGNAL_URL,
      message,
      process.env.SIGNAL_SENDER,
      process.env.SIGNAL_RECIPIENT.split(" ")
    );
  }
};
