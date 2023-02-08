import { MessageType, REGEX_PHONE_NUMBER } from "rating-tracker-commons";
import { readAllUsers } from "../redis/repositories/user/userRepository.js";
import { send } from "./signalBase.js";

/**
 * Send a message to all users subscribed to the given message type.
 *
 * @param {string} message The message to send.
 * @param {MessageType} messageType The type of message to send.
 */
export const sendMessage = async (message: string, messageType: MessageType) => {
  const users = (await readAllUsers()).filter(
    (user) => user.phone?.match(REGEX_PHONE_NUMBER) && user.isAllowedAndWishesToReceiveMessage(messageType)
  );
  // Only send the message if the Signal Client URL, sender and recipients are specified in the environment variables
  if (process.env.SIGNAL_URL && process.env.SIGNAL_SENDER && users.length > 0) {
    send(
      process.env.SIGNAL_URL,
      message,
      process.env.SIGNAL_SENDER,
      users.map((user) => user.phone)
    );
  }
};
