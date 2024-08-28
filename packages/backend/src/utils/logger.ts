import fs from "node:fs";

import { baseURL, stockLogoEndpointSuffix, stocksAPIPath } from "@rating-tracker/commons";
import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import pino from "pino";
import pretty from "pino-pretty";

import type { LoggedRequest } from "./logFormatterConfig";
import { pinoPrettyConfig } from "./logFormatterConfig";

/**
 * This class provides methods to log messages to the standard output as well as a log file.
 */
class Logger {
  private constructor() {}

  /**
   * The log level to use for printing log messages to the standard output.
   */
  static readonly #LOG_LEVEL = process.env.LOG_LEVEL;

  /**
   * The stream used to log messages to the standard output.
   */
  static readonly #prettyStream = pretty(pinoPrettyConfig);

  /**
   * Creates a new stream to write to the log file.
   * @returns The stream to write to the log file.
   */
  static #getNewFileStream(): fs.WriteStream {
    return fs.createWriteStream(process.env.LOG_FILE.replaceAll("(DATE)", new Date().toISOString().split("T")[0]), {
      flags: "a",
    });
  }

  /**
   * The stream used to log messages to the log file. The file is rotated every day.
   */
  static #fileStream = Logger.#getNewFileStream();

  /**
   * A multistream which writes to both the standard output and the log file.
   */
  static #multistream = pino.multistream([
    { level: Logger.#LOG_LEVEL, stream: Logger.#prettyStream },
    { level: "trace", stream: Logger.#fileStream },
  ]);

  /**
   * The logger used to log messages to both the standard output and the log file.
   */
  static readonly #logger = pino(
    { level: "trace", base: { pid: undefined, hostname: undefined } },
    Logger.#multistream,
  );

  /**
   * Logs a message with the `fatal` level.
   * @returns The function to log messages with the `fatal` level.
   */
  static get fatal() {
    return Logger.#logger.fatal.bind(Logger.#logger);
  }

  /**
   * Logs a message with the `error` level.
   * @returns The function to log messages with the `error` level.
   */
  static get error() {
    return Logger.#logger.error.bind(Logger.#logger);
  }

  /**
   * Logs a message with the `warn` level.
   * @returns The function to log messages with the `warn` level.
   */
  static get warn() {
    return Logger.#logger.warn.bind(Logger.#logger);
  }

  /**
   * Logs a message with the `info` level.
   * @returns The function to log messages with the `info` level.
   */
  static get info() {
    return Logger.#logger.info.bind(Logger.#logger);
  }

  /**
   * Logs a message with the `debug` level.
   * @returns The function to log messages with the `debug` level.
   */
  static get debug() {
    return Logger.#logger.debug.bind(Logger.#logger);
  }

  /**
   * Logs a message with the `trace` level.
   * @returns The function to log messages with the `trace` level.
   */
  static get trace() {
    return Logger.#logger.trace.bind(Logger.#logger);
  }

  /**
   * Creates a new stream to write to the log file.
   */
  static rotateFile(): void {
    Logger.#fileStream.end();
    Logger.#fileStream = Logger.#getNewFileStream();
    Logger.#multistream.streams.find((stream) => stream.stream instanceof fs.WriteStream)!.stream = Logger.#fileStream;
  }

  /**
   * A function logging API requests.
   * @param c The Hono context.
   * @param next The `next` middleware function.
   */
  static logRequest: MiddlewareHandler = async (c, next) => {
    const start = Date.now();
    await next();
    const headers: Record<string, string> = {};
    c.res.headers.forEach((value, key) => (headers[key] = value));
    if (c.res.headers.get("content-length") === null) {
      const { body } = c.res.clone();
      if (body instanceof ReadableStream) {
        const value = (await body.getReader().read()).value;
        if (value?.byteLength) headers["content-length"] = value.byteLength.toString();
      }
    }
    const ip = c.get("ip");
    const user = c.get("user");
    Logger[
      (c.req.path.startsWith(baseURL + stocksAPIPath) && c.req.path.endsWith(stockLogoEndpointSuffix)) ||
      ["127.0.0.1", "::1"].includes(ip)
        ? "trace"
        : "info"
    ](
      {
        prefix: "hono",
        req: {
          ip,
          method: c.req.method,
          url: c.req.path,
          cookies: getCookie(c),
          query: c.req.queries(),
          user: user ? { name: user.name, email: user.email } : undefined,
          statusCode: c.res.status,
          headers,
          time: Date.now() - start,
        },
      } as { prefix: string | object; req: LoggedRequest },
      "Processed request",
    );
  };
}

export default Logger;
