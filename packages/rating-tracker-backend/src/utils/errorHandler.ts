import chalk from "chalk";
import logger, { PREFIX_NODEJS } from "./logger.js";

/**
 * An error handler. Logs an error and sends an error response to the client.
 * @param {Error} err The error that was thrown
 * @param {Request} _ Request object
 * @param {Response} res Response object
 * @param {void} __ The function to call the next middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, _, res, __) => {
  logger.error(PREFIX_NODEJS + chalk.redBright(err)); // Log the error
  // Send an error response to the client
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
};

export default errorHandler;
