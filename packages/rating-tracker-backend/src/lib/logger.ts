/* istanbul ignore file */
import pino from "pino";
import pretty from "pino-pretty";
import * as fs from "fs";
import chalk from "chalk";

const levelIcons = {
  10: `${chalk.gray("\uf002")} `,
  20: `${chalk.magenta("\uf188")} `,
  30: `${chalk.blue("\uf7fc")} `,
  40: `${chalk.yellow("\uf071")} `,
  50: `${chalk.red("\uf658")} `,
  60: `${chalk.redBright("\uf0e7")} `,
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
