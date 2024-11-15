import APIError from "./APIError";

/* c8 ignore start */ // We mock all services that can potentially be unavailable and throw this error
/**
 * This class is used to throw errors in the application which are associated with the HTTP status code 503 Service
 * Unavailable.
 */
class ServiceUnavailableError extends APIError {
  constructor(message: string, cause?: Error) {
    super(503, message, cause);
  }
}
/* c8 ignore stop */

export default ServiceUnavailableError;
