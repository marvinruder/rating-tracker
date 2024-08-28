import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 500 Internal
 * Server Error.
 */
class InternalServerError extends APIError {
  constructor(message: string, cause?: Error) {
    super(500, message, cause);

    // Set the prototype explicitly.
    InternalServerError.prototype.name = "InternalServerError";
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export default InternalServerError;
