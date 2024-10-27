import fs from "node:fs";

import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import pino from "pino";

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
    { level: Logger.#LOG_LEVEL, stream: process.stdout },
    { level: "trace", stream: Logger.#fileStream },
  ]);

  /**
   * The logger used to log messages to both the standard output and the log file.
   */
  static readonly #logger = pino(
    {
      level: "trace",
      base: { pid: undefined, hostname: undefined },
      formatters: { level: (level) => ({ level }) },
    },
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

    const addr = c.get("ip");
    const user = c.get("user");
    const { method, path } = c.req;
    const { status } = c.res;

    if (["127.0.0.1", "::1"].includes(addr) && path === "/api/status") return; // Do not log health check requests

    const headers: Record<string, string> = {};
    ["content-type", "content-length"].forEach(
      (key) => c.res.headers.get(key) && (headers[key] = c.res.headers.get(key)!),
    );
    if (c.res.headers.get("content-length") === null) {
      const { body } = c.res.clone();
      if (body instanceof ReadableStream) {
        const value = (await body.getReader().read()).value;
        if (value?.byteLength) headers["content-length"] = value.byteLength.toString();
      }
    }

    Logger.trace(
      {
        component: "hono",
        req: {
          addr,
          method,
          path,
          query: c.req.queries(),
          cookies: getCookie(c),
          ...(user ? { user: { name: user.name, email: user.email } } : {}),
          status,
          headers,
          latency: Date.now() - start,
        },
      },
      "Processed request",
    );
  };
}

export default Logger;
