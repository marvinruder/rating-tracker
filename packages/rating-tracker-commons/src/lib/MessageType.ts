/**
 * An array of types of messages that can be sent to a user.
 */
export const messageTypeArray = ["userManagement", "fetchError", "stockUpdate"] as const;

/**
 * A type of message that can be sent to a user.
 */
export type MessageType = (typeof messageTypeArray)[number];

/**
 * Checks if a string is a valid type of message that can be sent to a user.
 *
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid type of message that can be sent to a user.
 */
export function isMessageType(s: string): s is MessageType {
  return messageTypeArray.includes(s as MessageType);
}
