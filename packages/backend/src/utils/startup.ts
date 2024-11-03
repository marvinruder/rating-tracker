import assert from "node:assert";
import { availableParallelism } from "node:os";

import { REGEX_PHONE_NUMBER } from "@rating-tracker/commons";
import cron from "node-cron";
import { z } from "zod";

import packageInfo from "../../package.json" with { type: "json" };

/**
 * The color to style the logo in.
 */
let ratingTrackerColor: string;

/* c8 ignore start */ // The color depends on the environment, which is fixed to `test` in tests
switch (process.env.NODE_ENV) {
  case "production":
    ratingTrackerColor = "41;113;214";
    break;
  case "development":
    ratingTrackerColor = "214;142;41";
    break;
  case "test":
    ratingTrackerColor = "110;159;24";
    break;
  default:
    ratingTrackerColor = "128;128;128";
}
/* c8 ignore stop */

/**
 * An ASCII art logo, shown as a welcome message.
 */
const logo = `\x1b[1m\x1b[38;2;${ratingTrackerColor}m
                                    ήΒω
                                  ;βΪΆ
                        ;       ρΪΪΓε
                        θΪΝ    ·βΪβ΅
              ;μ     ;βΪΪΪΈωι;ΪΪΡ
              ρΪΪΝ·  ώΪΪΓ
            ;βΪβώΈΪψβΪβ΅ ;φβΪΪΪβΝω
          ;ΈΪΈ   ΫΈΪΈ  ήΪΪΓ   ΅ΨΪβλ
          ήΪΈ΅      ΅  ίΪΪ       ΪΪΈ
        ΅ΫΆρ           ΈΪψ     ;ΪΪΓ
                        ΫΪΈΒΚββΪΪΪω
                            ΅΅΅  ΅ΨΪΈώ
                                    ΫΆ΅

 Welcome to Rating Tracker v${packageInfo.version} (${process.env.NODE_ENV ?? "no specific"} environment)!

\x1b[0m`;

/**
 * A schema for the environment variables.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(["production", "development", "test"]),
    PORT: z.coerce.number().int().min(1).max(65535),
    DOMAIN: z.string(),
    SUBDOMAIN: z.string().optional(),
    FQDN: z.string(),
    TRUSTWORTHY_PROXY_COUNT: z.coerce.number().int().min(0).optional().default(0),
    DATABASE_URL: z.string().url(),
    LOG_FILE: z.string().optional().default("/tmp/rating-tracker-log-(DATE).log"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional().default("info"),
    AUTO_FETCH_SCHEDULE: z.custom<string>((autoFetchSchedule) => cron.validate(autoFetchSchedule)).optional(),
    MAX_FETCH_CONCURRENCY: z.coerce.number().int().min(1).max(availableParallelism()).optional().default(1),
    SIGNAL_URL: z.string().url().optional(),
    SIGNAL_SENDER: z.string().regex(new RegExp(REGEX_PHONE_NUMBER)).optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    SMTP_SECURITY: z.enum(["none", "tls", "ssl"]).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    EXIT_AFTER_READY: z.coerce.boolean().optional(),
  })
  .passthrough();

/**
 * The startup method prints a welcome message and checks whether all mandatory environment variables are set. If not,
 * the process is exited with code 1.
 */
export const startup = () => {
  // Print welcome message
  console.log(logo);

  try {
    // Check whether all mandatory environment variables are set
    process.env = envSchema.parse({
      ...process.env,
      FQDN: `${process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.` : ""}${process.env.DOMAIN}`,
    }) as typeof process.env;
  } catch (e) {
    if (e instanceof Error) {
      // Print error message and exit
      console.error(`\x07\x1b[31m${e.message}\x1b[0m`);
      process.exit(1);
      /* c8 ignore next */ // This should never occur, since always Errors are thrown.
    } else throw e; // if something else than an error was thrown
  }

  if (process.env.AUTO_FETCH_SCHEDULE) assert(cron.validate(process.env.AUTO_FETCH_SCHEDULE), "Invalid cron schedule");
};

// Run the startup method, so it is executed before all other imports.
startup();
