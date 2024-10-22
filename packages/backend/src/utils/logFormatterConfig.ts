import { STATUS_CODES } from "http";

import type { BackgroundColorName, ChalkInstance, ForegroundColorName } from "chalk";
import chalk from "chalk";
import type { PrettyOptions } from "pino-pretty";

/**
 * A list of error messages whose stack trace should not be printed.
 */
const IGNORED_ERRORS: readonly string[] = [
  "This endpoint is available to authenticated clients only. Please sign in.",
] as const;

/**
 * A prefix to be used before log messages. Multiple prefixes can be concatenated.
 */
type Prefix = {
  /**
   * The background color of the prefix.
   */
  color: ForegroundColorName | number;
  /**
   * The icon or text of the prefix.
   */
  icon: string;
  /**
   * The text color of the prefix.
   */
  textColor?: ForegroundColorName;
};

/**
 * All information to be logged for a request and its response.
 */
export type LoggedRequest = {
  /**
   * The IP address of the client that sent the request.
   */
  ip: string;
  /**
   * The HTTP method of the request.
   */
  method: string;
  /**
   * The URL of the request.
   */
  url: string;
  /**
   * The cookies sent with the request.
   */
  cookies: Record<string, unknown>;
  /**
   * The query parameters of the request.
   */
  query: Record<string, unknown>;
  /**
   * The user that sent the request.
   */
  user?: { name: string; email: string };
  /**
   * The status code of the response.
   */
  statusCode: number;
  /**
   * The headers of the response.
   */
  headers: Record<string, unknown>;
  /**
   * The response time of the request.
   */
  time: number;
};

/**
 * Icons to be used instead of text in prefixes.
 */
const prefixIcons: Record<string, string> = {
  cron: "\ufba7",
  node: "\uf898",
  nodejs: "\uf898",
  hono: "\uf490",
  redis: "\ue76d",
  postgres: "\ue76e",
  fetch: "\ufc0d",
  signal: "\uf868",
  email: "\uf003",
  time: "\uf64f",
  socket: "\uf6ff",
  user: "\uf007",
  anonymous: "\ufaf8",
  ip: "\uf0ac",
  cookie: "\uf697",
  query: "\uf002",
  responseTime: "\uf520",
  "application/json": "\ue60b",
  "image/avif": "\uf03e",
  "image/jpeg": "\uf03e",
  "image/png": "\uf03e",
  "image/svg+xml": "\ufc1f",
  successful: "\uf00c",
  failed: "\uf00d",
  skipped: "\uf05e",
  queued: "\uf071",
};

/**
 * Colors to be used for prefixes.
 */
const prefixColors: Record<string, ForegroundColorName | number> = {
  node: 0x339933,
  nodejs: 0x339933,
  hono: 0xe36002,
  redis: 0xd82c20,
  postgres: 0x336791,
  fetch: 0x43b02a,
  signal: 0x4975e8,
  GET: "blue",
  HEAD: "magenta",
  POST: "green",
  PUT: "yellow",
  PATCH: "cyanBright",
  DELETE: "red",
  successful: "green",
  failed: "red",
  skipped: "grey",
  queued: "yellow",
};

/**
 * Colors to be used for status codes.
 */
const statusCodeColor: Record<number, ForegroundColorName> = {
  1: "yellow",
  2: "green",
  3: "yellow",
  4: "red",
  5: "red",
};

/**
 * Capitalizes the first character of a string.
 * @param str The string to capitalize the first character of.
 * @returns The string with the first character capitalized.
 */
const capitalizeFirstChar = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts a number to a hex color code, prefixed with a hash sign.
 * @param n The number to convert to a hex color code.
 * @returns The hex color code.
 */
const hexNumberToColorCode = (n: number): string => `#${n.toString(16).padStart(6, "0")}`;

/**
 * Returns the default text color for a given background color.
 * @param color The background color.
 * @returns The default text color.
 */
const getDefaultTextColorFromBgColor = (color: string | number): ForegroundColorName => {
  switch (color) {
    case "grey":
      return "white";
    case "yellow":
      return "black";
    default:
      return "whiteBright";
  }
};

/**
 * Converts a prefix object into a pretty string. Allows concatenation of multiple prefixes.
 * @param prefix The prefix object to prettify.
 * @param nextPrefix The next prefix object to align the background color with.
 * @returns The prettified prefix.
 */
const prettifyPrefix = (prefix: Prefix, nextPrefix?: Prefix): string => {
  // If no text color is specified, use the default text color for the background color
  const textColor = prefix.textColor ?? getDefaultTextColorFromBgColor(prefix.color);

  /**
   * The function to color the background of the prefix with.
   */
  const bgColorFn: ChalkInstance =
    typeof prefix.color === "string"
      ? chalk[textColor][`bg${capitalizeFirstChar(prefix.color)}` as BackgroundColorName]
      : chalk[textColor].bgHex(hexNumberToColorCode(prefix.color));

  /**
   * The function to color the background of the next prefix and the separator with.
   */
  const nextBgColorFn: ChalkInstance = nextPrefix
    ? typeof nextPrefix?.color === "string"
      ? chalk[textColor][`bg${capitalizeFirstChar(nextPrefix.color)}` as BackgroundColorName]
      : chalk[textColor].bgHex(hexNumberToColorCode(nextPrefix.color))
    : chalk.reset;

  /**
   * The function to color the separator with.
   */
  const separatorColorFn: ChalkInstance =
    typeof prefix.color === "string"
      ? nextBgColorFn[prefix.color]
      : nextBgColorFn.hex(hexNumberToColorCode(prefix.color));

  return (
    bgColorFn(` ${prefix.icon} `) +
    (prefix.color === nextPrefix?.color
      ? bgColorFn[getDefaultTextColorFromBgColor(prefix.color)]("")
      : separatorColorFn(""))
  );
};

/**
 * Converts a record into a pretty string.
 * The key of every entry will be formatted as a prefix, the value will be formatted as plain text.
 * Every record entry will be printed in its own line.
 * @param record The record to prettify.
 * @param prefix The prefix to add in front of each line.
 * @returns The prettified record.
 */
const prettifyRecord = (record: Record<string, unknown>, prefix?: Prefix): string =>
  `\n\x1b[A${
    // Removes all characters in the current line
    Object.entries(record)
      .map(
        ([key, value]) =>
          ` ├─${prefix ? prettifyPrefix(prefix, { icon: key, color: "grey" }) : ""}${prettifyPrefix({
            icon: key,
            color: "grey",
          })} ${chalk.white(value)}`,
      )
      .join("\n")
  }`;

/**
 * Replaces the last occurrence of the `BOX DRAWINGS LIGHT VERTICAL AND RIGHT` character with the
 * `BOX DRAWINGS LIGHT ARC UP AND RIGHT` character.
 * @param str The string to process.
 * @returns The processed string.
 */
const replaceLastJoiner = (str: string): string => str.replace(/├([^├]*)$/, "╰$1");

/**
 * Color functions to be used for log levels.
 */
const levelColorFns: Record<number, ChalkInstance> = {
  10: chalk.grey,
  20: chalk.blue,
  30: chalk.cyanBright,
  40: chalk.yellowBright,
  50: chalk.red,
  60: chalk.magentaBright,
};

/**
 * Icons to represent log levels.
 */
const levelIcons: Record<number, string> = {
  10: " \uf002 ",
  20: " \uf188 ",
  30: " \uf7fc ",
  40: " \uf071 ",
  50: " \uf658 ",
  60: " \uf0e7 ",
};

/**
 * Converts a raw prefix into a prefix object.
 * @param rawPrefix A description of the prefix, extracted from the log message.
 * @returns The prefix object.
 */
const getPrefixFromRawPrefix = (rawPrefix: string | object): Prefix => {
  if (typeof rawPrefix === "string")
    // Look up a preconfigured icon and color for the given string.
    // Use the string itself as the icon if no icon is found; use grey as the color if no color is found.
    return { icon: prefixIcons[rawPrefix] ?? rawPrefix, color: prefixColors[rawPrefix] ?? "grey" };
  const [key, value] = Object.entries(rawPrefix)[0];
  // Passing an object as the prefix allows to add an icon manually.
  return {
    icon: (prefixIcons[key] ?? key) + (value === undefined ? "" : ` ${value}`),
    color: prefixColors[key] ?? "grey",
  };
};

export const pinoPrettyConfig: PrettyOptions | { customPrettifiers?: Record<string, (a: any) => string> } = process.env
  .PLAIN_LOG
  ? {}
  : {
      ignore: "time,prefix", // Those are added to the message, so we do not want to print it twice
      customPrettifiers: {
        // Indicate the log level with an icon and color, and print a ␇ character if the log level is `error` or higher.
        level: (level: unknown) =>
          (Number(level) >= 50 ? "\x07" : "") + levelColorFns[Number(level)](levelIcons[Number(level)]),
        err: (err: Error) =>
          // Do not print an ignored error
          IGNORED_ERRORS.some((ignoredError) => typeof err.message === "string" && err.message?.includes(ignoredError))
            ? "\x1b[2K\x1b[A"
            : `\n\x1b[A  ${
                // Removes all characters in the current line
                // Print only the stack trace of the error, any other information will be added to the message
                levelColorFns[10](err.stack ?? "No stack trace available")
              }`,
        req: (req: LoggedRequest) =>
          replaceLastJoiner(
            `\n\x1b[A ├─${
              // Removes all characters in the current line
              [
                [
                  // User
                  {
                    ...getPrefixFromRawPrefix(
                      req.user
                        ? { user: `${req.user.name} (${req.user.email})` }
                        : { anonymous: "Unauthenticated user" },
                    ),
                    textColor: "yellow",
                  },
                  // IP address
                  { ...getPrefixFromRawPrefix({ ip: req.ip }), textColor: "magentaBright" },
                ],
                [
                  // HTTP method
                  { icon: req.method, color: prefixColors[req.method] ?? ("grey" as const) },
                  // URL path
                  ...req.url
                    .slice(1, req.url.indexOf("?") === -1 ? undefined : req.url.indexOf("?"))
                    .split("/")
                    .map((rawPrefix) => ({ icon: decodeURIComponent(rawPrefix), color: "grey" as const })),
                ],
                // Cookies
                Object.entries(req.cookies).length
                  ? prettifyRecord(req.cookies, {
                      icon: prefixIcons.cookie,
                      color: "grey" as const,
                      textColor: "yellow",
                    })
                  : "",
                // Query parameters
                Object.entries(req.query).length
                  ? prettifyRecord(req.query, { icon: prefixIcons.query, color: "grey" as const, textColor: "cyan" })
                  : "",
                [
                  // Response status code
                  { icon: req.statusCode.toString(), color: statusCodeColor[Math.floor(req.statusCode / 100)] },
                  { icon: STATUS_CODES[req.statusCode]!, color: statusCodeColor[Math.floor(req.statusCode / 100)] },
                  ...[
                    // Content type and length
                    ...(typeof req.headers["content-type"] === "string"
                      ? [
                          {
                            ...getPrefixFromRawPrefix({
                              [req.headers["content-type"].split(";")[0]]:
                                `${req.headers["content-length"] || "–"} bytes`,
                            }),
                            textColor: "yellowBright",
                          },
                        ]
                      : []),
                  ],
                  // Response time
                  {
                    ...getPrefixFromRawPrefix({ responseTime: `${Math.round(req.time)} ms` }),
                    textColor: "cyanBright",
                  },
                ],
              ]
                .map((prefixArrayOrLine) => {
                  if (typeof prefixArrayOrLine === "string") return prefixArrayOrLine;
                  const prefixArray = prefixArrayOrLine.filter((prefix) => Object.entries(prefix).length);
                  return prefixArray.map((prefix, index) => prettifyPrefix(prefix, prefixArray[index + 1])).join("");
                })
                .filter((line) => line)
                .join("\n ├─")
            }`,
          ),
        signalMessage: (signalMessage: { number: string; recipients: string[]; message: string }) =>
          replaceLastJoiner(
            prettifyRecord({
              "\uf007 \uf1d8": signalMessage.number, // Sender
              "\ufa2f\uf0c0": signalMessage.recipients.join(", "), // Recipients
              "\uf0f6": signalMessage.message, // Message Text
            }),
          ),
        fetchCounts: (fetchCounts: { successful: number; failed: number; skipped: number; queued: number }) =>
          replaceLastJoiner(
            `\n\x1b[A${
              // Removes all characters in the current line
              Object.entries(fetchCounts)
                .map(
                  ([key, value]) =>
                    ` ├─${prettifyPrefix(getPrefixFromRawPrefix({ [key]: undefined }))} ${chalk[
                      (prefixColors[key] as ForegroundColorName) ?? "grey"
                    ](`${value} ${key}`)}`,
                )
                .join("\n")
            }`,
          ),
        newValues: (newValues: Record<string, unknown>) => replaceLastJoiner(prettifyRecord(newValues)),
      },
      messageFormat: (log, messageKey) => {
        let msg = "\x1b[2D "; // Remove the : character after the log level
        // Read prefix information from the log message and create prefix objects from them
        const prefixArray: Prefix[] = (
          typeof log.prefix === "string" ? [log.prefix] : Array.isArray(log.prefix) ? log.prefix : []
        ).map((rawPrefix) => getPrefixFromRawPrefix(rawPrefix));
        msg +=
          prettifyPrefix(
            // Log the time as the first prefix
            {
              icon: `${prefixIcons["time"]} ${new Date(log.time as number).toISOString().split("T")[1]}`,
              color: "grey",
              textColor: "cyanBright",
            },
            prefixArray.length ? prefixArray[0] : undefined,
          ) + prefixArray.map((prefix, index) => prettifyPrefix(prefix, prefixArray[index + 1])).join("");
        // Include error title directly in the message
        if (typeof log.err === "object" && log.err !== null) {
          let errorTitle: string | undefined;
          if ("name" in log.err && typeof log.err.name === "string") {
            errorTitle = log.err.name;
          } else if ("type" in log.err && typeof log.err.type === "string") {
            errorTitle = log.err.type;
          }
          if (errorTitle)
            // Enclose the error title in 🔥 FLAMES 🔥
            msg += ` ${chalk.red("\ue0c2")}${chalk.bgRed.whiteBright(` ${errorTitle} `)}${chalk.red("\ue0c0")}`;
        }
        // Print the log message in the color of the log level
        return `${msg} ${levelColorFns[Number(log.level)](log[messageKey] ?? "")}`;
      },
    };

try {
  // This works when importing the config directly into the pino-pretty CLI, since it requires CommonJS syntax
  module.exports = pinoPrettyConfig;
} catch (_) {
  // The server does not understand CommonJS syntax, so we ignore the instruction above and use the ESM exports instead
}
