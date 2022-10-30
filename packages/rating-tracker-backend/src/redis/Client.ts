/* istanbul ignore file */
import chalk from "chalk";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client } from "redis-om";

dotenv.config({
  path: ".env.local",
});

const url = process.env.REDIS_URL || "redis://redis:6379";

export const redis = createClient({ url: url });
redis.on("error", (err) =>
  console.error(chalk.redBright(`Redis Client: ${err}`))
);
await redis.connect();

const client = await new Client().use(redis);

export default client;
