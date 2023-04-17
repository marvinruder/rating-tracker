/* istanbul ignore file -- @preserve */ // We do not need to test the logger itself
import pino from "pino";
import pretty from "pino-pretty";
import fs from "node:fs";
import chalk from "chalk";
import cron from "cron";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";
import { stockLogoEndpointPath } from "rating-tracker-commons";

dotenv.config();

export const PREFIX_CRON = chalk.whiteBright.bgGrey(" \ufba7 ") + chalk.grey(" ");
export const PREFIX_NODEJS = chalk.whiteBright.bgHex("#339933")(" \uf898 ") + chalk.hex("#339933")(" ");
export const PREFIX_REDIS = chalk.whiteBright.bgHex("#D82C20")(" \ue76d ") + chalk.hex("#D82C20")(" ");
export const PREFIX_POSTGRES = chalk.whiteBright.bgHex("#336791")(" \ue76e ") + chalk.hex("#336791")(" ");
export const PREFIX_SELENIUM = chalk.whiteBright.bgHex("#43B02A")(" \ufc0d ") + chalk.hex("#43B02A")(" ");
export const PREFIX_SIGNAL = chalk.whiteBright.bgHex("#4975E8")(" \uf868 ") + chalk.hex("#4975E8")(" ");

const levelIcons = {
  10: chalk.grey(" \uf002 "),
  20: chalk.blue(" \uf188 "),
  30: chalk.cyanBright(" \uf7fc "),
  40: chalk.yellowBright(" \uf071 "),
  50: "\x07" + chalk.red(" \uf658 "),
  60: "\x07" + chalk.magentaBright(" \uf0e7 "),
};

/**
 * The stream used to log messages to the standard output.
 */
const prettyStream = pretty({
  include: "level",
  customPrettifiers: {
    level: (level) => levelIcons[Number(level)],
  },
});

/**
 * Provides the path of the log file for the current day.
 *
 * @returns {string} The path of the log file.
 */
const getLogFilePath = () => {
  return (process.env.LOG_FILE ?? "/tmp/rating-tracker-log-(DATE).log").replaceAll(
    "(DATE)",
    new Date().toISOString().split("T")[0]
  );
};

/**
 * Creates a new stream to write to the log file.
 *
 * @returns {fs.WriteStream} The stream to write to the log file.
 */
const getNewFileStream = () => {
  return fs.createWriteStream(getLogFilePath(), {
    flags: "a",
  });
};

let fileStream = getNewFileStream();

/**
 * A multistream which writes to both the standard output and the log file.
 */
const multistream = pino.multistream([
  {
    level: (process.env.LOG_LEVEL as pino.Level) ?? "info",
    stream: prettyStream,
  },
  {
    level: (process.env.LOG_LEVEL as pino.Level) ?? "info",
    stream: fileStream,
  },
]);

/**
 * The logger used to log messages to both the standard output and the log file.
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
  },
  multistream
);

// Rotate the log file every day
new cron.CronJob(
  "0 0 0 * * *",
  () => {
    fileStream.end();
    fileStream = getNewFileStream();
    multistream.streams.find((stream) => stream.stream instanceof fs.WriteStream).stream = fileStream;
  },
  null,
  true
);

/**
 * Create a pretty prefix string from an HTTP method. The colors in use correspond to those used by the OpenAPI UI.
 *
 * @param {string} method The HTTP method.
 * @returns {string} A colored pretty prefix string.
 */
const highlightMethod = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.whiteBright.bgBlue(` ${method} `) + chalk.blue.bgGrey("");
    case "HEAD":
      return chalk.whiteBright.bgMagenta(` ${method} `) + chalk.magenta.bgGrey("");
    case "POST":
      return chalk.whiteBright.bgGreen(` ${method} `) + chalk.green.bgGrey("");
    case "PUT":
      return chalk.black.bgYellow(` ${method} `) + chalk.yellow.bgGrey("");
    case "PATCH":
      return chalk.black.bgCyanBright(` ${method} `) + chalk.cyanBright.bgGrey("");
    case "DELETE":
      return chalk.whiteBright.bgRed(` ${method} `) + chalk.red.bgGrey("");
  }
};

/**
 * Create a pretty prefix string from an HTTP status code.
 *
 * @param {number} statusCode The HTTP status code.
 * @returns {string} A colored pretty prefix string.
 */
const statusCodeDescription = (statusCode: number) => {
  const statusCodeString = ` ${statusCode}  ${STATUS_CODES[statusCode]} `;
  switch (Math.floor(statusCode / 100)) {
    case 2: // Successful responses
      return chalk.whiteBright.bgGreen(statusCodeString) + chalk.green("");
    case 1: // Informational responses
    case 3: // Redirection messages
      return chalk.black.bgYellow(statusCodeString) + chalk.yellow("");
    case 4: // Client error responses
    case 5: // Server error responses
      return chalk.whiteBright.bgRed(statusCodeString) + chalk.red("");
  }
};

/**
 * A function logging API requests.
 *
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {number} time The response time of the request.
 */
export const requestLogger = (req: Request, res: Response, time: number) => {
  // Do not log requests for resources such as logos – those are far too many and only mildly interesting
  if (!req.originalUrl.startsWith(`/api${stockLogoEndpointPath}`)) {
    chalk
      .white(
        chalk.whiteBright.bgHex("#339933")(" \uf898 ") +
          chalk.bgGrey.hex("#339933")("") +
          chalk.bgGrey(
            chalk.cyanBright(" \uf5ef " + new Date().toISOString()) + // Timestamp
              "  " +
              chalk.yellow(
                res.locals.user
                  ? `\uf007 ${res.locals.user.name} (${res.locals.user.email})` // Authenticated user
                  : /* istanbul ignore next -- @preserve */ // We do not test Cron jobs
                  res.locals.userIsCron
                  ? "\ufba7 cron" // Cron job
                  : "\uf21b" // Unauthenticated user
              ) +
              "  " +
              // use reverse proxy that sets this header to prevent CWE-134
              chalk.magentaBright("\uf98c" + req.headers["x-real-ip"]) + // IP address
              " "
          ) +
          chalk.grey("") +
          "\n ├─" +
          highlightMethod(req.method) + // HTTP request method
          chalk.bgGrey(
            ` ${req.originalUrl // URL path
              .slice(1, req.originalUrl.indexOf("?") == -1 ? undefined : req.originalUrl.indexOf("?"))
              .replaceAll("/", "  ")} `
          ) +
          chalk.grey("") +
          Object.entries(req.cookies) // Cookies
            .map(
              ([key, value]) =>
                "\n ├─" + chalk.bgGrey(chalk.yellow(" \uf697") + `  ${key} `) + chalk.grey("") + " " + value
            )
            .join(" ") +
          Object.entries(req.query) // Query parameters
            .map(
              ([key, value]) =>
                "\n ├─" + chalk.bgGrey(chalk.cyan(" \uf002") + `  ${key} `) + chalk.grey("") + " " + value
            )
            .join(" ") +
          "\n ╰─" +
          statusCodeDescription(res.statusCode) + // HTTP response status code
          ` after ${Math.round(time)} ms` // Response time
      )
      .split("\n")
      .forEach((line) => logger.info(line)); // Show newlines in the log in a pretty way
    logger.info("");
  }
};

export default logger;
