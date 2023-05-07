import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import logger, { PREFIX_NODEJS } from "./logger.js";
import APIError from "./apiError.js";

/**
 * An error handler. Logs an error and sends an error response to the client.
 *
 * @param {Error} err The error that was thrown
 * @param {Request} _ Request object
 * @param {Response} res Response object
 * @param {NextFunction} __ The function to call the next middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: Error, _: Request, res: Response, __: NextFunction) => {
  logger.error(PREFIX_NODEJS + chalk.redBright(err)); // Log the error
  // Send an error response to the client
  res.status(err instanceof APIError && err.status ? err.status : 500).json({
    message: err.message,
  });
};
