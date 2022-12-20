/* istanbul ignore file */
import chalk from "chalk";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client } from "redis-om";
import logger, { PREFIX_REDIS } from "../lib/logger.js";

dotenv.config({
  path: ".env.local",
});

const url = process.env.REDIS_URL;

export const redis = createClient({
  url: url,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
});
redis.on("error", (err) =>
  logger.error(PREFIX_REDIS + chalk.redBright(`Redis Client: ${err}`))
);
await redis.connect();

const client = await new Client().use(redis);

export default client;
