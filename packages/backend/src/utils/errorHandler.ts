import type { NextFunction, Request, Response } from "express";

import logger from "./logger";

/**
 * An error handler. Logs an error and sends an error response to the client.
 * @param err The error that was thrown
 * @param _ Request object
 * @param res Response object
 * @param __ The function to call the next middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: Error, _: Request, res: Response, __: NextFunction) => {
  logger.error(err); // Log the error
  // Send an error response to the client
  res.status("status" in err && err.status && typeof err.status === "number" ? err.status : 500).json({
    message:
      err.message +
      (err.cause instanceof Error && err.cause.message
        ? /* c8 ignore next */ // The `cause` property is only set during fetches, which are not tested.
          ` (caused by ${err.cause.name ?? "unknown error"}: ${err.cause.message})`
        : ""),
  });
};
