import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 409 Conflict.
 */
class ConflictError extends APIError {
  constructor(message: string, cause?: Error) {
    super(409, message, cause);

    // Set the prototype explicitly.
    ConflictError.prototype.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export default ConflictError;
