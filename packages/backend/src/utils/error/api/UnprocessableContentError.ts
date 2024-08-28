import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 422
 * Unprocessable Content.
 */
class UnprocessableContentError extends APIError {
  constructor(message: string, cause?: Error) {
    super(422, message, cause);

    // Set the prototype explicitly.
    UnprocessableContentError.prototype.name = "UnprocessableContentError";
    Object.setPrototypeOf(this, UnprocessableContentError.prototype);
  }
}

export default UnprocessableContentError;
