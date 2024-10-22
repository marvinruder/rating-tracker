import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 501 Not
 * Implemented.
 */
class NotImplementedError extends APIError {
  constructor(message: string, cause?: Error) {
    super(501, message, cause);

    // Set the prototype explicitly.
    NotImplementedError.prototype.name = "NotImplementedError";
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}

export default NotImplementedError;
