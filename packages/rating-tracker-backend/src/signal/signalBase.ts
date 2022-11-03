/* istanbul ignore file */
import axios from "axios";

export const send = (
  url: string,
  message: string,
  number: string,
  recipients: string[]
) => {
  axios.post(url + "/v2/send", {
    message: message,
    number: number,
    recipients: recipients,
  });
};
