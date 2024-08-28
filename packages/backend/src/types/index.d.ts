import type { z } from "zod";

import type { envSchema } from "../utils/startup";

import "./hono";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
