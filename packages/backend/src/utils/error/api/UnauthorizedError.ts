import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 401
 * Unauthorized.
 */
class UnauthorizedError extends APIError {
  constructor(message: string, cause?: Error) {
    super(401, message, cause);

    // Set the prototype explicitly.
    UnauthorizedError.prototype.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export default UnauthorizedError;
