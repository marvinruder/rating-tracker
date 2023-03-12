/* istanbul ignore file -- @preserve */ // We do not need to test the logger itself
import pino from "pino";
import pretty from "pino-pretty";
import fs from "node:fs";
import chalk from "chalk";
import cron from "cron";
import dotenv from "dotenv";

dotenv.config();

export const PREFIX_NODEJS = chalk.whiteBright.bgGreen(" \uf898 ") + chalk.green(" ");
export const PREFIX_REDIS = chalk.whiteBright.bgRed(" \ue76d ") + chalk.red(" ");
export const PREFIX_CHROME = chalk.whiteBright.bgBlueBright(" \ufc0d ") + chalk.blueBright(" ");
export const PREFIX_SIGNAL = chalk.whiteBright.bgBlue(" \uf868 ") + chalk.blue(" ");

const levelIcons = {
  10: chalk.gray(" \uf002 "),
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

export default logger;
