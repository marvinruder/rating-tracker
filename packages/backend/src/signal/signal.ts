import type { MessageType, Stock } from "@rating-tracker/commons";
import { REGEX_PHONE_NUMBER } from "@rating-tracker/commons";

import { readAllUsers, readUsersWithStockOnSubscribedWatchlist } from "../db/tables/userTable";

import { send } from "./signalBase";

export const SIGNAL_PREFIX_ERROR = "⚠️ " as const;
export const SIGNAL_PREFIX_INFO = "ℹ️ " as const;

/**
 * Send a message to all users subscribed to the given message type.
 * @param message The message to send.
 * @param messageType The type of message to send.
 * @param stock The stock in question, if the message type is `stockUpdate`.
 */
export const sendMessage = async (message: string, messageType: MessageType, stock?: Stock) => {
  let users = (await readAllUsers()).filter(
    (user) => user.phone?.match(REGEX_PHONE_NUMBER) && user.isAllowedAndWishesToReceiveMessage(messageType),
  );
  // If a stock is specified, also send the message to users subscribed to a watchlist containing the stock
  if (stock) {
    users = users.concat(
      (await readUsersWithStockOnSubscribedWatchlist(stock.ticker)).filter((user) =>
        user.isAllowedToReceiveMessage(messageType),
      ),
    );
  }
  // Only send the message if the Signal Client URL, sender and recipients are specified in the environment variables
  if (process.env.SIGNAL_URL && process.env.SIGNAL_SENDER && users.length > 0) {
    send(
      process.env.SIGNAL_URL,
      message,
      process.env.SIGNAL_SENDER,
      // Remove duplicate phone numbers (i.e. user subscribed to all updates and has a watchlist containing the stock)
      [...new Set(users.map((user) => user.phone))],
    );
  }
};
