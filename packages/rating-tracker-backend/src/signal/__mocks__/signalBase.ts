export const send = (
  url: string,
  message: string,
  number: string,
  recipients: string[]
) => {
  console.log(
    `Sending message via Signal API at ${url} from ${number} to ${recipients.join(
      ", "
    )}:\n${message}`
  );
};
