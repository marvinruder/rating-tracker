import { baseURL } from "@rating-tracker/commons";
import axios from "axios";

const api = axios.create({
  baseURL,
  paramsSerializer: {
    encode: (value, defaultEncoder) => {
      const encodedValue = defaultEncoder(value);
      // Encode spaces as %20 instead of +, since + is not a character considered safe by the backend.
      return typeof encodedValue === "string" ? encodedValue.replaceAll("+", "%20") : encodedValue;
    },
  },
});

export default api;
