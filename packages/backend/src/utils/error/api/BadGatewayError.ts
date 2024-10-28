import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 502 Bad Gateway.
 */
class BadGatewayError extends APIError {
  constructor(message: string, cause?: Error) {
    super(502, message, cause);
  }
}

export default BadGatewayError;
