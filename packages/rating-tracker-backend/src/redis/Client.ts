import dotenv from "dotenv";
import { Client } from "redis-om";

dotenv.config({
  path: ".env.local",
});

/* pulls the Redis URL from .env */
const url = process.env.REDIS_URL || "redis://redis:6379";

/* create and open the Redis OM Client */
const client = await new Client().open(url);

export default client;
