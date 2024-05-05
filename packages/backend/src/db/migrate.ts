import { MigrateDeploy } from "@prisma/migrate";

import logger from "../utils/logger";

if (["test", "production"].includes(process.env.NODE_ENV.toLowerCase()) && !process.env.EXIT_AFTER_READY)
  await new MigrateDeploy()
    .parse([])
    .then((s) => logger.info(s))
    .catch((e) => logger.error(e));
