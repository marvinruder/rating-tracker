import APIError from "./APIError";

/* c8 ignore start */ // Timeouts are not tested because that would take too long.
/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 504 Gateway
 * Timeout.
 */
class GatewayTimeoutError extends APIError {
  constructor(message: string, cause?: Error) {
    super(504, message, cause);
  }
}
/* c8 ignore stop */

export default GatewayTimeoutError;
