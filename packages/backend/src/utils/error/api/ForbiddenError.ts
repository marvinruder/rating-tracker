import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 403 Forbidden.
 */
class ForbiddenError extends APIError {
  constructor(message: string, cause?: Error) {
    super(403, message, cause);

    // Set the prototype explicitly.
    ForbiddenError.prototype.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export default ForbiddenError;