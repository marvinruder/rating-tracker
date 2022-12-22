export const sentMessages: string[] = [];

export const send = (_url: string, message: string) => {
  sentMessages.push(message);
};
