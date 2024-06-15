import { exec } from "node:child_process";
import { promisify } from "node:util";

import logger from "../utils/logger";

if (["test", "production"].includes(process.env.NODE_ENV.toLowerCase()) && !process.env.EXIT_AFTER_READY)
  await promisify(exec)("prisma migrate deploy")
    .then(({ stdout, stderr }) => {
      if (stdout) logger.info({ prefix: "postgres" }, "\n\n" + stdout);
      if (stderr) logger.warn({ prefix: "postgres" }, "\n\n" + stderr);
    })
    .catch(({ error, stdout, stderr }) => {
      /* c8 ignore start */ // Migration must succeed for tests to work properly
      if (stdout) logger.info({ prefix: "postgres" }, "\n\n" + stdout);
      if (stderr) logger.warn({ prefix: "postgres" }, "\n\n" + stderr);
      if (error) {
        logger.error({ prefix: "postgres", err: error }, "Failed to migrate database");
        throw error;
      }
      /* c8 ignore stop */
    });
