import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 400 Bad Request.
 */
class BadRequestError extends APIError {
  constructor(message: string, cause?: Error) {
    super(400, message, cause);
  }
}

export default BadRequestError;
