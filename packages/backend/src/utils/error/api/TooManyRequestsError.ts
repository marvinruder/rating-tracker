import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 429 Too Many
 * Requests.
 */
class TooManyRequestsError extends APIError {
  constructor(message: string, cause?: Error) {
    super(429, message, cause);
  }
}

export default TooManyRequestsError;
