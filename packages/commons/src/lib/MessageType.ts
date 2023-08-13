import {
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
  ADMINISTRATIVE_ACCESS,
  STOCK_UPDATE_MESSAGE,
  FETCH_ERROR_MESSAGE,
  ADMINISTRATIVE_MESSAGE,
} from "./models/user";

/**
 * An array of types of messages that can be sent to a user.
 */
export const messageTypeArray = ["userManagement", "fetchError", "stockUpdate"] as const;

/**
 * A type of message that can be sent to a user.
 */
export type MessageType = (typeof messageTypeArray)[number];

/**
 * A mapping from access rights to message types that can be sent to a user with the given access rights.
 */
export const messageTypesAllowedWithGivenAccessRight: Record<number, MessageType[]> = {};

messageTypesAllowedWithGivenAccessRight[GENERAL_ACCESS] = ["stockUpdate"];
messageTypesAllowedWithGivenAccessRight[WRITE_STOCKS_ACCESS] = ["fetchError"];
messageTypesAllowedWithGivenAccessRight[ADMINISTRATIVE_ACCESS] = ["userManagement"];

/**
 * A mapping from message types to their corresponding subscription.
 */
export const subscriptionOfMessageType: Record<MessageType, number> = {
  stockUpdate: STOCK_UPDATE_MESSAGE,
  fetchError: FETCH_ERROR_MESSAGE,
  userManagement: ADMINISTRATIVE_MESSAGE,
};

/**
 * A mapping from message types to their names that can be displayed to a user.
 */
export const messageTypeName: Record<MessageType, string> = {
  userManagement: "User Management",
  fetchError: "Fetch Errors",
  stockUpdate: "All Stock Updates",
};

/**
 * A mapping from message types to their more detailed descriptions that can be displayed to a user.
 */
export const messageTypeDescription: Record<MessageType, string> = {
  userManagement: "Receive a message when a new user signs up for the service.",
  fetchError: "Receive a message when fetching information about a stock fails.",
  stockUpdate: "Receive a message when any stock’s rating information is updated.",
};

/**
 * Checks if a string is a valid type of message that can be sent to a user.
 *
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid type of message that can be sent to a user.
 */
export function isMessageType(s: string): s is MessageType {
  return messageTypeArray.includes(s as MessageType);
}
