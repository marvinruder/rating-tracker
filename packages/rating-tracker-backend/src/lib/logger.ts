/* istanbul ignore file */
import pino from "pino";
import pretty from "pino-pretty";
import fs from "node:fs";
import chalk from "chalk";
import cron from "cron";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

export const PREFIX_NODEJS =
  chalk.whiteBright.bgGreen(" \uf898 ") + chalk.green(" ");
export const PREFIX_REDIS =
  chalk.whiteBright.bgRed(" \ue76d ") + chalk.red(" ");
export const PREFIX_CHROME =
  chalk.whiteBright.bgBlueBright(" \ufc0d ") + chalk.blueBright(" ");

const levelIcons = {
  10: chalk.gray(" \uf002 "),
  20: chalk.blue(" \uf188 "),
  30: chalk.cyanBright(" \uf7fc "),
  40: chalk.yellowBright(" \uf071 "),
  50: "\x07" + chalk.red(" \uf658 "),
  60: "\x07" + chalk.magentaBright(" \uf0e7 "),
};

const prettyStream = pretty({
  include: "level",
  customPrettifiers: {
    level: (level) => levelIcons[Number(level)],
  },
});

const getLogFileName = () => {
  return (
    process.env.LOG_FILE ?? "/tmp/rating-tracker-log-(DATE).log"
  ).replaceAll("(DATE)", new Date().toISOString().split("T")[0]);
};

const getNewFileStream = () => {
  return fs.createWriteStream(getLogFileName(), {
    flags: "a",
  });
};

let fileStream = getNewFileStream();
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
const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
  },
  multistream
);

new cron.CronJob(
  "0 0 0 * * *",
  () => {
    fileStream.end();
    fileStream = getNewFileStream();
    multistream.streams.find(
      (stream) => stream.stream instanceof fs.WriteStream
    ).stream = fileStream;
  },
  null,
  true
);

export default logger;
