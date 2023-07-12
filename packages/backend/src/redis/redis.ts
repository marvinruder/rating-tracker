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

export default redis;
