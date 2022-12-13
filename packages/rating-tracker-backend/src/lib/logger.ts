/* istanbul ignore file */
import pino from "pino";
import pretty from "pino-pretty";
import * as fs from "fs";
import chalk from "chalk";

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

const streams = [
  prettyStream,
  fs.createWriteStream(process.env.LOG_FILE || `/tmp/rating-tracker-log.txt`),
];

const logger = pino({}, pino.multistream(streams));

export default logger;
