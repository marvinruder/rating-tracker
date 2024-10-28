import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 404 Not Found.
 */
class NotFoundError extends APIError {
  constructor(message: string, cause?: Error) {
    super(404, message, cause);
  }
}

export default NotFoundError;
