/**
 * This class is used to throw errors in the application which are associated with an HTTP status code.
 */
export default class APIError extends Error {
  status: number;

  /**
   * Creates a new instance of the {@link APIError} class.
   *
   * @param {number} httpStatus The HTTP status code associated with the error.
   * @param {string} message A descriptive message for the error.
   * @param {Error} cause The error that caused this error.
   */
  constructor(httpStatus: number, message: string, cause?: Error) {
    super(message, { cause });
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.status = httpStatus;

    // Set the prototype explicitly.
    APIError.prototype.name = "APIError";
    Object.setPrototypeOf(this, APIError.prototype);
  }
}
