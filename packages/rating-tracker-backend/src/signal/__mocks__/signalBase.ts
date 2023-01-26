/**
 * A mock storage of sent Signal messages.
 */
export const sentMessages: string[] = [];

/**
 * A mock of the Signal send function. Stores the message in the sentMessages array.
 *
 * @param {string} _ unused (for consistency with the real send function)
 * @param {string} message The message to send. In this mock, it is stored in the sentMessages array.
 */
export const send = (_: string, message: string) => {
  sentMessages.push(message);
};
