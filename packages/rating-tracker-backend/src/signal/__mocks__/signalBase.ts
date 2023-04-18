/**
 * A mock storage of sent Signal messages.
 */
export const sentMessages: { message: string; recipients: string[] }[] = [];

/**
 * A mock of the Signal send function. Stores the message in the sentMessages array.
 * @param {string} _ unused (for consistency with the real send function)
 * @param {string} message The message to send. In this mock, it is stored in the sentMessages array.
 * @param {string} __ unused (for consistency with the real send function)
 * @param {string[]} recipients The recipients to send the message to, taken from the mock user repository.
 */
export const send = (_: string, message: string, __: string, recipients: string[]) => {
  sentMessages.push({ message, recipients });
};
