import type { Hook } from "@hono/zod-openapi";
import type { Env, ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { fromError, ValidationError } from "zod-validation-error";

import Logger from "../logger";

import APIError from "./api/APIError";

/**
 * This helper class provides methods to handle errors.
 */
class ErrorHelper {
  /**
   * An error handler. Logs an error and sends an error response to the client.
   * @param err The error that occurred.
   * @param c The Hono context.
   * @returns The response to send to the client.
   */
  static errorHandler: ErrorHandler = (err, c) => {
    Logger.error(err); // Log the error

    let statusCode: ContentfulStatusCode = 500;
    let message = err.message;

    if (err instanceof APIError) statusCode = err.status;
    if (err instanceof ValidationError)
      statusCode = err.details.every((detail) => detail.path[0] === "content-type") ? 415 : 400;

    if (err.cause instanceof Error && !(err.cause instanceof ZodError) && err.cause.message)
      message += ` (caused by ${err.cause.name ?? "unknown error"}: ${err.cause.message})`;

    // If the request method does not allow a response body, only set the status code
    return c.req.method === "HEAD" ? c.body(null, statusCode) : c.json({ message }, statusCode);
  };

  static zodErrorHandler: Hook<any, Env, any, any> = (result) => {
    if (!result.success) throw fromError(result.error);
  };

  /**
   * Extracts the first line of an error message.
   * @param e The error to extract the summary from.
   * @returns The first line of the error message.
   */
  /* c8 ignore next 3 */ // This method primarily summarizes Data Provider errors during fetches, which are not tested.
  static getSummary(e: unknown) {
    return (e instanceof Error ? e.message : String(e)).split(/[\n:{]/)[0];
  }
}

export default ErrorHelper;
