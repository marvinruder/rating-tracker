import chalk from "chalk";
import dotenv from "dotenv";
import { createClient } from "redis";
import logger, { PREFIX_REDIS } from "../utils/logger.js";

dotenv.config();

// The URL of the Redis instance
const url = process.env.REDIS_URL;

/**
 * The Redis client.
 */
export const redis = createClient({
  url: url,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
});
redis.on(
  "error", // This error only occurs when Redis server is not available, which is difficult to reproduce.
  /* c8 ignore next */ (err) => logger.error(PREFIX_REDIS + chalk.redBright(`Redis Client: ${err}`)),
);
await redis.connect();

/**
 * Checks if the Redis server is reachable.
 *
 * @returns {Promise<void>} A promise that resolves when the Redis server is reachable, or rejects with an error if it
 * is not.
 */
export const redisIsReady = (): Promise<void> =>
  redis.isReady
    ? redis
        .ping()
        .then((pong) =>
          pong === "PONG"
            ? Promise.resolve()
            : /* c8 ignore next */ Promise.reject(new Error("Redis is not reachable: server responded with " + pong)),
        )
    : /* c8 ignore next */ Promise.reject(new Error("Redis is not ready"));
// The errors only occurs when Redis server is not available, which is difficult to reproduce.

export default redis;
