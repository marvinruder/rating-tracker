import APIError from "./APIError";

/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 413 Content Too
 * Large.
 */
class ContentTooLargeError extends APIError {
  constructor(message: string, cause?: Error) {
    super(413, message, cause);
  }
}

export default ContentTooLargeError;
