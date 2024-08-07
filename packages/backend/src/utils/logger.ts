import fs from "node:fs";

import { baseURL, stockLogoEndpointSuffix, stocksAPIPath } from "@rating-tracker/commons";
import type { Request, Response } from "express";
import cron from "node-cron";
import pino from "pino";
import pretty from "pino-pretty";

import type { LoggedRequest } from "./logFormatterConfig";
import { pinoPrettyConfig } from "./logFormatterConfig";

/**
 * The log level to use for printing log messages to the standard output.
 */
const LOG_LEVEL = (process.env.LOG_LEVEL as pino.Level) ?? "info";

/**
 * The stream used to log messages to the standard output.
 */
const prettyStream = pretty(pinoPrettyConfig);

/**
 * Provides the path of the log file for the current day.
 * @returns The path of the log file.
 */
const getLogFilePath = (): string => {
  return (process.env.LOG_FILE ?? "/tmp/rating-tracker-log-(DATE).log").replaceAll(
    "(DATE)",
    new Date().toISOString().split("T")[0],
  );
};

/**
 * Creates a new stream to write to the log file.
 * @returns The stream to write to the log file.
 */
const getNewFileStream = (): fs.WriteStream => fs.createWriteStream(getLogFilePath(), { flags: "a" });

/**
 * The stream used to log messages to the log file. The file is rotated every day.
 */
let fileStream = getNewFileStream();

/**
 * A multistream which writes to both the standard output and the log file.
 */
const multistream = pino.multistream([
  { level: LOG_LEVEL, stream: prettyStream },
  { level: "trace", stream: fileStream },
]);

/**
 * The logger used to log messages to both the standard output and the log file.
 */
const logger = pino({ level: "trace", base: { pid: undefined, hostname: undefined } }, multistream);

// Rotate the log file every day
cron.schedule("0 0 * * *", () => {
  fileStream.end();
  fileStream = getNewFileStream();
  multistream.streams.find((stream) => stream.stream instanceof fs.WriteStream).stream = fileStream;
});

/**
 * A function logging API requests.
 * @param req Request object
 * @param res Response object
 * @param time The response time of the request.
 */
export const logRequest = (req: Request, res: Response, time: number): void => {
  logger[
    (req.originalUrl.startsWith(baseURL + stocksAPIPath) && req.path.endsWith(stockLogoEndpointSuffix)) ||
    req.ip === "::1"
      ? "trace"
      : "info"
  ](
    {
      prefix: "nodejs",
      req: {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        cookies: req.cookies,
        query: req.query,
        user: res.locals.user
          ? { name: res.locals.user.name, email: res.locals.user.email }
          : res.locals.userIsCron
            ? "cron"
            : undefined,
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        time,
      },
    } as { prefix: string | object; req: LoggedRequest },
    "Processed request",
  );
};

export default logger;
