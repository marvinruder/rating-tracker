import type { StatusCode } from "hono/utils/http-status";

/**
 * This class is used to throw errors in the application which are associated with an HTTP status code.
 */
abstract class APIError extends Error {
  status: StatusCode;

  /**
   * Creates a new instance of the {@link APIError} class.
   * @param httpStatus The HTTP status code associated with the error.
   * @param message A descriptive message for the error.
   * @param cause The error that caused this error.
   */
  constructor(httpStatus: StatusCode, message: string, cause?: Error) {
    super(message, { cause });
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.status = httpStatus;
  }
}

export default APIError;
