/**
 * A mock storage of sent Signal messages.
 */
export const sentMessages: { message: string; recipients: string[] }[] = [];

export const { signalIsReadyOrUnused } = await vi.importActual<{ signalIsReadyOrUnused: () => Promise<string | void> }>(
  "../signalBase",
);

/**
 * A mock of the Signal send function. Stores the message in the sentMessages array.
 * @param _ unused (for consistency with the real send function)
 * @param message The message to send. In this mock, it is stored in the sentMessages array.
 * @param __ unused (for consistency with the real send function)
 * @param recipients The recipients to send the message to, taken from the mock user repository.
 */
export const send = (_: string, message: string, __: string, recipients: string[]) => {
  sentMessages.push({ message, recipients });
};
