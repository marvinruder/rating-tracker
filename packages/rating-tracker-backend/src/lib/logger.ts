/* istanbul ignore file */
import pino from "pino";
import pretty from "pino-pretty";
import fs from "node:fs";
import chalk from "chalk";
import cron from "cron";

const levelIcons = {
  10: chalk.whiteBright.bgGray(" \uf002 ") + chalk.gray(" "),
  20: chalk.whiteBright.bgBlue(" \uf188 ") + chalk.blue(" "),
  30: chalk.whiteBright.bgGreen(" \uf7fc ") + chalk.green(" "),
  40: chalk.whiteBright.bgYellow(" \uf071 ") + chalk.yellow(" "),
  50: chalk.whiteBright.bgRed(" \uf658 ") + chalk.red(" "),
  60: chalk.whiteBright.bgMagenta(" \uf0e7 ") + chalk.bgMagenta(" "),
};

const prettyStream = pretty({
  include: "level",
  customPrettifiers: {
    level: (level) => levelIcons[Number(level)],
  },
});

const getLogFileName = () => {
  return (
    process.env.LOG_FILE ?? "/tmp/rating-tracker-log-(DATE).json"
  ).replaceAll("(DATE)", new Date().toISOString().split("T")[0]);
};

const getNewFileStream = () => {
  return fs.createWriteStream(getLogFileName(), {
    flags: "a",
  });
};

let fileStream = getNewFileStream();
const multistream = pino.multistream([prettyStream, fileStream]);
const logger = pino({}, multistream);

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
